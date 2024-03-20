import * as React from "react"
import type { ColorName, ColorVariant } from "../../theme"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import Slot from "../../utils/Slot"
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
   * @default "brand"
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

export const Root = forwardRef(function Root(
  props: HTMLPropsWithRef<null, RootProps>,
) {
  const {
    color = "brand",
    asChild = false,
    variant = "solid",
    outlined = false,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      {...other as {}}
      className={clsx(
        className,
        "SuiButtonBase",
        { color, variant, outlined },
      )}
    />
  )
})
