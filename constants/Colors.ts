export const palette = {
  ink: "#0D0D0D",
  charcoal: "#2E2E2E",
  paper: "#F7F4F3",
  mist: "#EFEAE8",
  stone: "#A6A6A6",
  rose: "#D99197",
  roseMuted: "#C9969B",
  roseStrong: "#B76A75",
  blush: "#F7E9EB",
  blushStrong: "#EED3D6",
  white: "#FFFFFF",
  line: "#DED7D4",
  lineStrong: "#D7C1C4",
  textSubtle: "#6E6764",
} as const;

const tintColorLight = palette.rose;
const tintColorDark = palette.white;

const Colors = {
  light: {
    text: palette.ink,
    background: palette.paper,
    tint: tintColorLight,
    tabIconDefault: palette.stone,
    tabIconSelected: tintColorLight,
    card: palette.white,
    mutedBackground: palette.mist,
    border: palette.line,
    primary: palette.rose,
    primaryMuted: palette.roseMuted,
    primaryStrong: palette.roseStrong,
    primarySurface: palette.blush,
    primarySurfaceStrong: palette.blushStrong,
    secondary: palette.charcoal,
    subtleText: palette.textSubtle,
  },
  dark: {
    text: palette.white,
    background: palette.ink,
    tint: tintColorDark,
    tabIconDefault: palette.stone,
    tabIconSelected: tintColorDark,
    card: palette.charcoal,
    mutedBackground: "#1C1C1C",
    border: "#3A3A3A",
    primary: palette.rose,
    primaryMuted: palette.roseMuted,
    primaryStrong: palette.roseStrong,
    primarySurface: "#3B2E31",
    primarySurfaceStrong: "#4A363B",
    secondary: palette.stone,
    subtleText: "#C8C1BE",
  },
};

export default Colors;
