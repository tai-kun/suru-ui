import * as React from "react"
import atom from "./atom"
import isRefObject from "./isRefObject"
import useAtom from "./useAtom"
import useConstantValue from "./useConstantValue"
import useIsMounted from "./useIsMounted"

/**
 * ノードの変更を監視したときのイベント。
 *
 * @template N 監視対象のノードの型。
 */
export interface OnChangeEvent<N extends Node> {
  /**
   * 監視対象のノード。
   */
  currentTarget: N
  /**
   * 変更の情報。
   */
  mutations: MutationRecord[]
  /**
   * オブザーバーインスタンス。
   */
  observer: MutationObserver
}

/**
 * ノードの変更を監視したときに呼ばれるコールバック関数。
 *
 * @template N 監視対象のノードの型。
 * @template T 値の型。
 * @param event 変更イベント。
 * @returns 新しい値。
 */
export type OnChange<N extends Node, T> = (event: OnChangeEvent<N>) => T

/**
 * ノードの変更を監視するためのカスタムフックの引数。
 *
 * @template N 監視対象のノードの型。
 * @template T 値の型。
 */
export interface UseSubscribeMutationsProps<N extends Node, T>
  extends MutationObserverInit
{
  /**
   * 初期値。
   */
  initialValue: T | (() => T)
  /**
   * 変更イベントが発生したときに呼ばれるコールバック関数。
   */
  onChange: OnChange<N, T>
  /**
   * 監視対象のノード。
   */
  target: React.RefObject<N> | N | null
}

/**
 * ノードの変更を監視する。
 *
 * @template N 監視対象のノードの型。
 * @template T 値の型。
 * @param props カスタムフックの引数。
 */
export default function useSubscribeMutations<N extends Node, T>(
  props: UseSubscribeMutationsProps<N, T>,
): T {
  const {
    target,
    subtree,
    onChange,
    childList,
    attributes,
    initialValue,
    characterData,
    attributeFilter,
    attributeOldValue,
    characterDataOldValue,
  } = props
  const isMounted = useIsMounted()
  const [state, dispatch] = useAtom(React.useMemo(() => atom(initialValue), []))

  if (__DEV__) {
    const firstInitialValue = useConstantValue(initialValue)

    React.useEffect(
      () => {
        if (
          typeof firstInitialValue !== "function"
          && firstInitialValue !== initialValue
        ) {
          console.error(
            "SUI(utils/useSubscribeMutations): initialValue を変更することはできません。",
          )
        }
      },
      [initialValue],
    )
  }

  React.useEffect(
    () => {
      const currentTarget = isRefObject(target)
        ? target.current
        : target

      if (currentTarget === null) {
        return () => {}
      }

      const ins = new MutationObserver((mutations, observer) => {
        if (isMounted()) {
          dispatch(onChange({ currentTarget, mutations, observer }))
        }
      })

      ins.observe(currentTarget, {
        subtree,
        childList,
        attributes,
        characterData,
        attributeFilter,
        attributeOldValue,
        characterDataOldValue,
      } as {})

      return () => {
        ins.disconnect()
      }
    },
    [
      target,
      subtree,
      onChange,
      childList,
      attributes,
      characterData,
      `${attributeFilter}`,
      attributeOldValue,
      characterDataOldValue,
    ],
  )

  return state
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { act, renderHook, waitFor } = await import("../utils-dev/react")
  const { assert, describe, test } = cfgTest

  describe("src/utils/useSubscribeMutations", () => {
    test("変更を検知する", { timeout: 3e3 }, async () => {
      const target = document.createElement("button")
      using renderResult = renderHook(() =>
        useSubscribeMutations({
          target,
          onChange(ev) {
            return ev.currentTarget.disabled
          },
          initialValue: false,
          attributes: true,
        })
      )
      const { result } = renderResult

      assert.equal(result.current, false)

      act(() => {
        target.disabled = true
      })

      await waitFor(() => {
        assert.equal(result.current, true)
      })
    })
  })
}
