import { Platform } from "react-native";

export const palette = {
  background: "#f6efe3",
  backgroundStrong: "#fff8ef",
  surface: "rgba(255, 250, 242, 0.94)",
  surfaceStrong: "#ffffff",
  cream: "#fff5ea",
  ink: "#20160f",
  inkStrong: "#1f2b25",
  muted: "#6c6258",
  mutedStrong: "#4f453c",
  accent: "#c55b2d",
  accentStrong: "#7f2f17",
  accentSoft: "#f4d8bc",
  moss: "#365847",
  gold: "#c9a24a",
  goldSoft: "#f7e2b7",
  line: "rgba(62, 46, 31, 0.12)",
  shadow: "rgba(66, 47, 29, 0.14)",
  dark: "#1f2b25",
  darkSoft: "#31463d",
  white: "#ffffff"
} as const;

export const gradients = {
  background: ["#fff9f0", "#f4eadb", "#efe5d7"] as const,
  darkHero: ["#294136", "#1a261f"] as const,
  accent: ["#f7a31c", "#ef7d16"] as const,
  surface: ["rgba(255, 252, 247, 0.96)", "rgba(255, 247, 237, 0.88)"] as const
} as const;

export const fonts = {
  body: Platform.select({
    ios: "Avenir Next",
    android: "sans-serif",
    default: "System"
  }) as string,
  heading: Platform.select({
    ios: "Georgia",
    android: "serif",
    default: "Georgia"
  }) as string
} as const;
