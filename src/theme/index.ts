import { variables } from "./_constants"
import type { Dict, Flat } from "./_types"

type Primitive = { readonly toString: () => `--${any}` }

type SizeLike = `${number}xs` | "xs" | "sm" | "md" | "lg" | "xl" | `${number}xl`

type ConditionalKeys<T, U> = NonNullable<
  { [P in keyof T]: T[P] extends U ? P : never }[keyof T]
>

/**
 * 単色。
 */
export type Monochrome = ConditionalKeys<Dict["color"], Primitive>

/**
 * `ColorShade` と `ColorAlias`、 `ColorVariant` を持つ色名。
 *
 * @see {@link ColorShade}
 * @see {@link ColorAlias}
 * @see {@link ColorVariant}
 */
export type ColorName = ConditionalKeys<Dict["color"], { 50: any }>

/**
 * 色の濃さ。
 *
 * @see {@link ColorName}
 * @see {@link ColorAlias}
 */
export type ColorShade = Extract<keyof Dict["color"]["primary"], `${number}`>

/**
 * 色の濃さのエイリアス。
 *
 * @see {@link ColorName}
 * @see {@link ColorShade}
 */
export type ColorAlias = Exclude<
  ConditionalKeys<Dict["color"]["primary"], Primitive>,
  ColorShade
>

/**
 * 主にボタンなどの状態を表す色のバリエーション。
 *
 * @see {@link ColorName}
 */
export type ColorVariant = ConditionalKeys<
  Dict["color"]["primary"],
  { hover: any }
>

/**
 * テキストの大きさ。
 */
export type TextSize = Extract<keyof Dict["text"], SizeLike>

/**
 * 枠線の太さ。
 */
export type BorderSize = Extract<keyof Dict["border"], SizeLike>

/**
 * フォント。
 */
export type FontFamily = Extract<keyof Dict["font"], "mono" | "serif" | "sans">

/**
 * フォントの太さ。
 */
export type FontWeight = Exclude<keyof Dict["font"], FontFamily>

/**
 * 特定のコンポーネント群の高さ。
 */
export type ShapeSize = keyof Dict["size"]

/**
 * ラベルの大きさ。
 */
export type LabelSize = Extract<keyof Dict["label"], SizeLike>

/**
 * 見出しのタグ。
 */
export type HeadingTag = Extract<keyof Dict, `h${number}`>

/**
 * 補助的なテキストの大きさ。
 */
export type SupplSize = Extract<keyof Dict["suppl"], SizeLike>

/**
 * 行間の広さ。
 */
export type LeadingSize = Extract<keyof Dict["leading"], SizeLike>

/**
 * 文字間の広さ。
 */
export type TrackingSize = Extract<keyof Dict["tracking"], SizeLike>

/**
 * 角丸の大きさ。
 */
export type RadSize = Extract<keyof Dict["rad"], SizeLike>

/**
 * 影の程度。
 */
export type ShadowSize = Extract<keyof Dict["shadow"], SizeLike>

/**
 * スペースの広さ。
 */
export type SpaceSize = Extract<keyof Dict["space"], SizeLike>

/**
 * CSS 変数。
 */
export type Variables = Flat

export const MONOCHROME_LIST = [
  "none",
  "black",
  "white",
  "canvas",
  "canvasText",
] as const satisfies Monochrome[]

export const COLOR_NAME_LIST = [
  "grey",
  "blue",
  "lightBlue",
  "cyan",
  "green",
  "lime",
  "yellow",
  "orange",
  "red",
  "magenta",
  "purple",
  // alias
  "neutral",
  "info",
  "success",
  "warn",
  "error",
  "primary",
  "secondary",
] as const satisfies ColorName[]

export const COLOR_SHADE_LIST = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "1000",
  "1100",
  "1200",
] as const satisfies ColorShade[]

export const COLOR_ALIAS_LIST = [
  "main",
  "subtle",
] as const satisfies ColorAlias[]

export const COLOR_VARIANT_LIST = [
  "naked",
  "solid",
  "liquid",
] as const satisfies ColorVariant[]

export const TEXT_SIZE_LIST = ["sm", "md"] as const satisfies TextSize[]

export const BORDER_SIZE_LIST = [
  "sm",
  "md",
  "lg",
] as const satisfies BorderSize[]

export const FONT_FAMILY_LIST = [
  "mono",
  "serif",
  "sans",
] as const satisfies FontFamily[]

export const FONT_WEIGHT_LIST = [
  "normal",
  "medium",
  "bold",
] as const satisfies FontWeight[]

export const SHAPE_SIZE_LIST = [
  "sm",
  "md",
  "lg",
  "xl",
] as const satisfies ShapeSize[]

