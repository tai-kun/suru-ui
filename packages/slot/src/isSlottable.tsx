import React from "react";

import Slottable, { type SlottableProps } from "./Slottable";

export type SlottableElement = React.ReactElement<
  SlottableProps,
  typeof Slottable
>;

/**
 * `Slottable` かどうかを判定する。
 *
 * @param node - 子要素。
 * @returns `Slottable` なら `true`、そうでなければ `false`。
 */
export default function isSlottable(
  node: React.ReactNode,
): node is SlottableElement {
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
