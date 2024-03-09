import type { Story, StoryDefault } from "@ladle/react"
import * as React from "react"
import { COLOR_VARIANT_LIST } from "../../theme"
import * as ButtonBase from "./ButtonBase"

export default { title: " base/ButtonBase" } satisfies StoryDefault

export const Basic: Story = () => (
  <>
    {COLOR_VARIANT_LIST.map(variant => (
      <ButtonBase.Root
        key={variant}
        role="button"
        variant={variant}
      >
        {variant}
      </ButtonBase.Root>
    ))}
  </>
)

export const Disabled: Story = () => (
  <>
    {COLOR_VARIANT_LIST.map(variant => (
      <ButtonBase.Root
        key={variant}
        role="button"
        variant={variant}
        data-disabled
      >
        {variant}
      </ButtonBase.Root>
    ))}
    {COLOR_VARIANT_LIST.map(variant => (
      <ButtonBase.Root
        key={variant}
        role="button"
        variant={variant}
        outlined
        data-disabled
      >
        {variant}
      </ButtonBase.Root>
    ))}
  </>
)

export const Outlined: Story = () => (
  <>
    {COLOR_VARIANT_LIST.map(variant => (
      <ButtonBase.Root
        key={variant}
        role="button"
        variant={variant}
        outlined
      >
        {variant}
      </ButtonBase.Root>
    ))}
  </>
)
