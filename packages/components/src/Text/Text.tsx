import React from "react";

import { styled } from "@suru-ui/styled";
import { isTextSizing, type TextSizing } from "@suru-ui/theme";
import clsx from "clsx";
import * as Typography from "../Typography";

import "./Text.css";

const I = "SuiText";

interface ParagraphCss {
  sizing: TextSizing | (string & {}) | number;
}

const Paragraph = styled.p<ParagraphCss>`${({ sizing }) => (
  isTextSizing(sizing)
    ? null
    : `--${I}-sizing: ${typeof sizing === "number" ? sizing + "px" : sizing};`
)}`;

export interface RootParams extends Typography.RootParams {
  size?: ParagraphCss["sizing"] | undefined;
}

export interface RootProps
  extends
    Omit<React.ComponentProps<typeof Paragraph>, keyof RootParams | "css">,
    RootParams
{}

export default function SuiText(props: RootProps) {
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
        [`${I}-size-${sizing}`]: isTextSizing(sizing),
      })}
    >
      <Paragraph
        css={{
          sizing,
        }}
        asChild={asChild}
      >
        {children}
      </Paragraph>
    </Typography.Root>
  );
}
