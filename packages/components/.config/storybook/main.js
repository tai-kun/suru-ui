// @ts-check

import { buildDefine } from "cfg-test/define";
import { dirname, join } from "node:path";

/**
 * @param {string} value
 * @returns {string}
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}

/** @type { import("@storybook/react-vite").StorybookConfig } */
const config = {
  stories: [
    "../../src/**/*.stories.tsx",
  ],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  // @ts-expect-error
  framework: getAbsolutePath("@storybook/react-vite"),
  viteFinal(config) {
    return {
      ...config,
      define: {
        ...config.define,
        ...buildDefine,
        __DEV__: "true",
      },
      esbuild: {
        ...config.esbuild,
        jsx: "automatic",
      },
    };
  },
};

export default config;
