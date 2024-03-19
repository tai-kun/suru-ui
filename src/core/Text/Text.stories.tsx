import type { Story, StoryDefault } from "@ladle/react"
import {
  COLOR_NAME_LIST,
  FONT_FAMILY_LIST,
  FONT_WEIGHT_LIST,
  TEXT_SIZE_LIST,
} from "../../theme"
import * as Text from "./Text"

export default { title: "Text" } satisfies StoryDefault

export const Align: Story = () => (
  <>
    <Text.Root>left</Text.Root>
    <Text.Root align="center">center</Text.Root>
    <Text.Root align="right">right</Text.Root>
    <Text.Root align="justify">justify</Text.Root>
  </>
)

export const HighContrastColor: Story = () => (
  <>
    {COLOR_NAME_LIST.map(color => (
      <Text.Root key={color} color={`${color}.hc`}>
        {color}
      </Text.Root>
    ))}
  </>
)

export const LowContrastColor: Story = () => (
  <>
    {COLOR_NAME_LIST.map(color => (
      <Text.Root key={color} color={color}>
        {color}
      </Text.Root>
    ))}
  </>
)

export const Font: Story = () => (
  <>
    {FONT_FAMILY_LIST.map(font => (
      <Text.Root key={font} font={font}>
        {font} 1,000 あいうえお
      </Text.Root>
    ))}
  </>
)

export const Inline: Story = () => (
  <>
    <Text.Root>
      {"block "}
      <Text.Root inline asChild>
        <span>inline</span>
      </Text.Root>
      {" block"}
    </Text.Root>
  </>
)

export const LineClamp: Story = () => (
  <Text.Root lineClamp={2}>
    {"あいうえお".repeat(1_000)}
  </Text.Root>
)

export const Size: Story = () => (
  <>
    {TEXT_SIZE_LIST.map(size => (
      <Text.Root key={size} size={size}>
        {size} あいうえお
      </Text.Root>
    ))}
  </>
)

export const Truncate: Story = () => (
  <Text.Root truncate>
    {"あいうえお".repeat(1_000)}
  </Text.Root>
)

export const Weight: Story = () => (
  <>
    {FONT_WEIGHT_LIST.map(weight => (
      <Text.Root key={weight} weight={weight}>
        {weight} あいうえお
      </Text.Root>
    ))}
  </>
)
