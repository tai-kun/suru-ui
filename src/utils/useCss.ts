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
  name: string,
  make: (...args: A) => CssObject | null | undefined,
  args: A,
): string {
  if (__DEV__) {
    if (!/^[a-z][a-z0-9-]*$/.test(name)) {
      console.error(
        `SUI(utils/useCss): コンポーネント名はケバブケースで指定してください: ${name}`,
      )
    }

    const nameRef = React.useRef<string>()

    React.useEffect(
      () => {
        if (nameRef.current !== undefined && nameRef.current !== name) {
          console.error(
            "SUI(utils/useCss): コンポーネント名は変更できません: "
              + `${nameRef.current} -> ${name}`,
          )
        }

        nameRef.current = name
      },
      [name],
    )
  }

  return React.useMemo(
    () => {
      const style = make(...args)

      if (style == null) {
        return ""
      }

      const { hash } = renderer.put(hash => ({
        [`@layer sui.components.${name}.dynamic`]: {
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
      using renderResult = renderHook(() => useCss("box", makeStyle, ["red"]))
      const { result } = renderResult

      assert.match(result.current, /^sui-[0-9a-z]+$/)
      assert.deepEqual(
        renderer.raw.map(normalizeCss),
        [
          `
            @layer sui.components.box.dynamic {
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
