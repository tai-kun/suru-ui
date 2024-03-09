import * as React from "react"
import isRefObject from "./isRefObject"
import useIsMounted from "./useIsMounted"

/**
 * イベントリスナーを登録する対象の型。
 *
 * @template T イベントリスナーを登録する対象の型。
 */
export interface EventTargetLike<T> {
  addEventListener(
    this: T,
    type: string,
    listener: (this: T, event: any) => void,
    options?: boolean | AddEventListenerOptions,
  ): void
  removeEventListener(
    this: T,
    type: string,
    listener: (this: T, event: any) => void,
    options?: boolean | EventListenerOptions,
  ): void
}

/**
 * イベントリスナーを登録する関数の戻り値の型。
 * `React.useEffect` と同様に、クリーンアップ関数を返すことができる。
 */
export type RegisterReturn = ReturnType<Parameters<typeof React.useEffect>[0]>

/**
 * `useEventListener` フックのオプション。
 */
export interface Options {
  /**
   * イベントリスナーを有効にするかどうか。
   *
   * @default true
   */
  enabled?: boolean
}

/**
 * イベントリスナーを登録する。
 *
 * @template T イベントリスナーを登録する対象の型。
 * @param target イベントリスナーを登録する対象。
 * @param register イベントリスナーを登録する関数。
 * @param options オプション。
 */
export default function useEventListener<T extends EventTargetLike<T>>(
  target:
    | React.RefObject<T | undefined>
    | T
    | null
    | undefined
    | false
    | ""
    | 0,
  register: (target: T) => RegisterReturn,
  options: Options | undefined = {},
): void {
  const { enabled = true } = options
  const isMounted = useIsMounted()

  React.useEffect(
    () => {
      if (!enabled) {
        return
      }

      const etl = isRefObject(target) ? target.current : target

      if (!etl) {
        return
      }

      let registry: (readonly [any, any, ...any[]])[] = []
      const destructor = register(
        new Proxy(etl, {
          get(_, prop) {
            if (prop !== "addEventListener") {
              const value = etl[prop as keyof T]

              if (typeof value === "function") {
                return value.bind(etl)
              }

              return value
            }

            return (typ: any, listener: any, ...rest: any[]) => {
              const argArray: [any, any, ...any[]] = [
                typ,
                function(this: any, ...args: any) {
                  if (isMounted()) {
                    listener.apply(this, args)
                  }
                },
                ...rest,
              ]
              etl.addEventListener(...argArray)
              registry.push(argArray)
            }
          },
        }),
      )
      const argsArray = registry.toReversed()
      // 例えば setTimeout 内で addEventListener() を呼び出そうとすると、登録解除処理と
      // どちらが先に行われるかわからなくなるため、違反として警告を出す。
      registry = {
        // @ts-expect-error
        push(argArray: any) {
          if (__DEV__) {
            console.error(
              "SUI(utils/useEventListener): addEventListener() は register 内で"
                + "同期的に呼び出す必要があります。引数:",
              argArray,
            )
          }
        },
      }

      return () => {
        for (const args of argsArray) {
          etl.removeEventListener(...args)
        }

        if (typeof destructor === "function") {
          destructor()
        }
      }
    },
    [enabled, target, register],
  )
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { format } = await import("node:util")
  const { renderHook } = await import("../utils-dev/react")
  const { afterEach, assert, describe, mock, test } = cfgTest

  // TODO: Promise.withResolvers が使えるようになったら、それを使う。
  function PromiseWithResolvers<T = unknown>() {
    let resolve: (value: T) => void
    let reject: (reason: unknown) => void
    const promise = new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })

    return { promise, resolve: resolve!, reject: reject! }
  }

  afterEach(() => {
    mock.restoreAll()
  })

  describe("src/utils/useEventListener", () => {
    describe("Client-side", () => {
      test("マウント時にイベントリスナーを登録し、アンマウント時に解除する", () => {
        const div = document.createElement("div")
        const addFn = mock.method(div, "addEventListener")
        const removeFn = mock.method(div, "removeEventListener")
        const renderResult = renderHook(() => {
          useEventListener(
            div,
            React.useCallback(tgt => {
              tgt.addEventListener("resize", () => {})
            }, []),
          )
        })
        const { rerender, unmount } = renderResult

        assert.equal(addFn.mock.callCount(), 1)
        assert.equal(removeFn.mock.callCount(), 0)

        rerender()

        assert.equal(addFn.mock.callCount(), 1)
        assert.equal(removeFn.mock.callCount(), 0)

        unmount()

        assert.equal(addFn.mock.callCount(), 1)
        assert.equal(removeFn.mock.callCount(), 1)
      })

      test("レジスタで関数を返すと、解除時にそれが実行される", () => {
        const div = document.createElement("div")
        const addFn = mock.method(div, "addEventListener")
        const removeFn = mock.method(div, "removeEventListener")
        const destructFn = mock.fn()
        const renderResult = renderHook(() => {
          useEventListener(
            div,
            React.useCallback(tgt => {
              tgt.addEventListener("resize", () => {})

              return () => {
                destructFn()
              }
            }, []),
          )
        })
        const { unmount } = renderResult

        assert.equal(addFn.mock.callCount(), 1)
        assert.equal(removeFn.mock.callCount(), 0)
        assert.equal(destructFn.mock.callCount(), 0)

        unmount()

        assert.equal(addFn.mock.callCount(), 1)
        assert.equal(removeFn.mock.callCount(), 1)
        assert.equal(destructFn.mock.callCount(), 1)
      })

      test("レジスタで addEventListener() を非同期的に呼び出すと警告が出でる", async () => {
        const { promise, resolve } = PromiseWithResolvers<void>()
        const errorFn = mock.method(console, "error")
        const div = document.createElement("div")
        renderHook(() => {
          useEventListener(
            div,
            React.useCallback(tgt => {
              setTimeout(() => {
                tgt.addEventListener("resize", () => {})
                resolve()
              })
            }, []),
          )
        })
        await promise

        assert.deepEqual(
          errorFn.mock.calls.map(call => format(...call.arguments)),
          [
            "SUI(utils/useEventListener): addEventListener() は register 内で"
            + "同期的に呼び出す必要があります。引数: [ 'resize', [Function (anonymous)] ]",
          ],
        )
      })

      test("target が null または undefined の場合は何もしない", () => {
        const addFn = mock.fn()
        const removeFn = mock.fn()
        const renderResult = renderHook(() => {
          useEventListener(
            null,
            // @ts-expect-error
            React.useCallback(tgt => {
              // @ts-expect-error
              tgt.addEventListener("resize", () => {})
            }, []),
          )
        })
        const { rerender, unmount } = renderResult

        assert.equal(addFn.mock.callCount(), 0)
        assert.equal(removeFn.mock.callCount(), 0)

        rerender()

        assert.equal(addFn.mock.callCount(), 0)
        assert.equal(removeFn.mock.callCount(), 0)

        unmount()

        assert.equal(addFn.mock.callCount(), 0)
        assert.equal(removeFn.mock.callCount(), 0)
      })
    })

    describe("Server-side", () => {
      test.todo("テストする")
    })
  })
}
