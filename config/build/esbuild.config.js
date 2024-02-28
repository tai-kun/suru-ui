// @ts-check

import { buildDefine } from "cfg-test/define"
import { replace } from "esbuild-plugin-replace"
import { glob } from "glob"
import autoInsertExt from "./autoInsertExt.js"

/** @type {string[]} */
const PURE = [
  "new Set",
  "onceCell",
  "forwardRef(",
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

    entryPoints: await glob("src/**/*.ts", {
      ignore: [
        "src/icons/build/**",
        "src/theme/build/**",
        "src/utils-dev/**",
      ],
    }),

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

    entryPoints: await glob("src/**/*.tsx", {
      ignore: [
        "src/**/*.d.ts",
        "src/**/*.spec.tsx",
        "src/**/*.stories.tsx",
      ],
    }),

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
