import {
  autoUpdate,
  computePosition,
  flip as flipMiddleware,
  offset as offsetMiddleware,
  type Placement as FloatingPlacement,
  shift as shiftMiddleware,
} from "@floating-ui/dom"
import { useComposedRefs } from "@radix-ui/react-compose-refs"
import { Slot } from "@radix-ui/react-slot"
import * as React from "react"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import "suru-ui/base/PopoverBase.css"
import atom from "../../utils/atom"
import useAtom from "../../utils/useAtom"
import useEventListener from "../../utils/useEventListener"
import useIsMounted from "../../utils/useIsMounted"
import useKeyboardEvent from "../../utils/useKeyboardEvent"

/* -----------------------------------------------------------------------------
 * Event
 * ---------------------------------------------------------------------------*/

// TODO: TypeScript で型が定義されたらそれに置き換える。
export interface BeforeToggleEventType extends Event {
  type: "beforetoggle"
  newState: "open" | "closed" | (string & {})
  oldState: "open" | "closed" | (string & {})
}

/* -----------------------------------------------------------------------------
 * helpers
 * ---------------------------------------------------------------------------*/

/**
 * トリガー要素。
 */
export type TriggerElement = HTMLButtonElement | HTMLInputElement

function isValidAnchorElement(
  anchorEl: TriggerElement,
  targetEl: HTMLElement,
) {
  return (
    // ポップオーバー要素とアンカー要素が同じツリー内に存在する必要がある。
    // See: https://html.spec.whatwg.org/multipage/popover.html#the-popover-target-attributes
    (
      anchorEl.parentElement === anchorEl.parentElement
      || anchorEl.parentElement?.contains(targetEl)
      || targetEl.parentElement?.contains(anchorEl)
    )
    // アンカー要素はポップオーバー要素の外側に存在する必要がある。
    && !targetEl.contains(anchorEl)
  )
}

/**
 * ポップオーバーのアンカー要素を取得する。
 *
 * @param targetEl ポップオーバー要素。
 * @returns アンカー要素。
 */
function getAnchorElement(targetEl: HTMLElement | null): TriggerElement | null {
  if (!targetEl) {
    return null
  }

  const { id, ownerDocument } = targetEl
  const anchorEls = ownerDocument.querySelectorAll<TriggerElement>(
    // Popover API のポリフィル
    // https://github.com/oddbird/popover-polyfill/blob/a1ec8dc60bf45fc22d354a41c413ae3ab58c44eb/src/popover.ts#L253-L269
    // を参考に、button 要素か、type 属性が button|submit|reset|image の input 要素。
    // ただし、ポップオーバーの位置決めのために、ポップオーバーを開くことのできる有効な要素に限定する。
    `[popovertarget=${CSS.escape(id)}]:not([popovertargetaction=hide])`
      + `:enabled:is(${[
        `button`,
        `input:is(${[
          "[type=button]",
          "[type=submit]",
          "[type=reset]",
          "[type=image]",
        ]})`,
      ]})`,
  )

  if (anchorEls.length === 0) {
    return null
  }

  for (const [i, anchorEl] of anchorEls.entries()) {
    if (isValidAnchorElement(anchorEl, targetEl)) {
      if (__DEV__) {
        for (let j = i + 1; j < anchorEls.length; j++) {
          if (isValidAnchorElement(anchorEls.item(j), targetEl)) {
            console.warn(
              `SUI(base/PopoverBase): ポップオーバー要素のアンカー要素が複数存在します。`,
              anchorEls.item(j),
            )

            return null
          }
        }
      }

      return anchorEl
    }
  }

  return null
}

/**
 * ポップオーバー要素を取得する。
 *
 * @param target ポップオーバー要素の ID またはポップオーバー要素。
 * @returns ポップオーバー要素。
 */
export function getTargetElement(
  target: string | EventTarget | null | undefined,
): HTMLElement | null {
  if (typeof target === "string") {
    target = document.getElementById(target)
  }

  if (target instanceof HTMLElement) {
    return target
  }

  return null
}

