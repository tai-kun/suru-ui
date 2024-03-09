import type { Story, StoryDefault } from "@ladle/react"
import * as React from "react"
import * as DialogBase from "./DialogBase"

export default { title: " base/DialogBase" } satisfies StoryDefault

export const Modal: Story = () => {
  const id = React.useId()

  return (
    <>
      <DialogBase.Trigger target={id}>
        <button type="button">
          モーダルで開く
        </button>
      </DialogBase.Trigger>

      <DialogBase.Target id={id} modal onOpenChange={console.log}>
        ダイアログの内容

        <DialogBase.Trigger target={id} action="hide">
          <button type="button">
            閉じる
          </button>
        </DialogBase.Trigger>
      </DialogBase.Target>
    </>
  )
}

export const NonModal: Story = () => {
  const id = React.useId()

  return (
    <>
      <DialogBase.Trigger target={id}>
        <button type="button">
          モードレスで開く
        </button>
      </DialogBase.Trigger>

      <DialogBase.Target id={id}>
        ダイアログの内容

        <DialogBase.Trigger target={id} action="hide">
          <button type="button">
            閉じる
          </button>
        </DialogBase.Trigger>
      </DialogBase.Target>
    </>
  )
}

export const NoLightDismiss: Story = () => {
  const id = React.useId()

  return (
    <>
      <DialogBase.Trigger target={id} modal>
        <button type="button">
          簡易非表示機能なしで開く
        </button>
      </DialogBase.Trigger>

      <DialogBase.Target
        id={id}
        onEscapeKeyDown={ev => ev.preventDefault()}
        onInteractOutside={ev => ev.preventDefault()}
      >
        ダイアログの内容

        <DialogBase.Trigger target={id} action="hide">
          <button type="button">
            閉じる
          </button>
        </DialogBase.Trigger>
      </DialogBase.Target>
    </>
  )
}
