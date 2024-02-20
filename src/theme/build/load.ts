import type { Buffer } from "node:buffer"
import fs from "node:fs/promises"
import path from "node:path"
import { nullish, object, optional, type Output, parse, unknown } from "valibot"
import type { JsonObject, JsonValue } from "visit-json"
import {
  ImportsSchema,
  type ImportWithOptions,
  PatchOperationValueSchema,
} from "./schemas"

/**
 * ソースファイルの場所。
 */
export interface SourceLocation {
  /**
   * ソースファイルのルートディレクトリ。
   */
  readonly root: string
  /**
   * ソースファイルのパス。
   */
  readonly file: string
  /**
   * ソースファイルの絶対パス。
   */
  readonly path: string
}

/**
 * ソースファイル。
 */
export interface Source extends SourceLocation {
  /**
   * ソースファイルの `$build` を除いたデータ。
   */
  readonly data: Record<string, JsonValue>
  /**
   * ソースファイルの `$build`。なければ `null`。
   */
  readonly $build: Output<typeof BuildSchema> | null
  /**
   * ソースファイルがインポートしているソースファイルのマップ。
   */
  readonly imports: ReadonlyMap<string, Import>
  /**
   * ソースファイルがエクスポートした結果。
   */
  exports?: JsonObject | null
}

/**
 * インポートのオプション。
 */
export interface ImportOptions {
  /**
   * インポートするときにビルドするかどうか。true ならビルドする。
   *
   * @default true
   */
  readonly build?: boolean | null | undefined
}

/**
 * インポート。
 */
export interface Import extends ImportOptions {
  /**
   * インポートのソース。
   */
  readonly source: Source
}

/**
 * ロードのためのパラメータ。
 */
export interface LoadParams {
  /**
   * ソースファイル群のルートディレクトリ。
   */
  readonly sourceRoot: string
  /**
   * エントリーポイントのファイルパスのリスト。
   * ファイルパスは `sourceRoot` からの相対パスで指定する。
   */
  readonly entryPoints: readonly string[]
  /**
   * ファイルパスを解決する。
   *
   * @param file エントリーポイント。
   * @param root エントリーポイントのルートディレクトリ。
   * @returns ファイルのパス。
   */
  readonly resolvePath: (file: string, root: string) => string | Promise<string>
  /**
   * ファイルのデータを解析する。
   *
   * @param data ファイルのデータ。
   * @param location ファイルの場所。
   * @returns ファイルの内容。
   */
  readonly parseFileData: (data: Buffer, location: SourceLocation) => unknown
}

/**
 * ロードの結果。
 */
export interface LoadResult {
  /**
   * ロードしたソースファイルのリスト。
   */
  readonly sources: readonly Source[]
}

/**
 * ロードのためのコンテキスト。
 */
interface Context extends Omit<LoadParams, "entryPoints"> {
  /**
   * ファイルパス。
   */
  readonly file: string
  /**
   * ソースファイルのキャッシュ。
   */
  readonly cache: Map<string, Source>
  /**
   * 親のコンテキスト。ルートのコンテキストの場合は `null`。
   */
  readonly parent: Context | null
}

/**
 * ロードのためのコンテキストを作成する。
 *
 * @param ctx コンテキスト。
 * @param file エントリーポイントのファイルパス。
 * @returns コンテキスト。
 */
function createContext(ctx: Context, file: string): Context

/**
 * ロードのためのコンテキストを作成する。
 *
 * @param params ロードのパラメータ。
 * @param cache ソースファイルのキャッシュ。
 * @param file エントリーポイントのファイルパス。
 * @returns コンテキスト。
 */
function createContext(
  params: LoadParams,
  cache: Map<string, Source>,
  file: string,
): Context

function createContext(
  ...args:
    | [Context, string]
    | [LoadParams, Map<string, Source>, string]
): Context {
  if (args.length === 2) {
    const [parent, file] = args

    return {
      ...parent,
      file,
      parent,
    }
  }

  const [params, cache, file] = args
  const sourceRoot = path.normalize(path.resolve(params.sourceRoot))

  return {
    ...params,
    sourceRoot,
    file,
    cache,
    parent: null,
  }
}

