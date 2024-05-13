import * as React from "react"
import type { ShapeSize } from "../../theme"
import type { ColorName } from "../../theme"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import Slot from "../../utils/Slot"
import "suru-ui/Radio.css"

/* -----------------------------------------------------------------------------
 * Input
 * ---------------------------------------------------------------------------*/

export interface InputProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
}

export const Input = forwardRef(function Input(
  props: Omit<HTMLPropsWithRef<"input", InputProps>, "type">,
) {
  const {
    asChild = false,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "input"

  return (
    <Comp
      {...other}
      type="radio"
      className={clsx(className, "SuiRadioInput", {})}
    />
  )
})

/* -----------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------------*/

export type Color = ColorName

export type Size = ShapeSize

export interface RootProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
  /**
   * チェックボックスの色。
   *
   * @default "brand"
   */
  color?: Color | undefined
  /**
   * チェックボックスをインラインで表示するかどうか。
   *
   * @default false
   */
  inline?: boolean | undefined
  /**
   * チェックボックスのサイズ。
   *
   * @default "md"
   */
  size?: Size | undefined
}

export const Root = forwardRef(function Root(
  props: HTMLPropsWithRef<"div", RootProps>,
) {
  const {
    size = "md",
    color = "brand",
    inline = false,
    asChild = false,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      {...other}
      className={clsx(className, "SuiRadio", { size, color, inline })}
    />
  )
})