export const LABEL_SIZE_LIST = ["sm", "md"] as const satisfies LabelSize[]

export const HEADING_TAG_LIST = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
] as const satisfies HeadingTag[]

export const SUPPL_SIZE_LIST = ["sm", "md"] as const satisfies SupplSize[]

export const LEADING_SIZE_LIST = [
  "sm",
  "md",
  "lg",
] as const satisfies LeadingSize[]

export const TRACKING_SIZE_LIST = ["sm", "md"] as const satisfies TrackingSize[]

export const RAD_SIZE_LIST = [
  "sm",
  "md",
  "lg",
  "xl",
] as const satisfies RadSize[]

export const SHADOW_SIZE_LIST = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
] as const satisfies ShadowSize[]

export const SPACE_SIZE_LIST = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
] as const satisfies SpaceSize[]

export const monochromeSet = new Set(MONOCHROME_LIST)

export const colorNameSet = new Set(COLOR_NAME_LIST)

export const colorShadeSet = new Set(COLOR_SHADE_LIST)

export const colorAliasSet = new Set(COLOR_ALIAS_LIST)

export const colorVariantSet = new Set(COLOR_VARIANT_LIST)

export const textSizeSet = new Set(TEXT_SIZE_LIST)

export const borderSizeSet = new Set(BORDER_SIZE_LIST)

export const fontFamilySet = new Set(FONT_FAMILY_LIST)

export const fontWeightSet = new Set(FONT_WEIGHT_LIST)

export const shapeSizeSet = new Set(SHAPE_SIZE_LIST)

export const labelSizeSet = new Set(LABEL_SIZE_LIST)

export const headingTagSet = new Set(HEADING_TAG_LIST)

export const supplSizeSet = new Set(SUPPL_SIZE_LIST)

export const leadingSizeSet = new Set(LEADING_SIZE_LIST)

export const trackingSizeSet = new Set(TRACKING_SIZE_LIST)

export const radSizeSet = new Set(RAD_SIZE_LIST)

export const shadowSizeSet = new Set(SHADOW_SIZE_LIST)

export const spaceSizeSet = new Set(SPACE_SIZE_LIST)

export function isMonochrome(monochrome: unknown): monochrome is Monochrome {
  return monochromeSet.has(monochrome)
}

export function isColorName(colorName: unknown): colorName is ColorName {
  return colorNameSet.has(colorName)
}

export function isColorShade(colorShade: unknown): colorShade is ColorShade {
  return colorShadeSet.has(colorShade)
}

export function isColorAlias(colorAlias: unknown): colorAlias is ColorAlias {
  return colorAliasSet.has(colorAlias)
}

export function isColorVariant(
  colorVariant: unknown,
): colorVariant is ColorVariant {
  return colorVariantSet.has(colorVariant)
}

export function isTextSize(textSize: unknown): textSize is TextSize {
  return textSizeSet.has(textSize)
}

export function isBorderSize(borderSize: unknown): borderSize is BorderSize {
  return borderSizeSet.has(borderSize)
}

export function isFontFamily(fontFamily: unknown): fontFamily is FontFamily {
  return fontFamilySet.has(fontFamily)
}

export function isFontWeight(fontWeight: unknown): fontWeight is FontWeight {
  return fontWeightSet.has(fontWeight)
}

export function isShapeSize(shapeSize: unknown): shapeSize is ShapeSize {
  return shapeSizeSet.has(shapeSize)
}

export function isLabelSize(labelSize: unknown): labelSize is LabelSize {
  return labelSizeSet.has(labelSize)
}

export function isHeadingTag(headingTag: unknown): headingTag is HeadingTag {
  return headingTagSet.has(headingTag)
}

export function isSupplSize(supplSize: unknown): supplSize is SupplSize {
  return supplSizeSet.has(supplSize)
}

export function isLeadingSize(
  leadingSize: unknown,
): leadingSize is LeadingSize {
  return leadingSizeSet.has(leadingSize)
}

export function isTrackingSize(
  trackingSize: unknown,
): trackingSize is TrackingSize {
  return trackingSizeSet.has(trackingSize)
}

export function isRadSize(radSize: unknown): radSize is RadSize {
  return radSizeSet.has(radSize)
}

export function isShadowSize(shadowSize: unknown): shadowSize is ShadowSize {
  return shadowSizeSet.has(shadowSize)
}

export function isSpaceSize(spaceSize: unknown): spaceSize is SpaceSize {
  return spaceSizeSet.has(spaceSize)
}

