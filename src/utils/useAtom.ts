import * as React from "react"
import type { Atom } from "./atom"

export default function useAtom<T>(atom: Atom<T>): [
  state: T,
  dispatch: (newState: T) => void,
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
  const { describe, test } = cfgTest

  describe("src/utils/useAtom", () => {
    test.todo("テストする")
  })
}
