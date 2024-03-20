// @ts-check

import { glob } from "glob"
import { readFile } from "node:fs/promises"

const pkg = JSON.parse(await readFile("package.json", "utf-8"))
/** @type {string | { types: string; import: string; require: string }[]} */
const exports = [
  {
    "types": pkg.types,
    "import": pkg.module,
    "require": pkg.main,
  },
  ...Object.values(pkg.exports),
]
const exportFiles = exports
  .flatMap(e => {
    if (typeof e === "string") {
      return e
    }

    if (
      typeof e !== "object"
      || e === null
      || typeof e.types !== "string"
      || typeof e.import !== "string"
      || typeof e.require !== "string"
    ) {
      throw new TypeError("期待しない exports の形式です。", { cause: e })
    }

    return [e.types, e.import, e.require]
  })
  .map(e => {
    if (e.startsWith("./")) {
      return e.substring(2)
    }

    return e
  })
const distFiles = await glob("dist/**/*.{cjs,mjs,jsx,css}", {
  ignore: [
    "**/_*", // internal としてマークされたファイルは除外
    "**/*.machine.{cjs,mjs}", // ステートマシンの定義ファイルは除外
  ],
})

const missingExports = distFiles.filter(f => !exportFiles.includes(f))

if (missingExports.length > 0) {
  console.error("次のファイルは package.json でエクスポートされません。")
  missingExports.forEach(f => console.error(`./${f}`))
  process.exit(1)
}
