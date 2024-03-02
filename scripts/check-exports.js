// @ts-check

import { glob } from "glob"
import { readFile } from "node:fs/promises"

const pkg = JSON.parse(await readFile("package.json", "utf-8"))
/** @type {string | { types: string; default: string }[]} */
const exports = [
  {
    "types": pkg.types,
    "default": pkg.main,
  },
  ...Object.values(pkg.exports),
]
const exportFiles = exports
  .flatMap(e => {
    if (typeof e === "string") {
      return e
    }

    return [e.types, e.default]
  })
  .map(e => {
    if (e.startsWith("./")) {
      return e.substring(2)
    }

    return e
  })
const distFiles = await glob("dist/**/*.{js,jsx,css}", {
  ignore: "**/_*", // internal としてマークされたファイルは除外
})

const missingExports = distFiles.filter(f => !exportFiles.includes(f))

if (missingExports.length > 0) {
  console.error("次のファイルは package.json でエクスポートされません。")
  missingExports.forEach(f => console.error(`./${f}`))
  process.exit(1)
}
