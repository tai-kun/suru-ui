import * as React from "react"
import type { Atom } from "./atom"

/**
 * アトムを使って状態を管理するためのカスタムフック。
 *
 * @param atom 状態を管理するためのアトム。
 * @returns 状態と状態を更新するための関数。
 */
export default function useAtom<S>(atom: Atom<S>): [
  state: S,
  dispatch: (newState: S) => void,
] {
  const state = React.useSyncExternalStore(
    React.useCallback(notify => atom.sub(notify), [atom]),
    atom.get,
    atom.get,
  )

  return [
    state,
    atom.set,
  ]
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { renderHook, act } = await import("../utils-dev/react")
  const { default: atom } = await import("./atom")
  const { assert, describe, test } = cfgTest

  describe("src/utils/useAtom", () => {
    describe("Client-side", () => {
      test("状態と状態を更新するための関数を返す", () => {
        const countAtom = atom(0)
        using renderResult = renderHook(() => useAtom(countAtom))
        const { result } = renderResult
        const [count, setCount] = result.current

        assert.equal(count, 0)
        assert.equal(typeof setCount, "function")
      })

      test("状態を更新できる", () => {
        const countAtom = atom(0)
        using renderResult = renderHook(() => useAtom(countAtom))

        act(() => {
          const { result } = renderResult
          const [, setCount] = result.current
          setCount(1)
        })

        const { result } = renderResult
        const [count] = result.current

        assert.equal(count, 1)
      })
    })
  })
}
