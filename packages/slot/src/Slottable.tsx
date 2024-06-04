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
export default function Slottable(props: SlottableProps) {
  return <>{props.children}</>;
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest;

  describe("@suru-ui/slot/Slottable", () => {
    test("React 要素を返す", () => {
      assert(React.isValidElement(<Slottable>CHILD</Slottable>));
    });
  });
}
