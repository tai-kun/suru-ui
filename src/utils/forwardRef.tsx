import * as React from "react"

/**
 * `data-` 属性の型。
 */
export type DataAttributes = {
  [A in `data-${any}`]?: string | number | boolean | null | undefined
}

/**
 * HTML コンポーネントのプロパティ。
 *
 * @template E - 要素名。
 * @template P - プロパティ。
 * @template Q - プロパティの基本。
 */
export type HTMLProps<
  E extends keyof JSX.IntrinsicElements | null = null,
  P = {},
  Q = E extends string ? JSX.IntrinsicElements[E]
    : React.AllHTMLAttributes<HTMLElement>,
> =
  & Omit<Q & DataAttributes, keyof P | "key">
  & P
  & React.Attributes

/**
 * HTML コンポーネントのプロパティ。
 *
 * @template E - 要素名。
 * @template P - プロパティ。
 * @template Q - プロパティの基本。
 */
export type HTMLPropsWithRef<
  E extends keyof JSX.IntrinsicElements | null = null,
  P = {},
  Q = E extends string ? JSX.IntrinsicElements[E]
    : React.AllHTMLAttributes<HTMLElement>,
> =
  & Omit<Q & DataAttributes, keyof P | "key" | "ref">
  & P
  & React.Attributes
  & { ref: React.ForwardedRef<any> }

/**
 * `React.forwardRef` のラッパー。
 *
 * @template P - プロパティ。
 * @param render - レンダリング関数。
 * @returns コンポーネント。
 */
export default function forwardRef<P>(
  render: (props: P) => React.ReactNode,
): React.ForwardRefExoticComponent<
  & React.PropsWithoutRef<P>
  & (P extends { ref?: React.ForwardedRef<infer E> | undefined }
    ? React.RefAttributes<E>
    : {})
> {
  // @ts-ignore
  return React.forwardRef((props, ref) => render({ ...props, ref }))
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const ReactIs = await import("react-is")
  const { expectType } = await import("tsd")
  const { assert, describe, test } = cfgTest

  describe("src/utils/forwardRef", () => {
    test("forwardRef の返り値は ForwardRef コンポーネント", () => {
      const Component = forwardRef(() => null)

      assert(ReactIs.isValidElementType(Component))
      assert.equal(ReactIs.typeOf(<Component />), ReactIs.ForwardRef)
    })

    describe("tsd", () => {
      test("取り得るすべての props", () => {
        forwardRef((props: HTMLPropsWithRef) => {
          const keys = {} as keyof typeof props

          expectType<
            | `data-${any}`
            | "ref"
            | "key"
            | keyof React.AllHTMLAttributes<HTMLElement>
          >(keys)

          return null
        })
      })

      test("特定の要素の props を期待できる", () => {
        forwardRef((props: HTMLPropsWithRef<"input">) => {
          const keys = {} as keyof typeof props

          expectType<
            | `data-${any}`
            | "ref"
            | "key"
            | keyof React.InputHTMLAttributes<HTMLInputElement>
          >(keys)

          return null
        })
      })

      test("ref は ForwardedRef<any>", () => {
        forwardRef((props: HTMLPropsWithRef<"input">) => {
          expectType<React.ForwardedRef<any>>(props.ref)

          return null
        })
      })
    })
  })
}
