import * as React from "react"

export interface SlottableProps {
  /**
   * 子要素。
   */
  children: React.ReactNode
}

/**
 * Slot コンポーネントが props を渡す対象としてマークする。
 *
 * @param props - 子要素。
 */
export default function Slottable(props: SlottableProps) {
  return <>{props.children}</>
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/utils/Slottable", () => {
    test("React 要素を返す", () => {
      const element = <Slottable>CHILD</Slottable>

      assert(React.isValidElement(element))
      assert.equal(element.type, Slottable)
    })
  })
}
