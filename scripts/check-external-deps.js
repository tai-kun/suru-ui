// @ts-check

import { AST_NODE_TYPES, parse } from "@typescript-eslint/typescript-estree"
import { glob } from "glob"
import fs from "node:fs/promises"
import path from "node:path"

const [pkg, files] = await Promise.all([
  fs.readFile("package.json", "utf-8").then(JSON.parse),
  glob("dist/**/*.{js,jsx,ts}"),
])
const deps = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.exports || {})
    .map(key => path.normalize(path.join(pkg.name, key))),
]
/** @type {Record<string, string[]>} */
const errs = {}
await Promise.all(
  files.sort().map(async file => {
    const code = await fs.readFile(file, "utf-8")

    if (code.indexOf("import") === -1) {
      return
    }

    const { body: statements } = parse(code, { jsx: true })

    for (const statement of statements) {
      if (statement.type !== AST_NODE_TYPES.ImportDeclaration) {
        break
      }

      const { value } = statement.source

      if (
        value.startsWith(".")
        || deps.some(dep => value === dep || value.startsWith(dep))
      ) {
        continue
      }

      ;(errs[value] ||= []).push(file)
    }
  }),
)

const pkgNames = Object.keys(errs)

if (pkgNames.length === 0) {
  process.exit(0)
}

console.error("\n外部依存性が見つかりました:")

for (const pkgName of pkgNames.sort()) {
  const importers = errs[pkgName]
  console.error(
    [
      `\n"${pkgName}" in`,
      // @ts-ignore
      ...importers.map(file => `  ${file}`),
    ].join("\n"),
  )
}

process.exit(1)
