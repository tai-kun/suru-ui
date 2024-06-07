import React from "react";

import { Slot } from "@suru-ui/slot";
import { styled } from "@suru-ui/styled";
import type { HeadingLevel } from "@suru-ui/theme";
import clsx from "clsx";
import * as Typography from "../Typography";

import "./Heading.css";

const I = "SuiHeading";

interface HeadingCss {
  sizing: (string & {}) | number | undefined;
}

const Heading = styled.h1<HeadingCss>`${({ sizing }) => (
  sizing == null
    ? null
    : `--${I}-sizing: ${typeof sizing === "number" ? sizing + "px" : sizing};`
)}`;

export interface RootParams extends Typography.RootParams {
  level?: HeadingLevel | undefined;
  size?: HeadingCss["sizing"] | undefined;
}

export interface RootProps
  extends
    Omit<React.ComponentProps<typeof Heading>, keyof RootParams | "css">,
    RootParams
{}

export default function SuiHeading(props: RootProps) {
  const {
    size: sizing,
    level = 1,
    asChild,
    children,
    className,
    ...otherRootProps
  } = props;
  const Component = asChild ? Slot : `h${level}`;

  return (
    <Typography.Root
      {...otherRootProps as {}}
      asChild
      className={clsx(className, I, {
        [`${I}-level-${level}`]: sizing == null,
      })}
    >
      <Heading
        css={{
          sizing,
        }}
        asChild
      >
        <Component>
          {children}
        </Component>
      </Heading>
    </Typography.Root>
  );
}
