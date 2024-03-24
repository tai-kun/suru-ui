import type { Story, StoryDefault } from "@ladle/react"
import { COLOR_NAME_LIST } from "../../theme"
import * as Loader from "./Loader"

export default { title: "Loader" } satisfies StoryDefault

export const Color: Story = () => (
  <>
    {COLOR_NAME_LIST.map(color => <Loader.Root key={color} color={color} />)}
  </>
)

export const Dots: Story = () => <Loader.Root />

export const Spinner: Story = () => <Loader.Root variant="spinner" />
