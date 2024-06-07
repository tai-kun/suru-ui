import React from "react";

import { styled } from "@suru-ui/styled";
import {
  type Color,
  type FontSizing,
  isColor,
  isFontSizing,
} from "@suru-ui/theme";
import clsx from "clsx";

import "./Loading.css";

const I = "SuiLoading";

interface SvgCss {
  color: Color | (string & {}) | undefined;
  sizing: FontSizing | (string & {}) | number | undefined;
}

const WithCustomProperties = styled.span<SvgCss>`display:contents;
${({ color }) => (
  color == null || isColor(color)
    ? null
    : `--${I}-color: ${color}`
)};
${({ sizing }) => (
  sizing == null || isFontSizing(sizing)
    ? null
    : `--${I}-sizing: ${typeof sizing === "number" ? `${sizing}px` : sizing}`
)}`;

/**
 * @see https://github.com/n3r4zzurr0/svg-spinners
 */
function Ring(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
        fill="currentColor"
        opacity=".25"
      />
      <path
        d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * @see https://github.com/n3r4zzurr0/svg-spinners
 */
function Dots(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <circle fill="currentColor" cx="4" cy="12" r="1.5" />
      <circle fill="currentColor" cx="12" cy="12" r="3" />
      <circle fill="currentColor" cx="20" cy="12" r="1.5" />
    </svg>
  );
}

export interface LoadingParams {
  color?: Color | { readonly toString: () => string } | undefined;
  size?: SvgCss["sizing"];
  variant?: "ring" | "dots" | undefined;
}

export interface LoadingProps extends
  Omit<
    React.SVGProps<SVGSVGElement>,
    | keyof LoadingParams
    | "xmlns"
    | "width"
    | "height"
    | "viewBox"
    | "children"
  >,
  LoadingParams
{}

export default function Root(props: LoadingProps) {
  const {
    size: sizing,
    color,
    variant = "ring",
    className: classNameProp,
    ...otherRootProps
  } = props;
  const className = clsx(classNameProp, I, `${I}-variant-${variant}`, {
    [`${I}-size-${sizing}`]: isFontSizing(sizing),
    [`${I}-color-${color}`]: isColor(color),
  });
  let iconElement: React.ReactElement;

  switch (variant) {
    case "ring":
      iconElement = <Ring className={className} {...otherRootProps} />;

      break;

    case "dots":
      iconElement = <Dots className={className} {...otherRootProps} />;

      break;

    default:
      if (__DEV__) {
        console.error(
          `SUI(components/Loading): 不明な variant が指定されました: ${variant}`,
        );
      }

      return null;
  }

  return (
    <WithCustomProperties
      css={{
        color: color?.toString(),
        sizing,
      }}
    >
      {iconElement}
    </WithCustomProperties>
  );
}