/**
 * ポップオーバーを開く。
 *
 * @param target ポップオーバー要素。
 * @returns この操作によってポップオーバーが開いたかどうか。
 */
export function show(
  target: string | EventTarget | null | undefined,
): boolean | "unknown" {
  const targetEl = getTargetElement(target)

  if (!targetEl) {
    if (__DEV__) {
      console.error(
        `SUI(base/PopoverBase): ポップオーバーが見つかりませんでした。`,
        target,
      )
    }

    return "unknown"
  }

  if (targetEl.matches(":popover-open")) {
    if (__DEV__) {
      console.error(
        "SUI(base/PopoverBase): すでに開いているポップオーバーを開こうとしました。",
        targetEl,
      )
    }

    return false
  }

  targetEl.showPopover()

  return targetEl.matches(":popover-open")
}

/**
 * ポップオーバーを閉じる。
 *
 * @param target ポップオーバー要素。
 * @returns この操作によってポップオーバーが閉じたかどうか。
 */
export function hide(
  target: string | EventTarget | null | undefined,
): boolean | "unknown" {
  const targetEl = getTargetElement(target)

  if (!targetEl) {
    if (__DEV__) {
      console.error(
        `SUI(base/PopoverBase): ポップオーバーが見つかりませんでした。`,
        target,
      )
    }

    return "unknown"
  }

  if (!targetEl.matches(":popover-open")) {
    if (__DEV__) {
      console.error(
        "SUI(base/PopoverBase): すでに閉じているポップオーバーを閉じようとしました。",
        targetEl,
      )
    }

    return false
  }

  targetEl.hidePopover()

  return !targetEl.matches(":popover-open")
}

/**
 * ポップオーバーを開閉する。
 *
 * @param target ポップオーバー要素。
 * @returns この操作によってポップオーバーが開閉したかどうか。
 */
export function toggle(
  target: string | EventTarget | null | undefined,
): "show" | "hide" | false | "unknown" {
  const targetEl = getTargetElement(target)

  if (!targetEl) {
    if (__DEV__) {
      console.error(
        `SUI(base/PopoverBase): ポップオーバーが見つかりませんでした。`,
        target,
      )
    }

    return "unknown"
  }

  let temp

  return targetEl.matches(":popover-open")
    ? ((temp = hide(targetEl)) === true ? "hide" : temp)
    : ((temp = show(targetEl)) === true ? "show" : temp)
}

/* -----------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------------*/
/**
 * ポップオーバーを開閉するアクション。
 */
export type TriggerAction = "toggle" | "show" | "hide"

export interface TriggerProps {
  /**
   * ポップオーバーを開閉するアクション。
   *
   * @default "toggle"
   */
  action?: TriggerAction | undefined
  /**
   * 子要素。
   */
  children: React.ReactNode
  /**
   * ポップオーバーの ID。
   */
  target: string
}

export function Trigger(props: TriggerProps) {
  const {
    action = "toggle",
    target: targetId,
    ...other
  } = props

  return (
    <Slot
      {...other}
      // @ts-expect-error
      popovertarget={targetId}
      popovertargetaction={action}
    />
  )
}

/* -----------------------------------------------------------------------------
 * Target
 * ---------------------------------------------------------------------------*/

/**
 * ポップオーバーの配置。
 */
export type Placement = FloatingPlacement

/**
 * ポップオーバーが開いている状態で、ユーザーが esc キーを押したときに呼び出される関数。
 *
 * @param event キーボードイベント。
 */
export type OnEscapeKeyDown = (this: Window, event: KeyboardEvent) => void

/**
 * ポップオーバーが開いている状態で、ポップオーバーの外側でインタラクションが発生したときに呼び出される関数。
 *
 * @param event ポインターイベント。
 */
export type OnInteractOutside = (this: Window, event: PointerEvent) => void

/**
 * ポップオーバーの開閉状態が変更されたときに呼び出される関数。
 *
 * @param open ポップオーバーが開いているかどうか。
 * @param event トグルイベント。
 */
