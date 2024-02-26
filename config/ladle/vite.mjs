import replace from "@rollup/plugin-replace"
import { buildDefine } from "cfg-test/define"
import { defineConfig } from "vite"

export default defineConfig({
  resolve: {
    alias: [{
      find: /^suru-ui\/([A-Z].+)\.css$/,
      replacement: process.cwd() + "/src/core/$1/$1.css",
    }, {
      find: /^suru-ui\/(base|lab)\/([A-Z].+)\.css$/,
      replacement: process.cwd() + "/src/$1/$2/$2.css",
    }],
  },
  plugins: [
    replace({
      ...buildDefine,
      __DEV__: "true",
      preventAssignment: true,
    }),
  ],
})
