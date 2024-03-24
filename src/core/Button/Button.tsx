import * as React from "react"
import * as ButtonBase from "../../base/ButtonBase/ButtonBase"
import type { ShapeSize } from "../../theme"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import Slot from "../../utils/Slot"
import Slottable from "../../utils/Slottable"
import * as Loader from "../Loader/Loader"
import "suru-ui/Button.css"

/* -----------------------------------------------------------------------------
 * Adornment
 * ---------------------------------------------------------------------------*/

export interface AdornmentProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
}

export const Adornment = forwardRef(function Adornment(
  props: HTMLPropsWithRef<"span", AdornmentProps>,
) {
  const {
    asChild = false,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      {...other}
      className={clsx(className, "SuiButtonAdornment")}
    />
  )
})

/* -----------------------------------------------------------------------------
 * Text
 * ---------------------------------------------------------------------------*/

export type TextAlign = "start" | "center" | "end"

export interface TextProps {
  /**
   * テキストの配置。
   *
   * @default "center"
   */
  align?: TextAlign | undefined
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
  /**
   * テキストを可能な限り横幅をとるかどうか。
   *
   * @default false
   */
  fullWidth?: boolean | undefined
}

export const Text = forwardRef(function Text(
  props: HTMLPropsWithRef<"span", TextProps>,
) {
  const {
    align = "center",
    asChild = false,
    fullWidth = false,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      {...other}
      className={clsx(className, "SuiButtonText", { align, fullWidth })}
    />
  )
})

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
   * @default <Loader.Root />
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
    loader = <Loader.Root />,
    asChild = false,
    loading = false,
    variant: variantProp = "solid",
    children,
    disabled,
    className,
    fullWidth = false,
    "data-scope": scope,
    "aria-selected": ariaSelected,
    "data-highlighted": dataHighlighted,
    ...other
  } = props
  const Comp = asChild ? Slot : "button"
  const highlighted = String(ariaSelected) === "true"
    || (dataHighlighted !== undefined && String(dataHighlighted) !== "false")
  const color: ButtonBase.Color = variantProp !== "menuitem" || highlighted
    ? colorProp
    : "neutral"
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
      className={clsx(className, "SuiButton", {
        size,
        align,
        loading,
        menuitem: variantProp === "menuitem",
        fullWidth,
        highlighted,
      })}
      data-scope={clsx.lite(scope, "SuiButton")}
      aria-selected={ariaSelected}
      data-highlighted={dataHighlighted}
    >
      <Comp>
        <Slottable>{children}</Slottable>

        {loading && (
          <Slot
            className="SuiButtonLoader"
            data-scope={clsx.lite(scope, "SuiButton")}
          >
            {loader}
          </Slot>
        )}
      </Comp>
    </ButtonBase.Root>
  )
})
