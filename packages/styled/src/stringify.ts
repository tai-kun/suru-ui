import type { CssValue, CssValueFunction } from "./types";

export default function stringify(value: CssValue): string | CssValueFunction {
  switch (true) {
    case typeof value === "string":
      return value;

    case typeof value === "number":
      switch (true) {
        case value !== value:
          break;

        case value === Infinity:
          return "infinity";

        case value === -Infinity:
          return "-infinity";

        default:
          return "" + value;
      }

      break;

    case typeof value === "bigint":
      return "" + value;

    case typeof value === "boolean":
      return value && "true" || "false";

    case value == null:
      return "";

    case Array.isArray(value): {
      let i = 0,
        str = "",
        nItems = value.length;

      for (; i < nItems; i++) {
        str += value[i];
        (i + 1 < nItems) && (str += " ");
      }

      return str;
    }

    case Object.hasOwn(value as object, "toValue"):
      // @ts-expect-error
      return stringify(value.toValue());

    case Object.hasOwn(value as object, "toString"):
      return value.toString();

    case typeof value === "function":
      return value as CssValueFunction;
  }

  if (__DEV__) {
    console.error(
      `SUI(styled): CSS の値に変換できない値が含まれています: `,
      value,
    );
  }

  return "";
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/styled/stringify", () => {
    test.todo("テスト");
  });
}
