import React from "react";

import { Slot } from "@suru-ui/slot";
import clsx from "clsx";

const I = "SuiButton_Text";

export interface TextParams {
  align?: "start" | "center" | "end" | undefined;
  fullWidth?: boolean | undefined;
}

export interface TextProps
  extends Omit<React.ComponentProps<"span">, keyof TextParams>, TextParams
{
  asChild?: boolean | undefined;
}

export default function SuiButtonText(props: TextProps) {
  const {
    align = "center",
    asChild,
    className,
    fullWidth,
    ...otherTextProps
  } = props;
  const Span = asChild ? Slot : "span";

  return (
    <Span
      {...otherTextProps}
      className={clsx(className, I, `${I}-align-${align}`, {
        [`${I}-fullWidth`]: fullWidth,
      })}
    />
  );
}
