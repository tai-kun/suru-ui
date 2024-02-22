// @ts-check

import { build } from "esbuild"
import options from "../config/build/esbuild.config.js"

await Promise.all(options.map(opts => build(opts)))
