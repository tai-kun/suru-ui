import { buildDefine } from "cfg-test/define"
import path from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
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
})
