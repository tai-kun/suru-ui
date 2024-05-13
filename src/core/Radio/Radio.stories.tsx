import type { Story, StoryDefault } from "@ladle/react"
import { COLOR_NAME_LIST, SHAPE_SIZE_LIST } from "../../theme"
import * as Radio from "./Radio"

export default { title: "Radio" } satisfies StoryDefault

export const Basic: Story = () => (
  <div>
    <Radio.Root>
      <Radio.Input />
    </Radio.Root>
    <Radio.Root>
      <Radio.Input defaultChecked />
    </Radio.Root>
  </div>
)

export const Color: Story = () => (
  <div>
    {COLOR_NAME_LIST.map(color => (
      <Radio.Root key={color} color={color}>
        <Radio.Input defaultChecked />
      </Radio.Root>
    ))}
  </div>
)

export const Disabled: Story = () => (
  <div>
    <Radio.Root>
      <Radio.Input disabled />
    </Radio.Root>
    <Radio.Root>
      <Radio.Input defaultChecked disabled />
    </Radio.Root>
  </div>
)

export const Inline: Story = () => (
  <div>
    {COLOR_NAME_LIST.map(color => (
      <Radio.Root key={color} color={color} inline>
        <Radio.Input defaultChecked />
      </Radio.Root>
    ))}
  </div>
)

export const Size: Story = () => (
  <div>
    {SHAPE_SIZE_LIST.map(size => (
      <Radio.Root key={size} size={size}>
        <Radio.Input defaultChecked />
      </Radio.Root>
    ))}
  </div>
)
