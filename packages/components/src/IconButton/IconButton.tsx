import React from "react";

import { Slot, Slottable } from "@suru-ui/slot";
import { type Color, type Sizing } from "@suru-ui/theme";
import clsx from "clsx";
import * as ButtonStyle from "../ButtonStyle";
import * as classes from "../classes";
import * as Loading from "../Loading";

import "./IconButton.css";

const I = "SuiIconButton";

export interface IconButtonParams
  extends Partial<Omit<ButtonStyle.RootParams, "variant">>
{
  fullWidth?: boolean | undefined;
  highlighted?: boolean | undefined;
  loading?: boolean | undefined;
  loadingIcon?: React.ReactElement | undefined;
  size?: Sizing | undefined;
  variant?: "menuitem" | ButtonStyle.RootParams["variant"];
}

export interface IconButtonProps
  extends
    Omit<React.ComponentProps<"button">, keyof IconButtonParams>,
    IconButtonParams
{
  asChild?: boolean | undefined;
}

export default function SuiIconButton(props: IconButtonProps) {
  const {
    size = "md",
    type: typeProp = "button",
    color: colorProp = "blue",
    asChild,
    loading = false,
    variant: variantProp = "solid",
    children,
    disabled,
    outlined,
    className,
    fullWidth = false,
    highlighted: highlightedProp,
    loadingIcon = <Loading.Root />,
    ...otherRootProps
  } = props;
  const Component = asChild ? Slot : "button";
  const highlighted = highlightedProp ?? (
    String(props["aria-selected"]) === "true"
  );
  const color: Color = variantProp !== "menuitem" || highlighted
    ? colorProp
    : "grey";
  const variant: NonNullable<ButtonStyle.RootParams["variant"]> =
    variantProp !== "menuitem"
      ? variantProp
      : highlighted
      ? "solid"
      : "naked";

  return (
    <ButtonStyle.Root
      color={color}
      variant={variant}
      outlined={outlined}
    >
      <Component
        {...otherRootProps}
        type={typeProp}
        disabled={disabled || loading}
        className={clsx(className, I, [
          `${I}-size-${size}`,
        ], {
          [`${I}-fullWidth`]: fullWidth,
          [`${I}-variant-menuitem`]: variantProp === "menuitem",
          [classes.loading]: loading,
          [classes.highlighted]: highlighted,
        })}
      >
        <Slottable>{children}</Slottable>
        {!loading
          ? null
          : <Slot className={`${I}_LoadingIcon`}>{loadingIcon}</Slot>}
      </Component>
    </ButtonStyle.Root>
  );
}
