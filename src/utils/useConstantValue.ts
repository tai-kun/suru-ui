import * as React from "react"

/**
 * コンポーネント内の定数値を保持するフック。
 *
 * @template T 値の型。
 * @param value 値。
 * @returns 定数値。
 */
export default function useConstantValue<T>(value: T): T {
  return React.useRef(value).current
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { renderHook } = await import("../utils-dev/react")
  const { assert, describe, test } = cfgTest

  describe("src/utils/useConstantValue", () => {
    test("値を返す", () => {
      const obj = {}
      using renderResult = renderHook(() => useConstantValue(obj))
      const { result, rerender } = renderResult

      assert.equal(result.current, obj)

      rerender()

      assert.equal(result.current, obj)
    })
  })
}
