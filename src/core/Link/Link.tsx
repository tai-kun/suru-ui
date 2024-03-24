import * as React from "react"
import { dsaNewWindow } from "../../icons/digital.go.jp/outlined"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import Slot from "../../utils/Slot"
import Slottable from "../../utils/Slottable"
import * as Icon from "../Icon/Icon"
import "suru-ui/Link.css"

/* -----------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------------*/

function preventDefault(e: React.BaseSyntheticEvent<unknown>) {
  e.preventDefault()
}

export type Underline = "never" | "hover" | "always"

export interface RootProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
  /**
   * リンク機能を無効にするかどうか。
   *
   * @default false
   */
  disabled?: boolean | undefined
  /**
   * 外部リンクの場合に表示するアイコンを無効にするかどうか。
   *
   * @default false
   */
  disableExternalIcon?: boolean | undefined
  /**
   * リンクの下線の表示方法。
   *
   * - `"never"`: 下線を表示しません。
   * - `"hover"`: マウスオーバー時に下線を表示します。
   * - `"always"`: 常に下線を表示します。
   *
   * @default "hover"
   */
  underline?: Underline | undefined
}

export const Root = forwardRef(function Root(
  props: HTMLPropsWithRef<"a", RootProps>,
) {
  const {
    rel: refProp,
    target,
    asChild = false,
    onClick,
    children,
    disabled = false,
    tabIndex,
    className,
    underline = "hover",
    "aria-disabled": ariaDisabled = disabled,
    disableExternalIcon = false,
    ...other
  } = props
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      {...other}
      rel={target === "_blank" ? (refProp ?? "noreferrer") : refProp}
      target={target}
      onClick={disabled ? preventDefault : onClick}
      tabIndex={disabled ? -1 : tabIndex}
      className={clsx(className, "SuiLink", { underline })}
      aria-disabled={ariaDisabled}
    >
      <Slottable>{children}</Slottable>
      {!disableExternalIcon && target === "_blank" && (
        <Icon.Root className="SuiLinkExternalIcon" icon={dsaNewWindow} />
      )}
    </Comp>
  )
})
