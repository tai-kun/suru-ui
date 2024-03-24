import * as React from "react"
import {
  type ColorName,
  isTextColor,
  isTextColorVariant,
  type Monochrome,
  parseColor,
  type TextColor,
  type TextColorVariant,
} from "../../theme"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import Slot from "../../utils/Slot"
import "suru-ui/Loader.css"

/* -----------------------------------------------------------------------------
 * Dots
 * ---------------------------------------------------------------------------*/

function Dots(props: { dot: React.ReactElement }) {
  const { dot } = props

  return (
    <>
      <Slot className="SuiLoaderDot" data-scope="SuiLoader">{dot}</Slot>
      <Slot className="SuiLoaderDot" data-scope="SuiLoader">{dot}</Slot>
      <Slot className="SuiLoaderDot" data-scope="SuiLoader">{dot}</Slot>
    </>
  )
}

/* -----------------------------------------------------------------------------
 * Spinner
 * ---------------------------------------------------------------------------*/

function Spinner(props: { spinner: React.ReactElement }) {
  const { spinner } = props

  return (
    <Slot
      className="SuiLoaderSpinner"
      data-scope="SuiLoader"
    >
      {spinner}
    </Slot>
  )
}

/* -----------------------------------------------------------------------------
 * Content
 * ---------------------------------------------------------------------------*/

export type Variant = "dots" | "spinner"

function Content(props: { variant: Variant }) {
  const { variant } = props

  switch (variant) {
    case "dots":
      return <Dots dot={<span />} />

    case "spinner":
      return <Spinner spinner={<span />} />

    default:
      if (__DEV__) {
        console.error(`SUI(core/Loader): 不明な variant: ${variant}`)
      }

      return null
  }
}

/* -----------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------------*/

export type Color =
  | "inherit"
  | TextColor
  | "canvas"
  | Monochrome
  | ColorName
  | `${ColorName}.${TextColorVariant}`

export interface RootProps {
  /**
   * ローダーの色。
   *
   * @default "inherit"
   */
  color?: Color | undefined
  /**
   * div 要素としてレンダリングするかどうか。
   *
   * @default false
   */
  div?: boolean | undefined
  /**
   * variant が "dots" のとき子要素に与えられるドット要素。
   *
   * @default <span />
   */
  dot?: React.ReactElement | undefined
  /**
   * variant が "spinner" のとき子要素に与えられるスピナー要素。
   *
   * @default <span />
   */
  spinner?: React.ReactElement | undefined
  /**
   * ローダーの形状。
   *
   * @default "dots"
   */
  variant?: Variant | undefined
}

export const Root = forwardRef(function Root(
  props: Omit<HTMLPropsWithRef<"span", RootProps>, "children">,
) {
  const {
    div = false,
    dot = <span />,
    color: colorProp = "inherit",
    spinner = <span />,
    variant = "dots",
    className,
    ...other
  } = props
  const Comp = div ? "div" : "span"
  const parsedColor =
    colorProp === "inherit" || colorProp === "canvas" || isTextColor(colorProp)
      ? colorProp
      : parseColor(colorProp, [isTextColorVariant]) || "inherit"

  return (
    <Comp
      {...other}
      className={clsx(className, "SuiLoader", {
        variant,
        color: typeof parsedColor === "string" ? parsedColor : parsedColor[0],
        contrast: parsedColor[1] === "hc" ? "high" : "low",
      })}
    >
      <Content variant={variant} />
    </Comp>
  )
})
