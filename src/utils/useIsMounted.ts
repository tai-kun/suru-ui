import * as React from "react"

/**
 * 現在のコンポーネントがマウントされているかどうかを確認する関数を返す。
 *
 * @param initialValue 初期値。
 * @returns マウントされているかどうか。
 */
export default function useIsMounted(
  initialValue: boolean | undefined = false,
): () => boolean {
  const isMounted = React.useRef(initialValue)

  React.useEffect(
    () => {
      isMounted.current = true

      return () => {
        isMounted.current = false
      }
    },
    [],
  )

  return React.useCallback(() => isMounted.current, [])
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { renderHook } = await import("../utils-dev/react")
  const { assert, describe, test } = cfgTest

  describe("src/utils/useIsMounted", () => {
    describe("Client-side", () => {
      test("関数を返す", () => {
        using renderResult = renderHook(() => useIsMounted())
        const { result } = renderResult

        assert.equal(typeof result.current, "function")
      })

      test("マウント後に true を返す", () => {
        using renderResult = renderHook(() => useIsMounted())
        const { result } = renderResult

        assert(result.current())
      })

      test("アンマウント後に false を返す", () => {
        const renderResult = renderHook(() => useIsMounted())
        const { result, unmount } = renderResult

        assert(result.current())

        unmount()

        assert(!result.current())
      })

      test("再レンダリングしても同じ関数を返す", () => {
        using renderResult = renderHook(() => useIsMounted())
        const { result, rerender } = renderResult
        const isMounted1 = result.current
        rerender()
        const isMounted2 = result.current
        rerender()
        const isMounted3 = result.current

        assert.equal(isMounted1, isMounted2)
        assert.equal(isMounted2, isMounted3)
      })
    })

    describe("Server-side", () => {
      test.todo("テストする")
    })
  })
}
