import React from "react";

import { styled } from "@suru-ui/styled";
import { isLabelSizing, type LabelSizing } from "@suru-ui/theme";
import clsx from "clsx";
import * as Typography from "../Typography";

import "./Label.css";

const I = "SuiLabel";

interface LabelCss {
  sizing: LabelSizing | (string & {}) | number;
}

const Label = styled.label<LabelCss>`${({ sizing }) => (
  isLabelSizing(sizing)
    ? null
    : `--${I}-sizing: ${typeof sizing === "number" ? sizing + "px" : sizing};`
)}`;

export interface RootParams extends Typography.RootParams {
  size?: LabelCss["sizing"] | undefined;
}

export interface RootProps
  extends
    Omit<React.ComponentProps<typeof Label>, keyof RootParams | "css">,
    RootParams
{}

export default function SuiLabel(props: RootProps) {
  const {
    size: sizing = "md",
    asChild,
    children,
    className,
    ...otherRootProps
  } = props;

  return (
    <Typography.Root
      {...otherRootProps as {}}
      asChild
      className={clsx(className, I, {
        [`${I}-size-${sizing}`]: isLabelSizing(sizing),
      })}
    >
      <Label
        css={{
          sizing,
        }}
        asChild={asChild}
      >
        {children}
      </Label>
    </Typography.Root>
  );
}
