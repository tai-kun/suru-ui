import React from "react";

import Slottable from "./Slottable";

/**
 * `Slottable` かどうかを判定する。
 *
 * @param node - 子要素。
 * @returns `Slottable` なら `true`、そうでなければ `false`。
 */
export default function isSlottable(
  node: React.ReactNode,
): node is React.ReactElement<any> {
  return React.isValidElement(node) && node.type === Slottable;
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest;

  describe("@suru-ui/slot/isSlottable", () => {
    test("Slottable と判定できる", () => {
      assert(isSlottable(<Slottable>{null}</Slottable>));
      assert(!isSlottable(<div />));
    });
  });
}
