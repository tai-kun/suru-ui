import { transfer, useStateMachine } from "@tai-kun/use-state-machine"
import * as React from "react"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import Slot from "../../utils/Slot"
import useComposedRefs from "../../utils/useComposedRefs"
import useEventListener from "../../utils/useEventListener"
import useInspectableRef from "../../utils/useInspectableRef.dev"
import machine, { type MachineProps } from "./DialogBase.machine"
import "suru-ui/base/DialogBase.css"

/* -----------------------------------------------------------------------------
 * Event
 * ---------------------------------------------------------------------------*/

/**
 * ダイアログが開こうとするときに発火するイベント。
 */
export class SuiBeforeOpenEvent extends Event {
  /**
   * @param modal モーダルダイアログとして開こうとするかどうか。未定義の場合はダイアログに従う。
   * @param eventInitDict イベントの初期化オプション。
   */
  constructor(
    public modal: boolean | undefined,
    eventInitDict: Omit<EventInit, "cancelable"> | undefined = {},
  ) {
    super("sui:dialog-base:beforeopen", {
      ...eventInitDict,
      // 開こうとする場合のみキャンセル可能。Popover API の動作と同じにしている。
      cancelable: true,
    })
  }
}

/* -----------------------------------------------------------------------------
 * helpers
 * ---------------------------------------------------------------------------*/

/**
 * トリガー要素。
 */
export type TriggerElement = HTMLElement

/**
 * ダイアログ要素を取得する。
 *
 * @param target ダイアログの ID またはダイアログ要素。
 * @returns ダイアログ要素。
 */
function getHTMLDialogElement(
  target: string | EventTarget | null | undefined,
): HTMLDialogElement | null {
  if (typeof target === "string") {
    target = document.getElementById(target)
  }

  if (target instanceof HTMLDialogElement) {
    return target
  }

  return null
}

/**
 * ダイアログの表示オプション。
 */
export interface ShowOptions {
  /**
   * モーダルダイアログとして開くかどうか。
   *
   * @default undefined
   */
  modal?: boolean | undefined
}

/**
 * ダイアログを表示する。
 *
 * @param target ダイアログ。
 * @param options オプション。
 * @returns この操作によってダイアログが開いたかどうか。
 */
export function show(
  target: string | EventTarget | null | undefined,
  options: ShowOptions | undefined = {},
): boolean | "unknown" {
  const { modal } = options
  const dialogEl = getHTMLDialogElement(target)

  if (!dialogEl) {
    if (__DEV__) {
      console.error(
        `SUI(base/DialogBase): ダイアログが見つかりませんでした。`,
        target,
      )
    }

    return "unknown"
  }

  if (dialogEl.open) {
    if (__DEV__) {
      // TODO: すでに開いているダイアログに .show(Modal)? を呼び出すとエラーが投げられる
      //       仕様をどこかで見かけた気がするので調査する。
      console.error(
        "SUI(base/DialogBase): すでに開いているダイアログを開こうとしました。",
        dialogEl,
      )
    }

    return false
  }

  dialogEl.dispatchEvent(new SuiBeforeOpenEvent(modal))

  return dialogEl.open
}

/**
 * ダイアログをモーダルとして表示する。
 *
 * @param target ダイアログ。
 * @returns この操作によってダイアログが開いたかどうか。
 */
export function showModal(
  target: string | EventTarget | null | undefined,
): boolean | "unknown" {
  return show(target, { modal: true })
}

/**
 * ダイアログを閉じる。
 *
 * @param target ダイアログ。
 * @returns この操作によってダイアログが閉じたかどうか。
 */
export function hide(
  target: string | EventTarget | null | undefined,
): boolean | "unknown" {
  const dialogEl = getHTMLDialogElement(target)

  if (!dialogEl) {
    if (__DEV__) {
      console.error(
        `SUI(base/DialogBase): ダイアログが見つかりませんでした。`,
        target,
      )
    }

    return "unknown"
  }

  if (!dialogEl.open) {
    if (__DEV__) {
      console.error(
        "SUI(base/DialogBase): すでに閉じているダイアログを閉じようとしました。",
        dialogEl,
      )
    }

    return false
  }

  dialogEl.close()

  return !dialogEl.open
}

