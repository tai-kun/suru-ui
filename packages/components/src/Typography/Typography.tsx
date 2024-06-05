import React from "react";

import { styled } from "@suru-ui/styled";
import {
  type FontFamily,
  type FontWeight,
  isFontFamily,
  isFontWeight,
  isLeading,
  isTracking,
  type Leading,
  type Tracking,
} from "@suru-ui/theme";
import clsx from "clsx";

import "./Typography.css";

const I = "SuiTypography";

interface DivCss {
  color: string | undefined;
  font: FontFamily | React.CSSProperties["fontFamily"];
  leading: Leading | React.CSSProperties["lineHeight"];
  lineClamp: number | undefined;
  tracking: Tracking | React.CSSProperties["letterSpacing"];
  weight: FontWeight | React.CSSProperties["fontWeight"];
}

const Div = styled.div<DivCss>`
${({ color }) => (
  color == null
    ? null
    : `--${I}-color: ${color};`
)}
${({ font }) => (
  font == null || isFontFamily(font)
    ? null
    : `--${I}-font: ${font};`
)}
${({ leading }) => (
  leading == null || isLeading(leading)
    ? null
    : `--${I}-leading: ${leading};`
)}
${({ lineClamp }) => (
  lineClamp == null
    ? null
    : `--${I}-lineClamp: ${lineClamp};`
)}
${({ tracking }) => (
  tracking == null || isTracking(tracking)
    ? null
    : `--${I}-tracking: ${tracking};`
)}
${({ weight }) => (
  weight == null || isFontWeight(weight)
    ? null
    : `--${I}-weight: ${weight};`
)}
`;

export interface RootParams {
  align?: "start" | "center" | "end" | "justify" | "middle" | undefined;
  color?: string | { readonly toString: () => string } | undefined;
  font?: DivCss["font"];
  inline?: boolean | undefined;
  leading?: DivCss["leading"];
  lineClamp?: DivCss["lineClamp"];
  tracking?: DivCss["tracking"];
  truncate?: boolean | undefined;
  weight?: DivCss["weight"];
}

export interface RootProps
  extends
    Omit<React.ComponentProps<typeof Div>, keyof RootParams | "css">,
    RootParams
{}

export default function Root(props: RootProps) {
  const {
    font,
    align,
    color,
    inline = false,
    weight,
    leading,
    tracking,
    truncate = false,
    className,
    lineClamp: lineClampProp,
    ...otherRootProps
  } = props;
  const lineClamp = lineClampProp == null
      || !Number.isSafeInteger(lineClampProp)
      || lineClampProp <= 0
    ? undefined
    : lineClampProp;

  if (__DEV__) {
    React.useEffect(
      () => {
        if (lineClampProp != null) {
          if (inline) {
            console.error(
              "SUI(components/Typography): "
                + "inline と lineClamp を同時に指定することはできません。"
                + "lineClamp はブロック要素でのみ使用できます。inline は無効化されます。",
            );
          }

          if (truncate) {
            console.error(
              "SUI(components/Typography): "
                + "truncate と lineClamp を同時に指定することはできません。"
                + "truncate は無効化されます。",
            );
          }

          if (
            !(Number.isSafeInteger(lineClampProp) && lineClampProp > 0)
            && !(lineClampProp === Infinity)
          ) {
            console.error(
              "SUI(components/Typography): "
                + "lineClamp には正の整数または Infinity を指定してください。",
            );
          }
        }
      },
      [inline, lineClampProp, truncate],
    );
  }

  return (
    <Div
      {...otherRootProps}
      css={{
        font,
        color: color?.toString(),
        weight,
        leading,
        tracking,
        lineClamp,
      }}
      className={clsx(className, I, {
        [`${I}-font-${font}`]: isFontFamily(font),
        [`${I}-align-${align}`]: align,
        [`${I}-weight-${weight}`]: isFontWeight(weight),
        [`${I}-leading-${leading}`]: isLeading(leading),
        [`${I}-tracking-${tracking}`]: isTracking(tracking),
        [`${I}-inline`]: inline,
        [`${I}-truncate`]: truncate,
        [`${I}-lineClamp`]: lineClamp != null,
      })}
    />
  );
}
