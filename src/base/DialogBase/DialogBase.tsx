import { useComposedRefs } from "@radix-ui/react-compose-refs"
import { Slot } from "@radix-ui/react-slot"
import * as React from "react"
import clsx from "../../utils/clsx"
import forwardRef, { type HTMLPropsWithRef } from "../../utils/forwardRef"
import useEventListener from "../../utils/useEventListener"
import useInspectableRef from "../../utils/useInspectableRef.dev"
import useSubscribeMutations, {
  type UseSubscribeMutationsConfig,
} from "../../utils/useSubscribeMutations"
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
 * トリガー要素を取得する。
 *
 * @param dialogEl ダイアログ要素。
 * @returns トリガー要素。
 */
function* getTriggerElements(
  dialogEl: HTMLDialogElement | null,
): Generator<TriggerElement> {
  if (!dialogEl) {
    return
  }

  const { id, ownerDocument } = dialogEl
  const triggerEls = ownerDocument.querySelectorAll<TriggerElement>(
    // Popover API のポリフィル
    // https://github.com/oddbird/popover-polyfill/blob/a1ec8dc60bf45fc22d354a41c413ae3ab58c44eb/src/popover.ts#L253-L269
    // を参考に、button 要素か、type 属性が button|submit|reset|image の input 要素。
    `[aria-controls=${CSS.escape(id)}]:enabled:is(${[
      `button`,
      `input:is(${[
        "[type=button]",
        "[type=submit]",
        "[type=reset]",
        "[type=image]",
      ]})`,
    ]})`,
  )

  for (const triggerEl of triggerEls) {
    yield triggerEl
  }

  return
}

/**
 * ダイアログ要素を取得する。
 *
 * @param target ダイアログの ID またはダイアログ要素。
 * @returns ダイアログ要素。
 */
