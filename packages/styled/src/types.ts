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

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/styled/types", () => {
    test.todo("テスト");
  });
}
