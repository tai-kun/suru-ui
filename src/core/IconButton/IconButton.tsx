import * as React from "react"
import * as ButtonBase from "../../base/ButtonBase/ButtonBase"
import type { ShapeSize } from "../../theme"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import Slot from "../../utils/Slot"
import Slottable from "../../utils/Slottable"
import * as Loader from "../Loader/Loader"
import "suru-ui/IconButton.css"

/* -----------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------------*/

export type Align = "start" | "center" | "end"

export type Size = ShapeSize

export type Variant = ButtonBase.Variant | "menuitem"

export interface RootProps extends Omit<ButtonBase.RootProps, "variant"> {
  /**
   * 子要素の配置。
   *
   * @default "center"
   */
  align?: Align | undefined
  /**
   * ボタンの横幅を親要素に合わせるかどうか。
   *
   * @default false
   */
  fullWidth?: boolean | undefined
  /**
   * ローディング中に表示する要素。
   *
   * @default <Loader.Root variant="spinner" />
   */
  loader?: React.ReactElement | undefined
  /**
   * ローディング中かどうか。
   *
   * @default false
   */
  loading?: boolean | undefined
  /**
   * ボタンの大きさ。
   *
   * @default "md"
   */
  size?: Size | undefined
  /**
   * ボタンのスタイル。
   *
   * @default "solid"
   */
  variant?: Variant | undefined
}

export const Root = forwardRef(function Root(
  props: HTMLPropsWithRef<"button", RootProps>,
) {
  const {
    size = "md",
    type: typeProp = "button",
    align = "center",
    color: colorProp = "brand",
    loader = <Loader.Root variant="spinner" />,
    asChild = false,
    loading = false,
    variant: variantProp = "solid",
    children,
    disabled,
    className,
    fullWidth = false,
    "aria-selected": ariaSelected,
    "data-highlighted": dataHighlighted,
    ...other
  } = props
  const Comp = asChild ? Slot : "button"
  const highlighted = String(ariaSelected) === "true"
    || (dataHighlighted !== undefined && String(dataHighlighted) !== "false")
  const color: ButtonBase.Color = variantProp !== "menuitem" || highlighted
    ? colorProp
    : "grey"
  const variant: ButtonBase.Variant = variantProp !== "menuitem"
    ? variantProp
    : highlighted
    ? "solid"
    : "naked"

  return (
    <ButtonBase.Root
      {...other}
      type={typeProp}
      color={color}
      asChild
      variant={variant}
      disabled={disabled || loading}
      className={clsx(className, "SuiIconButton", {
        size,
        align,
        loading,
        menuitem: variantProp === "menuitem",
        fullWidth,
        highlighted,
      })}
      aria-selected={ariaSelected}
      data-highlighted={dataHighlighted}
    >
      <Comp>
        <Slottable>{children}</Slottable>
        {loading && <Slot className="SuiIconButtonLoader">{loader}</Slot>}
      </Comp>
    </ButtonBase.Root>
  )
})
