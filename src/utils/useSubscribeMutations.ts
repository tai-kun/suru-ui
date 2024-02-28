import * as React from "react"
import atom from "./atom"
import isRefObject from "./isRefObject"
import useAtom from "./useAtom"
import useConstantValue from "./useConstantValue"
import useIsMounted from "./useIsMounted"

export type OnMutate<N extends Node, T> = (
  this: N,
  mutations: MutationRecord[],
  observer: MutationObserver,
) => T

export interface UseSubscribeMutationsConfig<N extends Node, T>
  extends MutationObserverInit
{
  initialValue: T | (() => T)
  onMutate: OnMutate<N, T>
}

/**
 * ノードの変更を監視する。
 *
 * @template N 監視対象のノードの型。
 * @template T 値の型。
 * @param target 監視対象のノード。
 * @param config 監視の設定。
 */
export default function useSubscribeMutations<N extends Node, T>(
  target: React.RefObject<N> | N | null,
  config: UseSubscribeMutationsConfig<N, T>,
): T {
  const {
    subtree,
    onMutate,
    childList,
    attributes,
    initialValue,
    characterData,
    attributeFilter,
    attributeOldValue,
    characterDataOldValue,
  } = config
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
      const node = isRefObject(target)
        ? target.current
        : target

      if (node === null) {
        return () => {}
      }

      const observer = new MutationObserver(mutations => {
        if (isMounted()) {
          dispatch(onMutate.call(node, mutations, observer))
        }
      })

      observer.observe(node, {
        subtree,
        childList,
        attributes,
        characterData,
        attributeFilter,
        attributeOldValue,
        characterDataOldValue,
      } as {})

      return () => {
        observer.disconnect()
      }
    },
    [
      dispatch,
      target,
      subtree,
      onMutate,
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
  const { describe, test } = cfgTest

  describe("src/utils/useSubscribeMutations", () => {
    test.todo("テストする")
  })
}
