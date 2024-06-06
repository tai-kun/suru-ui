import "@suru-ui/theme/base.css";
import "@suru-ui/theme/light.css";
import "@suru-ui/theme/desktop.css";

import type { Meta, StoryFn } from "@storybook/react";
import { $, COLORS } from "@suru-ui/theme";
import * as Caption from ".";

export default {
  title: "typography/Caption",
  component: Caption.Root,
  tags: ["autodocs"],
} satisfies Meta<typeof Caption.Root>;

type Story = StoryFn<typeof Caption.Root>;

export const Basic: Story = () => <Caption.Root>ラベル</Caption.Root>;

export const Alignment: Story = () => (
  <>
    <Caption.Root align="start">始端揃え</Caption.Root>
    <Caption.Root align="end">終端揃え</Caption.Root>
    <Caption.Root align="justify">両端揃え</Caption.Root>
    <Caption.Root align="center">{"中央揃え ".repeat(15)}</Caption.Root>
    <Caption.Root align="middle">{"中央寄せ ".repeat(15)}</Caption.Root>
  </>
);

export const Color: Story = () => (
  <>
    {COLORS.map(color => (
      <Caption.Root
        key={color}
        color={$.color[color].naked.canvasText}
      >
        ラベル
      </Caption.Root>
    ))}
  </>
);

export const Font: Story = () => (
  <>
    <Caption.Root font="sans">サンセリフ体 (sans)</Caption.Root>
    <Caption.Root font="serif">セリフ体 (serif)</Caption.Root>
    <Caption.Root font="mono">等幅体 (mono)</Caption.Root>
  </>
);

export const Inline: Story = () => (
  <>
    <Caption.Root inline>インラインラベル 1</Caption.Root>
    <Caption.Root inline>インラインラベル 2</Caption.Root>
    <Caption.Root inline>インラインラベル 3</Caption.Root>
    <Caption.Root>ブロックラベル 1</Caption.Root>
    <Caption.Root>ブロックラベル 2</Caption.Root>
    <Caption.Root>ブロックラベル 3</Caption.Root>
  </>
);

export const Leading: Story = () => (
  <>
    <Caption.Root leading="sm">
      {"行間が狭いラベル ".repeat(10)}
    </Caption.Root>
    <Caption.Root leading="md">
      {"行間が普通のラベル ".repeat(10)}
    </Caption.Root>
    <Caption.Root leading="lg">
      {"行間が広いラベル ".repeat(10)}
    </Caption.Root>
  </>
);

export const LineClamp: Story = () => (
  <>
    <Caption.Root lineClamp={1}>
      {"lineClamp={1}" + "長いラベル".repeat(50)}
    </Caption.Root>
    <Caption.Root lineClamp={3}>
      {"lineClamp={3}" + "長いラベル".repeat(50)}
    </Caption.Root>
    <Caption.Root lineClamp={Infinity}>
      {"lineClamp={Infinity}" + "長いラベル".repeat(50)}
    </Caption.Root>
  </>
);

export const Size: Story = () => (
  <>
    <Caption.Root>普通サイズのラベル</Caption.Root>
    <Caption.Root size="sm">小さいサイズのラベル</Caption.Root>
    <Caption.Root size="1.5em">相対サイズのラベル</Caption.Root>
    <Caption.Root size={20}>カスタムサイズのラベル</Caption.Root>
  </>
);

export const Tracking: Story = () => (
  <>
    <Caption.Root tracking="sm">
      {"文字間が狭いラベル ".repeat(10)}
    </Caption.Root>
    <Caption.Root tracking="md">
      {"文字間が普通のラベル ".repeat(10)}
    </Caption.Root>
  </>
);

export const Truncate: Story = () => (
  <>
    <Caption.Root truncate>
      {"長いラベル".repeat(20)}
    </Caption.Root>
  </>
);

export const Weight: Story = () => (
  <>
    <Caption.Root weight="normal">通常 (normal) のラベル</Caption.Root>
    <Caption.Root weight="medium">中字 (medium) のラベル</Caption.Root>
    <Caption.Root weight="bold">太字 (bold) のラベル</Caption.Root>
  </>
);
