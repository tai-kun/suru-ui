export interface Atom<T> {
  readonly get: () => T
  readonly set: (state: T) => void
  readonly sub: (callback: (state: T) => void) => () => void
}

export default function atom<T>(initialState: T | (() => T)): Atom<T> {
  let state = typeof initialState === "function"
    ? (initialState as () => T)()
    : initialState
  const cbs = new Set<(state: T) => void>()

  return Object.freeze({
    get() {
      return state
    },
    set(newState: T) {
      if (!Object.is(state, newState)) {
        state = newState

        for (const cb of cbs) {
          cb(state)
        }
      }
    },
    sub(cb: (state: T) => void) {
      cbs.add(cb)

      return () => {
        cbs.delete(cb)
      }
    },
  })
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, mock, test } = cfgTest

  describe("src/utils/atom", () => {
    test("初期値を取得できる", () => {
      const a = atom(0)

      assert.equal(a.get(), 0)
    })

    test("値を変更できる", () => {
      const a = atom(0)

      a.set(1)

      assert.equal(a.get(), 1)
    })

    test("値が変更されたときにコールバックが呼ばれる", () => {
      const a = atom(0)
      const cb = mock.fn()

      a.sub(cb)
      a.set(1)

      assert.equal(cb.mock.callCount(), 1)
    })

    test("コールバックを解除できる", () => {
      const a = atom(0)
      const cb = mock.fn()

      const unsub = a.sub(cb)
      unsub()
      a.set(1)

      assert.equal(cb.mock.callCount(), 0)
    })

    test("初期値を関数で指定できる", () => {
      const a = atom(() => 0)

      assert.equal(a.get(), 0)
    })
  })
}