/**
 * ダイアログを開閉する。
 *
 * @param target ダイアログ。
 * @param options 表示オプション。
 * @returns この操作によってダイアログが開閉したかどうか。
 */
export function toggle(
  target: string | EventTarget | null | undefined,
  options: ShowOptions | undefined = {},
): "show" | "hide" | false | "unknown" {
  const dialogEl = getHTMLDialogElement(target)

  if (!dialogEl) {
    if (__DEV__) {
      console.error(
        `SUI(base/DialogBase): ダイアログが見つかりませんでした。`,
        target,
      )
    }

    return "unknown"
  }

  let temp

  return dialogEl.open
    ? ((temp = hide(dialogEl)) === true ? "hide" : temp)
    : ((temp = show(dialogEl, options)) === true ? "show" : temp)
}

/* -----------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------------*/

/**
 * ダイアログを開閉するアクション。
 */
export type TriggerAction = "toggle" | "show" | "hide"

export interface TriggerProps extends ShowOptions {
  /**
   * ダイアログを開閉するアクション。
   *
   * @default "toggle"
   */
  action?: TriggerAction | undefined
  /**
   * 子要素。
   */
  children: React.ReactNode
  /**
   * ダイアログの ID。
   */
  target: string
}

export function Trigger(props: TriggerProps) {
  const {
    modal,
    action = "toggle",
    target: targetId,
    children,
  } = props
  const ref = React.useRef<HTMLElement>(null)
  const handleClick = React.useCallback<React.MouseEventHandler<HTMLElement>>(
    () => {
      switch (action) {
        case "toggle":
          toggle(targetId, { modal })

          break

        case "show":
          show(targetId, { modal })

          break

        case "hide":
          hide(targetId)

          break

        default:
          if (__DEV__) {
            console.error(
              `SUI(base/DialogBase): 未知のアクションが指定されました。`,
              action,
            )
          }
      }
    },
    [action, targetId, modal],
  )

  React.useEffect(
    () => {
      if (ref.current) {
        const dialogEl = getHTMLDialogElement(targetId)

        if (dialogEl) {
          ref.current.setAttribute("aria-expanded", `${dialogEl.open}`)
        }
      }
    },
    [targetId],
  )

  return (
    <Slot
      ref={ref}
      onClick={handleClick}
      aria-controls={targetId}
      aria-expanded="false"
      aria-haspopup="dialog"
    >
      {children}
    </Slot>
  )
}

/* -----------------------------------------------------------------------------
 * Target
 * ---------------------------------------------------------------------------*/

/**
 * ダイアログが開いている状態で、ユーザーが esc キーを押したときに呼び出される関数。
 *
 * @param event キーボードイベント。
 * @returns なし。
 */
export type OnEscapeKeyDown = (
  this: HTMLDialogElement,
  event: Event | KeyboardEvent,
) => void

/**
 * ダイアログが開いている状態で、ダイアログの外側でインタラクションが発生したときに呼び出される関数。
 *
 * @param event ポインターイベント。
 * @returns なし。
 */
export type OnInteractOutside = (this: Window, event: PointerEvent) => void

/**
 * ダイアログの開閉状態が変更されたときに呼び出される関数。
 *
 * @param isOpen ダイアログが開いたかどうか。
 * @returns なし。
 */
export type OnOpenChange = (isOpen: boolean) => void

