import type { Story, StoryDefault } from "@ladle/react"
import * as Button from "../Button/Button"
import * as Link from "./Link"

export default { title: "Link" } satisfies StoryDefault

export const Basic: Story = () => (
  <Link.Root href="#" target="_blank">
    リンク
  </Link.Root>
)

export const ButtonStyle: Story = () => (
  <Button.Root asChild>
    <Link.Root href="#">
      <Button.Text>リンク</Button.Text>
    </Link.Root>
  </Button.Root>
)

export const Disabled: Story = () => (
  <Link.Root href="#" disabled>
    リンク
  </Link.Root>
)
