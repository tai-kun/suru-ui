import * as React from "react"
import type { LabelSize, SupplSize, TextSize } from "../../theme"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import Slot from "../../utils/Slot"
import "suru-ui/lab/FormField.css"

export type Size = LabelSize & TextSize & SupplSize

/* -----------------------------------------------------------------------------
 * Label
 * ---------------------------------------------------------------------------*/

export interface LabelProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
  /**
   * ラベルの大きさ。
   */
  size?: Size | undefined
}

export const Label = forwardRef(function Label(
  props: HTMLPropsWithRef<"label", LabelProps>,
) {
  const {
    size,
    asChild = false,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "label"

  return (
    <Comp
      {...other}
      className={clsx(className, "SuiFormFieldLabel", { size })}
    />
  )
})

/* -----------------------------------------------------------------------------
 * HelperText
 * ---------------------------------------------------------------------------*/

export interface HelperTextProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
  /**
   * テキストの大きさ。
   */
  size?: Size | undefined
}

export const HelperText = forwardRef(function HelperText(
  props: HTMLPropsWithRef<"div", HelperTextProps>,
) {
  const {
    size,
    asChild = false,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      {...other}
      className={clsx(className, "SuiFormFieldHelperText", { size })}
    />
  )
})

/* -----------------------------------------------------------------------------
 * ExampleText
 * ---------------------------------------------------------------------------*/

export interface ExampleTextProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
  /**
   * テキストの大きさ。
   */
  size?: Size | undefined
}

export const ExampleText = forwardRef(function ExampleText(
  props: HTMLPropsWithRef<"div", ExampleTextProps>,
) {
  const {
    size,
    asChild = false,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      {...other}
      className={clsx(className, "SuiFormFieldExampleText", { size })}
    />
  )
})

/* -----------------------------------------------------------------------------
 * ErrorText
 * ---------------------------------------------------------------------------*/

export interface ErrorTextProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
  /**
   * テキストの大きさ。
   */
  size?: Size | undefined
}

export const ErrorText = forwardRef(function ErrorText(
  props: HTMLPropsWithRef<"div", ErrorTextProps>,
) {
  const {
    size,
    asChild = false,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      {...other}
      className={clsx(className, "SuiFormFieldErrorText", { size })}
    />
  )
})

/* -----------------------------------------------------------------------------
 * Control
 * ---------------------------------------------------------------------------*/

export interface ControlProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
}

export const Control = forwardRef(function Control(
  props: HTMLPropsWithRef<"div", ControlProps>,
) {
  const {
    asChild = false,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      {...other}
      className={clsx(className, "SuiFormFieldControl", {})}
    />
  )
})

/* -----------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------------*/

export interface RootProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
  /**
   * テキストの大きさ。
   */
  size?: Size | undefined
}

export const Root = forwardRef(function Root(
  props: HTMLPropsWithRef<"div", RootProps>,
) {
  const {
    size,
    asChild = false,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      {...other}
      className={clsx(className, "SuiFormField", { size })}
    />
  )
})
