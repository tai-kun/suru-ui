import "@suru-ui/theme/base.css";
import "@suru-ui/theme/light.css";
import "@suru-ui/theme/desktop.css";

import type { Meta, StoryFn } from "@storybook/react";
import { $, COLORS } from "@suru-ui/theme";
import * as Label from ".";

export default {
  title: "typography/Label",
  component: Label.Root,
  tags: ["autodocs"],
} satisfies Meta<typeof Label.Root>;

type Story = StoryFn<typeof Label.Root>;

export const Basic: Story = () => <Label.Root>ラベル</Label.Root>;

export const Alignment: Story = () => (
  <>
    <Label.Root align="start">始端揃え</Label.Root>
    <Label.Root align="end">終端揃え</Label.Root>
    <Label.Root align="justify">両端揃え</Label.Root>
    <Label.Root align="center">{"中央揃え ".repeat(15)}</Label.Root>
    <Label.Root align="middle">{"中央寄せ ".repeat(15)}</Label.Root>
  </>
);

export const Color: Story = () => (
  <>
    {COLORS.map(color => (
      <Label.Root
        key={color}
        color={$.color[color].naked.canvasText}
      >
        ラベル
      </Label.Root>
    ))}
  </>
);

export const Font: Story = () => (
  <>
    <Label.Root font="sans">サンセリフ体 (sans)</Label.Root>
    <Label.Root font="serif">セリフ体 (serif)</Label.Root>
    <Label.Root font="mono">等幅体 (mono)</Label.Root>
  </>
);

export const Inline: Story = () => (
  <>
    <Label.Root inline>インラインラベル 1</Label.Root>
    <Label.Root inline>インラインラベル 2</Label.Root>
    <Label.Root inline>インラインラベル 3</Label.Root>
    <Label.Root>ブロックラベル 1</Label.Root>
    <Label.Root>ブロックラベル 2</Label.Root>
    <Label.Root>ブロックラベル 3</Label.Root>
  </>
);

export const Leading: Story = () => (
  <>
    <Label.Root leading="sm">
      {"行間が狭いラベル ".repeat(10)}
    </Label.Root>
    <Label.Root leading="md">
      {"行間が普通のラベル ".repeat(10)}
    </Label.Root>
    <Label.Root leading="lg">
      {"行間が広いラベル ".repeat(10)}
    </Label.Root>
  </>
);

export const LineClamp: Story = () => (
  <>
    <Label.Root lineClamp={1}>
      {"lineClamp={1}" + "長いラベル".repeat(50)}
    </Label.Root>
    <Label.Root lineClamp={3}>
      {"lineClamp={3}" + "長いラベル".repeat(50)}
    </Label.Root>
    <Label.Root lineClamp={Infinity}>
      {"lineClamp={Infinity}" + "長いラベル".repeat(50)}
    </Label.Root>
  </>
);

export const Size: Story = () => (
  <>
    <Label.Root>普通サイズのラベル</Label.Root>
    <Label.Root size="sm">小さいサイズのラベル</Label.Root>
    <Label.Root size="1.5em">相対サイズのラベル</Label.Root>
    <Label.Root size={20}>カスタムサイズのラベル</Label.Root>
  </>
);

export const Tracking: Story = () => (
  <>
    <Label.Root tracking="sm">
      {"文字間が狭いラベル ".repeat(10)}
    </Label.Root>
    <Label.Root tracking="md">
      {"文字間が普通のラベル ".repeat(10)}
    </Label.Root>
  </>
);

export const Truncate: Story = () => (
  <>
    <Label.Root truncate>
      {"長いラベル".repeat(20)}
    </Label.Root>
  </>
);

export const Weight: Story = () => (
  <>
    <Label.Root weight="normal">通常 (normal) のラベル</Label.Root>
    <Label.Root weight="medium">中字 (medium) のラベル</Label.Root>
    <Label.Root weight="bold">太字 (bold) のラベル</Label.Root>
  </>
);
