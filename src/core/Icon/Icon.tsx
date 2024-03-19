import * as React from "react"
import type { IconDefinition } from "../../icons"
import {
  type ColorName,
  isTextColorVariant,
  parseColor,
  type TextColorVariant,
} from "../../theme"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import Slot from "../../utils/Slot"
import "suru-ui/Icon.css"

/* -----------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------------*/

export type Color = ColorName | `${ColorName}.${TextColorVariant}`

export interface RootProps {
  /**
   * アイコンの色。
   */
  color?: Color | undefined
  /**
   * アイコンの定義。
   */
  icon: IconDefinition
}

export const Root = forwardRef(function Root(
  props: Omit<HTMLPropsWithRef<"svg", RootProps>, "children">,
) {
  const {
    icon,
    color: colorProp,
    className,
    ...other
  } = props
  const [color, contrast] = parseColor(colorProp, [isTextColorVariant]) || []

  return (
    <Slot
      {...other as {}}
      className={clsx(
        className,
        "SuiIcon",
        { color, contrast: color && (contrast === "hc" ? "high" : "low") },
        icon.props.className,
      )}
    >
      {icon.children}
    </Slot>
  )
})
