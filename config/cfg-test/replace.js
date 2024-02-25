// @ts-check

import fs from "node:fs/promises"
import { fileURLToPath } from "node:url"

/** @type {import("node:module").LoadHook} */
export async function load(url, _, next) {
  if (url.endsWith(".ts") || url.endsWith(".tsx")) {
    let source = await fs.readFile(fileURLToPath(url), "utf8")
    source = source.replace(/\b__DEV__\b/g, "true")

    if (url.endsWith(".tsx") && source.includes(".css")) {
      source = source.replace(/import\s+"[^"]+\.css"/g, "")
    }

    return {
      // @ts-expect-error
      format: "ts",
      source,
    }
  }

  return next(url)
}
