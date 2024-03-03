import * as React from "react"
import { $, type ColorName, type ColorVariant } from "../../theme"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import Slot from "../../utils/Slot"
import useCss from "../../utils/useCss"
import "suru-ui/base/ButtonBase.css"

/* -----------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------------*/

export type Color = ColorName

export type Variant = ColorVariant

export interface RootProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
  /**
   * ボタンの色。
   *
   * @default "primary"
   */
  color?: Color | undefined
  /**
   * ボタンに枠線を付けるかどうか。
   *
   * @default false
   */
  outlined?: boolean | undefined
  /**
   * ボタンのスタイル。
   *
   * @default "solid"
   */
  variant?: Variant | undefined
}

function makeRootStyle(color: Color, variant: Variant) {
  const bg = $.color[color][variant]

  return {
    "--SuiButtonBase-color": `var(${
      variant === "solid"
        ? $.text.onfill
        : $.color[color].solid.noop
    })`,
    "--SuiButtonBase-color-noop": `var(${bg.noop})`,
    "--SuiButtonBase-color-hover": `var(${bg.hover})`,
    "--SuiButtonBase-color-active": `var(${bg.active})`,
    "--SuiButtonBase-border-color": `var(${$.color[color].main})`,
  }
}

export const Root = forwardRef(function Root(
  props: HTMLPropsWithRef<any, RootProps>,
) {
  const {
    color = "primary",
    asChild = false,
    variant = "solid",
    outlined = false,
    className,
    "data-scope": scope,
    ...other
  } = props
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      {...other as {}}
      className={clsx(
        className,
        "SuiButtonBase",
        { variant, outlined },
        useCss(makeRootStyle, [color, variant]),
      )}
      data-scope={clsx.lite(scope, "SuiButtonBase")}
    />
  )
})

/* -----------------------------------------------------------------------------
 * Test
 * ---------------------------------------------------------------------------*/

if (cfgTest && cfgTest.url === import.meta.url) {
  const { render } = await import("../../utils-dev/react")
  const { assert, describe, test } = cfgTest

  describe("src/base/ButtonBase/ButtonBase", () => {
    test("必要な機能を備えている", () => {
      using renderResult = render(<Root data-scope="Test">Hello</Root>)
      const root = renderResult.getByText("Hello")

      assert.equal(root.dataset["scope"], "Test SuiButtonBase")
    })
  })
}
