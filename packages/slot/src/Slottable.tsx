import React from "react";

export interface SlottableProps {
  /**
   * 子要素。
   */
  children: React.ReactNode;
}

/**
 * Slot コンポーネントが props を渡す対象としてマークする。
 *
 * @param props - 子要素。
 */
export function Slottable(props: SlottableProps) {
  return <>{props.children}</>;
}

/**
 * `Slottable` かどうかを判定する。
 *
 * @param node - 子要素。
 * @returns `Slottable` なら `true`、そうでなければ `false`。
 */
export function isSlottable(
  node: React.ReactNode,
): node is React.ReactElement<any> {
  return React.isValidElement(node) && node.type === Slottable;
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest;

  describe("@suru-ui/slot/Slottable", () => {
    test("React 要素を返す", () => {
      assert(React.isValidElement(<Slottable>CHILD</Slottable>));
    });

    test("Slottable と判定できる", () => {
      assert(isSlottable(<Slottable>{null}</Slottable>));
      assert(!isSlottable(<div />));
    });
  });
}
