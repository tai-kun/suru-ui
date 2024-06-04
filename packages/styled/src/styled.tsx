import { Slot, Slottable } from "@suru-ui/slot";
import clsx, { type ClassValue } from "clsx";
import React from "react";
import {
  type SerializableArray,
  type SerializablePrimitive,
  type SerializablePrimitiveObject,
  vhash,
} from "./vhash";

/**
 * スタイル付きのコンポーネントのプロパティ。
 *
 * @template T - HTML 要素のタグ名。
 */
export interface StyledComponentProps<
  T extends keyof React.JSX.IntrinsicElements,
> extends Omit<React.HTMLProps<T>, "className"> {
  asChild?: boolean | undefined;
  className?: ClassValue;
}

/**
 * スタイル付きのコンポーネントのプロパティ。
 *
 * @template T - HTML 要素のタグ名。
 * @template P - CSS プロパティ。
 */
export interface StyledComponentPropsWithCss<
  T extends keyof React.JSX.IntrinsicElements,
  P,
> extends StyledComponentProps<T> {
  css: P;
}

/**
 * スタイル付きのコンポーネント。
 *
 * @template T - HTML 要素のタグ名。
 */
export interface StyledComponent<
  T extends keyof React.JSX.IntrinsicElements,
> extends React.FunctionComponent<StyledComponentProps<T>> {
  toString(): `.sui-C${T}.sui-T${string}`;
}

/**
 * スタイル付きのコンポーネント。
 *
 * @template T - HTML 要素のタグ名。
 * @template P - CSS プロパティ。
 */
export interface StyledComponentWithCss<
  T extends keyof React.JSX.IntrinsicElements,
  P,
> extends React.FunctionComponent<StyledComponentPropsWithCss<T, P>> {}

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

function toString(value: CssValue): string | CssValueFunction {
  if (typeof value === "string") {
    return value;
  } else if (typeof value === "number") {
    if (value !== value) {
      // return "";
    } else if (value === Infinity) {
      return "infinity";
    } else if (value === -Infinity) {
      return "-infinity";
    } else {
      return "" + value;
    }
  } else if (typeof value === "bigint") {
    return "" + value;
  } else if (typeof value === "boolean") {
    return value && "true" || "false";
  } else if (value == null) {
    return "";
  } else if (Array.isArray(value)) {
    let i = 0,
      length = value.length,
      result = "";

    for (; i < length; i++) {
      result += value[i];
      (i + 1 < length) && (result += " ");
    }

    return result;
  } else if (Object.hasOwn(value, "toValue")) {
    // @ts-expect-error
    return toString(value.toValue());
  } else if (Object.hasOwn(value, "toString")) {
    return toString(value.toString());
  } else if (typeof value === "function") {
    return value as CssValueFunction;
  }

  if (__DEV__) {
    console.error(
      `SUI(styled): CSS の値に変換できない値が含まれています: `,
      value,
    );
  }

  return "";
}

