import type { Story, StoryDefault } from "@ladle/react"
import { COLOR_NAME_LIST, SHAPE_SIZE_LIST } from "../../theme"
import * as Checkbox from "./Checkbox"

export default { title: "Checkbox" } satisfies StoryDefault

export const Basic: Story = () => (
  <div>
    <Checkbox.Root>
      <Checkbox.Input />
    </Checkbox.Root>
    <Checkbox.Root>
      <Checkbox.Input defaultChecked />
    </Checkbox.Root>
  </div>
)

export const Color: Story = () => (
  <div>
    {COLOR_NAME_LIST.map(color => (
      <Checkbox.Root key={color} color={color}>
        <Checkbox.Input defaultChecked />
      </Checkbox.Root>
    ))}
  </div>
)

export const Disabled: Story = () => (
  <div>
    <Checkbox.Root>
      <Checkbox.Input disabled />
    </Checkbox.Root>
    <Checkbox.Root>
      <Checkbox.Input defaultChecked disabled />
    </Checkbox.Root>
  </div>
)

export const Inline: Story = () => (
  <div>
    {COLOR_NAME_LIST.map(color => (
      <Checkbox.Root key={color} color={color} inline>
        <Checkbox.Input defaultChecked />
      </Checkbox.Root>
    ))}
  </div>
)

export const Size: Story = () => (
  <div>
    {SHAPE_SIZE_LIST.map(size => (
      <Checkbox.Root key={size} size={size}>
        <Checkbox.Input defaultChecked />
      </Checkbox.Root>
    ))}
  </div>
)
