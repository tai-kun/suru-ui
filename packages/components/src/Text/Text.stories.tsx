import "@suru-ui/theme/base.css";
import "@suru-ui/theme/light.css";
import "@suru-ui/theme/desktop.css";

import type { Meta, StoryFn } from "@storybook/react";
import { $, COLORS } from "@suru-ui/theme";
import * as Text from ".";

export default {
  title: "typography/Text",
  component: Text.Root,
  tags: ["autodocs"],
} satisfies Meta<typeof Text.Root>;

type Story = StoryFn<typeof Text.Root>;

export const Basic: Story = () => <Text.Root>テキスト</Text.Root>;

export const Alignment: Story = () => (
  <>
    <Text.Root align="start">始端揃え</Text.Root>
    <Text.Root align="end">終端揃え</Text.Root>
    <Text.Root align="justify">両端揃え</Text.Root>
    <Text.Root align="center">{"中央揃え ".repeat(15)}</Text.Root>
    <Text.Root align="middle">{"中央寄せ ".repeat(15)}</Text.Root>
  </>
);

export const Color: Story = () => (
  <>
    {COLORS.map(color => (
      <Text.Root
        key={color}
        color={$.color[color].naked.canvasText}
      >
        テキスト
      </Text.Root>
    ))}
  </>
);

export const Font: Story = () => (
  <>
    <Text.Root font="sans">サンセリフ体 (sans)</Text.Root>
    <Text.Root font="serif">セリフ体 (serif)</Text.Root>
    <Text.Root font="mono">等幅体 (mono)</Text.Root>
  </>
);

export const Inline: Story = () => (
  <>
    <Text.Root inline>インラインテキスト 1</Text.Root>
    <Text.Root inline>インラインテキスト 2</Text.Root>
    <Text.Root inline>インラインテキスト 3</Text.Root>
    <Text.Root>ブロックテキスト 1</Text.Root>
    <Text.Root>ブロックテキスト 2</Text.Root>
    <Text.Root>ブロックテキスト 3</Text.Root>
  </>
);

export const Leading: Story = () => (
  <>
    <Text.Root leading="sm">
      {"行間が狭いテキスト ".repeat(10)}
    </Text.Root>
    <Text.Root leading="md">
      {"行間が普通のテキスト ".repeat(10)}
    </Text.Root>
    <Text.Root leading="lg">
      {"行間が広いテキスト ".repeat(10)}
    </Text.Root>
  </>
);

export const LineClamp: Story = () => (
  <>
    <Text.Root lineClamp={1}>
      {"lineClamp={1}" + "長いテキスト".repeat(50)}
    </Text.Root>
    <Text.Root lineClamp={3}>
      {"lineClamp={3}" + "長いテキスト".repeat(50)}
    </Text.Root>
    <Text.Root lineClamp={Infinity}>
      {"lineClamp={Infinity}" + "長いテキスト".repeat(50)}
    </Text.Root>
  </>
);

export const Size: Story = () => (
  <>
    <Text.Root>普通サイズのテキスト</Text.Root>
    <Text.Root size="sm">小さいサイズのテキスト</Text.Root>
    <Text.Root size="1.5em">相対サイズのテキスト</Text.Root>
    <Text.Root size={20}>カスタムサイズのテキスト</Text.Root>
  </>
);

export const Tracking: Story = () => (
  <>
    <Text.Root tracking="sm">
      {"文字間が狭いテキスト ".repeat(10)}
    </Text.Root>
    <Text.Root tracking="md">
      {"文字間が普通のテキスト ".repeat(10)}
    </Text.Root>
  </>
);

export const Truncate: Story = () => (
  <>
    <Text.Root truncate>
      {"長いテキスト".repeat(20)}
    </Text.Root>
  </>
);

export const Weight: Story = () => (
  <>
    <Text.Root weight="normal">通常 (normal) のテキスト</Text.Root>
    <Text.Root weight="medium">中字 (medium) のテキスト</Text.Root>
    <Text.Root weight="bold">太字 (bold) のテキスト</Text.Root>
  </>
);
