export {
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
export type {
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
export {
  isBorderSize,
  isButtonSize,
  isCaptionSize,
  isColor,
  isColorScale,
  isColorVariant,
  isFontFamily,
  isFontSize,
  isFontWeight,
  isHeadingLevel,
  isLabelSize,
  isLeading,
  isRadius,
  isShadowLevel,
  isSizing,
  isSpacing,
  isTextSize,
  isTracking,
} from "./utils";

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/theme/src/index", () => {
    test.todo("テスト");
  });
}