export const styled = /* @__PURE__ */ new Proxy(
  (() => ({})) as unknown as {
    readonly [T in keyof React.JSX.IntrinsicElements]: {
      /**
       * スタイル付きのコンポーネントを作成する。
       *
       * @returns スタイル付きのコンポーネント。
       */
      (
        pieces: TemplateStringsArray,
        ...values: readonly CssValue[]
      ): StyledComponent<T>;
      /**
       * スタイル付きのコンポーネントを作成する。
       *
       * @template P - CSS プロパティ。
       * @returns スタイル付きのコンポーネント。
       */
      <P>(
        pieces: TemplateStringsArray,
        ...values: readonly CssValue<P>[]
      ): StyledComponentWithCss<T, P>;
    };
  },
  {
    get:
      (_, key) =>
      (pieces: TemplateStringsArray, ...values: readonly CssValue[]) => {
        const templateHash = vhash(pieces),
          functions: CssValueFunction[] = [],
          template: string[] = [pieces[0]!];

        for (
          let i = 0,
            j = 0,
            tmp,
            length = values.length;
          i < length;
          i++
        ) {
          tmp = toString(values[i]);

          if (
            typeof tmp === "function"
            && !Object.hasOwn(tmp, "toString")
            && !Object.hasOwn(tmp, "toValue")
          ) {
            functions.push(tmp);
            template[++j] = pieces[i + 1]!;
          } else {
            template[j]! += tmp + pieces[i + 1]!;
          }
        }

        function Styled(props: StyledComponentPropsWithCss<any, {}>) {
          const {
            css,
            asChild,
            children,
            className: classNameProp,
            ...otherProps
          } = props;
          const Component: any = asChild ? Slot : key;

          if (__DEV__) {
            const keys = Object.keys(css || {}).filter(k => k in (() => {}));

            if (keys.length) {
              console.error(
                `SUI(styled): CSS の値に関数のプロパティが含まれています: `,
                keys,
              );

              return null;
            }
          }

          let i = 0,
            length = template.length,
            cssText = template[i++]!,
            cssFunc = Object.assign<CssFunction, {}>(
              (pieces, ...values) => {
                let j = 0,
                  result = pieces[j++]!;

                for (; j < pieces.length; j++) {
                  result += toString(values[j - 1]) + pieces[j]!;
                }

                return result;
              },
              css || {},
            );

          for (; i < length; i++) {
            cssText += toString(functions[i - 1]!(cssFunc)) + template[i]!;
          }

          const valuesHash = vhash(cssText);

          return (
            <Component
              className={clsx(
                classNameProp,
                "sui-C" + (key as string)
                  + " sui-T" + templateHash
                  + " sui-V" + valuesHash,
              )}
              {...otherProps}
            >
              <style
                // @ts-expect-error: React19 の属性
                href={"sui-" + templateHash + "-" + valuesHash}
                precedence="sui-styled"
              >
                {".sui-T" + templateHash + ".sui-V" + valuesHash
                  + "{" + cssText + "}"}
              </style>
              <Slottable>
                {children}
              </Slottable>
            </Component>
          );
        }

        return Object.assign(Styled, {
          toString() {
            return ".sui-C" + (key as string) + ".sui-T" + templateHash;
          },
        });
      },
  },
);

if (cfgTest && cfgTest.url === import.meta.url) {
  await import("@happy-dom/global-registrator")
    .then(({ GlobalRegistrator }) => GlobalRegistrator.register());
  const { renderToString } = await import("react-dom/server");
  const { assert, describe, test } = cfgTest;

  describe("@suru-ui/styled/styled", () => {
    test("スタイル付きのコンポーネントを作成する", async () => {
      const StyledDiv = styled.div<{ color: any }>`
        color: ${css => css`var(--color-${css.color})`};`;
      const markup = renderToString(
        <StyledDiv
          css={{ color: { toString: () => "red" } }}
          className="test"
        >
          CONTENT
        </StyledDiv>,
      );

      assert.equal(
        markup,
        renderToString(
          <>
            <style
              data-precedence="sui-styled"
              data-href="sui-16mr8hw-1qgs3bo"
            >
              {".sui-T16mr8hw.sui-V1qgs3bo{\n        color: var(--color-red);}"}
            </style>
            <div className="test sui-Cdiv sui-T16mr8hw sui-V1qgs3bo">
              CONTENT
            </div>
          </>,
        ),
      );
    });

    test("コンポーネントをスタイルのクラス名として使える", () => {
      const StyledButton = styled.button``;
      const StyledDiv = styled.div`& > ${StyledButton} { color: red; }`;
      const markup = renderToString(
        <StyledDiv>
          <StyledButton>CONTENT</StyledButton>
        </StyledDiv>,
      );

      assert.equal(
        markup,
        renderToString(
          <>
            <style
              data-precedence="sui-styled"
              data-href="sui-10tmcja-1ofshzm sui-84kp56-0"
            >
              {[
                ".sui-T10tmcja.sui-V1ofshzm{& > .sui-Cbutton.sui-T84kp56 { color: red; }}",
                ".sui-T84kp56.sui-V0{}",
              ].join("")}
            </style>
            <div className="sui-Cdiv sui-T10tmcja sui-V1ofshzm">
              <button className="sui-Cbutton sui-T84kp56 sui-V0">
                CONTENT
              </button>
            </div>
          </>,
        ),
      );
    });
  });
}
