import { contrastRatio } from "@/lib/color-utils";

export type Tokens = {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  neutral: string[]; // length 11 dark -> light
  text: {
    primary: string;
    muted: string;
    inverted: string;
  };
  surface: {
    base: string;
    raised: string;
    sunken: string;
  };
  outline: string;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const hexToHsl = (hex: string) => {
  const sanitized = hex.replace("#", "");
  const value = sanitized.length === 3
    ? sanitized.split("").map((c) => c + c).join("")
    : sanitized;
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h, s, l };
};

const hslToHex = ({ h, s, l }: { h: number; s: number; l: number }) => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (value: number) => Math.round((value + m) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const adjustLightness = (hex: string, delta: number) => {
  const hsl = hexToHsl(hex);
  hsl.l = clamp01(hsl.l + delta);
  return hslToHex(hsl);
};

export const ensureAA = (fg: string, bg: string) => {
  if (contrastRatio(fg, bg) >= 4.5) return { fg, bg };
  for (let step = 1; step <= 10; step += 1) {
    const delta = step * 0.01;
    const darker = adjustLightness(fg, -delta);
    if (contrastRatio(darker, bg) >= 4.5) return { fg: darker, bg };
    const lighter = adjustLightness(fg, delta);
    if (contrastRatio(lighter, bg) >= 4.5) return { fg: lighter, bg };
  }
  return { fg, bg };
};

export const autoTextOn = (
  background: string,
  tokens: Tokens,
  pref: "primary" | "inverted" = "primary"
) => {
  const ordered = pref === "primary"
    ? [tokens.text.primary, tokens.text.inverted]
    : [tokens.text.inverted, tokens.text.primary];
  for (const candidate of ordered) {
    if (contrastRatio(candidate, background) >= 4.5) return candidate;
  }
  return ensureAA(ordered[0], background).fg;
};

export const tone = (background: string, delta: number) => adjustLightness(background, delta);

export const ensureButtonPrimary = (color: string, mode: "light" | "dark") => {
  const bg = mode === "light" ? "#ffffff" : "#111827";
  if (contrastRatio(color, bg) >= 4.5) return color;
  return adjustLightness(color, mode === "light" ? -0.08 : 0.08);
};

export const neutralBackgroundFor = (tokens: Tokens, mode: "light" | "dark") =>
  mode === "light" ? tokens.neutral[10] ?? tokens.surface.base : tokens.neutral[1] ?? tokens.surface.sunken;

export const raisedSurfaceFor = (tokens: Tokens, mode: "light" | "dark") => {
  if (mode === "light") return tokens.surface.raised;
  const darkIndex = Math.min(tokens.neutral.length - 1, 2);
  return tokens.neutral[darkIndex] ?? tokens.surface.raised;
};

export const applyHoverShift = (hex: string, mode: "light" | "dark") =>
  adjustLightness(hex, mode === "light" ? -0.06 : 0.06);
