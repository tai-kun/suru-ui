import React from "react";

import { Slot } from "@suru-ui/slot";
import { type Color, type Sizing } from "@suru-ui/theme";
import clsx from "clsx";

import "./Checkbox.css";

const I = "SuiCheckbox";

export interface RootParams {
  color?: Color | undefined;
  indeterminate?: boolean | undefined;
  size?: Sizing | undefined;
}

export interface RootProps
  extends Omit<React.ComponentProps<"input">, keyof RootParams>, RootParams
{
  asChild?: boolean | undefined;
}

export default function Root(props: RootProps) {
  const {
    size = "md",
    type: typeProp = "checkbox",
    color = "blue",
    asChild,
    className,
    indeterminate,
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
      ], {
        [`${I}-indeterminate`]: indeterminate,
      })}
    />
  );
}
