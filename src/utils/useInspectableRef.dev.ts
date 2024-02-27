import * as React from "react"

/**
 * ref の値を観測する関数。
 *
 * @template T ref の値の型。
 * @param type 観測の種類。
 * @param callback 観測関数。
 */
export type RefInspector<T> = (
  type: "get" | "set",
  callback: (value: T) => void,
) => void

/**
 * 開発環境で ref の値を観測する。
 *
 * **注意**: 本番環境では何も観測しない。
 *
 * @template T ref の値の型。
 * @param initialValue 初期値。
 * @returns ref と観測関数。
 */
function useInspectableRef<T>(initialValue: T): [
  ref: React.MutableRefObject<T>,
  inspector: RefInspector<T>,
]

/**
 * 開発環境で ref の値を観測する。
 *
 * **注意**: 本番環境では何も観測しない。
 *
 * @template T ref の値の型。
 * @returns ref と観測関数。
 */
function useInspectableRef<T = undefined>(): [
  ref: React.MutableRefObject<T | undefined>,
  inspector: RefInspector<T>,
]

function useInspectableRef<T>(initialValue?: T): [
  ref: React.MutableRefObject<T | undefined>,
  inspector: RefInspector<T>,
] {
  if (__DEV__) {
    const { current: getCbs } = React.useRef(new Set<(current: T) => void>())
    const { current: setCbs } = React.useRef(new Set<(value: T) => void>())

    return [
      React.useMemo(
        function ref() {
          let current = initialValue

          return {
            get current() {
              for (const cb of getCbs) {
                cb(current!)
              }

              return current!
            },
            set current(value: T) {
              for (const cb of setCbs) {
                cb(value)
              }

              current = value
            },
          }
        },
        [],
      ),
      React.useCallback(
        function inspector(typ: "get" | "set", cb: (value: any) => void): void {
          if (typ === "get") {
            getCbs.add(cb)
          } else {
            setCbs.add(cb)
          }
        },
        [],
      ),
    ]
  }

  return [
    React.useRef(initialValue),
    () => {},
  ]
}

export default useInspectableRef

if (cfgTest && cfgTest.url === import.meta.url) {
  const { renderHook } = await import("../utils-dev/react")
  const { assert, describe, mock, test } = cfgTest

  describe("src/utils/useInspectableRef.dev", () => {
    describe("Client-side", () => {
      test("getter と setter が呼ばれる", () => {
        const getter = mock.fn()
        const setter = mock.fn()
        using renderResult = renderHook(() => {
          const [ref, inspect] = useInspectableRef(0)
          inspect("get", getter)
          inspect("set", setter)

          return ref
        })
        const { result } = renderResult

        assert.equal(getter.mock.callCount(), 0)
        assert.equal(setter.mock.callCount(), 0)

        result.current.current // getter が呼ばれる
        result.current.current = 1 // setter が呼ばれる
        result.current.current // getter が呼ばれる

        assert.deepEqual(
          getter.mock.calls.map(call => ({
            args: call.arguments,
          })),
          [
            {
              args: [0],
            },
            {
              args: [1],
            },
          ],
        )
        assert.deepEqual(
          setter.mock.calls.map(call => ({
            args: call.arguments,
          })),
          [
            {
              args: [1],
            },
          ],
        )
      })
    })
  })
}
