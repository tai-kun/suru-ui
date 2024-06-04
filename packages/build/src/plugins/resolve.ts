import type { Plugin } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..", "..");
const monorepoRoot = path.resolve(packageRoot, "..", "..");

export function resolve(): Plugin {
  const accessCache: Record<string, boolean> = {};

  function isExist(file: string): boolean {
    if (file in accessCache) {
      return accessCache[file]!;
    }

    try {
      fs.accessSync(file, fs.constants.R_OK);

      return (accessCache[file] = fs.statSync(file).isFile());
    } catch {
      return (accessCache[file] = false);
    }
  }

  const builtPathCache: Record<string, string | null> = {};

  function createGetBuiltPath(resolvers: [string, string][]) {
    return function getBuiltPath(
      resolveDir: string,
      file: string,
    ): string | null {
      const filepath = path.resolve(resolveDir, file);

      if (filepath in builtPathCache) {
        return builtPathCache[filepath]!;
      }

      for (const [src, dst] of resolvers) {
        if (isExist(filepath + src)) {
          return (builtPathCache[filepath] = filepath + dst);
        }
      }

      return (builtPathCache[filepath] = null);
    };
  }

  function createToOutFilePath(resolveDir: string) {
    return function toOutFilePath(file: string): string {
      file = path.normalize(path.relative(resolveDir + "/", file));

      if (!file.startsWith(".")) {
        file = `.${path.sep}${file}`;
      }

      return file;
    };
  }

  return {
    name: "esbuild-plugin-resolve",
    setup(build) {
      if (build.initialOptions.bundle !== true) {
        throw new Error(
          "esbuild-plugin-resolve はバンドルモードでのみ動作します。",
        );
      }

      const resolvers = Object.entries({
        "": "",
        ".ts": ".js",
        ".tsx": ".jsx",
        ".mts": ".mjs",
        ".cts": ".cjs",
        "/index.ts": "/index.js",
        "/index.tsx": "/index.jsx",
        "/index.mts": "/index.mjs",
        "/index.cts": "/index.cjs",
        ".js": ".js",
        ".jsx": ".jsx",
        ".mjs": ".mjs",
        ".cjs": ".cjs",
        "/index.js": "/index.js",
        "/index.jsx": "/index.jsx",
        "/index.mjs": "/index.mjs",
        "/index.cjs": "/index.cjs",
      });
      const getBuiltPath = createGetBuiltPath(resolvers);

      build.onResolve({ filter: /.*/ }, async args => {
        const { namespace, kind, path: pkg, resolveDir } = args;
        const toOutFilePath = createToOutFilePath(resolveDir);

        switch (true) {
          case namespace !== "file" || kind !== "import-statement":
            return null;

          case pkg.startsWith("."): {
            const builtPath = getBuiltPath(resolveDir, pkg);

            if (builtPath) {
              return {
                path: toOutFilePath(builtPath),
                external: true,
              };
            }

            return {
              errors: [
                {
                  text: `パッケージを解決できませんでした: ${pkg}`,
                },
              ],
            };
          }

          default:
            return {
              external: true,
            };
        }
      });
    },
  };
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest;

  describe("@suru-ui/build/plugins/resolve", () => {
    test("モノレポのルートディレクトリが正しい", () => {
      assert.equal(path.basename(monorepoRoot), "suru-ui");
    });
  });
}
