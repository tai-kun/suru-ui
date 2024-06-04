import stringify from "./stringify";
import type { CssFunction } from "./types";

export default function createCssFunction(css: {} | undefined): CssFunction {
  if (__DEV__) {
    const keys = Object.keys(css || {}).filter(k => k in (() => {}));

    if (keys.length) {
      console.error(
        `SUI(styled): CSS の値に関数のプロパティが含まれています: `,
        keys,
      );

      css = { ...css };

      for (const key of keys) {
        // @ts-expect-error
        delete css[key];
      }
    }
  }

  return Object.assign<CssFunction, {}>(
    (pieces, ...values) => {
      let i = 0,
        str = pieces[i++]!;

      for (; i < pieces.length; i++) {
        str += stringify(values[i - 1]) + pieces[i]!;
      }

      return str;
    },
    css || {},
  );
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/styled/createCssFunction", () => {
    test.todo("テスト");
  });
}