export type OnOpenChange = (
  this: HTMLElement,
  open: boolean,
  event: ToggleEvent,
) => void

/**
 * onOpenChange を操作する。
 * ポップオーバーの開閉状態と同期して真偽値を返す。
 *
 * @param targetRef ポップオーバー要素の ref オブジェクト。
 * @param handler ハンドラー。
 * @returns ポップオーバーの開閉状態。
 */
function useHandleOpenChange(
  targetRef: React.RefObject<HTMLElement>,
  handler: OnOpenChange | undefined,
) {
  const isMounted = useIsMounted()
  const [open, dispatch] = useAtom(React.useMemo(() => atom(false), []))

  React.useEffect(
    () => {
      const { current: currentTarget } = targetRef

      if (!currentTarget) {
        return
      }

      function handleToggle(this: HTMLElement, event: ToggleEvent) {
        if (isMounted() && event.oldState !== event.newState) {
          const open = event.newState === "open"
          dispatch(open)
          handler?.call(this, open, event)
        }
      }

      currentTarget.addEventListener("toggle", handleToggle as any)

      return () => {
        currentTarget.removeEventListener("toggle", handleToggle as any)
      }
    },
    [handler],
  )

  return open
}

/**
 * onEscapeKeyDown を操作する。
 *
 * @param open ポップオーバーが開いているかどうか。
 * @param targetRef ポップオーバー要素の ref オブジェクト。
 * @param handler ハンドラー。
 */
function useHandleEscapeKeyDown(
  open: boolean,
  targetRef: React.RefObject<HTMLElement>,
  handler: OnEscapeKeyDown | undefined,
): void {
  useKeyboardEvent<Window>(
    "Escape",
    React.useCallback(
      function(event) {
        handler?.call(this, event)

        if (!event.defaultPrevented) {
          hide(targetRef.current)
        }
      },
      [handler],
    ),
    open ? {} : { target: null },
  )
}

/**
 * onInteractOutside を操作する。
 *
 * @param open ダイアログが開いているかどうか。
 * @param targetRef ターゲットコンポーネントの ref オブジェクト。
 * @param handler ハンドラー。
 */
function useHandleInteractOutside(
  open: boolean,
  targetRef: React.RefObject<HTMLElement>,
  handler: OnInteractOutside | undefined,
): void {
  useEventListener(
    open && typeof document !== "undefined" ? window : null,
    React.useCallback(
      win => {
        win.addEventListener("click", function(event) {
          if (
            targetRef.current?.matches(":popover-open")
            // TODO: PointerEvent でない場合は未対応のブラウザかもしれないので、警告を出す。
            && event instanceof PointerEvent
            && event.target instanceof Element
            // クリックされた要素がポップオーバー内の要素ではない。
            && !targetRef.current.contains(event.target)
            // クリックされた要素がポップオーバーを開閉するボタンではない。
            && !event.target.matches(
              `[popovertarget=${CSS.escape(targetRef.current.id)}]`,
            )
          ) {
            handler?.call(this, event)

            if (!event.defaultPrevented) {
              hide(targetRef.current)
            }
          }
        })
      },
      [handler],
    ),
  )
}

/**
 * ポップオーバーの位置を計算する。
 *
 * @param targetRef ターゲットコンポーネントの ref オブジェクト。
 * @param handler ハンドラー。
 * @param options オプション。
 */
