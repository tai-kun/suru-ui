import * as React from "react"
import { $, isSpaceSize, type SpaceSize } from "../../theme"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import Slot from "../../utils/Slot"
import "suru-ui/MenuList.css"

/* -----------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------------*/

export interface ContextValue {
  level: number
}

export const Context = React.createContext<ContextValue>({ level: 0 })

/* -----------------------------------------------------------------------------
 * Indent
 * ---------------------------------------------------------------------------*/

export type IndentSize = SpaceSize | (string & {}) | number

export interface IndentProps {
  /**
   * インデントのサイズ。
   *
   * @default "md"
   */
  size?: IndentSize | undefined
  /**
   * インデントの間に挿入する要素。
   *
   * @default <span />
   */
  spacer?: React.ReactElement | undefined
}

export const Indent = forwardRef(function Indent(
  props: HTMLPropsWithRef<"span", IndentProps>,
) {
  const ctx = React.useContext(Context)
  const {
    size = "md",
    style: styleProp,
    spacer: spacerProp = <span />,
    children,
    className,
    ...other
  } = props

  if (ctx.level === 1) {
    return null
  }

  const spacer = (
    <Slot className="SuiMenuListIndentSpacer">
      {spacerProp}
    </Slot>
  )
  const style: Record<string, any> = {
    ...styleProp,
    "--SuiMenuListIndent-size": isSpaceSize(size)
      ? `var(${$.space[size]})`
      : typeof size === "number"
      ? `${size}px`
      : size,
  }

  return (
    <span
      {...other}
      style={style}
      className={clsx(className, "SuiMenuListIndent")}
    >
      {Array.from({ length: ctx.level - 1 }).map((_, i) => (
        React.cloneElement(spacer, { key: i })
      ))}
    </span>
  )
})

/* -----------------------------------------------------------------------------
 * Item
 * ---------------------------------------------------------------------------*/

export interface ItemProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
}

export const Item = forwardRef(function Item(
  props: HTMLPropsWithRef<"li", ItemProps>,
) {
  const {
    asChild = false,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "li"

  return (
    <Comp
      {...other}
      className={clsx(className, "SuiMenuListItem")}
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
   * ネストの深さ。
   */
  level?: number | undefined
}

export const Root = forwardRef(function Root(
  props: HTMLPropsWithRef<"ul", RootProps>,
) {
  const ctx = React.useContext(Context)
  const {
    level,
    asChild = false,
    className,
    ...other
  } = props
  const Comp = asChild ? Slot : "ul"
  const nextLv = level === undefined ? ctx.level + 1 : level

  return (
    <Context.Provider
      value={React.useMemo(() => ({ level: nextLv }), [nextLv])}
    >
      <Comp
        {...other}
        className={clsx(className, "SuiMenuList")}
      />
    </Context.Provider>
  )
})