/**
 * ソースファイルの場所を作成する。
 *
 * @param root ルートディレクトリ。
 * @param file ソースファイルのファイルパス。
 * @returns ソースファイルの場所。
 */
function createLocation(root: string, file: string): SourceLocation {
  return {
    root,
    file: file = path.normalize(file),
    path: path.normalize(
      path.isAbsolute(file)
        ? file
        : path.resolve(root, file),
    ),
  }
}

/**
 * コンテキストのトレースをフォーマットする。
 *
 * @param ctx コンテキスト。
 * @returns フォーマットされたトレース。
 */
async function fmtContextTrace(ctx: Context): Promise<string> {
  const resolved = await ctx.resolvePath(ctx.file, ctx.sourceRoot)
  const location = createLocation(ctx.sourceRoot, resolved)

  return `  at ${ctx.file} (${location.path})`
}

/**
 * コンテキストのトレースを取得する。
 *
 * @param ctx コンテキスト。
 * @returns トレース。
 */
async function getContextTrace(ctx: Context): Promise<string[]> {
  const trace = [await fmtContextTrace(ctx)]

  if (ctx.parent) {
    trace.push(...await getContextTrace(ctx.parent))
  }

  return trace
}

const BuildSchema = object({
  imports: nullish(ImportsSchema),
  patches: optional(unknown()),
  exports: optional(unknown()),
})

const ContentsSchema = object(
  {
    $build: optional(nullish(BuildSchema)),
  },
  PatchOperationValueSchema,
)

/**
 * 循環参照を検出する。
 *
 * @param ctx コンテキスト。
 * @param path ファイルパス。
 * @returns 循環参照がある場合は `true`。そうでない場合は `false`。
 */
function detectCircularReference(ctx: Context, path: string) {
  if (ctx.parent) {
    return detectCircularReference(ctx.parent, path)
  }

  return false
}

/**
 * ソースファイルを再帰的にロードする。
 *
 * @param ctx コンテキスト。
 * @returns ロードしたソースファイル。
 */
async function inner(ctx: Context): Promise<Source> {
  const resolved = await ctx.resolvePath(ctx.file, ctx.sourceRoot)
  const location = createLocation(ctx.sourceRoot, resolved)

  if (!location.path.startsWith(location.root)) {
    throw new Error(
      [
        `ソースファイル "${ctx.file}" はルートの外側にあります。`,
        ...(await getContextTrace(ctx).then(trace => trace.slice(1))),
      ].join("\n"),
    )
  }

  if (detectCircularReference(ctx, location.path)) {
    throw new Error(
      [
        `ソースファイル "${ctx.file}" を循環参照しようとしました。`,
        ...(await getContextTrace(ctx).then(trace => trace.slice(1))),
      ].join("\n"),
    )
  }

  const cache = ctx.cache.get(location.path)

  if (cache) {
    return cache
  }

  const dataBuff = await fs.readFile(location.path)
  const contents = await ctx.parseFileData(dataBuff, structuredClone(location))
  const { $build = null, ...data } = parse(ContentsSchema, contents)
  const imports = new Map<string, Import>()

  if ($build?.imports) {
    for (const [name, info] of Object.entries($build.imports)) {
      const imp: Output<typeof ImportWithOptions> = typeof info !== "string"
        ? info
        : {
          from: info,
          build: undefined,
        }
      imports.set(name, {
        source: await inner(createContext(ctx, imp.from)),
        build: imp.build,
      })
    }
  }

  const source: Source = {
    ...location,
    data,
    $build,
    imports,
  }
  ctx.cache.set(location.path, source)

  return source
}

/**
 * ソースファイルをロードする。
 *
 * @param params ロードのパラメータ。
 * @returns ロードの結果。
 */
