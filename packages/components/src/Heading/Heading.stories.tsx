import "@suru-ui/theme/base.css";
import "@suru-ui/theme/light.css";
import "@suru-ui/theme/desktop.css";

import type { Meta, StoryFn } from "@storybook/react";
import { $, COLORS } from "@suru-ui/theme";
import * as Heading from ".";

export default {
  title: "typography/Heading",
  component: Heading.Root,
  tags: ["autodocs"],
} satisfies Meta<typeof Heading.Root>;

type Story = StoryFn<typeof Heading.Root>;

export const Basic: Story = () => <Heading.Root>テキスト</Heading.Root>;

export const Alignment: Story = () => (
  <>
    <Heading.Root align="start">始端揃え</Heading.Root>
    <Heading.Root align="end">終端揃え</Heading.Root>
    <Heading.Root align="justify">両端揃え</Heading.Root>
    <Heading.Root align="center">{"中央揃え ".repeat(8)}</Heading.Root>
    <Heading.Root align="middle">{"中央寄せ ".repeat(8)}</Heading.Root>
  </>
);

export const Color: Story = () => (
  <>
    {COLORS.map(color => (
      <Heading.Root
        key={color}
        color={$.color[color].naked.canvasText}
      >
        テキスト
      </Heading.Root>
    ))}
  </>
);

export const Font: Story = () => (
  <>
    <Heading.Root font="sans">サンセリフ体 (sans)</Heading.Root>
    <Heading.Root font="serif">セリフ体 (serif)</Heading.Root>
    <Heading.Root font="mono">等幅体 (mono)</Heading.Root>
  </>
);

export const Inline: Story = () => (
  <>
    <Heading.Root inline>インラインテキスト 1</Heading.Root>
    <Heading.Root inline>インラインテキスト 2</Heading.Root>
    <Heading.Root inline>インラインテキスト 3</Heading.Root>
    <Heading.Root>ブロックテキスト 1</Heading.Root>
    <Heading.Root>ブロックテキスト 2</Heading.Root>
    <Heading.Root>ブロックテキスト 3</Heading.Root>
  </>
);

export const Leading: Story = () => (
  <>
    <Heading.Root leading="sm">
      {"行間が狭いテキスト ".repeat(8)}
    </Heading.Root>
    <Heading.Root leading="md">
      {"行間が普通のテキスト ".repeat(8)}
    </Heading.Root>
    <Heading.Root leading="lg">
      {"行間が広いテキスト ".repeat(8)}
    </Heading.Root>
  </>
);

export const Level: Story = () => (
  <>
    <Heading.Root>h1 テキスト</Heading.Root>
    <Heading.Root level={2}>h2 テキスト</Heading.Root>
    <Heading.Root level={3}>h3 テキスト</Heading.Root>
    <Heading.Root level={4}>h4 テキスト</Heading.Root>
    <Heading.Root level={5}>h5 テキスト</Heading.Root>
  </>
);

export const LineClamp: Story = () => (
  <>
    <Heading.Root lineClamp={1}>
      {"lineClamp={1}" + "長いテキスト".repeat(20)}
    </Heading.Root>
    <Heading.Root lineClamp={3}>
      {"lineClamp={3}" + "長いテキスト".repeat(20)}
    </Heading.Root>
    <Heading.Root lineClamp={Infinity}>
      {"lineClamp={Infinity}" + "長いテキスト".repeat(20)}
    </Heading.Root>
  </>
);

export const Tracking: Story = () => (
  <>
    <Heading.Root tracking="sm">
      {"文字間が狭いテキスト ".repeat(8)}
    </Heading.Root>
    <Heading.Root tracking="md">
      {"文字間が普通のテキスト ".repeat(8)}
    </Heading.Root>
  </>
);

export const Truncate: Story = () => (
  <>
    <Heading.Root truncate>
      {"長いテキスト".repeat(20)}
    </Heading.Root>
  </>
);

export const Weight: Story = () => (
  <>
    <Heading.Root weight="normal">通常 (normal) のテキスト</Heading.Root>
    <Heading.Root weight="medium">中字 (medium) のテキスト</Heading.Root>
    <Heading.Root weight="bold">太字 (bold) のテキスト</Heading.Root>
  </>
);
