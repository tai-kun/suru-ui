import { transform } from "@svgr/core"
import { Buffer } from "node:buffer"
import { createHash, randomBytes } from "node:crypto"
import { existsSync } from "node:fs"
import { appendFile, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { dirname, isAbsolute, resolve as resolvePath } from "node:path"
import type { JsonArrayLike } from "visit-json"

/**
 * アイコンのメタ情報。
 */
export interface IconMeta {
  /**
   * アイコンのスタイル。
   *
   * @example "filled"
   */
  readonly style: string
}

/**
 * SVG アイコンファイルの情報。
 */
export interface IconFile {
  /**
   * SVG アイコンファイルの名前。
   */
  readonly name: string
  /**
   * SVG アイコンファイルへのパス。
   */
  readonly path: string
  /**
   * アイコンのメタ情報。
   */
  readonly meta: IconMeta
}

/**
 * アイコンコンポーネントの情報。
 */
export interface IconComponent {
  /**
   * アイコンコンポーネントの名前。
   */
  readonly name: string
  /**
   * アイコンのメタ情報。
   */
  readonly meta: IconMeta
  /**
   * アイコンコンポーネントの props。
   */
  readonly props: {
    /**
     * アイコンコンポーネントのクラス名。
     */
    readonly className: string
  }
}

async function mksrc(
  base: string,
  cacheKey: JsonArrayLike | undefined,
): Promise<{ path: string } & AsyncDisposable> {
  if (cacheKey?.length) {
    const hash = createHash("md5")
      .update(JSON.stringify(cacheKey))
      .digest("hex")
    const path = resolvePath(".cache", base, hash)
    await mkdir(dirname(path), { recursive: true })

    return {
      path,
      async [Symbol.asyncDispose]() {
        // 何もしない
      },
    }
  }

  const rand = randomBytes(16).toString("hex")
  const name = "sui-icons-" + rand
  const path = resolvePath(".cache", base, name)
  await mkdir(dirname(path), { recursive: true })

  return {
    path,
    async [Symbol.asyncDispose]() {
      try {
        await rm(path)
      } catch {
        // 削除済み
      }
    },
  }
}

async function mkdtemp(): Promise<{ path: string } & AsyncDisposable> {
  const rand = randomBytes(16).toString("hex")
  const name = "sui-icons-" + rand
  const path = resolvePath(".temp", name)
  await mkdir(path, { recursive: true })

  return {
    path,
    async [Symbol.asyncDispose]() {
      try {
        await rm(path)
      } catch {
        // 削除済み
      }
    },
  }
}

const BANNER = `/**
 * このファイルは自動生成されています。直接編集しないでください。
 * このファイルを生成するには、次のコマンドを実行してください:
 * $ npm run build:icons
 */
`

const OUT_HEAD = `${BANNER}
// @ts-ignore
import * as React from "react"
import type { IconDefinition } from ".."
`

const init = new Set<string>()

async function mkout(name: string, style: string): Promise<string> {
  const path = resolvePath("src/icons", name, style + ".tsx")

  if (!init.has(path)) {
    if (existsSync(path)) {
      await rm(path, { recursive: true })
    } else {
      await mkdir(dirname(path), { recursive: true })
    }

    await writeFile(path, OUT_HEAD, "utf8")
    init.add(path)
  }

  return path
}

function trimSvgExt(str: string): string {
  return str.endsWith(".svg")
    ? str.slice(0, -".svg".length)
    : str
}

function snakeToPascal(str: string): string {
  return (str = str.replace(/_(\w)/g, (_, a) => a.toUpperCase()))
    .charAt(0)
    .toUpperCase()
    + str.slice(1)
}

const template = (
  props: {
    componentName: string
    valueName: string
    className: string
    children: string
  },
) => `
export const ${props.valueName} = {
  name: "${props.componentName}" as const,
  props: {
    className: ${JSON.stringify(props.className)}
  },
  children: ${props.children}
} satisfies IconDefinition
`

export default class Generator {
  #name?: string
  #cacheKey?: JsonArrayLike
  #download?: () => Promise<Blob>
  #decompress?: (src: string, dstdir: string) => Promise<void>
  #listFiles?: (dir: string) => AsyncGenerator<IconFile>
  #mutateSvg?: (svg: string) => string
  #className?: (icon: IconComponent) => string
  #valueName?: (icon: IconComponent) => string
  #readLicense?: (dir: string) => Promise<string>

  withName(name: string): this {
    this.#name = name

    return this
  }

  withCacheKey(cacheKey: JsonArrayLike): this {
    this.#cacheKey = cacheKey

    return this
  }

  withDownload(download: () => Promise<Blob>): this {
    this.#download = download

    return this
  }

  withDecompress(
    decompress: (src: string, dstdir: string) => Promise<void>,
  ): this {
    this.#decompress = decompress

    return this
  }

  withListFiles(listFiles: (dir: string) => AsyncGenerator<IconFile>): this {
    this.#listFiles = listFiles

    return this
  }

  withMutateSvg(mutateSvg: (svg: string) => string): this {
    this.#mutateSvg = mutateSvg

    return this
  }

  withClassName(className: (icon: IconComponent) => string): this {
    this.#className = className

    return this
  }

  withValueName(valueName: (icon: IconComponent) => string): this {
    this.#valueName = valueName

    return this
  }

  withReadLicense(readLicense: (dir: string) => Promise<string>): this {
    this.#readLicense = readLicense

    return this
  }

  async generate(): Promise<void> {
    if (!this.#name) {
      throw new Error("name が設定されていません。")
    }

    await using src = await mksrc(this.#name, this.#cacheKey)

    if (!existsSync(src.path)) {
      if (!this.#download) {
        throw new Error("download が設定されていません。")
      }

      const blob = await this.#download()
      const buff = Buffer.from(await blob.arrayBuffer())
      await writeFile(src.path, buff)
    }

    if (!this.#decompress) {
      throw new Error("decompress が設定されていません。")
    }

    await using dst = await mkdtemp()
    await this.#decompress(src.path, dst.path)

    if (!this.#listFiles) {
      throw new Error("listFiles が設定されていません。")
    }

    if (!this.#mutateSvg) {
      throw new Error("mutateSvg が設定されていません。")
    }

    if (!this.#className) {
      throw new Error("className が設定されていません。")
    }

    if (!this.#valueName) {
      throw new Error("valueName が設定されていません。")
    }

    for await (const file of this.#listFiles(dst.path)) {
      const filepath = isAbsolute(file.path)
        ? file.path
        : resolvePath(dst.path, file.path)
      const data = await readFile(filepath, "utf8")
      const svg = await transform(data)
      const children = this.#mutateSvg(svg)
      const filename = trimSvgExt(file.name).replace(/[- ]/g, "_")
      const componentName = snakeToPascal(filename)
      const classNameBase = filename.replaceAll("_", "-")
      const info: IconComponent = {
        name: componentName,
        meta: file.meta,
        props: {
          className: classNameBase,
        },
      }
      await appendFile(
        await mkout(this.#name, file.meta.style),
        template({
          componentName: classNameBase,
          valueName: this.#valueName({ ...info }),
          className: this.#className({ ...info }),
          children,
        }),
      )
    }

    if (this.#readLicense) {
      await writeFile(
        resolvePath("src/icons", this.#name, "LICENSE"),
        await this.#readLicense(dst.path),
      )
    }
  }
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest

  describe("src/icons/build/Generator", () => {
    test.todo("Not implemented")
  })
}
