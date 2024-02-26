import { createReadStream } from "node:fs"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { formatWithOptions as format } from "node:util"
import * as unzipper from "unzipper"
import clsx from "../../utils/clsx"
import Generator from "./Generator"

async function unzip(src: string, dstdir: string): Promise<void> {
  const zip = createReadStream(src)
    .pipe(unzipper.Parse({ forceStream: true }))

  for await (const entry of zip) {
    if (
      entry.type === "File"
      && (entry.path.endsWith(".svg") || entry.path.includes("LICENSE"))
    ) {
      const buf = await entry.buffer()
      const out = join(dstdir, entry.path)
      await mkdir(dirname(out), { recursive: true })
      await writeFile(out, buf)
    } else {
      entry.autodrain()
    }
  }
}

async function buildDesignSystemAssets(
  id: string,
  shortName: string,
  assetsUrl: string,
): Promise<void> {
  await new Generator()
    .withName(id)
    .withCacheKey([assetsUrl])
    .withDownload(() => fetch(assetsUrl).then(resp => resp.blob()))
    .withDecompress(unzip)
    .withListFiles(async function*(dir) {
      dir = join(dir, "designsystem-assets/icon/svg")

      for (const dirent of await readdir(dir, { withFileTypes: true })) {
        if (dirent.isFile() && dirent.name.endsWith(".svg")) {
          yield {
            name: dirent.name.replace(/_(fill|line)\.svg$/, ""),
            path: join(dir, dirent.name),
            meta: {
              // スタイル名を Material Design Icons にあわせる。
              style: dirent.name.endsWith("_fill.svg") ? "filled" : "outlined",
            },
          }
        }
      }
    })
    .withMutateSvg(svg =>
      svg
        .trim()
        // fill は CSS で指定するので、currentColor に置き換える。
        .replace("fill=\"#1A1A1C\"", "fill=\"currentColor\"")
        // ケバブケースの属性名をキャメルケースにする。
        .replace(
          /([a-z])-([a-z])(?=[a-z]+=")/g,
          (_, a, b) => `${a}${b.toUpperCase()}`,
        )
    )
    .withClassName(icon =>
      clsx(
        shortName,
        shortName + "-" + icon.props.className,
        shortName + "-" + icon.meta.style,
      )
    )
    .withValueName(icon => shortName + icon.name)
    .withReadLicense(dir =>
      readFile(join(dir, "designsystem-assets/LICENSE.txt"), "utf8")
    )
    .generate()
}

async function buildMaterialDesignIcons(
  id: string,
  shortName: string,
  assetsUrl: string,
): Promise<void> {
  const ver = assetsUrl.match(/v(\d+\.\d+\.\d+)\.zip$/)?.at(1)

  if (!ver) {
    throw new Error("バージョン番号を取得できませんでした。")
  }

  await new Generator()
    .withName(id)
    .withCacheKey([assetsUrl])
    .withDownload(async () => {
      const resp = await fetch(assetsUrl, { redirect: "manual" })

      if (resp.status === 302) {
        const res = await fetch(resp.headers.get("location")!)

        return res.blob()
      }

      return resp.blob()
    })
    .withDecompress(unzip)
    .withListFiles(async function*(dir) {
      dir = join(dir, `material-design-icons-${ver}`, "svg")

      for (const dirent of await readdir(dir, { withFileTypes: true })) {
        if (dirent.isDirectory()) {
          const style = dirent.name
          const styleDir = join(dir, style)

          for (
            const dirent of await readdir(styleDir, { withFileTypes: true })
          ) {
            if (dirent.isFile() && dirent.name.endsWith(".svg")) {
              yield {
                name: dirent.name.replace(/\.svg$/, ""),
                path: join(styleDir, dirent.name),
                meta: { style },
              }
            }
          }
        }
      }
    })
    .withMutateSvg(svg =>
      svg
        .trim()
        // ケバブケースの属性名をキャメルケースにする。
        .replace(
          /([a-z])-([a-z])(?=[a-z]+=")/g,
          (_, a, b) => `${a}${b.toUpperCase()}`,
        )
        .replaceAll("xlink:href", "xlinkHref")
        .replaceAll("xmlns:xlink", "xmlnsXlink")
    )
    .withClassName(icon =>
      clsx(
        shortName,
        shortName + "-" + icon.props.className,
        shortName + "-" + icon.meta.style,
      )
    )
    .withValueName(icon => shortName + icon.name)
    .withReadLicense(dir =>
      readFile(join(dir, `material-design-icons-${ver}`, "LICENSE"), "utf8")
    )
    .generate()
}

async function main(): Promise<void> {
  await Promise.all([
    buildDesignSystemAssets(
      "digital.go.jp",
      "dsa",
      "https://www.digital.go.jp/assets/contents/node/basic_page"
        + "/field_ref_resources/bb5d3e3b-30be-4487-b4f0-b3191a1ef823/c7976118"
        + "/designsystem-assets.zip",
    ),
    buildMaterialDesignIcons(
      "m3.material.io",
      "mdi",
      "https://github.com/marella/material-design-icons"
        + "/archive/refs/tags/v0.14.13.zip",
    ),
  ])
}

function removeExternalTrace(e: unknown): void {
  if (e instanceof Error && typeof e.stack === "string") {
    e.stack = e.stack
      .split("\n")
      .filter(line => !line.includes("/node_modules/"))
      .join("\n")

    removeExternalTrace(e.cause)
  }
}

function panic(e: unknown): never {
  removeExternalTrace(e)
  process.stderr.write(format({ colors: true, depth: Infinity }, "%O\n", e))
  process.exit(1)
}

if (process.env.NODE_ENV !== "test") {
  Error.stackTraceLimit = Infinity
  process.once("uncaughtException", panic)
  process.once("unhandledRejection", panic)

  try {
    await main()
  } catch (e) {
    panic(e)
  }
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest

  describe("src/icons/build/main", () => {
    test.todo("Not implemented")
  })
}
