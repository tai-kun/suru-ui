import type {
  BORDER_SIZINGS,
  BUTTON_TEXT_SIZINGS,
  CAPTION_SIZINGS,
  COLOR_SCALES,
  COLOR_VARIANTS,
  COLORS,
  FONT_FAMILIES,
  FONT_SIZINGS,
  FONT_WEIGHTS,
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

export type Color = (typeof COLORS)[number];

export type ColorScale = (typeof COLOR_SCALES)[number];

export type ColorVariant = (typeof COLOR_VARIANTS)[number];

export type ShadowLevel = (typeof SHADOW_LEVELS)[number];

export type Spacing = (typeof SPACINGS)[number];

export type RadiusSizing = (typeof RADIUS_SIZINGS)[number];

export type BorderSizing = (typeof BORDER_SIZINGS)[number];

export type FontFamily = (typeof FONT_FAMILIES)[number];

export type FontWeight = (typeof FONT_WEIGHTS)[number];

export type FontSizing = (typeof FONT_SIZINGS)[number];

export type Sizing = (typeof SIZINGS)[number];

export type Leading = (typeof LEADINGS)[number];

export type Tracking = (typeof TRACKINGS)[number];

export type HeadingLevel = (typeof HEADING_LEVELS)[number];

export type TextSizing = (typeof TEXT_SIZINGS)[number];

export type LabelSizing = (typeof LABEL_SIZINGS)[number];

export type CaptionSizing = (typeof CAPTION_SIZINGS)[number];

export type ButtonSizing = (typeof BUTTON_TEXT_SIZINGS)[number];

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/theme/src/types", () => {
    test.todo("テスト");
  });
}
