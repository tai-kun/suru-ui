import "./global.js";
import { buildDefine } from "cfg-test/define";
import esbuild from "esbuild";
import fs from "node:fs/promises";
import { resolve } from "./plugins/resolve.js";

export interface BuildOptions {
  /**
   * @default false
   */
  jsx?: boolean | undefined;
  /**
   * @default "browser"
   */
  platform?: esbuild.Platform | undefined;
}

export async function build(options: BuildOptions | undefined = {}) {
  const {
    jsx = false,
    platform = "browser",
  } = options;
  await esbuild.build({
    // General

    bundle: true,
    platform: "node",
    target: {
      neutral: "esnext",
      browser: "chrome125",
      node: "node22",
    }[platform],

    // Input

    // @ts-expect-error
    entryPoints: await Array.fromAsync(
      // @ts-expect-error
      fs.glob(`src/**/*.${jsx ? "tsx" : "ts"}`, {
        exclude: (file: string) => (
          file.endsWith(".d.ts")
          || file.endsWith(".stories.tsx")
          || file.includes("/__tests__/")
          || file.includes("/__snapshots__/")
        ),
      }),
    ),

    // Output contents

    format: "esm",
    lineLimit: 80,

    // Output location

    write: true,
    outdir: "dist",
    outbase: "src",
    outExtension: {
      ".js": jsx ? ".jsx" : ".js",
    },

    // Transformation

    ...(jsx ? { jsx: "preserve" } : {}),

    // Optimization

    define: { ...buildDefine },
    minifySyntax: true,

    // Source maps

    sourcemap: "linked",

    // Plugins

    plugins: [
      resolve(),
    ],
  });
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/build/build", () => {
    test.todo("テスト");
  });
}
