// @ts-check

import { buildDefine } from "cfg-test/define"
import { replace } from "esbuild-plugin-replace"
import autoInsertExt from "./autoInsertExt.js"

/** @type {string[]} */
const PURE = [
  "new Set",
  "Object.assign",
  "createRecursiveProxy",
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
      "src/theme/*.ts",
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

    // Plugins

    plugins: [
      replace({
        __DEV__: "process.env.NODE_ENV !== \"production\"",
        ...Object.fromEntries(PURE.map(s => [s, `/* @__PURE__ */ ${s}`])),
      }),
      autoInsertExt(),
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

    // Plugins

    plugins: [
      replace({
        __DEV__: "process.env.NODE_ENV !== \"production\"",
        ...Object.fromEntries(PURE.map(s => [s, `/* @__PURE__ */ ${s}`])),
      }),
      autoInsertExt(),
    ],
  },
]
