import * as React from "react"
import createCssRenderer, { type CssObject } from "./createCssRenderer"
import onceCell from "./singleton"

export type {
  CssArray,
  CssObject,
  CssPrimitive,
  CssValue,
} from "./createCssRenderer"

export const renderer = onceCell("css-renderer", createCssRenderer)

/**
 * スタイルルールが適用された CSS のクラス名を返す。
 *
 * @template A スタイルルールを生成するための引数の型。
 * @param name コンポーネント名。
 * @param make スタイルルールを生成する関数。
 * @param args スタイルルールを生成するための引数。
 * @returns CSS のクラス名。
 */
export default function useCss<A extends readonly unknown[]>(
  make: (...args: A) => CssObject | null | undefined,
  args: A,
): string {
  return React.useMemo(
    () => {
      const style = make(...args)

      if (style == null) {
        return ""
      }

      const { hash } = renderer.put(hash => ({
        [`@layer sui.dynamic`]: {
          [`.sui-${hash}`]: style,
        },
      }))

      return hash
        ? `sui-${hash}`
        : ""
    },
    args,
  )
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { renderHook } = await import("../utils-dev/react")
  const { normalizeCss } = await import("../utils-dev/normalizeCss")
  const { assert, describe, test } = cfgTest

  describe("src/utils/useCss", () => {
    test("スタイルルールを追加して専用のクラス名を返す", () => {
      const makeStyle = (color: string) => ({
        color,
      })
      using renderResult = renderHook(() => useCss(makeStyle, ["red"]))
      const { result } = renderResult

      assert.match(result.current, /^sui-[0-9a-z]+$/)
      assert.deepEqual(
        renderer.raw.map(normalizeCss),
        [
          `
            @layer sui.dynamic {
              .${result.current} {
                color: red;
              }
            }
          `,
        ].map(normalizeCss),
      )
    })
  })
}
