import type { Story, StoryDefault } from "@ladle/react"
import { COLOR_VARIANT_LIST } from "../../theme"
import * as ButtonBase from "./ButtonBase"

import * as React from "react"

export default { title: " base/ButtonBase" } satisfies StoryDefault

export const Basic: Story = () => (
  <>
    {COLOR_VARIANT_LIST.map(variant => (
      <ButtonBase.Root
        key={variant}
        variant={variant}
        onTouchStart={console.log}
        onMouseDown={console.log}
      >
        {variant}
      </ButtonBase.Root>
    ))}
  </>
)

export const Disabled: Story = () => (
  <>
    {COLOR_VARIANT_LIST.map(variant => (
      <ButtonBase.Root data-disabled key={variant} variant={variant}>
        {variant}
      </ButtonBase.Root>
    ))}
  </>
)

export const Outlined: Story = () => (
  <>
    {COLOR_VARIANT_LIST.map(variant => (
      <ButtonBase.Root key={variant} outlined variant={variant}>
        {variant}
      </ButtonBase.Root>
    ))}
  </>
)