function usePopoverPosition(
  open: boolean,
  targetRef: React.RefObject<HTMLElement>,
  options: {
    anchorId: string | undefined
    disabled: boolean
    placement: Placement
  },
): void {
  const { anchorId, disabled, placement } = options

  useEventListener(
    targetRef,
    React.useCallback(
      targetEl => {
        targetEl.addEventListener("beforetoggle", event => {
          if ((event as BeforeToggleEventType).newState === "open") {
            if (disabled) {
              event.preventDefault()
            }
            // else if (event.currentTarget instanceof HTMLElement) {
            //   // 開く前に先行して要素を見えない形で配置することによって、位置計算ができるようにする。
            //   event.currentTarget.attributeStyleMap
            //     .set("--visibility", "hidden")
            // }
          }
        })
      },
      [disabled],
    ),
  )

  React.useEffect(
    () => {
      const targetEl = targetRef.current
      const anchorEl = anchorId
        ? document.getElementById(anchorId)
        : getAnchorElement(targetEl)

      if (!open || !targetEl || !anchorEl) {
        if (targetEl) {
          targetEl.attributeStyleMap.delete("--y")
          targetEl.attributeStyleMap.delete("--x")
          targetEl.attributeStyleMap.delete("--position")
          targetEl.attributeStyleMap.delete("--visibility")
        }

        return
      }

      return autoUpdate(anchorEl, targetEl, async () => {
        try {
          const result = await computePosition(anchorEl, targetEl, {
            strategy: "fixed", // TODO: オプションで指定できるようにする。
            placement,
            middleware: [
              offsetMiddleware(8),
              flipMiddleware(),
              shiftMiddleware(),
            ], // TODO: オプションで指定できるようにする。
          })
          targetEl.attributeStyleMap.set("--y", result.y + "px")
          targetEl.attributeStyleMap.set("--x", result.x + "px")
          targetEl.attributeStyleMap.set("--position", result.strategy)
          targetEl.attributeStyleMap.set("--visibility", "visible")
        } catch (err) {
          console.error(
            "SUI(base/PopoverBase): ポップオーバーの位置計算中にエラーが発生しました。",
            err,
          )
        }
      })
    },
    [open, anchorId, placement],
  )
}

export interface TargetProps {
  /**
   * アンカー要素の ID。
   */
  anchor?: string | undefined
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
  /**
   * ポップオーバーを無効にするかどうか。
   *
   * @default false
   */
  disabled?: boolean | undefined
  /**
   * ポップオーバーの ID。
   */
  id: string
  /**
   * ポップオーバーの配置。
   */
  placement?: Placement | undefined
  /**
   * ポップオーバーが開いている状態で、ユーザーが esc キーを押したときに呼び出される関数。
   */
  onEscapeKeyDown?: OnEscapeKeyDown | undefined
  /**
   * ポップオーバーが開いている状態で、ポップオーバーの外側でインタラクションが発生したときに呼び出される関数。
   */
  onInteractOutside?: OnInteractOutside | undefined
  /**
   * ポップオーバーの開閉状態が変更されたときに呼び出される関数。
   */
  onOpenChange?: OnOpenChange | undefined
}

export const Target = forwardRef(function Target(
  props: Omit<HTMLPropsWithRef<"div", TargetProps>, "popover">,
) {
  const {
    ref: refProp,
    role = "dialog",
    anchor: anchorId,
    asChild = false,
    disabled = false,
    className,
    placement = "bottom",
    "data-scope": scope,
    onOpenChange,
    onEscapeKeyDown,
    onInteractOutside,
    ...other
  } = props
  const Comp = asChild ? Slot : "div"
  const targetRef = React.useRef<HTMLElement>(null)
  const open = useHandleOpenChange(targetRef, onOpenChange)
  usePopoverPosition(open, targetRef, { anchorId, disabled, placement })
  useHandleEscapeKeyDown(open, targetRef, onEscapeKeyDown)
  useHandleInteractOutside(open, targetRef, onInteractOutside)

  return (
    <Comp
      {...other}
      ref={useComposedRefs(refProp, targetRef)}
      role={role}
      className={clsx(className, "SuiPopoverBaseTarget")}
      data-scope={clsx.lite(scope, "SuiPopoverBase")}
      // @ts-expect-error
      popover="manual"
    />
  )
})

/* -----------------------------------------------------------------------------
 * Test
 * ---------------------------------------------------------------------------*/

if (cfgTest && cfgTest.url === import.meta.url) {
  // const { render } = await import("../../utils-dev/react")
  const { describe, test } = cfgTest

  describe("src/base/PopoverBase/PopoverBase", () => {
    test.todo("テストを書く")
  })
}