export default async function load(params: LoadParams): Promise<LoadResult> {
  const cache = new Map<string, Source>()
  const sources: Source[] = []

  for (const file of new Set(params.entryPoints)) {
    const ctx = createContext(params, cache, file)
    const src = await inner(ctx)
    sources.push(src)
  }

  return { sources }
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { expectType } = await import("tsd")
  const { default: mockFs, restore } = await import("mock-fs")
  const { afterEach, assert, describe, test } = cfgTest

  afterEach(() => {
    restore()
  })

  describe("src/theme/build/load", () => {
    describe("createLocation", () => {
      test("ソースファイルの場所を作成する", () => {
        const location = createLocation("root", "main.json")

        assert.deepEqual(location, {
          root: "root",
          file: "main.json",
          path: path.resolve("root", "main.json"),
        })
      })
    })

    describe("load", () => {
      test("ソースファイルをロードする", async () => {
        mockFs({
          "root/main.json": JSON.stringify({
            main: "true",
            $build: {
              imports: {
                sub: "lib/sub",
              },
            },
          }),
          "root/lib/sub.json": JSON.stringify({
            sub: "true",
          }),
        })

        const result = await load({
          sourceRoot: "root",
          entryPoints: ["main"],
          resolvePath: file => `${file}.json`,
          parseFileData: data => JSON.parse(data.toString("utf-8")),
        })

        assert.deepEqual(result, {
          sources: [
            {
              root: path.resolve("root"),
              file: "main.json",
              path: path.resolve("root/main.json"),
              data: {
                main: "true",
              },
              $build: {
                imports: {
                  sub: "lib/sub",
                },
              },
              imports: new Map([
                [
                  "sub",
                  {
                    source: {
                      root: path.resolve("root"),
                      file: "lib/sub.json",
                      path: path.resolve("root/lib/sub.json"),
                      data: {
                        sub: "true",
                      },
                      $build: null,
                      imports: new Map(),
                    },
                    build: undefined,
                  },
                ],
              ]),
            },
          ],
        })
      })

      test("循環参照した場合はエラー", async () => {
        mockFs({
          "root/main.json": JSON.stringify({
            main: "true",
            $build: {
              imports: {
                sub: "lib/sub",
              },
            },
          }),
          "root/lib/sub.json": JSON.stringify({
            sub: "true",
            $build: {
              imports: {
                main: "main",
              },
            },
          }),
        })

        await assert.rejects(
          async () => {
            await load({
              sourceRoot: "root",
              entryPoints: ["main"],
              resolvePath: file => `${file}.json`,
              parseFileData: data => JSON.parse(data.toString("utf-8")),
            })
          },
          {
            message: [
              "ソースファイル \"main\" を循環参照しようとしました。",
              `  at lib/sub (${path.resolve("root/lib/sub.json")})`,
              `  at main (${path.resolve("root/main.json")})`,
            ].join("\n"),
          },
        )
      })

      test("ルートの外側にある場合はエラー", async () => {
        mockFs({
          "root/main.json": JSON.stringify({
            main: "true",
            $build: {
              imports: {
                sub: "../lib/sub",
              },
            },
          }),
          "lib/sub.json": JSON.stringify({
            sub: "true",
          }),
        })

        await assert.rejects(
          async () => {
            await load({
              sourceRoot: "root",
              entryPoints: ["main"],
              resolvePath: file => `${file}.json`,
              parseFileData: data => JSON.parse(data.toString("utf-8")),
            })
          },
          {
            message: [
              "ソースファイル \"../lib/sub\" はルートの外側にあります。",
              `  at main (${path.resolve("root/main.json")})`,
            ].join("\n"),
          },
        )
      })

      test("ファイルが存在しない場合はエラー", async () => {
        mockFs({
          "root/main.json": JSON.stringify({
            main: "true",
            $build: {
              imports: {
                sub: "lib/sub",
              },
            },
          }),
        })

        await assert.rejects(
          async () => {
            await load({
              sourceRoot: "root",
              entryPoints: ["main"],
              resolvePath: file => `${file}.json`,
              parseFileData: data => JSON.parse(data.toString("utf-8")),
            })
          },
          /no such file or directory/,
        )
      })

      test("ファイルのデータが不正な場合はエラー", async () => {
        mockFs({
          "root/main.json": "",
        })

        await assert.rejects(
          async () => {
            await load({
              sourceRoot: "root",
              entryPoints: ["main"],
              resolvePath: file => `${file}.json`,
              parseFileData: data => JSON.parse(data.toString("utf-8")),
            })
          },
          /Unexpected end of JSON input/,
        )
      })
    })

    describe("tsd", () => {
      test("ImportOptions は ImportWithOptions から from を除いた型", () => {
        expectType<Readonly<Omit<Output<typeof ImportWithOptions>, "from">>>(
          {} as ImportOptions,
        )
      })
    })
  })
}
