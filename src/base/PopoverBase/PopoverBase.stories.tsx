import type { Story, StoryDefault } from "@ladle/react"
import * as React from "react"
import { $ } from "../../theme"
import * as PopoverBase from "./PopoverBase"

export default { title: " base/PopoverBase" } satisfies StoryDefault

function Draggable(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <div
      style={{
        cursor: "move",
        display: "inline-block",
        background: `var(${$.color.grey.main})`,
        paddingTop: 32,
      }}
      onPointerMove={React.useCallback(
        (ev: React.PointerEvent<HTMLDivElement>) => {
          // https://qiita.com/economist/items/d4254209330c11caff04
          if (ev.buttons) {
            const { currentTarget: self } = ev
            self.style.top = `${self.offsetTop + ev.movementY}px`
            self.style.left = `${self.offsetLeft + ev.movementX}px`
            self.style.position = "absolute"
            self.draggable = false
            self.setPointerCapture(ev.pointerId)
          }
        },
        [],
      )}
    >
      {children}
    </div>
  )
}

export const Basic: Story = () => {
  const id = React.useId()

  return (
    <>
      <Draggable>
        <PopoverBase.Trigger target={id}>
          <button type="button">ボタン</button>
        </PopoverBase.Trigger>
      </Draggable>

      <PopoverBase.Target id={id} placement="bottom-end">
        ポップオーバーの内容
      </PopoverBase.Target>
    </>
  )
}

export const NoLightDismiss: Story = () => {
  const id = React.useId()

  return (
    <>
      <Draggable>
        <PopoverBase.Trigger target={id}>
          <button type="button">
            簡易非表示機能なしで開く
          </button>
        </PopoverBase.Trigger>
      </Draggable>

      <PopoverBase.Target
        id={id}
        onEscapeKeyDown={ev => ev.preventDefault()}
        onInteractOutside={ev => ev.preventDefault()}
      >
        ポップオーバーの内容

        <PopoverBase.Trigger target={id} action="hide">
          <button type="button">
            閉じる
          </button>
        </PopoverBase.Trigger>
      </PopoverBase.Target>
    </>
  )
}

export const OwnAnchor: Story = () => {
  const anchorId = React.useId()
  const triggerId = React.useId()

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <PopoverBase.Trigger target={triggerId}>
          <button type="button">ボタン</button>
        </PopoverBase.Trigger>

        <span id={anchorId}>=</span>
      </div>

      <PopoverBase.Target
        id={triggerId}
        anchor={anchorId}
        placement="bottom-end"
      >
        ポップオーバーの内容
      </PopoverBase.Target>
    </>
  )
}
