export const COLORS = [
  "grey",
  "blue",
  "green",
  "yellow",
  "red",
] as const;

export const COLOR_SCALES = [
  50,
  100,
  200,
  300,
  400,
  500,
  600,
  700,
  800,
  900,
  1000,
  1100,
  1200,
] as const;

export const COLOR_VARIANTS = [
  "naked",
  "solid",
  "liquid",
] as const;

export const SHADOW_LEVELS = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
] as const;

export const SPACINGS = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
] as const;

export const RADIUS_SIZINGS = [
  "xs",
  "sm",
  "md",
  "lg",
  "full",
] as const;

export const BORDER_SIZINGS = [
  "xs",
  "sm",
  "md",
  "lg",
] as const;

export const FONT_FAMILIES = [
  "sans",
  "mono",
  "serif",
] as const;

export const FONT_WEIGHTS = [
  "normal",
  "medium",
  "bold",
] as const;

export const FONT_SIZINGS = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
] as const;

export const SIZINGS = [
  "sm",
  "md",
  "lg",
  "xl",
] as const;

export const LEADINGS = [
  "sm",
  "md",
  "lg",
] as const;

export const TRACKINGS = [
  "sm",
  "md",
] as const;

export const HEADING_LEVELS = [
  1,
  2,
  3,
  4,
  5,
] as const;

export const TEXT_SIZINGS = [
  "sm",
  "md",
] as const;

export const LABEL_SIZINGS = [
  "sm",
  "md",
] as const;

export const CAPTION_SIZINGS = [
  "sm",
  "md",
] as const;

export const BUTTON_TEXT_SIZINGS = [
  "md",
  "lg",
] as const;

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/theme/src/constants", () => {
    test.todo("テスト");
  });
}
