import type { Story, StoryDefault } from "@ladle/react"
import * as React from "react"
import * as Icon from "../../core/Icon/Icon"
import * as IconButton from "../../core/IconButton/IconButton"
import { mdiExpandLess, mdiExpandMore } from "../../icons/m3.material.io/filled"
import * as Toggle from "./Toggle"

export default { title: " lab/Toggle" } satisfies StoryDefault

export const Basic: Story = () => {
  const id = React.useId()

  return (
    <details id={id}>
      <IconButton.Root
        color="grey"
        variant="naked"
        outlined
        asChild
      >
        <Toggle.Root
          on={<Icon.Root icon={mdiExpandLess} />}
          off={<Icon.Root icon={mdiExpandMore} />}
          selector={`#${CSS.escape(id)}[open] > &`}
          asChild
        >
          <summary />
        </Toggle.Root>
      </IconButton.Root>
    </details>
  )
}
