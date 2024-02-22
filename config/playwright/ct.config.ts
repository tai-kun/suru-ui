import { defineConfig, devices } from "@playwright/experimental-ct-react"
import { resolve } from "node:path"

export default defineConfig({
  testDir: resolve("src"),
  timeout: 10e3,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined as never,
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  reporter: [["html", { outputFolder: resolve(".temp/playwright/report") }]],
  outputDir: resolve(".temp/playwright/test-results"),
  use: {
    trace: "on-first-retry",
    ctPort: 3100,
    ctCacheDir: resolve(".cache/playwright"),
    ctTemplateDir: ".",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
