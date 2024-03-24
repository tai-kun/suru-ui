import type { Story, StoryDefault } from "@ladle/react"
import * as React from "react"
import { mdiSearch } from "../../icons/m3.material.io/outlined"
import {
  COLOR_NAME_LIST,
  COLOR_VARIANT_LIST,
  SHAPE_SIZE_LIST,
} from "../../theme"
import * as Icon from "../Icon/Icon"
import * as Button from "./Button"

export default { title: "Button" } satisfies StoryDefault

export const Basic: Story = () => (
  <>
    {COLOR_VARIANT_LIST.map(variant => (
      <Button.Root key={variant} variant={variant}>
        <Button.Text>ボタン</Button.Text>
      </Button.Root>
    ))}
  </>
)

export const ChildAlign: Story = () => (
  <>
    {(["start", "center", "end"] as const).map(align => (
      <Button.Root key={align} align={align} fullWidth>
        <Button.Adornment>
          <Icon.Root icon={mdiSearch} />
        </Button.Adornment>
        <Button.Text>ボタン</Button.Text>
      </Button.Root>
    ))}
  </>
)

export const Color: Story = () => (
  <>
    {COLOR_NAME_LIST.map(color => (
      <div key={color}>
        {COLOR_VARIANT_LIST.map(variant => (
          <Button.Root key={variant} color={color} variant={variant}>
            <Button.Text>BUTTON</Button.Text>
          </Button.Root>
        ))}
      </div>
    ))}
  </>
)

export const Disabled: Story = () => (
  <>
    {COLOR_VARIANT_LIST.map(variant => (
      <Button.Root key={variant} variant={variant} disabled>
        <Button.Text>ボタン</Button.Text>
      </Button.Root>
    ))}
  </>
)

export const FullWidth: Story = () => (
  <Button.Root fullWidth>
    <Button.Text>ボタン</Button.Text>
  </Button.Root>
)

export const LeftAdornment: Story = () => (
  <Button.Root>
    <Button.Adornment>
      <Icon.Root icon={mdiSearch} />
    </Button.Adornment>
    <Button.Text>検索</Button.Text>
  </Button.Root>
)

export const Loading: Story = () => (
  <>
    {COLOR_VARIANT_LIST.map(variant => (
      <Button.Root key={variant} variant={variant} loading>
        <Button.Text>ボタン</Button.Text>
      </Button.Root>
    ))}
  </>
)

export const MenuItem: Story = () => {
  const [bool, setBool] = React.useState(false)

  return (
    <Button.Root
      variant="menuitem"
      onClick={() => setBool(!bool)}
      aria-selected={bool}
    >
      <Button.Text>CLICK</Button.Text>
    </Button.Root>
  )
}

export const Outlined: Story = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {COLOR_VARIANT_LIST.map(variant => (
      <Button.Root key={variant} variant={variant} outlined>
        <Button.Text>ボタン</Button.Text>
      </Button.Root>
    ))}
  </div>
)

export const Size: Story = () => (
  <>
    {SHAPE_SIZE_LIST.map(size => (
      <Button.Root key={size} size={size}>
        <Button.Text>ボタン</Button.Text>
      </Button.Root>
    ))}
  </>
)

export const TextAlign: Story = () => (
  <>
    {(["start", "center", "end"] as const).map(align => (
      <Button.Root key={align} fullWidth>
        <Button.Adornment>
          <Icon.Root icon={mdiSearch} />
        </Button.Adornment>
        <Button.Text align={align} fullWidth>ボタン</Button.Text>
      </Button.Root>
    ))}
  </>
)
