import React from "react";

import { Slot } from "@suru-ui/slot";
import { type Color, type Sizing } from "@suru-ui/theme";
import clsx from "clsx";

import "./Radio.css";

const I = "SuiRadio";

export interface RootParams {
  color?: Color | undefined;
  size?: Sizing | undefined;
}

export interface RootProps
  extends Omit<React.ComponentProps<"input">, keyof RootParams>, RootParams
{
  asChild?: boolean | undefined;
}

export default function SuiRadio(props: RootProps) {
  const {
    size = "md",
    type: typeProp = "radio",
    color = "blue",
    asChild,
    className,
    ...otherRootProps
  } = props;
  const Component = asChild ? Slot : "input";

  return (
    <Component
      {...otherRootProps}
      type={typeProp}
      className={clsx(className, I, [
        `${I}-size-${size}`,
        `${I}-color-${color}`,
      ])}
    />
  );
}
