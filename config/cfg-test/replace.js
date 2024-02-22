// @ts-check

import fs from "node:fs/promises"
import { fileURLToPath } from "node:url"

/** @type {import("node:module").LoadHook} */
export async function load(url, _, next) {
  if (url.endsWith(".ts") || url.endsWith(".tsx")) {
    return {
      // @ts-expect-error
      format: "ts",
      source: (await fs.readFile(fileURLToPath(url), "utf8"))
        .replaceAll("__DEV__", "true"),
    }
  }

  return next(url)
}
