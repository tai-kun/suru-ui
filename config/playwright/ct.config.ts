import { defineConfig, devices } from "@playwright/experimental-ct-react"
import { buildDefine } from "cfg-test/define"
import path from "node:path"

const srcDir = path.resolve("src")
const tempDir = path.resolve(".temp", "playwright")
const cacheDir = path.resolve(".cache", "playwright")

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: srcDir,
  testMatch: "**/*.spec.tsx",
  outputDir: path.join(tempDir, "test-results"),
  timeout: 10e3,
  fullyParallel: true,
  ...(
    process.env.CI
      ? {
        reporter: "github",
        workers: 1,
        retries: 2,
        forbidOnly: true, // 誤って test.only を残した場合、CI でのビルドは失敗する。
      }
      : {
        reporter: [
          ["list"],
          // ["html", { outputFolder: path.join(tempDir, "report") }],
        ],
        workers: "50%",
        retries: 0,
        forbidOnly: false,
      }
  ),
  /**
   * @see https://playwright.dev/docs/api/class-testoptions
   */
  use: {
    trace: "on-first-retry",
    ctPort: 3100,
    ctCacheDir: cacheDir,
    ctTemplateDir: ".",
    ctViteConfig: {
      define: {
        ...buildDefine,
        __DEV__: "true",
      },
      resolve: {
        alias: [
          {
            find: /^suru-ui\/([A-Z].+)\.css$/,
            replacement: path.resolve("src/core/$1/$1.css"),
          },
          {
            find: /^suru-ui\/(base|lab)\/([A-Z].+)\.css$/,
            replacement: path.resolve("src/$1/$2/$2.css"),
          },
        ],
      },
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