function getHTMLDialogElement(target: unknown): HTMLDialogElement | null {
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
 * @returns ダイアログが開いたかどうか。
 */
export function show(
  target: unknown,
  options: ShowOptions | undefined = {},
): boolean | "unknown" {
  const { modal } = options
  const dialogEl = getHTMLDialogElement(target)

  if (dialogEl) {
    if (dialogEl.open) {
      // TODO: すでに開いているダイアログに .show(Modal)? を呼び出すとエラーが投げられる
      //       仕様をどこかで見かけた気がするので調査する。
      console.error(
        "SUI(base/DialogBase): すでに開いているダイアログを開こうとしました。",
      )

      return false
    }

    dialogEl.dispatchEvent(new SuiBeforeOpenEvent(modal))

    return dialogEl.open
  }

  if (__DEV__) {
    console.error(
      `SUI(base/DialogBase): ダイアログが見つかりませんでした。`,
      target,
    )
  }

  return "unknown"
}

/**
 * ダイアログをモーダルとして表示する。
 *
 * @param target ダイアログ。
 * @returns ダイアログが開いたかどうか。
 */
export function showModal(target: unknown): boolean | "unknown" {
  return show(target, { modal: true })
}

/**
 * ダイアログを閉じる。
 *
 * @param target ダイアログ。
 * @returns ダイアログが閉じたかどうか。
 */
export function hide(target: unknown): boolean | "unknown" {
  const dialogEl = getHTMLDialogElement(target)

  if (dialogEl) {
    if (dialogEl.open) {
      dialogEl.close()

      return !dialogEl.open
    }

    console.error(
      "SUI(base/DialogBase): すでに閉じているダイアログを閉じようとしました。",
    )

    return false
  }

  if (__DEV__) {
    console.error(
      `SUI(base/DialogBase): ダイアログが見つかりませんでした。`,
      target,
    )
  }

  return "unknown"
}

/**
 * ダイアログを開閉する。
 *
 * @param target ダイアログ。
 * @param options 表示オプション。
 * @returns ダイアログが開いたかどうか。
 */
export function toggle(
  target: unknown,
  options: ShowOptions | undefined = {},
): "show" | "hide" | false | "unknown" {
  const dialogEl = getHTMLDialogElement(target)

  if (dialogEl) {
    if (dialogEl.open) {
      const result = hide(dialogEl)

      return result === true
        ? "hide"
        : result
    }

    const result = show(dialogEl, options)

    return result === true
      ? "show"
      : result
  }

  if (__DEV__) {
    console.error(
      `SUI(base/DialogBase): ダイアログが見つかりませんでした。`,
      target,
    )
  }

  return "unknown"
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
 * @param open ダイアログが開いているかどうか。
 * @param event イベント。
 * @returns なし。
 */
export type OnOpenChange = (open: boolean, event: Event) => void

const CONFIG: UseSubscribeMutationsConfig<HTMLDialogElement, boolean> = {
  onMutate(this: HTMLDialogElement): boolean {
    return this.open
  },
  initialValue: false,
  attributes: true,
  attributeFilter: ["open"],
  attributeOldValue: true,
}

function useOpenChange(rootRef: React.RefObject<HTMLDialogElement>) {
  return useSubscribeMutations(rootRef, CONFIG)
}

/**
 * onInteractOutside を操作する。
 * dialog 要素の cancel イベントを監視し、イベントを発火する。
 *
 * @param rootRef ルートコンポーネントの ref オブジェクト。
 * @param handler ハンドラー。
 */
function useHandleEscapeKeyDown(
  open: boolean,
  rootRef: React.RefObject<HTMLDialogElement>,
  handler: OnEscapeKeyDown | undefined,
): void {
  useEventListener(
    open ? rootRef : null,
    React.useCallback(
      rootEl => {
        if (!handler) {
          return
        }

        // ダイアログの説明
        // https://developer.mozilla.org/ja/docs/Web/API/HTMLDialogElement#%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88
        // より、cancelについて、
        // 「ユーザーがエスケープキーで現在開いているダイアログを解除したときに発行されます。」
        // とあるので、cancel イベントを監視する。
        rootEl.addEventListener("cancel", function(event) {
          handler.call(this, event)
        })
      },
      [handler],
    ),
  )
}

function isInside(
  box: Record<"top" | "left" | "right" | "bottom", number>,
  pointer: Record<"x" | "y", number>,
): boolean {
  return (
    box.left <= pointer.x
    && pointer.x <= box.right
    && box.top <= pointer.y
    && pointer.y <= box.bottom
  )
}

/**
 * onInteractOutside を操作する。
 *
 * @param rootRef ルートコンポーネントの ref オブジェクト。
 * @param handler ハンドラー。
 */
function useHandleInteractOutside(
  open: boolean,
  rootRef: React.RefObject<HTMLDialogElement>,
  handler: OnInteractOutside | undefined,
): void {
  useEventListener(
    open && typeof document !== "undefined" ? window : null,
    React.useCallback(
      win => {
        win.addEventListener("click", function(event) {
          const { current: rootEl } = rootRef

          if (
            !rootEl
            // TODO: PointerEvent でない場合は未対応のブラウザかもしれないので、警告を出す。
            || !(event instanceof PointerEvent)
            || !(event.target instanceof Element)
            // ダイアログのトリガーをクリックした場合は、そのトリガーの動作を優先させる。
            || event.target.getAttribute("aria-controls") === rootEl.id
            || (
              rootEl.matches(":modal")
                // モーダル状態ではダイアログ要素のコンテンツを除く ::backdrop がクリック
                // されたときに閉じたいが、イベントとしてはダイアログ要素がターゲットになる。
                // そのため、ダイアログ要素の外側をクリックしたかどうかは座標で判定する。
                ? isInside(rootEl.getBoundingClientRect(), {
                  x: event.clientX,
                  y: event.clientY,
                })
                // 非モーダルでは ::backdrop が無いので、クリックされた要素の祖先に
                // ダイアログ要素が含まれていないかどうかで判定する。
                : event.target.closest(`#${CSS.escape(rootEl.id)}`)
            )
          ) {
            return
          }

          handler?.call(this, event)

          if (!event.defaultPrevented) {
            hide(rootEl)
          }
        })
      },
      [],
    ),
  )
}

/**
 * onOpenChange を操作する。
 *
 * @param rootRef ルートコンポーネントの ref オブジェクト。
 * @param handler ハンドラー。
 * @param options オプション。
 */
function useHandleOpenChange(
  rootRef: React.RefObject<HTMLDialogElement>,
  handler: OnOpenChange | undefined,
  options: {
    modal: boolean | undefined
    disabled: boolean
  },
): void {
  const { modal, disabled } = options
  useEventListener(
    rootRef,
    React.useCallback(
      rootEl => {
        const handleOpenChange = (event: Event) => {
          const currentTarget = event.currentTarget as HTMLDialogElement
          const { open } = currentTarget

          for (const triggerEl of getTriggerElements(currentTarget)) {
            triggerEl.setAttribute("aria-expanded", `${open}`)
          }

          handler?.(open, event)
        }
        rootEl.addEventListener("sui:dialog-base:beforeopen", event => {
          if (event instanceof SuiBeforeOpenEvent) {
            if (disabled) {
              event.preventDefault()
            } else if (
              modal !== undefined
              && event.modal !== undefined
              && event.modal !== modal
            ) {
              event.preventDefault()
              console.error(
                `SUI(base/DialogBase): ${modal ? "" : "非"}モーダルダイアログを`
                  + `${event.modal ? "" : "非"}モーダルダイアログ`
                  + "として開こうとしました。",
              )
            }

            if (!event.cancelable || !event.defaultPrevented) {
              const currentTarget = event.currentTarget as HTMLDialogElement

              if (event.modal ?? modal) {
                currentTarget.showModal()
              } else {
                currentTarget.show()
              }

              handleOpenChange(event)
            }
          }
        })
        rootEl.addEventListener("close", event => {
          handleOpenChange(event)
        })
      },
      [modal, disabled, handler],
    ),
  )
}

export interface TargetProps {
  /**
   * 子要素を独自のコンポーネントとしてレンダリングするかどうか。
   *
   * @default false
   */
  asChild?: boolean | undefined
  /**
   * ダイアログの表示を無効にするかどうか。
   *
   * @default false
   */
  disabled?: boolean | undefined
  /**
   * ダイアログの ID。
   */
  id: string
  /**
   * モーダルダイアログとして扱うかどうか。未定義の場合はトリガーの指示に従う。
   *
   * @default undefined
   */
  modal?: boolean | undefined
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
  const [rootRef, inspect] = useInspectableRef<HTMLDialogElement | null>(null)

  if (__DEV__) {
    inspect(
      "set",
      React.useCallback(
        rootEl => {
          if (rootEl !== null && !(rootEl instanceof HTMLDialogElement)) {
            console.error(
              "SUI(base/DialogBase): ref に渡された要素が HTMLDialogElement "
                + "のインスタンスではありません。",
              rootEl,
            )
          }
        },
        [],
      ),
    )
  }

  const open = useOpenChange(rootRef)
  useHandleOpenChange(rootRef, onOpenChange, { modal, disabled })
  useHandleEscapeKeyDown(open, rootRef, onEscapeKeyDown)
  useHandleInteractOutside(open, rootRef, onInteractOutside)

  return (
    <Comp
      {...other}
      ref={useComposedRefs(refProp, rootRef)}
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
