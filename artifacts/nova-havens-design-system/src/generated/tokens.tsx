/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "background": "#F7F7F5",
      "foreground": "#15171C",
      "border": "#D9DCE1",
      "card": "#FFFFFF",
      "cardForeground": "#15171C",
      "popover": "#FFFFFF",
      "popoverForeground": "#15171C",
      "primary": "#D4A24C",
      "primaryForeground": "#0B0D14",
      "secondary": "#ECEEF1",
      "secondaryForeground": "#15171C",
      "muted": "#ECEEF1",
      "mutedForeground": "#5D6672",
      "accent": "#E7E9ED",
      "accentForeground": "#15171C",
      "destructive": "#B42318",
      "destructiveForeground": "#FFFFFF",
      "input": "#D9DCE1",
      "ring": "#D4A24C",
      "chart1": "#9C6F27",
      "chart2": "#2D817B",
      "chart3": "#416B86",
      "chart4": "#B85F3E",
      "chart5": "#8061A8",
      "sidebar": "#F0F1F3",
      "sidebarForeground": "#3E4650",
      "sidebarBorder": "#D9DCE1",
      "sidebarPrimary": "#D4A24C",
      "sidebarPrimaryForeground": "#0B0D14",
      "sidebarAccent": "#E7E9ED",
      "sidebarAccentForeground": "#15171C",
      "sidebarRing": "#D4A24C"
    },
    "dark": {
      "background": "#0A0C10",
      "foreground": "#F5F5F2",
      "border": "#1D1F2B",
      "card": "#111318",
      "cardForeground": "#F5F5F2",
      "popover": "#111318",
      "popoverForeground": "#F5F5F2",
      "primary": "#D4A24C",
      "primaryForeground": "#0B0D14",
      "secondary": "#181B25",
      "secondaryForeground": "#F5F5F2",
      "muted": "#181B25",
      "mutedForeground": "#9BA3AF",
      "accent": "#1D1F2B",
      "accentForeground": "#F5F5F2",
      "destructive": "#DC2828",
      "destructiveForeground": "#F5F5F2",
      "input": "#1D1F2B",
      "ring": "#D4A24C",
      "chart1": "#D4A24C",
      "chart2": "#83C5BE",
      "chart3": "#7A9AB8",
      "chart4": "#D27E5B",
      "chart5": "#B9A1D9",
      "sidebar": "#0D0F14",
      "sidebarForeground": "#F5F5F2",
      "sidebarBorder": "#1D1F2B",
      "sidebarPrimary": "#D4A24C",
      "sidebarPrimaryForeground": "#0B0D14",
      "sidebarAccent": "#1D1F2B",
      "sidebarAccentForeground": "#F5F5F2",
      "sidebarRing": "#D4A24C"
    }
  },
  "fontFamily": {
    "sans": [
      "Plus Jakarta Sans",
      "sans-serif"
    ],
    "serif": [
      "Georgia",
      "serif"
    ],
    "mono": [
      "Menlo",
      "monospace"
    ]
  },
  "radius": "1rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
