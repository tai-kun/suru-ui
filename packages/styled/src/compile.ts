import { createContext, digest, update } from "@suru-ui/vhash";
import type { BuildResult } from "./build";
import createCssFunction from "./createCssFunction";
import stringify from "./stringify";

export interface CompileResult {
  hash: string;
  cssText: string;
}

export default function compile(
  css: {} | undefined,
  template: BuildResult["template"],
  functions: BuildResult["functions"],
): CompileResult {
  let i = 0,
    ctx = createContext(),
    value: string,
    cssText = template[i++]!,
    nPeices = template.length,
    cssFuntion = createCssFunction(css);

  for (; i < nPeices; i++) {
    update(ctx, value = stringify(functions[i - 1]!(cssFuntion)) as string);
    cssText += value + template[i]!;
  }

  return {
    hash: digest(ctx).toString(36),
    cssText,
  };
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/styled/compile", () => {
    test.todo("テスト");
  });
}
