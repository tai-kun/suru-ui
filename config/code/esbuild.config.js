// @ts-check

import { buildDefine } from "cfg-test/define"
import { replace } from "esbuild-plugin-replace"

/** @type {string[]} */
const PURE = []

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

    minifySyntax: true,
    pure: [
      ...PURE,
    ],

    // Plugins

    plugins: [
      replace({
        ...buildDefine,
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

    minifySyntax: true,
    pure: [
      ...PURE,
    ],

    // Plugins

    plugins: [
      replace({
        ...buildDefine,
        __DEV__: "process.env.NODE_ENV !== \"production\"",
      }),
    ],
  },
]
