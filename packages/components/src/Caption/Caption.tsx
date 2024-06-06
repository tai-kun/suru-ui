import React from "react";

import { styled } from "@suru-ui/styled";
import { type CaptionSizing, isCaptionSizing } from "@suru-ui/theme";
import clsx from "clsx";
import * as Typography from "../Typography";

import "./Caption.css";

const I = "SuiCaption";

interface CaptionCss {
  sizing: CaptionSizing | (string & {}) | number;
}

const Caption = styled.caption<CaptionCss>`${({ sizing }) => (
  isCaptionSizing(sizing)
    ? null
    : `--${I}-sizing: ${typeof sizing === "number" ? sizing + "px" : sizing};`
)}`;

export interface RootParams extends Typography.RootParams {
  size?: CaptionCss["sizing"] | undefined;
}

export interface RootProps
  extends
    Omit<React.ComponentProps<typeof Caption>, keyof RootParams | "css">,
    RootParams
{}

export default function Root(props: RootProps) {
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
        [`${I}-size-${sizing}`]: isCaptionSizing(sizing),
      })}
    >
      <Caption
        css={{
          sizing,
        }}
        asChild={asChild}
      >
        {children}
      </Caption>
    </Typography.Root>
  );
}
