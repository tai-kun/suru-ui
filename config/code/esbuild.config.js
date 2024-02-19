// @ts-check

import { buildDefine } from "cfg-test/define"
import { replace } from "esbuild-plugin-replace"

/** @type {string[]} */
const PURE = [
  "Object.assign",
]

/** @type {import("esbuild").BuildOptions[]} */
export default [
  {
    // General

    format: "esm",
    platform: "node",

    // Input

    entryPoints: [
      "src/**/*.ts",
    ],

    // Output contents

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
    ],
  },
  {
    // General

    format: "esm",
    platform: "node",

    // Input

    entryPoints: [
      "src/**/*.tsx",
    ],

    // Output contents

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
    ],
  },
]
