import "@suru-ui/theme/base.css";
import "@suru-ui/theme/light.css";
import "@suru-ui/theme/desktop.css";

import React from "react";

import type { Meta, StoryFn } from "@storybook/react";
import { COLOR_VARIANTS as VARIANTS, COLORS, SIZINGS } from "@suru-ui/theme";
import {
  MdAccessibility,
  MdAdd,
  MdChat,
  MdClose,
  MdDeleteForever,
  MdFileCopy,
  MdOpenInNew,
  MdOutlineBedtime,
  MdOutlineHandshake,
  MdSearch,
} from "react-icons/md";
import * as SuiLoading from "../Loading";
import * as IconButton from ".";

export default {
  title: "forms/IconButton",
  component: IconButton.Root,
  tags: ["autodocs"],
} satisfies Meta<typeof IconButton.Root>;

type Story = StoryFn<typeof IconButton.Root>;

export const Basic: Story = () => (
  <IconButton.Root>
    <MdAdd />
  </IconButton.Root>
);

export const Color: Story = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {COLORS.map(color => (
      <IconButton.Root
        key={color}
        color={color}
      >
        <MdDeleteForever />
      </IconButton.Root>
    ))}
  </div>
);

export const Disabled: Story = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {VARIANTS.map(variant => (
      <IconButton.Root
        key={variant}
        variant={variant}
        disabled
      >
        <MdAdd />
      </IconButton.Root>
    ))}
  </div>
);

export const FullWidth: Story = () => (
  <IconButton.Root fullWidth>
    <MdOutlineHandshake />
  </IconButton.Root>
);

export const Link: Story = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {VARIANTS.map(variant => (
      <IconButton.Root
        key={variant}
        asChild
        variant={variant}
      >
        <a href="#">
          <MdOpenInNew />
        </a>
      </IconButton.Root>
    ))}
  </div>
);

export const Loading: Story = () => {
  const [loading, setLoading] = React.useState<boolean>(true);

  return (
    <>
      <IconButton.Root loading={loading}>
        <MdAdd />
      </IconButton.Root>

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

export const LoadingIcon: Story = () => {
  const [loading, setLoading] = React.useState<boolean>(true);

  return (
    <>
      <IconButton.Root
        loading={loading}
        loadingIcon={<SuiLoading.Root variant="dots" size="1.5em" />}
      >
        <MdAdd />
      </IconButton.Root>

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

export const Outlined: Story = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {VARIANTS.map(variant => (
      <IconButton.Root
        key={variant}
        variant={variant}
        outlined
      >
        <MdOutlineBedtime />
      </IconButton.Root>
    ))}
  </div>
);

export const Size: Story = () => (
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    {SIZINGS.map(size => (
      <IconButton.Root
        key={size}
        size={size}
      >
        <MdClose />
      </IconButton.Root>
    ))}
  </div>
);

export const Variant: Story = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {VARIANTS.map(variant => (
      <IconButton.Root
        key={variant}
        variant={variant}
      >
        <MdAccessibility />
      </IconButton.Root>
    ))}
  </div>
);

export const VariantMenuitem: Story = () => {
  const [selected, setSelected] = React.useState<number>(1);

  return (
    <div style={{ display: "flex", gap: 4, flexDirection: "column" }}>
      <IconButton.Root
        variant="menuitem"
        aria-selected={selected === 1}
        onClick={() => setSelected(1)}
      >
        <MdFileCopy />
      </IconButton.Root>

      <IconButton.Root
        variant="menuitem"
        aria-selected={selected === 2}
        onClick={() => setSelected(2)}
      >
        <MdSearch />
      </IconButton.Root>

      <IconButton.Root
        variant="menuitem"
        aria-selected={selected === 3}
        onClick={() => setSelected(3)}
      >
        <MdChat />
      </IconButton.Root>
    </div>
  );
};