function useHandleOpenChange(
  props: {
    id: string
    send: {
      (event: "DIALOG.OPEN"): void
      (event: "DIALOG.CLOSE"): void
      (event: { type: "OPEN"; event: SuiBeforeOpenEvent }): void
    }
    isOpen: boolean
    targetRef: React.RefObject<HTMLDialogElement>
    onOpenChange: OnOpenChange | undefined
  },
) {
  const { id, targetRef, send, isOpen, onOpenChange } = props
  React.useEffect(
    () => {
      if (!targetRef.current) {
        return
      }

      const { current: targetEl } = targetRef

      function handleBeforeOpen(
        this: HTMLDialogElement,
        event: SuiBeforeOpenEvent,
      ) {
        send({
          type: "OPEN",
          event,
        })
      }

      targetEl.addEventListener(
        "sui:dialog-base:beforeopen",
        handleBeforeOpen as any,
        { passive: true },
      )
      const observer = new MutationObserver(mutations => {
        const mutation = mutations.at(-1)

        if (mutation?.target instanceof Element) {
          if (
            mutation.oldValue === null
            && mutation.target.hasAttribute("open")
          ) {
            send("DIALOG.OPEN")
          } else if (
            mutation.oldValue !== null
            && !mutation.target.hasAttribute("open")
          ) {
            send("DIALOG.CLOSE")
          }
        }
      })
      observer.observe(targetEl, {
        attributes: true,
        attributeFilter: ["open"],
        attributeOldValue: true,
      })

      return () => {
        observer.disconnect()
        targetEl.removeEventListener(
          "sui:dialog-base:beforeopen",
          handleBeforeOpen as any,
        )
      }
    },
    [],
  )
  React.useEffect(
    () => {
      onOpenChange?.(isOpen)
    },
    [isOpen, onOpenChange],
  )
  React.useEffect(
    () => {
      const triggerEl = document.querySelector(
        `[aria-controls=${CSS.escape(id)}]`,
      )

      if (triggerEl instanceof HTMLElement) {
        triggerEl.setAttribute("aria-expanded", `${isOpen}`)
      }
    },
    [isOpen],
  )
}

/**
 * onEscapeKeyDown を操作する。
 * dialog 要素の cancel イベントを監視し、イベントを発火する。
 */
function useHandleEscapeKeyDown(
  props: {
    isOpen: boolean
    targetRef: React.RefObject<HTMLDialogElement>
    onEscapeKeyDown: OnEscapeKeyDown | undefined
  },
): void {
  const { isOpen, targetRef, onEscapeKeyDown } = props
  useEventListener(
    targetRef,
    React.useCallback(
      targetEl => {
        if (onEscapeKeyDown) {
          // ダイアログの説明
          // https://developer.mozilla.org/ja/docs/Web/API/HTMLDialogElement#%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88
          // より、cancelについて、
          // 「ユーザーがエスケープキーで現在開いているダイアログを解除したときに発行されます。」
          // とあるので、cancel イベントを監視する。
          targetEl.addEventListener("cancel", function(event) {
            onEscapeKeyDown.call(this, event)
          })
        }
      },
      [onEscapeKeyDown],
    ),
    {
      enabled: isOpen,
    },
  )
}

/**
 * ポインタの座標が矩形内にあるかどうかを判定する。
 *
 * @param rect 矩形。
 * @param pointer ポインタの座標。
 * @returns ポインタが矩形内にあるかどうか。
 */
function isInside(
  rect: Record<"top" | "left" | "right" | "bottom", number>,
  pointer: Record<"x" | "y", number>,
): boolean {
  return (
    rect.left <= pointer.x
    && pointer.x <= rect.right
    && rect.top <= pointer.y
    && pointer.y <= rect.bottom
  )
}

/**
 * onInteractOutside を操作する。
 */
