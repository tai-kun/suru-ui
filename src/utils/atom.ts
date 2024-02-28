/**
 * 状態を管理するためのアトム。
 *
 * @template S 状態の型。
 */
export interface Atom<S> {
  /**
   * 状態のスナップショットを取得する。
   *
   * @returns 状態。
   */
  readonly get: () => S
  /**
   * 状態を更新する。
   *
   * @param newState 新しい状態。
   */
  readonly set: (newState: S) => void
  /**
   * 状態の変更を監視する。同じ関数を複数回登録しても、一度しか呼ばれない。
   *
   * @param callback 状態が変更されたときに呼ばれるコールバック。
   * @returns コールバックを解除する関数。
   */
  readonly sub: (callback: (state: S) => void) => () => void
}

/**
 * 状態を管理するためのアトムを作成する。
 *
 * @template S 状態の型。
 * @param initialState 初期状態。
 * @returns 作成されたアトム。
 */
export default function atom<S>(initialState: S | (() => S)): Atom<S> {
  let state = typeof initialState === "function"
    ? (initialState as () => S)()
    : initialState
  const cbs = new Set<(state: S) => void>()

  return Object.freeze({
    get() {
      return state
    },
    set(newState: S) {
      if (!Object.is(state, newState)) {
        state = newState

        for (const cb of cbs) {
          cb(state)
        }
      }
    },
    sub(cb: (state: S) => void) {
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
