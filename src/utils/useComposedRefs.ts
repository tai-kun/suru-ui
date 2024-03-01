import * as React from "react"
import composeRefs from "./composeRefs"

/**
 * 複数の ref を結合する。
 *
 * @template T ref の型。
 * @param refs ref の配列。
 * @returns 結合された ref。
 */
export default function useComposedRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return React.useMemo(() => composeRefs(...refs), refs)
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest

  describe("src/utils/useComposedRefs", () => {
    test.todo("テストを書く")
  })
}
