import { and, createMachine, not, type Transfer } from "use-machine-ts"

type PointerType = "mouse" | "touch" | "pen"

type PointerEvent = {
  readonly pointerType: PointerType
  readonly pointerId: number
  readonly button: number
}

export interface ClickMachineProps {
  disabled: boolean
  onClick: () => void
}

export function clickMachine(props: Transfer<ClickMachineProps>) {
  return createMachine(
    {
      $schema: {} as {
        strict: true
        context: null | {
          ty: PointerType
          id: number
        }
        events: {
          POINTER_UP: PointerEvent
          POINTER_DOWN: PointerEvent
          POINTER_LEAVE: PointerEvent
          POINTER_CANCEL: PointerEvent
        }
      },
      context: null,
      initial: "idle",
      states: {
        idle: {
          on: {
            POINTER_DOWN: {
              target: "pointer.down",
              guard: and(not("isDisabled"), "isLeftClick"),
            },
          },
          effect: "resetCtx",
        },
        "pointer.down": {
          on: {
            POINTER_UP: {
              target: "idle",
              guard: "isTargetPointer",
            },
            POINTER_LEAVE: "idle",
            POINTER_CANCEL: "idle",
          },
          effect: "setCtx",
        },
      },
    },
    {
      guards: {
        isDisabled: () => props.current.disabled,
        isLeftClick: ({ event }) => event.button === 0,
        isTargetPointer: ({ context, event }) => (
          !!context
          && context.ty === event.pointerType
          && context.id === event.pointerId
        ),
      },
      effects: {
        resetCtx: ({ setContext, event }) => {
          if (event.type !== "$init") {
            setContext(() => null)
          }

          if (event.type === "POINTER_UP") {
            props.current.onClick()
          }
        },
        setCtx: ({ setContext, event }) => {
          setContext(() => ({
            ty: event.pointerType,
            id: event.pointerId,
          }))
        },
      },
    },
  )
}
