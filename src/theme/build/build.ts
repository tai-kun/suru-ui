import { nullish, parse } from "valibot"
import type { JsonObject } from "visit-json"
import visitJson, { PASS, REMOVE } from "visit-json"
import applyPatch from "./applyPatch"
import createMatchFunction from "./createMatchFunction"
import type { LoadParams, LoadResult, Source } from "./load"
import replaceRange from "./replaceRange"
import replaceVariable, { IGNORE } from "./replaceVariable"
import { ExportsSchema, PatchesSchema } from "./schemas"
import toPatchPath from "./toPatchPath"

export interface BuildParams extends LoadParams {}

export interface BuildResult extends LoadResult {}

type Matrix = {
  readonly [key: string]: readonly (string | number)[]
}

type MatrixVariables = {
  [key: string]: string | number
}

/**
 * Matrix 型のオブジェクトから全てのパターンを生成する。
 *
 * @param matrix キーと値のリスト。
 * @param _keys キーのリスト。
 * @returns 全ての組み合わせ。
 */
function* combinations(
  matrix: Matrix,
  _keys: readonly string[] = Object.keys(matrix),
): Generator<MatrixVariables> {
  if (_keys.length === 0) {
    yield {}
  } else {
    const key = _keys[0]!
    const restKeys = _keys.slice(1)

    for (const value of matrix[key]!) {
      for (const restCombination of combinations(matrix, restKeys)) {
        yield {
          [key]: value,
          ...restCombination,
        }
      }
    }
  }
}

/**
 * `${{ matrix.変数名 }}` という文字列を変数の値に置き換える。
 *
 * @param text 置き換える文字列。
 * @param vars 変数の値。
 * @returns 置き換えた文字列。
 */
function replaceMatrixVariable(text: string, vars: MatrixVariables): string {
  return replaceVariable(text, {
    getValue(name) {
      return name.startsWith("matrix.")
        ? vars[name.substring("matrix.".length)]
        : IGNORE
    },
    *getNames() {
      for (const key in vars) {
        if (Object.hasOwn(vars, key)) {
          yield `matrix.${key}`
        }
      }
    },
  })
}

function buildSource(source: Source): void {
  if (!source.$build) {
    source.exports = null
  }

  if ("exports" in source) {
    return
  }

  const exports = parse(nullish(ExportsSchema), source.$build!.exports)

  if (!exports?.include?.length) {
    source.exports = null

    return
  }

  const patches = parse(nullish(PatchesSchema), source.$build!.patches)
  let data = source.data

  if (patches?.length) {
    data = { ...source.data }

    for (const [key, imp] of source.imports) {
      if (imp.build ?? true) {
        try {
          buildSource(imp.source)
        } catch (cause) {
          throw new Error(
            [
              "テーマのビルドに失敗しました:",
              `  ファイル: ${imp.source.file} (${imp.source.path})`,
              "",
            ].join("\n"),
            { cause },
          )
        }

        data[key] = imp.source.exports!
      } else {
        data[key] = imp.source.data
      }
    }

    data = structuredClone(data)

    for (let i = 0; i < patches.length; i++) {
      const patch = patches[i]!

      if (
        !patch.matrix
        || Object.values(patch.matrix).every(vars => !vars.length)
      ) {
        try {
          data = applyPatch(data, patch.operations, {
            strict: patch.strict,
          })
        } catch (cause) {
          throw new Error(
            [
              "パッチの適用に失敗しました:",
              `  名前: ${patch.name ?? "(無名)"}`,
              `  場所: ${i + 1} 番目のパッチ`,
              "  変数: なし",
              "",
            ].join("\n"),
            { cause },
          )
        }
      } else {
        const matrix = Object.fromEntries(
          Object.entries(patch.matrix).map(([key, vars]) => [
            key,
            vars.flatMap<string | number>(v =>
              typeof v === "string"
                ? replaceRange(v)
                : v
            ),
          ]),
        )

        for (const vars of combinations(matrix)) {
          const operations = visitJson(patch.operations, {
            Primitive(primitive) {
              return typeof primitive === "string"
                ? replaceMatrixVariable(primitive, vars)
                : PASS
            },
          })
          try {
            data = applyPatch(data, operations as typeof patch.operations, {
              strict: patch.strict,
            })
          } catch (cause) {
            throw new Error(
              [
                "パッチの適用に失敗しました:",
                `  名前: ${patch.name ?? "(無名)"}`,
                `  場所: ${i + 1} 番目のパッチ`,
                "  変数:",
                ...Object.entries(vars)
                  .map(([key, val]) => `    ${key}: ${JSON.stringify(val)}`),
                "",
              ].join("\n"),
              { cause },
            )
          }
        }
      }
    }

    for (const key of source.imports.keys()) {
      delete data[key]
    }
  }

  const match = createMatchFunction(exports)
  const result = visitJson(data, {
    Primitive(_, path) {
      return match(toPatchPath(path))
        ? PASS
        : REMOVE
    },
    removeEmptyArray: true,
    removeEmptyObject: true,
  }) as JsonObject | null

  source.exports = result ?? {}
}

/**
 * ロードしたテーマをビルドする。
 *
 * @param loadResult ロード結果。
 */
export default function build(loadResult: Pick<LoadResult, "sources">): void {
  for (const source of loadResult.sources) {
    try {
      buildSource(source)
    } catch (cause) {
      throw new Error(
        [
          "テーマのビルドに失敗しました:",
          `  ファイル: ${source.file} (${source.path})`,
          "",
        ].join("\n"),
        { cause },
      )
    }
  }
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { default: load } = await import("./load")
  const { default: mockFs, restore } = await import("mock-fs")
  const { afterEach, assert, describe, test } = cfgTest

  afterEach(() => {
    restore()
  })

  describe("src/theme/build/build", () => {
    test("機能する", async () => {
      mockFs({
        "root/main.json": JSON.stringify({
          main: "true",
          $build: {
            imports: {
              libsub: "lib/sub",
            },
            patches: [
              {
                operations: [
                  {
                    mode: "copy",
                    path: "/lib",
                    from: "/libsub",
                  },
                ],
              },
            ],
            exports: {
              include: ["**"],
            },
          },
        }),
        "root/lib/sub.json": JSON.stringify({
          sub: "true",
          $build: {
            exports: {
              include: ["**"],
            },
          },
        }),
      })

      const result = await load({
        sourceRoot: "root",
        entryPoints: ["main"],
        resolvePath: file => `${file}.json`,
        parseFileData: data => JSON.parse(data.toString("utf-8")),
      })
      build(result)

      assert.deepEqual(result.sources.map(s => s.exports), [
        {
          main: "true",
          lib: {
            sub: "true",
          },
        },
      ])
    })
  })
}
