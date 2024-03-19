import * as React from "react"
import {
  type ColorName,
  type FontFamily,
  type FontWeight,
  isTextColor,
  isTextColorVariant,
  type Monochrome,
  parseColor,
  type TextColor,
  type TextColorVariant,
  type TextSize,
} from "../../theme"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import Slot from "../../utils/Slot"
import "suru-ui/Text.css"

/* -----------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------------*/

export type Align = "left" | "center" | "right" | "justify" | "inherit"

export type Color =
  | "inherit"
  | TextColor
  | "canvas"
  | Monochrome
  | ColorName
  | `${ColorName}.${TextColorVariant}`

export type Size = TextSize | "inherit"

export type Font = FontFamily | "inherit"

export type Weight = FontWeight | "inherit"

export interface RootProps {
  /**
   * テキストの配置。
   *
   * @default "inherit"
   */
  align?: Align | undefined
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
  /**
   * テキストの色。
   *
   * @default "inherit"
   */
  color?: Color | undefined
  /**
   * テキストのフォント。
   *
   * @default "inherit"
   */
  font?: Font | undefined
  /**
   * インライン要素としてレンダリングするかどうか。
   *
   * @default false
   */
  inline?: boolean | undefined
  /**
   * テキストの最大行数。`null` の場合、行数制限は行われない。
   *
   * @default null
   */
  lineClamp?: number | null | undefined
  /**
   * テキストのサイズ。
   *
   * @default "inherit"
   */
  size?: Size | undefined
  /**
   * テキストを切り詰めて、末尾に省略記号を追加するかどうか。
   *
   * @default false
   */
  truncate?: boolean | undefined
  /**
   * テキストの太さ。
   *
   * @default "inherit"
   */
  weight?: Weight | undefined
}

export const Root = forwardRef(function Root(
  props: HTMLPropsWithRef<"p", RootProps>,
) {
  const {
    font = "inherit",
    size = "inherit",
    align = "inherit",
    color: colorProp = "inherit",
    style: styleProp,
    inline = false,
    weight = "inherit",
    asChild = false,
    truncate = false,
    lineClamp = null,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "p"
  const parsedColor =
    colorProp === "inherit" || colorProp === "canvas" || isTextColor(colorProp)
      ? colorProp
      : parseColor(colorProp, [isTextColorVariant])
  const style: Record<string, any> | undefined = lineClamp === null
    ? styleProp
    : {
      "--SuiText-lineClamp": Math.max(1, Math.round(lineClamp)),
    }

  if (__DEV__) {
    React.useEffect(
      () => {
        if (inline && lineClamp !== null) {
          console.error(
            "SUI(core/Text): inline と lineClamp を同時に指定することはできません。"
              + "lineClamp はブロック要素でのみ使用できます。inline は無効化されます。",
          )
        }

        if (truncate && lineClamp !== null) {
          console.error(
            "SUI(core/Text): truncate と lineClamp を同時に指定することはできません。"
              + "truncate は無効化されます。",
          )
        }

        if (
          lineClamp !== null
          && !(Number.isSafeInteger(lineClamp) && lineClamp > 0)
        ) {
          console.error(
            "SUI(core/Text): lineClamp には正の整数を指定してください。",
          )
        }
      },
      [inline, lineClamp, truncate],
    )
  }

  return (
    <Comp
      {...other}
      style={style}
      className={clsx(
        className,
        "SuiText",
        {
          font,
          size,
          align,
          weight,
          inline,
          truncate,
          lineClamp: lineClamp !== null,
          color: typeof parsedColor === "string"
            ? parsedColor
            : parsedColor?.[0] || "inherit",
          contrast: parsedColor && parsedColor[1] === "hc" ? "high" : "low",
        },
      )}
    />
  )
})
