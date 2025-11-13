export type RGB = {
  r: number;
  g: number;
  b: number;
};

const clamp = (value: number, min = 0, max = 255) =>
  Math.min(Math.max(value, min), max);

export const hexToRgb = (hex?: string): RGB => {
  const fallback = "000000";
  const safeHex = typeof hex === "string" && /^[0-9a-fA-F]+$/.test(hex.replace("#", ""))
    ? hex
    : fallback;
  const normalized = safeHex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;

  const numeric = Number.parseInt(value || fallback, 16);

  return {
    r: clamp((numeric >> 16) & 255),
    g: clamp((numeric >> 8) & 255),
    b: clamp(numeric & 255),
  };
};

const luminanceChannel = (channel: number) => {
  const proportion = channel / 255;
  return proportion <= 0.03928
    ? proportion / 12.92
    : Math.pow((proportion + 0.055) / 1.055, 2.4);
};

export const relativeLuminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * luminanceChannel(r) +
    0.7152 * luminanceChannel(g) +
    0.0722 * luminanceChannel(b)
  );
};

export const contrastRatio = (foregroundHex: string, backgroundHex: string) => {
  const l1 = relativeLuminance(foregroundHex);
  const l2 = relativeLuminance(backgroundHex);

  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];

  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
};

export type AccessibilityGrade = "AAA" | "AA" | "Fail";

export const getAccessibilityGrade = (ratio: number): AccessibilityGrade => {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "Fail";
};

export const getReadableTextColor = (hex: string) => {
  const lum = relativeLuminance(hex);
  return lum > 0.52 ? "#0f1117" : "#f9fafb";
};
