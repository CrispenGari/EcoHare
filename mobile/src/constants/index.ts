export const COLORS = {
  main: "#FFFDF6",
  primary: "#FAF6E9",
  secondary: "#DDEB9D",
  tertiary: "#A0C878",
  black: "#000000",
  white: "#ffffff",
  red: "#FF0000",
  gray: "#57595B",
  transparent: "transparent",
};

export const Fonts = {
  "JosefinSans-Bold": require("@/assets/fonts/JosefinSans-Bold.ttf"),
  "JosefinSans-Regular": require("@/assets/fonts/JosefinSans-Regular.ttf"),
  "JosefinSans-Italic": require("@/assets/fonts/JosefinSans-Italic.ttf"),
  "JosefinSans-BoldItalic": require("@/assets/fonts/JosefinSans-BoldItalic.ttf"),
};
export const FONTS = {
  regular: "JosefinSans-Regular",
  bold: "JosefinSans-Bold",
  italic: "JosefinSans-Italic",
  boldItalic: "JosefinSans-BoldItalic",
};

export const IMAGES = {
  logo: require("@/assets/images/icon.png"),
};

export const STORAGE_NAME = {
  SETTINGS: "ecohare:settings",
  JWT: "ecohare:jwt",
};

export const relativeTimeObject = {
  future: "in %s",
  past: "%s",
  s: "now",
  m: "1m",
  mm: "%dm",
  h: "1h",
  hh: "%dh",
  d: "1d",
  dd: "%dd",
  M: "1M",
  MM: "%dM",
  y: "1y",
  yy: "%dy",
};

export const CLASS_COLORS: Record<string, string> = {
  Low: COLORS.tertiary,
  Medium: "#F2A900",
  High: COLORS.red,
};
export const APP_NAME = "EcoHare";
