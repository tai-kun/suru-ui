import type {
  BORDER_SIZES,
  BUTTON_TEXT_SIZES,
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

export type Color = (typeof COLORS)[number];

export type ColorScale = (typeof COLOR_SCALES)[number];

export type ColorVariant = (typeof COLOR_VARIANTS)[number];

export type ShadowLevel = (typeof SHADOW_LEVELS)[number];

export type Spacing = (typeof SPACINGS)[number];

export type Radius = (typeof RADIUS_SIZES)[number];

export type BorderSize = (typeof BORDER_SIZES)[number];

export type FontFamily = (typeof FONT_FAMILIES)[number];

export type FontWeight = (typeof FONR_WEIGHTS)[number];

export type FontSize = (typeof FONR_SIZES)[number];

export type Sizing = (typeof SIZINGS)[number];

export type Leading = (typeof LEADINGS)[number];

export type Tracking = (typeof TRACKINGS)[number];

export type HeadingLevel = (typeof HEADING_LEVELS)[number];

export type TextSize = (typeof TEXT_SIZES)[number];

export type LabelSize = (typeof LABEL_SIZES)[number];

export type CaptionSize = (typeof CAPTION_SIZES)[number];

export type ButtonSize = (typeof BUTTON_TEXT_SIZES)[number];

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/theme/src/types", () => {
    test.todo("テスト");
  });
}
