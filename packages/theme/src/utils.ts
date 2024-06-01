import {
  BORDER_SIZES,
  BUTTON_SIZES,
  CAPTION_SIZES,
  COLOR_SCALES,
  COLOR_VARIANTS,
  COLORS,
  FONR_SIZES,
  FONR_WEIGHTS,
  FONT_FAMILIES,
  HEADING_LEVELS,
  LABEL_SIZES,
  LEADINGS,
  RADIUS_SIZES,
  SHADOW_LEVELS,
  SIZINGS,
  SPACINGS,
  TEXT_SIZES,
  TRACKINGS,
} from "./constants";
import type { CssCustomProperties } from "./css";
import type {
  BorderSize,
  ButtonSize,
  CaptionSize,
  Color,
  ColorScale,
  ColorVariant,
  FontFamily,
  FontSize,
  FontWeight,
  HeadingLevel,
  LabelSize,
  Leading,
  Radius,
  ShadowLevel,
  Sizing,
  Spacing,
  TextSize,
  Tracking,
} from "./types";

const colorSet = /* @__PURE__ */ new Set<any>(COLORS);

const colorScaleSet = /* @__PURE__ */ new Set<any>(COLOR_SCALES);

const colorVariantSet = /* @__PURE__ */ new Set<any>(COLOR_VARIANTS);

const shadowLevelSet = /* @__PURE__ */ new Set<any>(SHADOW_LEVELS);

const spacingSet = /* @__PURE__ */ new Set<any>(SPACINGS);

const radiusSet = /* @__PURE__ */ new Set<any>(RADIUS_SIZES);

const borderSizeSet = /* @__PURE__ */ new Set<any>(BORDER_SIZES);

const fontFamilySet = /* @__PURE__ */ new Set<any>(FONT_FAMILIES);

const fontWeightSet = /* @__PURE__ */ new Set<any>(FONR_WEIGHTS);

const fontSizeSet = /* @__PURE__ */ new Set<any>(FONR_SIZES);

const sizingSet = /* @__PURE__ */ new Set<any>(SIZINGS);

const leadingSet = /* @__PURE__ */ new Set<any>(LEADINGS);

const trackingSet = /* @__PURE__ */ new Set<any>(TRACKINGS);

const headingLevelSet = /* @__PURE__ */ new Set<any>(HEADING_LEVELS);

const textSizeSet = /* @__PURE__ */ new Set<any>(TEXT_SIZES);

const labelSizeSet = /* @__PURE__ */ new Set<any>(LABEL_SIZES);

const captionSizeSet = /* @__PURE__ */ new Set<any>(CAPTION_SIZES);

const buttonSizeSet = /* @__PURE__ */ new Set<any>(BUTTON_SIZES);

export function isColor(value: unknown): value is Color {
  return colorSet.has(value);
}

export function isColorScale(value: unknown): value is ColorScale {
  return colorScaleSet.has(value);
}

export function isColorVariant(value: unknown): value is ColorVariant {
  return colorVariantSet.has(value);
}

export function isShadowLevel(value: unknown): value is ShadowLevel {
  return shadowLevelSet.has(value);
}

export function isSpacing(value: unknown): value is Spacing {
  return spacingSet.has(value);
}

export function isRadius(value: unknown): value is Radius {
  return radiusSet.has(value);
}

export function isBorderSize(value: unknown): value is BorderSize {
  return borderSizeSet.has(value);
}

export function isFontFamily(value: unknown): value is FontFamily {
  return fontFamilySet.has(value);
}

export function isFontWeight(value: unknown): value is FontWeight {
  return fontWeightSet.has(value);
}

export function isFontSize(value: unknown): value is FontSize {
  return fontSizeSet.has(value);
}

export function isSizing(value: unknown): value is Sizing {
  return sizingSet.has(value);
}

export function isLeading(value: unknown): value is Leading {
  return leadingSet.has(value);
}

export function isTracking(value: unknown): value is Tracking {
  return trackingSet.has(value);
}

export function isHeadingLevel(value: unknown): value is HeadingLevel {
  return headingLevelSet.has(value);
}

export function isTextSize(value: unknown): value is TextSize {
  return textSizeSet.has(value);
}

export function isLabelSize(value: unknown): value is LabelSize {
  return labelSizeSet.has(value);
}

export function isCaptionSize(value: unknown): value is CaptionSize {
  return captionSizeSet.has(value);
}

export function isButtonSize(value: unknown): value is ButtonSize {
  return buttonSizeSet.has(value);
}

function createRecursiveProxy(
  get: (method: "toString" | "name" | "keys", path: string[]) => any,
  stack: string[] = [],
): any {
  return new Proxy(() => {}, {
    get(target, prop, receiver) {
      switch (prop) {
        case "toString":
          return createRecursiveProxy(get, [...stack, prop]);

        case "$name":
          return get("name", stack);

        case "$keys":
          return get("keys", stack);

        default:
          return typeof prop === "string"
            ? createRecursiveProxy(get, [...stack, prop])
            : Reflect.get(target, prop, receiver);
      }
    },
    apply() {
      const method = stack.pop();

      if (__DEV__) {
        if (method !== "toString") {
          console.error("SUI: .toString() 以外を呼び出すことはできません。");

          return "";
        }
      }

      return get(method as "toString", stack);
    },
  });
}

export const $ = /* @__PURE__ */ createRecursiveProxy(
  function toReturnValue(method, path): any {
    switch (method) {
      case "toString":
        return `var(${toReturnValue("name", path)})`;

      case "name":
        return `--sui-${path.join("-")}`;

      case "keys":
        return path;
    }
  },
) as CssCustomProperties;

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest;

  describe("@suru-ui/theme/src/utils", () => {
    test("CSS カスタムプロパティを取得できる", () => {
      assert.equal(`${$.color.blue[50]}`, "var(--sui-color-blue-50)");
      assert.deepEqual($.color.blue[50].$keys, ["color", "blue", "50"]);
    });
  });
}
