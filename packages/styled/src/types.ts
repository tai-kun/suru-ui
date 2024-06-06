import type React from "react";

import type {
  SerializableArray,
  SerializablePrimitive,
  SerializablePrimitiveObject,
} from "@suru-ui/vhash";

/**
/**
 * CSS 値の配列型。
 */
export type CssValueArray = SerializableArray;

/**
 * CSS 値のプリミティブ型。
 */
export type CssValuePrimitive = SerializablePrimitive;

/**
 * CSS 値のプリミティブになれるオブジェクト型。
 */
export type CssValuePrimitiveObject = SerializablePrimitiveObject;

/**
 * CSS プロパティ兼 CSS のシンタックスハイライトを提供するためのヘルパー関数。
 *
 * @template P - CSS プロパティ。
 */
export type CssFunction<P = {}> = Readonly<P> & {
  /**
   * CSS の値を文字列に変換する。
   *
   * @returns CSS の値を表す文字列。
   */
  (
    pieces: TemplateStringsArray,
    ...values:
      readonly (CssValueArray | CssValuePrimitive | CssValuePrimitiveObject)[]
  ): string;
};

/**
 * CSS 値の関数型。
 *
 * @template P - CSS プロパティ。
 */
export interface CssValueFunction<P = {}> {
  /**
   * CSS の値を返す関数。
   *
   * @param css - CSS プロパティ。
   * @returns CSS の値。
   */
  (css: CssFunction<P>):
    | CssValueArray
    | CssValuePrimitive
    | CssValuePrimitiveObject;
}

/**
 * CSS 値の型。
 *
 * @template P - CSS プロパティ。
 */
export type CssValue<P = {}> =
  | CssValueFunction<P>
  | CssValueArray
  | CssValuePrimitive
  | CssValuePrimitiveObject;

export type SvgTag =
  | "svg"
  | "animate"
  | "animateMotion"
  | "animateTransform"
  | "circle"
  | "clipPath"
  | "defs"
  | "desc"
  | "ellipse"
  | "feBlend"
  | "feColorMatrix"
  | "feComponentTransfer"
  | "feComposite"
  | "feConvolveMatrix"
  | "feDiffuseLighting"
  | "feDisplacementMap"
  | "feDistantLight"
  | "feDropShadow"
  | "feFlood"
  | "feFuncA"
  | "feFuncB"
  | "feFuncG"
  | "feFuncR"
  | "feGaussianBlur"
  | "feImage"
  | "feMerge"
  | "feMergeNode"
  | "feMorphology"
  | "feOffset"
  | "fePointLight"
  | "feSpecularLighting"
  | "feSpotLight"
  | "feTile"
  | "feTurbulence"
  | "filter"
  | "foreignObject"
  | "g"
  | "image"
  | "line"
  | "linearGradient"
  | "marker"
  | "mask"
  | "metadata"
  | "mpath"
  | "path"
  | "pattern"
  | "polygon"
  | "polyline"
  | "radialGradient"
  | "rect"
  | "set"
  | "stop"
  | "switch"
  | "symbol"
  | "text"
  | "textPath"
  | "tspan"
  | "use"
  | "view";

export type HtmlTag = Exclude<keyof React.JSX.IntrinsicElements, SvgTag>;

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/styled/types", () => {
    test.todo("テスト");
  });
}
