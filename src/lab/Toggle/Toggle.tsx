import * as React from "react"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import Slot from "../../utils/Slot"
import Slottable from "../../utils/Slottable"
import "suru-ui/lab/Toggle.css"

/* -----------------------------------------------------------------------------
 * Style
 * ---------------------------------------------------------------------------*/

interface StyleProps {
  id: string
  display: Display
  selector: string
}

function Style(props: StyleProps) {
  const { id, display, selector } = props

  return (
    <style>
      {`.${id}{`
        + `.SuiToggleOff{display:${display}}.SuiToggleOn{display:none}`
        + `${selector}{.SuiToggleOff{display:none}.SuiToggleOn{display:${display}}`
        + "}"}
    </style>
  )
}

/* -----------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------------*/

export type Display = Exclude<
  React.CSSProperties["display"],
  "none" | undefined
>

export interface RootProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
  /**
   * @default "inline-block"
   */
  display?: Display | undefined
  /**
   * この要素が表示されていないときに表示される要素。
   */
  off: React.ReactElement
  /**
   * この要素が表示されているときに表示される要素。
   */
  on: React.ReactElement
  /**
   * 表示する条件を含む CSS セレクター。
   */
  selector: string
}

export const Root = forwardRef(function Root(
  props: HTMLPropsWithRef<"div", RootProps>,
) {
  const {
    on,
    off,
    asChild = false,
    display = "inline-block",
    children,
    selector,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "div"
  const id = React.useId()

  return (
    <Comp
      {...other}
      className={clsx(className, "SuiToggle", id)}
    >
      <Slottable>{children}</Slottable>
      <Slot className="SuiToggleOff">{off}</Slot>
      <Slot className="SuiToggleOn">{on}</Slot>
      <Style
        id={CSS.escape(id)}
        display={display}
        selector={selector}
      />
    </Comp>
  )
})
