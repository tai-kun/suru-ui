import React from "react";

import { Slot } from "@suru-ui/slot";
import clsx from "clsx";

const I = "SuiButton_Adornment";

export interface AdornmentParams {}

export interface AdornmentProps
  extends
    Omit<React.ComponentProps<"span">, keyof AdornmentParams>,
    AdornmentParams
{
  asChild?: boolean | undefined;
}

export default function Adornment(props: AdornmentProps) {
  const {
    asChild,
    className,
    ...otherAdornmentProps
  } = props;
  const Span = asChild ? Slot : "span";

  return (
    <Span
      {...otherAdornmentProps}
      className={clsx(className, I)}
    />
  );
}
