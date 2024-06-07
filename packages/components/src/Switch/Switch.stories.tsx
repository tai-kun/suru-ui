import "@suru-ui/theme/base.css";
import "@suru-ui/theme/light.css";
import "@suru-ui/theme/desktop.css";

import type { Meta, StoryFn } from "@storybook/react";
import { COLORS, SIZINGS } from "@suru-ui/theme";
import * as Switch from ".";

export default {
  title: "forms/Switch",
  component: Switch.Root,
  tags: ["autodocs"],
} satisfies Meta<typeof Switch.Root>;

type Story = StoryFn<typeof Switch.Root>;

export const Basic: Story = () => <Switch.Root defaultChecked />;
Basic.storyName = "基本的な使い方";

export const Size: Story = () => (
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    {SIZINGS.map(size => (
      <Switch.Root
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
      <Switch.Root
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
    <Switch.Root
      disabled
    />
    <Switch.Root
      disabled
      checked
    />
  </div>
);
Disabled.storyName = "無効にする";
