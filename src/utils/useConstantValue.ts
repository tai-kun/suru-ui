import * as React from "react"

/**
 * コンポーネント内の定数値を保持するフック。
 *
 * @template T - 値の型。
 * @param value - 値。
 * @returns 定数値。
 */
export default function useConstantValue<T>(value: T): T {
  return React.useRef(value).current
}

if (cfgTest && cfgTest.url === import.meta.url) {
  await import("@happy-dom/global-registrator")
    .then(({ GlobalRegistrator }) => GlobalRegistrator.register())
  const { renderHook } = await import("@testing-library/react")
  const { assert, describe, test } = cfgTest

  describe("src/utils/useConstantValue", () => {
    test("常に同じ値を返す", () => {
      const obj = {}
      const { result, rerender } = renderHook(() => useConstantValue(obj))

      assert.equal(result.current, obj)

      rerender()

      assert.equal(result.current, obj)
    })
  })
}
