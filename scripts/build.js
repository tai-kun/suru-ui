// @ts-check

import { build } from "esbuild"
import { exec } from "node:child_process"
import { writeFile } from "node:fs/promises"
import { promisify } from "node:util"
import options from "../config/code/esbuild.config.js"

await Promise.all([
  ...options.map(opts => build(opts)),
  writeFile(
    "tsconfig.build.json",
    JSON.stringify({
      extends: "./tsconfig.json",
      include: [
        "@types/**/*",
        "src/**/*",
      ],
      compilerOptions: {
        noEmit: false,
        declaration: true,
        declarationDir: "dist",
        emitDeclarationOnly: true,
      },
    }),
  ).then(() => promisify(exec)("npx tsc -p tsconfig.build.json")),
])
