import React from "react";

import { styled } from "@suru-ui/styled";
import {
  type FontFamily,
  type FontWeight,
  isFontFamily,
  isFontWeight,
  isLeading,
  isTextSizing,
  isTracking,
  type Leading,
  type TextSizing,
  type Tracking,
} from "@suru-ui/theme";
import clsx from "clsx";
import "./Text.css";

const I = "SuiText";

interface ParagraphCss {
  color: string | undefined;
  font: FontFamily | React.CSSProperties["fontFamily"];
  leading: Leading | React.CSSProperties["lineHeight"];
  lineClamp: number | undefined;
  sizing: TextSizing | (string & {}) | number;
  tracking: Tracking | React.CSSProperties["letterSpacing"];
  weight: FontWeight | React.CSSProperties["fontWeight"];
}

const Paragraph = styled.p<ParagraphCss>`
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
${({ sizing }) => (
  isTextSizing(sizing)
    ? null
    : `--${I}-sizing: ${typeof sizing === "number" ? sizing + "px" : sizing};`
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

interface RootProps
  extends Omit<React.ComponentProps<typeof Paragraph>, "color" | "css" | "size">
{
  align?: "start" | "center" | "end" | "justify" | "middle" | undefined;
  color?: string | { readonly toString: () => string } | undefined;
  font?: ParagraphCss["font"];
  inline?: boolean | undefined;
  leading?: ParagraphCss["leading"];
  lineClamp?: ParagraphCss["lineClamp"];
  size?: ParagraphCss["sizing"] | undefined;
  tracking?: ParagraphCss["tracking"];
  truncate?: boolean | undefined;
  weight?: ParagraphCss["weight"];
}

export default function Root(props: RootProps) {
  const {
    font = "sans",
    size: sizing = "md",
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
              "SUI(components/Text): "
                + "inline と lineClamp を同時に指定することはできません。"
                + "lineClamp はブロック要素でのみ使用できます。inline は無効化されます。",
            );
          }

          if (truncate) {
            console.error(
              "SUI(components/Text): "
                + "truncate と lineClamp を同時に指定することはできません。"
                + "truncate は無効化されます。",
            );
          }

          if (
            !(Number.isSafeInteger(lineClampProp) && lineClampProp > 0)
            && !(lineClampProp === Infinity)
          ) {
            console.error(
              "SUI(components/Text): "
                + "lineClamp には正の整数または Infinity を指定してください。",
            );
          }
        }
      },
      [inline, lineClampProp, truncate],
    );
  }

  return (
    <Paragraph
      {...otherRootProps}
      css={{
        font,
        color: color?.toString(),
        sizing,
        weight,
        leading,
        tracking,
        lineClamp,
      }}
      className={clsx(className, I, {
        [`${I}-size-${sizing}`]: isTextSizing(sizing),
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