export function parseColor(color: unknown): null | Monochrome | {
  name: ColorName
  shade?: ColorShade | ColorAlias
} {
  if (isColorName(color)) {
    return {
      name: color,
    }
  }

  if (isMonochrome(color)) {
    return color
  }

  if (typeof color === "string") {
    const list = color.split(".")
    const [name, shade] = list

    if (
      list.length === 2
      && isColorName(name)
      && (isColorShade(shade) || isColorAlias(shade))
    ) {
      return {
        name,
        shade,
      }
    }
  }

  return null
}

export const $ = createRecursiveProxy(p => `--sui-${p.join("-")}`) as Dict

function createRecursiveProxy(
  get: (path: string[]) => string,
  _path: string[] = [],
): any {
  return new Proxy(() => {}, {
    get(target, prop, receiver) {
      if (typeof prop !== "string") {
        return Reflect.get(target, prop, receiver)
      }

      if (__DEV__) {
        if (_path.at(-1) === "toString") {
          console.error(
            "SUI: .toString 以下のプロパティにアクセスすることはできません。",
          )
        }
      }

      return createRecursiveProxy(get, [..._path, prop])
    },
    apply() {
      const path = _path.slice(0, -1)

      if (__DEV__) {
        if (_path.at(-1) !== "toString") {
          console.error("SUI: .toString() 以外を呼び出すことはできません。")
        }

        const cssVar = "--sui-" + path.join("-")

        if (!variables.has(cssVar)) {
          console.error(`SUI: ${cssVar} は存在しない CSS 変数です。`)
        }
      }

      return get(path)
    },
  })
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { expectType } = await import("tsd")
  const { assert, describe, mock, test } = cfgTest

  describe("src/theme/index", () => {
    test("CSS 変数を取得できる", () => {
      assert.equal(`${$.color.black}`, "--sui-color-black")
    })

    test("CSS 未知の変数にアクセスするとエラーが表示される", () => {
      const error = mock.method(console, "error", () => {})

      // @ts-expect-error
      $.color.unknown.toString()

      assert.equal(error.mock.calls.length, 1)
      assert.equal(
        error.mock.calls[0]?.arguments[0],
        "SUI: --sui-color-unknown は存在しない CSS 変数です。",
      )

      error.mock.restore()
    })

    test(".toString 以外を呼び出すとエラーが表示される", () => {
      const error = mock.method(console, "error", () => {})

      // @ts-expect-error
      $.color()

      assert.equal(error.mock.calls.length, 2)
      assert.equal(
        error.mock.calls[0]?.arguments[0],
        "SUI: .toString() 以外を呼び出すことはできません。",
      )

      error.mock.restore()
    })

    test(".toString 以下のプロパティにアクセスするとエラーが表示される", () => {
      const error = mock.method(console, "error", () => {})

      // @ts-expect-error
      $.color.toString.apply()

      assert.equal(error.mock.calls.length, 3)
      assert.equal(
        error.mock.calls[0]?.arguments[0],
        "SUI: .toString 以下のプロパティにアクセスすることはできません。",
      )

      error.mock.restore()
    })

    test("tsd", () => {
      const getItemType = <T>(_: readonly T[]) => ({} as T)

      expectType<Monochrome>(getItemType(MONOCHROME_LIST))
      expectType<ColorName>(getItemType(COLOR_NAME_LIST))
      expectType<ColorShade>(getItemType(COLOR_SHADE_LIST))
      expectType<ColorAlias>(getItemType(COLOR_ALIAS_LIST))
      expectType<ColorVariant>(getItemType(COLOR_VARIANT_LIST))
      expectType<TextSize>(getItemType(TEXT_SIZE_LIST))
      expectType<BorderSize>(getItemType(BORDER_SIZE_LIST))
      expectType<FontFamily>(getItemType(FONT_FAMILY_LIST))
      expectType<FontWeight>(getItemType(FONT_WEIGHT_LIST))
      expectType<ShapeSize>(getItemType(SHAPE_SIZE_LIST))
      expectType<LabelSize>(getItemType(LABEL_SIZE_LIST))
      expectType<HeadingTag>(getItemType(HEADING_TAG_LIST))
      expectType<SupplSize>(getItemType(SUPPL_SIZE_LIST))
      expectType<LeadingSize>(getItemType(LEADING_SIZE_LIST))
      expectType<TrackingSize>(getItemType(TRACKING_SIZE_LIST))
      expectType<RadSize>(getItemType(RAD_SIZE_LIST))
      expectType<ShadowSize>(getItemType(SHADOW_SIZE_LIST))
      expectType<SpaceSize>(getItemType(SPACE_SIZE_LIST))
    })
  })
}
