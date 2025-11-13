import { converter, differenceCiede2000, formatHex, parse } from "culori";

export type Oklch = {
  l: number;
  c: number;
  h: number;
};

const toOklch = converter("oklch");
const toRgb = converter("rgb");

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const normalizeHue = (value: number | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  let hue = value % 360;
  if (hue < 0) hue += 360;
  return hue;
};

export const hexToOklch = (hex: string): Oklch | null => {
  try {
    const parsed = parse(hex);
    if (!parsed) return null;
    const color = toOklch(parsed);
    if (!color) return null;
    return {
      l: clamp01(color.l ?? 0),
      c: Math.max(0, color.c ?? 0),
      h: normalizeHue(color.h),
    };
  } catch {
    return null;
  }
};

export const oklchToHex = (oklch: Partial<Oklch>): string => {
  const rgb = toRgb({
    mode: "oklch",
    l: clamp01(oklch.l ?? 0),
    c: Math.max(0, oklch.c ?? 0),
    h: normalizeHue(oklch.h ?? 0),
  });
  return formatHex(rgb ?? { mode: "rgb", r: 0, g: 0, b: 0 });
};

export const deltaE = (a: Oklch, b: Oklch) =>
  differenceCiede2000(
    {
      mode: "oklch",
      l: a.l,
      c: a.c,
      h: a.h,
    },
    {
      mode: "oklch",
      l: b.l,
      c: b.c,
      h: b.h,
    }
  );

export const adjustOklch = (
  input: Oklch,
  adjustments: { l?: number; c?: number; h?: number }
): Oklch => ({
  l: clamp01(input.l + (adjustments.l ?? 0)),
  c: Math.max(0, input.c + (adjustments.c ?? 0)),
  h: normalizeHue(input.h + (adjustments.h ?? 0)),
});

export const rgbToHex = (r: number, g: number, b: number) =>
  formatHex({
    mode: "rgb",
    r: clamp01(r / 255),
    g: clamp01(g / 255),
    b: clamp01(b / 255),
  });

export const isSkinTone = (oklch: Oklch) => {
  const { l, h } = oklch;
  return l >= 0.2 && l <= 0.8 && h >= 25 && h <= 70;
};

export const toVector = (oklch: Oklch): [number, number, number] => {
  const angle = (oklch.h * Math.PI) / 180;
  const u = oklch.c * Math.cos(angle);
  const v = oklch.c * Math.sin(angle);
  return [oklch.l, u, v];
};

export const fromVector = (vector: [number, number, number]): Oklch => {
  const [l, u, v] = vector;
  const c = Math.sqrt(u * u + v * v);
  const h = (Math.atan2(v, u) * 180) / Math.PI;
  return {
    l: clamp01(l),
    c: Math.max(0, c),
    h: normalizeHue(h),
  };
};