function useHandleInteractOutside(
  props: {
    isOpen: boolean
    targetRef: React.RefObject<HTMLDialogElement>
    onInteractOutside: OnInteractOutside | undefined
  },
): void {
  const { isOpen, targetRef, onInteractOutside } = props
  useEventListener(
    typeof document !== "undefined" && window,
    React.useCallback(
      win => {
        win.addEventListener("pointerdown", function(event) {
          const { current: targetEl } = targetRef

          if (
            !targetEl
            || !(event.target instanceof Element)
            // ダイアログのトリガーをクリックした場合は、そのトリガーの動作を優先させる。
            || event.target.getAttribute("aria-controls") === targetEl.id
            || (
              targetEl.matches(":modal")
                // モーダル状態ではダイアログ要素のコンテンツを除く ::backdrop がクリック
                // されたときに閉じたいが、イベントとしてはダイアログ要素がターゲットになる。
                // そのため、ダイアログ要素の外側をクリックしたかどうかは座標で判定する。
                ? isInside(targetEl.getBoundingClientRect(), {
                  x: event.clientX,
                  y: event.clientY,
                })
                // 非モーダルでは ::backdrop が無いので、クリックされた要素の祖先に
                // ダイアログ要素が含まれていないかどうかで判定する。
                : event.target.closest(`#${CSS.escape(targetEl.id)}`)
            )
          ) {
            return
          }

          onInteractOutside?.call(this, event)

          if (!event.defaultPrevented) {
            hide(targetEl)
          }
        })
      },
      [onInteractOutside],
    ),
    {
      enabled: isOpen,
    },
  )
}

export interface TargetProps extends MachineProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
  /**
   * ダイアログの ID。
   */
  id: string
  /**
   * ダイアログが開いている状態で、ユーザーが esc キーを押したときに呼び出される関数。
   */
  onEscapeKeyDown?: OnEscapeKeyDown | undefined
  /**
   * ダイアログが開いている状態で、ダイアログの外側でインタラクションが発生したときに呼び出される関数。
   */
  onInteractOutside?: OnInteractOutside | undefined
  /**
   * ダイアログの開閉状態が変更されるときに呼び出される関数。
   */
  onOpenChange?: OnOpenChange | undefined
}

export const Target = forwardRef(function Target(
  props: Omit<HTMLPropsWithRef<"dialog", TargetProps>, "open">,
) {
  const {
    id,
    ref: refProp,
    modal,
    asChild = false,
    disabled = false,
    className,
    "data-scope": scope,
    onOpenChange,
    onEscapeKeyDown,
    onInteractOutside,
    ...other
  } = props
  const Comp = asChild ? Slot : "dialog"
  const [targetRef, inspect] = useInspectableRef<HTMLDialogElement | null>(null)

  if (__DEV__) {
    inspect(
      "set",
      React.useCallback(
        targetEl => {
          if (targetEl !== null && !(targetEl instanceof HTMLDialogElement)) {
            throw new Error(
              "SUI(base/DialogBase): ref に渡された要素が HTMLDialogElement "
                + "のインスタンスではありません。",
            )
          }
        },
        [],
      ),
    )
  }

  const [state, send] = useStateMachine(machine, [
    targetRef,
    transfer({
      modal,
      disabled,
    }),
  ])
  const isOpen = state.value === "open"

  useHandleOpenChange({
    id,
    send,
    isOpen,
    targetRef,
    onOpenChange,
  })
  useHandleEscapeKeyDown({
    isOpen,
    targetRef,
    onEscapeKeyDown,
  })
  useHandleInteractOutside({
    isOpen,
    targetRef,
    onInteractOutside,
  })

  return (
    <Comp
      {...other}
      id={id}
      ref={useComposedRefs(refProp, targetRef)}
      className={clsx(className, "SuiDialogBaseTarget")}
      data-scope={clsx.lite(scope, "SuiDialogBase")}
    />
  )
})

/* -----------------------------------------------------------------------------
 * Test
 * ---------------------------------------------------------------------------*/

if (cfgTest && cfgTest.url === import.meta.url) {
  // const { render } = await import("../../utils-dev/react")
  const { describe, test } = cfgTest

  describe("src/base/DialogBase/DialogBase", () => {
    test.todo("テストする")
  })
}
