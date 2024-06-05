export {
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
export type {
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
export {
  $,
  isBorderSizing,
  isButtonTextSizing,
  isCaptionSizing,
  isColor,
  isColorScale,
  isColorVariant,
  isFontFamily,
  isFontSizing,
  isFontWeight,
  isHeadingLevel,
  isLabelSizing,
  isLeading,
  isRadiusSizing,
  isShadowLevel,
  isSizing,
  isSpacing,
  isTextSizing,
  isTracking,
} from "./utils";

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/theme/src/index", () => {
    test.todo("テスト");
  });
}
