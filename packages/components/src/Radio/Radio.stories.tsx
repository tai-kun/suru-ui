import "@suru-ui/theme/base.css";
import "@suru-ui/theme/light.css";
import "@suru-ui/theme/desktop.css";

import type { Meta, StoryFn } from "@storybook/react";
import { COLORS, SIZINGS } from "@suru-ui/theme";
import * as Radio from ".";

export default {
  title: "forms/Radio",
  component: Radio.Root,
  tags: ["autodocs"],
} satisfies Meta<typeof Radio.Root>;

type Story = StoryFn<typeof Radio.Root>;

export const Basic: Story = () => <Radio.Root defaultChecked />;
Basic.storyName = "基本的な使い方";

export const Size: Story = () => (
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    {SIZINGS.map(size => (
      <Radio.Root
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
      <Radio.Root
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
    <Radio.Root
      disabled
    />
    <Radio.Root
      disabled
      checked
    />
  </div>
);
Disabled.storyName = "無効にする";
