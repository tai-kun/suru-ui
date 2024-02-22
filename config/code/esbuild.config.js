// @ts-check

import { buildDefine } from "cfg-test/define"
import { replace } from "esbuild-plugin-replace"
import fs from "node:fs"
import { join } from "node:path"

/** @type {string[]} */
const PURE = [
  "Object.assign",
]

/** @type {import("esbuild").BuildOptions[]} */
export default [
  {
    // General

    bundle: true,
    platform: "node",

    // Input

    entryPoints: [
      // "src/base/**/*.ts",
      // "src/core/**/*.ts",
      // "src/lab/**/*.ts",
      // "src/icons/**/*.ts",
      "src/utils/**/*.ts",
    ],

    // Output contents

    format: "esm",
    lineLimit: 80,

    // Output location

    write: true,
    outdir: "dist",
    outbase: "src",

    // Optimization

    define: buildDefine,
    minifySyntax: true,
    pure: [
      ...PURE,
    ],

    // Plugins

    plugins: [
      replace({
        __DEV__: "process.env.NODE_ENV !== \"production\"",
      }),
      autoInsertExtenstion(),
    ],
  },
  {
    // General

    bundle: true,
    platform: "node",

    // Input

    entryPoints: [
      "src/**/*.tsx",
    ],

    // Output contents

    format: "esm",
    lineLimit: 80,

    // Output location

    write: true,
    outdir: "dist",
    outbase: "src",
    outExtension: {
      ".js": ".jsx",
    },

    // Transformation

    jsx: "preserve",

    // Optimization

    define: buildDefine,
    minifySyntax: true,
    pure: [
      ...PURE,
    ],

    // Plugins

    plugins: [
      replace({
        __DEV__: "process.env.NODE_ENV !== \"production\"",
      }),
      autoInsertExtenstion(),
    ],
  },
]

/** @param {string} path */
function isLocalFile(path) {
  return path.startsWith(".")
}

/** @type {Record<string, boolean>} */
const accessCache = {}

/** @param {string} file */
function readOk(file) {
  if (file in accessCache) {
    return accessCache[file]
  }

  try {
    fs.accessSync(file, fs.constants.R_OK)

    return accessCache[file] = true
  } catch {
    return accessCache[file] = false
  }
}

/**
 * @param {string} dir
 * @param {string} file
 */
function getBuiltPath(dir, file) {
  dir = join(dir, file)

  for (const [src, dst] of Object.entries({ ".ts": ".js", ".tsx": ".jsx" })) {
    if (readOk(dir + src)) {
      return file + dst
    }
  }

  return null
}

/** @returns {import("esbuild").Plugin} */
function autoInsertExtenstion() {
  return {
    name: "auto-insert-extension",
    setup(build) {
      build.onResolve({ filter: /.*/ }, args => {
        if (args.namespace !== "file" || args.kind !== "import-statement") {
          return null
        }

        if (
          args.resolveDir.includes("node_modules")
          || !isLocalFile(args.path)
        ) {
          return {
            external: true,
          }
        }

        const builtPath = getBuiltPath(args.resolveDir, args.path)

        if (builtPath) {
          return {
            path: builtPath,
            external: true,
          }
        }

        return {
          errors: [
            {
              text: `File not found: ${args.path}`,
            },
          ],
        }
      })
    },
  }
}
