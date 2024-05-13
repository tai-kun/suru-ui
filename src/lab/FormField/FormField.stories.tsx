import type { Story, StoryDefault } from "@ladle/react"
import * as React from "react"
import * as Checkbox from "../../core/Checkbox/Checkbox"
import * as Radio from "../../core/Radio/Radio"
import * as TextField from "../../core/TextField/TextField"
import * as FormField from "./FormField"

export default { title: " lab/FormField" } satisfies StoryDefault

export const Basic: Story = () => {
  const id1 = React.useId()
  const id2 = React.useId()
  const id3 = React.useId()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <FormField.Root>
        <FormField.Label htmlFor={id1}>ラベル</FormField.Label>
        <FormField.HelperText>説明文</FormField.HelperText>
        <FormField.ExampleText>入力例</FormField.ExampleText>
        <FormField.ErrorText>エラー内容</FormField.ErrorText>
        <FormField.Control>
          <TextField.Root>
            <TextField.Input id={id1} defaultValue="テキスト" />
          </TextField.Root>
        </FormField.Control>
      </FormField.Root>

      <FormField.Root>
        <FormField.Label htmlFor={id2}>ラベル</FormField.Label>
        <FormField.HelperText>説明文</FormField.HelperText>
        <FormField.ExampleText>入力例</FormField.ExampleText>
        <FormField.ErrorText>エラー内容</FormField.ErrorText>
        <FormField.Control>
          <Checkbox.Root>
            <Checkbox.Input id={id2} defaultChecked />
          </Checkbox.Root>
        </FormField.Control>
      </FormField.Root>

      <FormField.Root>
        <FormField.Label htmlFor={id3}>ラベル</FormField.Label>
        <FormField.HelperText>説明文</FormField.HelperText>
        <FormField.ExampleText>入力例</FormField.ExampleText>
        <FormField.ErrorText>エラー内容</FormField.ErrorText>
        <FormField.Control>
          <Radio.Root>
            <Radio.Input id={id3} defaultChecked />
          </Radio.Root>
        </FormField.Control>
      </FormField.Root>
    </div>
  )
}
