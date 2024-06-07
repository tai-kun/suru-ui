import "@suru-ui/theme/base.css";
import "@suru-ui/theme/light.css";
import "@suru-ui/theme/desktop.css";

import React from "react";

import type { Meta, StoryFn } from "@storybook/react";
import { COLOR_VARIANTS as VARIANTS, COLORS, SIZINGS } from "@suru-ui/theme";
import { IoMdAdd } from "react-icons/io";
import * as SuiLoading from "../Loading";
import * as Button from ".";

export default {
  title: "forms/Button",
  component: Button.Root,
  tags: ["autodocs"],
} satisfies Meta<typeof Button.Root>;

type Story = StoryFn<typeof Button.Root>;

export const Basic: Story = () => (
  <Button.Root>
    <Button.Text>ボタン</Button.Text>
  </Button.Root>
);
Basic.storyName = "基本的な使い方";

export const Variant: Story = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {VARIANTS.map(variant => (
      <Button.Root
        key={variant}
        variant={variant}
      >
        <Button.Text>{variant.toUpperCase()}</Button.Text>
      </Button.Root>
    ))}
  </div>
);
Variant.storyName = "バリエーションを変更する";

export const Link: Story = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {VARIANTS.map(variant => (
      <Button.Root
        key={variant}
        asChild
        variant={variant}
      >
        <a href="#">
          <Button.Text>リンク</Button.Text>
        </a>
      </Button.Root>
    ))}
  </div>
);
Link.storyName = "リンクの見た目にする";

export const VariantMenuitem: Story = () => {
  const [selected, setSelected] = React.useState<number>(1);

  return (
    <div style={{ display: "flex", gap: 4, flexDirection: "column" }}>
      {[1, 2, 3].map(i => (
        <Button.Root
          key={i}
          variant="menuitem"
          aria-selected={selected === i}
          onClick={() => setSelected(i)}
        >
          <Button.Text>メニューアイテム - {i}</Button.Text>
        </Button.Root>
      ))}
    </div>
  );
};
VariantMenuitem.storyName = "メニューアイテムの見た目にする";

export const Outlined: Story = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {VARIANTS.map(variant => (
      <Button.Root
        key={variant}
        variant={variant}
        outlined
      >
        <Button.Text>{variant.toUpperCase()}</Button.Text>
      </Button.Root>
    ))}
  </div>
);
Outlined.storyName = "枠線を付ける";

export const Size: Story = () => (
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    {SIZINGS.map(size => (
      <Button.Root
        key={size}
        size={size}
      >
        <Button.Text>{size.toUpperCase()} サイズ</Button.Text>
      </Button.Root>
    ))}
  </div>
);
Size.storyName = "大きさを変更する";

export const Color: Story = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {COLORS.map(color => (
      <Button.Root
        key={color}
        color={color}
      >
        <Button.Text>{color.toUpperCase()}</Button.Text>
      </Button.Root>
    ))}
  </div>
);
Color.storyName = "色を変更する";

export const Adornment: Story = () => (
  <Button.Root>
    <Button.Adornment>
      <IoMdAdd />
    </Button.Adornment>
    <Button.Text>ボタン</Button.Text>
  </Button.Root>
);
Adornment.storyName = "装飾 (アイコン) を付ける";

export const Alignment: Story = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {(["start", "center", "end"] as const).map(align => (
      <Button.Root
        key={align}
        align={align}
        fullWidth
      >
        <Button.Text>{align.toUpperCase()}</Button.Text>
      </Button.Root>
    ))}
  </div>
);
Alignment.storyName = "文字の配置を変更する";

export const FullWidth: Story = () => (
  <Button.Root fullWidth>
    <Button.Text>最大幅</Button.Text>
  </Button.Root>
);
FullWidth.storyName = "最大幅いっぱいにする";

export const Loading: Story = () => {
  const [loading, setLoading] = React.useState<boolean>(true);

  return (
    <>
      <Button.Root loading={loading}>
        <Button.Text>ボタン</Button.Text>
      </Button.Root>

      <button
        type="button"
        style={{ marginLeft: 8 }}
        onClick={() => setLoading(prev => !prev)}
      >
        {loading ? "停止" : "開始"}
      </button>
    </>
  );
};
Loading.storyName = "ローディングを表示する";

export const LoadingIcon: Story = () => {
  const [loading, setLoading] = React.useState<boolean>(true);

  return (
    <>
      <Button.Root
        loading={loading}
        loadingIcon={<SuiLoading.Root variant="dots" size="2em" />}
      >
        <Button.Text>ボタン</Button.Text>
      </Button.Root>

      <button
        type="button"
        style={{ marginLeft: 8 }}
        onClick={() => setLoading(prev => !prev)}
      >
        {loading ? "停止" : "開始"}
      </button>
    </>
  );
};
LoadingIcon.storyName = "ローディングのアイコンを変更する";

export const Disabled: Story = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {VARIANTS.map(variant => (
      <Button.Root
        key={variant}
        variant={variant}
        disabled
      >
        <Button.Text>{variant.toUpperCase()}</Button.Text>
      </Button.Root>
    ))}
  </div>
);
Disabled.storyName = "無効化する";
