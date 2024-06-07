import "@suru-ui/theme/base.css";
import "@suru-ui/theme/light.css";
import "@suru-ui/theme/desktop.css";

import type { Meta, StoryFn } from "@storybook/react";
import { COLORS, FONT_SIZINGS } from "@suru-ui/theme";
import * as Loading from ".";

export default {
  title: "feedback/Loading",
  component: Loading.Root,
  tags: ["autodocs"],
} satisfies Meta<typeof Loading.Root>;

type Story = StoryFn<typeof Loading.Root>;

export const Basic: Story = () => <Loading.Root />;

export const Color: Story = () => (
  <>
    <div>Ring:</div>
    {COLORS.map(color => (
      <Loading.Root
        color={color}
      />
    ))}
    <div>Dots:</div>
    {COLORS.map(color => (
      <Loading.Root
        color={color}
        variant="dots"
      />
    ))}
  </>
);

export const Size: Story = () => (
  <>
    <div>Ring:</div>
    {FONT_SIZINGS.map(fontSize => (
      <Loading.Root
        size={fontSize}
      />
    ))}
    <div>Dots:</div>
    {FONT_SIZINGS.map(fontSize => (
      <Loading.Root
        size={fontSize}
        variant="dots"
      />
    ))}
  </>
);

export const CustomSize: Story = () => (
  <div style={{ fontSize: 16 }}>
    <Loading.Root size={32} />
    <Loading.Root size="3em" />
  </div>
);

export const Variant: Story = () => (
  <>
    <div>Ring:</div>
    <Loading.Root variant="ring" />
    <div>Dots:</div>
    <Loading.Root variant="dots" />
  </>
);
