import type { Story, StoryDefault } from "@ladle/react"
import { dsaAdd } from "../../icons/digital.go.jp/filled"
import { mdiAdd } from "../../icons/m3.material.io/filled"
import { COLOR_NAME_LIST } from "../../theme"
import * as Text from "../Text/Text"
import * as Icon from "./Icon"

export default { title: "Icon" } satisfies StoryDefault

export const Basic: Story = () => <Icon.Root icon={dsaAdd} />

export const HighContrastColor: Story = () => (
  <>
    {COLOR_NAME_LIST.map(color => (
      <Icon.Root key={color} icon={dsaAdd} color={`${color}.hc`} />
    ))}
  </>
)

export const LowContrastColor: Story = () => (
  <>
    {COLOR_NAME_LIST.map(color => (
      <Icon.Root key={color} icon={dsaAdd} color={color} />
    ))}
  </>
)

export const Material: Story = () => <Icon.Root icon={mdiAdd} />

export const Showcase: Story = () => (
  <div style={{ color: "red" }}>
    <Text.Root color="body" inline>English</Text.Root>
    <Icon.Root icon={dsaAdd} />
    <Icon.Root icon={mdiAdd} />
    <Text.Root color="body" inline>日本語</Text.Root>
  </div>
)
