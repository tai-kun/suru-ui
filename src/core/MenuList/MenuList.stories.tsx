import type { Story, StoryDefault } from "@ladle/react"
import React from "react"
import * as Icon from "../../core/Icon/Icon"
import { mdiExpandLess, mdiExpandMore } from "../../icons/m3.material.io/filled"
import * as Toggle from "../../lab/Toggle/Toggle"
import { $ } from "../../theme"
import * as Button from "../Button/Button"
import * as MenuList from "./MenuList"

export default { title: "MenuList" } satisfies StoryDefault

export const Basic: Story = () => (
  <MenuList.Root
    style={{
      width: "fit-content",
      border: `var(${$.ring.sm}) solid var(${$.color.grey.ring.lc})`,
      padding: `var(${$.space.sm})`,
      background: `var(${$.color.canvas.paper})`,
      borderRadius: `var(${$.radius.md})`,
    }}
  >
    <MenuList.Item>
      <Button.Root fullWidth variant="menuitem">
        <Button.Adornment>
          <MenuList.Indent />
        </Button.Adornment>
        <Button.Text fullWidth align="start">
          アイテム 1
        </Button.Text>
      </Button.Root>
    </MenuList.Item>
    <MenuList.Item>
      <Button.Root fullWidth variant="menuitem">
        <Button.Adornment>
          <MenuList.Indent />
        </Button.Adornment>
        <Button.Text fullWidth align="start">
          アイテム 2
        </Button.Text>
      </Button.Root>
      <MenuList.Root>
        <MenuList.Item>
          <Button.Root fullWidth variant="menuitem">
            <Button.Adornment>
              <MenuList.Indent />
            </Button.Adornment>
            <Button.Text fullWidth align="start">
              アイテム 2-1
            </Button.Text>
          </Button.Root>
        </MenuList.Item>
      </MenuList.Root>
    </MenuList.Item>
  </MenuList.Root>
)

export const TreeView: Story = () => {
  const id = React.useId()

  return (
    <MenuList.Root
      style={{
        width: 200,
        height: 150,
        border: `var(${$.ring.sm}) solid var(${$.color.grey.ring.lc})`,
        padding: `var(${$.space.sm})`,
        background: `var(${$.color.canvas.paper})`,
        borderRadius: `var(${$.radius.md})`,
      }}
    >
      <MenuList.Item>
        <Button.Root fullWidth variant="menuitem">
          <Button.Adornment>
            <MenuList.Indent />
          </Button.Adornment>
          <Button.Text fullWidth align="start">
            アイテム 1
          </Button.Text>
        </Button.Root>
      </MenuList.Item>
      <MenuList.Item>
        <details id={id}>
          <Button.Root fullWidth variant="menuitem" asChild>
            <summary>
              <Button.Adornment>
                <MenuList.Indent />
              </Button.Adornment>
              <Button.Text fullWidth align="start">
                アイテム 2
              </Button.Text>
              <Button.Adornment>
                <Toggle.Root
                  on={<Icon.Root icon={mdiExpandLess} />}
                  off={<Icon.Root icon={mdiExpandMore} />}
                  selector={`#${CSS.escape(id)}[open] > summary &`}
                />
              </Button.Adornment>
            </summary>
          </Button.Root>

          <MenuList.Root>
            <MenuList.Item>
              <Button.Root fullWidth variant="menuitem">
                <Button.Adornment>
                  <MenuList.Indent />
                </Button.Adornment>
                <Button.Text fullWidth align="start">
                  アイテム 2-1
                </Button.Text>
              </Button.Root>
            </MenuList.Item>
          </MenuList.Root>
        </details>
      </MenuList.Item>
    </MenuList.Root>
  )
}
