import "./global.js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { $ } from "zx";

$.stdio = "inherit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagesRoot = path.resolve(__dirname, "..", "..");

export async function setup(): Promise<void> {
  const seen: string[] = ["build" /* myself */];

  async function inner(pkg: string): Promise<void> {
    const pkgJson = path.join(packagesRoot, pkg, "package.json");
    const {
      dependencies = {},
      devDependencies = {},
      peerDependencies = {},
      optionalDependencies = {},
    } = JSON.parse(await fs.readFile(pkgJson, "utf-8"));
    const suiPkgs = Object.keys({
      ...dependencies,
      ...devDependencies,
      ...peerDependencies,
      ...optionalDependencies,
    })
      .filter(pkgName => pkgName.startsWith("@suru-ui/"));

    for (const suiPkg of suiPkgs) {
      const pkgName = suiPkg.split("/")[1]!;

      if (seen.includes(pkgName)) {
        continue;
      }

      seen.push(pkgName);
      await inner(pkgName);

      console.log(`[@suru-ui/build] Building ${suiPkg} ...\n`);

      await $`
        cd ${path.join(packagesRoot, pkgName)}
        npm run setup
        npm i
        npm run build
      `;
    }
  }

  await inner(path.basename(process.cwd()));
  await $`npm i`;
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/setup", () => {
    test.todo("テスト");
  });
}
