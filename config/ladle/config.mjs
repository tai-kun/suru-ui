// @ts-check

/** @type {any} */
const Dark = "dark"

/** @type {import("@ladle/react").UserConfig} */
export default {
  stories: "src/(base|core|lab)/**/*.stories.tsx",
  viteConfig: "config/ladle/vite.mjs",
  addons: {
    theme: {
      enabled: true,
      defaultState: Dark,
    },
  },
}
