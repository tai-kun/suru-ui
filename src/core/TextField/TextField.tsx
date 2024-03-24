import * as React from "react"
import { useSyncedMachine } from "use-machine-ts"
import type { ColorName, TextSize } from "../../theme"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import Slot from "../../utils/Slot"
import { clickMachine, type ClickMachineProps } from "./TextField.machine"
import "suru-ui/TextField.css"

/* -----------------------------------------------------------------------------
 * FocusSteal
 * ---------------------------------------------------------------------------*/

interface FocusStealProps extends ClickMachineProps {
  children: React.ReactNode
  ref: React.Ref<HTMLElement>
}

const FocusSteal = forwardRef(function FocusSteal(props: FocusStealProps) {
  const {
    ref,
    children,
    ...machineProps
  } = props
  const [, send] = useSyncedMachine(clickMachine, machineProps)
  const handlers = React.useMemo<
    Record<
      "onPointerUp" | "onPointerDown" | "onPointerLeave" | "onPointerCancel",
      React.PointerEventHandler<HTMLElement>
    >
  >(
    () => ({
      onPointerUp(ev) {
        if (!ev.defaultPrevented) {
          send({
            type: "POINTER_UP",
            button: ev.button,
            pointerId: ev.pointerId,
            pointerType: ev.pointerType,
          })
        }
      },
      onPointerDown(ev) {
        if (!ev.defaultPrevented) {
          send({
            type: "POINTER_DOWN",
            button: ev.button,
            pointerId: ev.pointerId,
            pointerType: ev.pointerType,
          })
        }
      },
      onPointerLeave(ev) {
        if (!ev.defaultPrevented) {
          send({
            type: "POINTER_LEAVE",
            button: ev.button,
            pointerId: ev.pointerId,
            pointerType: ev.pointerType,
          })
        }
      },
      onPointerCancel(ev) {
        if (!ev.defaultPrevented) {
          send({
            type: "POINTER_CANCEL",
            button: ev.button,
            pointerId: ev.pointerId,
            pointerType: ev.pointerType,
          })
        }
      },
    }),
    [],
  )

  return (
    <Slot
      ref={ref}
      {...handlers}
    >
      {children}
    </Slot>
  )
})

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
  /**
   * クリックされたときに input 要素にフォーカスを移動するのを無効化するかどうか。
   *
   * @default false
   */
  disableFocusSteal?: boolean | undefined
}

export const Adornment = forwardRef(function Adornment(
  props: HTMLPropsWithRef<"div", AdornmentProps>,
) {
  const {
    asChild = false,
    className,
    disableFocusSteal: noFocusSteal = false,
    ...other
  } = props
  const Comp = asChild ? Slot : "div"
  const ref = React.useRef<HTMLElement>(null)

  return (
    <FocusSteal
      ref={ref}
      onClick={() => {
        ref.current
          ?.parentElement
          ?.querySelector<HTMLInputElement>("input.SuiTextFieldInput:enabled")
          ?.focus()
      }}
      disabled={noFocusSteal}
    >
      <Comp
        {...other}
        className={clsx(className, "SuiTextFieldAdornment", { noFocusSteal })}
      />
    </FocusSteal>
  )
})

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
  props: HTMLPropsWithRef<"input", InputProps>,
) {
  const {
    type: typeProp = "text",
    asChild = false,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "input"

  return (
    <Comp
      {...other}
      type={typeProp}
      className={clsx(className, "SuiTextFieldInput")}
    />
  )
})

/* -----------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------------*/

export type Color = Extract<ColorName, "brand" | "neutral">

export type Size = TextSize

export interface RootProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
  /**
   * テキストフィールドの色。
   *
   * @default "neutral"
   */
  color?: Color | undefined
  /**
   * テキストフィールドの幅を親要素に合わせるかどうか。
   *
   * @default false
   */
  fullWidth?: boolean | undefined
  /**
   * コンポーネントの大きさ。
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
    color = "neutral",
    asChild = false,
    className,
    fullWidth = false,
    ...other
  } = props
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      {...other}
      className={clsx(className, "SuiTextField", { color, size, fullWidth })}
    />
  )
})
