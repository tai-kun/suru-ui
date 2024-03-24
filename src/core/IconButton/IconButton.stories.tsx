import type { Story, StoryDefault } from "@ladle/react"
import * as React from "react"
import { mdiTune } from "../../icons/m3.material.io/filled"
import {
  COLOR_NAME_LIST,
  COLOR_VARIANT_LIST,
  SHAPE_SIZE_LIST,
} from "../../theme"
import * as Icon from "../Icon/Icon"
import * as IconButton from "./IconButton"

export default { title: "IconButton" } satisfies StoryDefault

export const Basic: Story = () => (
  <>
    {COLOR_VARIANT_LIST.map(variant => (
      <IconButton.Root key={variant} variant={variant}>
        <Icon.Root icon={mdiTune} />
      </IconButton.Root>
    ))}
  </>
)

export const Color: Story = () => (
  <>
    {COLOR_NAME_LIST.map(color => (
      <div key={color}>
        {COLOR_VARIANT_LIST.map(variant => (
          <IconButton.Root key={variant} color={color} variant={variant}>
            <Icon.Root icon={mdiTune} />
          </IconButton.Root>
        ))}
      </div>
    ))}
  </>
)

export const Disabled: Story = () => (
  <>
    {COLOR_VARIANT_LIST.map(variant => (
      <IconButton.Root key={variant} variant={variant} disabled>
        <Icon.Root icon={mdiTune} />
      </IconButton.Root>
    ))}
  </>
)

export const FullWidth: Story = () => (
  <IconButton.Root fullWidth>
    <Icon.Root icon={mdiTune} />
  </IconButton.Root>
)

export const Loading: Story = () => (
  <>
    {COLOR_VARIANT_LIST.map(variant => (
      <IconButton.Root key={variant} variant={variant} loading>
        <Icon.Root icon={mdiTune} />
      </IconButton.Root>
    ))}
  </>
)

export const MenuItem: Story = () => {
  const [bool, setBool] = React.useState(false)

  return (
    <IconButton.Root
      variant="menuitem"
      onClick={() => setBool(!bool)}
      aria-selected={bool}
    >
      <Icon.Root icon={mdiTune} />
    </IconButton.Root>
  )
}

export const Outlined: Story = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {COLOR_VARIANT_LIST.map(variant => (
      <IconButton.Root key={variant} variant={variant} outlined>
        <Icon.Root icon={mdiTune} />
      </IconButton.Root>
    ))}
  </div>
)

export const Size: Story = () => (
  <>
    {SHAPE_SIZE_LIST.map(size => (
      <IconButton.Root key={size} size={size}>
        <Icon.Root icon={mdiTune} />
      </IconButton.Root>
    ))}
  </>
)
