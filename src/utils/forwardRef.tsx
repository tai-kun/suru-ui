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
 * @template E 要素名。
 * @template P プロパティ。
 * @template Q プロパティの基本。
 */
export type HTMLProps<
  E extends keyof JSX.IntrinsicElements = any,
  P = {},
  Q = 0 extends (1 & E) // E が any なら満たす。
    ? React.AllHTMLAttributes<HTMLElement>
    : JSX.IntrinsicElements[E],
> = Omit<Q & DataAttributes, keyof P> & P

/**
 * HTML コンポーネントのプロパティ。
 *
 * @template E 要素名。
 * @template P プロパティ。
 * @template Q プロパティの基本。
 */
export type HTMLPropsWithRef<
  E extends keyof JSX.IntrinsicElements = any,
  P = {},
  Q = 0 extends (1 & E) // E が any なら満たす。
    ? React.AllHTMLAttributes<HTMLElement>
    : JSX.IntrinsicElements[E],
> = Omit<Q & DataAttributes, keyof P | "ref"> & P & {
  ref: React.ForwardedRef<any>
}

/**
 * `React.forwardRef` のラッパー。
 *
 * @template P プロパティ。
 * @param render レンダリング関数。
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
      test("特定の要素の props を期待できる", () => {
        forwardRef((props: HTMLPropsWithRef<"input">) => {
          const keys = {} as keyof typeof props

          expectType<
            | keyof DataAttributes
            | keyof React.ClassAttributes<HTMLInputElement>
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
