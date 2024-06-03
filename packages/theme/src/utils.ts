import {
  BORDER_SIZINGS,
  BUTTON_TEXT_SIZINGS,
  CAPTION_SIZINGS,
  COLOR_SCALES,
  COLOR_VARIANTS,
  COLORS,
  FONR_SIZINGS,
  FONR_WEIGHTS,
  FONT_FAMILIES,
  HEADING_LEVELS,
  LABEL_SIZINGS,
  LEADINGS,
  RADIUS_SIZINGS,
  SHADOW_LEVELS,
  SIZINGS,
  SPACINGS,
  TEXT_SIZINGS,
  TRACKINGS,
} from "./constants";
import type { CssCustomProperties } from "./css";
import type {
  BorderSizing,
  ButtonSizing,
  CaptionSizing,
  Color,
  ColorScale,
  ColorVariant,
  FontFamily,
  FontSizing,
  FontWeight,
  HeadingLevel,
  LabelSizing,
  Leading,
  RadiusSizing,
  ShadowLevel,
  Sizing,
  Spacing,
  TextSizing,
  Tracking,
} from "./types";

const colorSet = /* @__PURE__ */ new Set<any>(COLORS);

const colorScaleSet = /* @__PURE__ */ new Set<any>(COLOR_SCALES);

const colorVariantSet = /* @__PURE__ */ new Set<any>(COLOR_VARIANTS);

const shadowLevelSet = /* @__PURE__ */ new Set<any>(SHADOW_LEVELS);

const spacingSet = /* @__PURE__ */ new Set<any>(SPACINGS);

const radiusSizingSet = /* @__PURE__ */ new Set<any>(RADIUS_SIZINGS);

const borderSizingSet = /* @__PURE__ */ new Set<any>(BORDER_SIZINGS);

const fontFamilySet = /* @__PURE__ */ new Set<any>(FONT_FAMILIES);

const fontWeightSet = /* @__PURE__ */ new Set<any>(FONR_WEIGHTS);

const fontSizingSet = /* @__PURE__ */ new Set<any>(FONR_SIZINGS);

const sizingSet = /* @__PURE__ */ new Set<any>(SIZINGS);

const leadingSet = /* @__PURE__ */ new Set<any>(LEADINGS);

const trackingSet = /* @__PURE__ */ new Set<any>(TRACKINGS);

const headingLevelSet = /* @__PURE__ */ new Set<any>(HEADING_LEVELS);

const textSizingSet = /* @__PURE__ */ new Set<any>(TEXT_SIZINGS);

const labelSizingSet = /* @__PURE__ */ new Set<any>(LABEL_SIZINGS);

const captionSizingSet = /* @__PURE__ */ new Set<any>(CAPTION_SIZINGS);

const buttonTextSizingSet = /* @__PURE__ */ new Set<any>(BUTTON_TEXT_SIZINGS);

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

export function isRadiusSizing(value: unknown): value is RadiusSizing {
  return radiusSizingSet.has(value);
}

export function isBorderSizing(value: unknown): value is BorderSizing {
  return borderSizingSet.has(value);
}

export function isFontFamily(value: unknown): value is FontFamily {
  return fontFamilySet.has(value);
}

export function isFontWeight(value: unknown): value is FontWeight {
  return fontWeightSet.has(value);
}

export function isFontSizing(value: unknown): value is FontSizing {
  return fontSizingSet.has(value);
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

export function isTextSizing(value: unknown): value is TextSizing {
  return textSizingSet.has(value);
}

export function isLabelSizing(value: unknown): value is LabelSizing {
  return labelSizingSet.has(value);
}

export function isCaptionSizing(value: unknown): value is CaptionSizing {
  return captionSizingSet.has(value);
}

export function isButtonTextSizing(value: unknown): value is ButtonSizing {
  return buttonTextSizingSet.has(value);
}

const ownKeys = ["toString", "valueOf", "$name", "$keys"];
const proxy = () => {};

for (const key of ownKeys) {
  // @ts-expect-error
  proxy[key] = null;
}

function createRecursiveProxy(
  get: (method: (typeof ownKeys)[number], path: string[]) => any,
  stack: string[] = [],
): any {
  return new Proxy(proxy, {
    get(target, prop, receiver) {
      switch (prop) {
        case "toString":
        case "valueOf":
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
        if (method !== "toString" && method !== "valueOf") {
          console.error(
            "SUI: .toString() と .valueOf() 以外を呼び出すことはできません:",
            stack,
          );

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
      case "valueOf":
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

    test("Object.hasOwn でプロパティの有無を確認できる", () => {
      assert(Object.hasOwn($.color.blue[100], "toString"));
      assert(Object.hasOwn($.color.blue[100], "$name"));
      assert(Object.hasOwn($.color.blue[100], "$keys"));
    });
  });
}
