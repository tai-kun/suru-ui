import "@suru-ui/theme/base.css";
import "@suru-ui/theme/light.css";
import "@suru-ui/theme/desktop.css";

import type { Meta, StoryFn } from "@storybook/react";
import { COLORS, SIZINGS } from "@suru-ui/theme";
import * as Checkbox from ".";

export default {
  title: "forms/Checkbox",
  component: Checkbox.Root,
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox.Root>;

type Story = StoryFn<typeof Checkbox.Root>;

export const Basic: Story = () => <Checkbox.Root defaultChecked />;
Basic.storyName = "基本的な使い方";

export const Indeterminate: Story = () => (
  <Checkbox.Root
    indeterminate
    defaultChecked
  />
);
Indeterminate.storyName = "中間状態にする";

export const Size: Story = () => (
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    {SIZINGS.map(size => (
      <Checkbox.Root
        key={size}
        size={size}
        defaultChecked
      />
    ))}
  </div>
);
Size.storyName = "大きさを変更する";

export const Color: Story = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {COLORS.map(color => (
      <Checkbox.Root
        key={color}
        color={color}
        defaultChecked
      />
    ))}
  </div>
);
Color.storyName = "色を変更する";

export const Disabled: Story = () => (
  <div style={{ display: "flex", gap: 8 }}>
    <Checkbox.Root
      disabled
    />
    <Checkbox.Root
      disabled
      checked
    />
  </div>
);
Disabled.storyName = "無効にする";
