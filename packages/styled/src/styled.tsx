import React from "react";

import { Slot } from "@suru-ui/slot";
import clsx, { type ClassValue } from "clsx";
import build from "./build";
import compile from "./compile";
import type { CssValue, HtmlTag } from "./types";

/**
 * スタイル付きのコンポーネントのプロパティ。
 *
 * @template T - HTML 要素のタグ名。
 */
export type StyledComponentProps<
  T extends HtmlTag,
> = Omit<React.JSX.IntrinsicElements[T], "className"> & {
  asChild?: boolean | undefined;
  className?: ClassValue;
};

/**
 * スタイル付きのコンポーネントのプロパティ。
 *
 * @template T - HTML 要素のタグ名。
 * @template P - CSS プロパティ。
 */
export type StyledComponentPropsWithCss<
  T extends HtmlTag,
  P,
> = StyledComponentProps<T> & {
  css: P;
};

/**
 * スタイル付きのコンポーネント。
 *
 * @template T - HTML 要素のタグ名。
 */
export interface StyledComponent<
  T extends HtmlTag,
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
  T extends HtmlTag,
  P,
> extends React.FunctionComponent<StyledComponentPropsWithCss<T, P>> {}

const styled = /* @__PURE__ */ new Proxy(
  (() => ({})) as unknown as {
    readonly [
      // SVG 関連の要素には React の style の巻き上げが効かないので、HTML 要素のみを対象にする。
      T in HtmlTag
    ]: {
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
        const htmlTag = key as HtmlTag;
        const {
          hash: id,
          template,
          functions,
        } = build(pieces, values);

        function Styled(props: StyledComponentPropsWithCss<any, {}>) {
          const {
            css,
            asChild,
            children,
            className: classNameProp,
            ...otherProps
          } = props;
          const Component: any = asChild ? Slot : htmlTag;
          const { hash, cssText } = compile(css, template, functions);

          return (
            <>
              {
                /**
                 * 親要素のスタイルより、子要素のスタイルの方が後ろに来るようにするために、
                 * コンポーネントよりも先にスタイルを追加する。
                 */
              }
              <style
                // @ts-expect-error: React19 の属性
                href={"sui-" + id + "-" + hash}
                precedence="sui-styled"
              >
                {".sui-T" + id + ".sui-V" + hash + "{" + cssText + "}"}
              </style>
              <Component
                {...otherProps}
                className={clsx(
                  classNameProp,
                  // HTML 要素のタグ名 (asChild で変わることがあるので、クラス名で管理する)
                  "sui-C" + htmlTag,
                  // スタイル付きコンポーネントの ID
                  "sui-T" + id,
                  // このコンポーネントの css プロパティのハッシュ
                  "sui-V" + hash,
                )}
              >
                {children}
              </Component>
            </>
          );
        }

        return Object.assign(Styled, {
          toString() {
            return ".sui-C" + htmlTag + ".sui-T" + id;
          },
        });
      },
  },
);

export default styled;

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
              data-href="sui-1e4yi0o-1n9g2e5"
            >
              {".sui-T1e4yi0o.sui-V1n9g2e5{\n        color: var(--color-red);}"}
            </style>
            <div className="test sui-Cdiv sui-T1e4yi0o sui-V1n9g2e5">
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
              data-href="sui-3ebgws-0 sui-0-0"
            >
              {[
                ".sui-T3ebgws.sui-V0{& > .sui-Cbutton.sui-T0 { color: red; }}",
                ".sui-T0.sui-V0{}",
              ].join("")}
            </style>
            <div className="sui-Cdiv sui-T3ebgws sui-V0">
              <button className="sui-Cbutton sui-T0 sui-V0">
                CONTENT
              </button>
            </div>
          </>,
        ),
      );
    });

    test("ネストできる", () => {
      const StyledDiv = styled.div``;
      const StyledSpan = styled.span``;
      const markup = renderToString(
        <StyledDiv asChild>
          <StyledSpan asChild>
            <p>CONTENT</p>
          </StyledSpan>
        </StyledDiv>,
      );

      assert.equal(
        markup,
        renderToString(
          <>
            <style data-precedence="sui-styled" data-href="sui-0-0">
              {".sui-T0.sui-V0{}"}
            </style>
            <p className="sui-Cdiv sui-T0 sui-V0 sui-Cspan sui-T0 sui-V0">
              CONTENT
            </p>
          </>,
        ),
      );
    });
  });
}
