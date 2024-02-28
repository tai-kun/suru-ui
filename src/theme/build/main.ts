import { detailedDiff } from "deep-object-diff"
import fs from "node:fs/promises"
import path from "node:path"
import { formatWithOptions as format } from "node:util"
import type { JsonObject } from "visit-json"
import { parse as parseYaml } from "yaml"
import build from "./build"
import genTypes from "./genTypes"
import load from "./load"
import toCssVariables from "./toCssVariables"

const BP = "991px" // TODO: テーマから読み込めるようにする。

const BANNER = `/**
 * このファイルは自動生成されています。直接編集しないでください。
 * このファイルを生成するには、次のコマンドを実行してください:
 * $ npm run build:theme
 */
`

const TEMPLATE = `${BANNER}
@import "{{ base }}.css";

@layer sui.tokens {
@media {{ media }} {
@scope {{ scope }} {
  :scope,
  :scope::backdrop,
  :scope ::backdrop {
{{ css }}
  }
}}}
`

interface Theme {
  readonly name: string
  readonly vars: JsonObject
}

async function writeTheme(
  prams: {
    readonly base?: Theme
    readonly theme: Theme
    readonly media: string
    readonly scope: string | {
      readonly from: string
      readonly to: string
    }
  },
) {
  const { theme, media, scope, base = theme } = prams
  const filename = path.resolve(`src/theme/${theme.name}.css`)
  const template = TEMPLATE
    .replace("{{ base }}", theme === base ? "./base" : `./${base.name}`)
    .replace("{{ media }}", media)
    .replace(
      "{{ scope }}",
      typeof scope === "string"
        ? scope
        : `${scope.from} to ${scope.to}`,
    )
  const indent = "  ".repeat(2)
  const toCssOptions = {
    prefix: "sui",
    indent,
  }

  if (theme === base) {
    const vars = toCssVariables(theme.vars, toCssOptions)
    const css = template.replace("{{ css }}", vars)
    await fs.writeFile(filename, css, "utf-8")
  } else {
    const diff = detailedDiff(base.vars, theme.vars)
    const vars = [
      toCssVariables(diff.added, toCssOptions),
      toCssVariables(diff.updated, toCssOptions),
      // TODO: 削除されたプロパティから更に base.vars を元に削除された変数を特定する。
      toCssVariables(diff.deleted, {
        ...toCssOptions,
        undefined: () => "",
      }),
    ]
      .map((css, i) =>
        !css.trim() ? "" : `\n${indent}/* ${
          {
            0: "追加する CSS 変数",
            1: "更新する CSS 変数",
            2: "削除する CSS 変数",
          }[i]
        } */\n\n${css}\n`
      )
      .join("")
    const css = template.replace("{{ css }}", vars)
    await fs.writeFile(filename, css, "utf-8")
  }
}

async function combineTheme(
  params: {
    readonly name: string
    readonly themes: readonly Pick<Theme, "name">[]
  },
) {
  const { name, themes } = params
  const filename = path.resolve(`src/theme/${name}.css`)
  const css = [
    BANNER,
    ...themes.map(theme => `@import "./${theme.name}.css";`),
  ].join("\n")
  await fs.writeFile(filename, css, "utf-8")
}

async function writeUtils(vars: JsonObject) {
  const { flat, dict } = genTypes(vars, { prefix: "sui" })
  const typesFile = `${BANNER}
export type Flat = ${["", ...flat].join("\n  | ")}

export type Dict = ${dict}
`
  const constantsFile = `${BANNER}
import type { Flat } from "./_types"

export const VARIABLES: readonly Flat[] = [
  ${flat.join(",\n  ")}
]

export const variables = new Set(VARIABLES)
`
  const baseDir = path.resolve("src/theme")
  await Promise.all([
    fs.writeFile(path.join(baseDir, "_types.ts"), typesFile, "utf-8"),
    fs.writeFile(path.join(baseDir, "_constants.ts"), constantsFile, "utf-8"),
  ])
}

async function main() {
  const result = await load({
    sourceRoot: "src/theme/design-system",
    entryPoints: [
      "light-desktop",
      "light-mobile",
      "dark-desktop",
      "dark-mobile",
    ],
    resolvePath(file) {
      return file.endsWith(".yaml")
        ? file
        : `${file}.yaml`
    },
    parseFileData(data) {
      return parseYaml(data.toString("utf-8"))
    },
  })

  build(result)

  const themeList = result.sources.map((src): Theme => ({
    name: src.file.slice(0, -".yaml".length),
    vars: src.exports!,
  }))
  const lightDesktop = themeList[0]!
  const lightMobile = themeList[1]!
  const darkDesktop = themeList[2]!
  const darkMobile = themeList[3]!
  await Promise.all([
    writeTheme({
      theme: lightDesktop,
      media: "screen",
      scope: "(:root, .sui-light)",
    }),
    writeTheme({
      base: lightDesktop,
      theme: lightMobile,
      media: `(max-width: ${BP})`,
      scope: "(:root, .sui-light)",
    }),
    writeTheme({
      base: lightDesktop,
      theme: darkDesktop,
      media: "screen",
      scope: {
        from: "(.sui-dark)",
        to: "(.sui-light)",
      },
    }),
    writeTheme({
      base: darkDesktop,
      theme: darkMobile,
      media: `(max-width: ${BP})`,
      scope: {
        from: "(.sui-dark)",
        to: "(.sui-light)",
      },
    }),
    combineTheme({
      name: "light",
      themes: [lightDesktop, lightMobile],
    }),
    combineTheme({
      name: "dark",
      themes: [darkDesktop, darkMobile],
    }),
    combineTheme({
      name: "desktop",
      themes: [lightDesktop, darkDesktop],
    }),
    combineTheme({
      name: "mobile",
      themes: [lightMobile, darkMobile],
    }),
    combineTheme({
      name: "all",
      themes: [
        { name: "light" },
        { name: "dark" },
      ],
    }),
    writeUtils(lightDesktop.vars),
  ])
}

function removeExternalTrace(e: unknown) {
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

  describe("src/theme/build/main", () => {
    test.todo("Not implemented")
  })
}
