import {
  createStateMachine,
  type t,
  type Transfer,
} from "@tai-kun/use-state-machine"
import * as React from "react"

export interface MachineProps {
  /**
   * ダイアログの表示を無効にするかどうか。非表示を無効化することはできない。
   *
   * @default false
   */
  disabled?: boolean | undefined
  /**
   * モーダルダイアログとして扱うかどうか。未定義の場合はトリガーの指示に従う。
   *
   * @default undefined
   */
  modal?: boolean | undefined
}

/**
 * ダイアログが開こうとするときに発火するイベント。
 */
export class SuiDialogBaseOpenEvent extends Event {
  /**
   * @param modal モーダルダイアログとして開こうとするかどうか。未定義の場合はダイアログに従う。
   * @param eventInitDict イベントの初期化オプション。
   */
  constructor(
    public modal: boolean | undefined,
    eventInitDict: Omit<EventInit, "cancelable"> | undefined = {},
  ) {
    super("sui:dialog-base:open", {
      ...eventInitDict,
      // 開こうとする場合のみキャンセル可能。
      cancelable: true,
    })
  }
}

export default function machine(
  ref: React.RefObject<HTMLDialogElement>,
  props: Transfer<MachineProps>,
) {
  return createStateMachine({
    schema: {
      events: {
        OPEN: {} as t<{ event: SuiDialogBaseOpenEvent }>,
        // CLOSE: {} as t<{ event: Event }>,
        "DIALOG.OPEN": {} as t<{}>,
        "DIALOG.CLOSE": {} as t<{}>,
      },
    },
    initial: "closed",
    verbose: true,
    states: {
      closed: {
        on: {
          OPEN: {
            target: "open",
            guard({ event: { event } }) {
              const { modal, disabled } = props.current

              return !(
                !disabled
                && (
                  modal === undefined
                  || event.modal === undefined
                  || event.modal === modal
                )
                && event instanceof SuiDialogBaseOpenEvent
                && event.currentTarget instanceof HTMLDialogElement
                && !event.currentTarget.open
              )
            },
          },
          "DIALOG.OPEN": "open",
        },
        // effect({ event }) {
        //   if (
        //     event.type === "CLOSE"
        //     && event.event.currentTarget instanceof HTMLDialogElement
        //     && event.event.currentTarget.open
        //   ) {
        //     event.event.currentTarget.close()
        //   }
        // },
      },
      open: {
        on: {
          "DIALOG.CLOSE": "closed",
        },
        effect({ event }) {
          if (event.type === "OPEN") {
            const { modal } = props.current
            const { current: dialogEl } = ref

            if (event.event.modal ?? modal) {
              dialogEl?.showModal()
            } else {
              dialogEl?.show()
            }
          }
        },
      },
    },
  })
}
