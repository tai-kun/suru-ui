import vhash from "@suru-ui/vhash";
import stringify from "./stringify";
import type { CssValue, CssValueFunction } from "./types";

export interface BuildResult {
  hash: string;
  template: readonly string[];
  functions: readonly CssValueFunction[];
}

export default function build(
  pieces: TemplateStringsArray,
  values: readonly CssValue[],
): BuildResult {
  let source = pieces[0]!,
    template: string[] = [source],
    functions: CssValueFunction[] = [];

  for (
    let i = 0,
      j = 0,
      str: string | CssValueFunction,
      nValues = values.length;
    i < nValues;
    i++
  ) {
    str = stringify(values[i]);

    if (
      typeof str === "function"
      // toString を持つ場合、スタイル付きコンポーネントのように、
      // それらの関数が CSS の値を返すことを期待するので、CssValueFunction として扱わない。
      && !Object.hasOwn(str, "toString")
    ) {
      functions.push(str);
      source += template[++j] = pieces[i + 1]!;
    } else {
      source += template[j]! += str + pieces[i + 1]!;
    }
  }

  return {
    hash: vhash(source),
    template,
    functions,
  };
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/styled/build", () => {
    test.todo("テスト");
  });
}
