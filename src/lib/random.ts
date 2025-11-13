import { deltaE, oklchToHex, type Oklch } from "@/lib/color-engine/oklch";

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

export type Bias = {
  warmth?: number;
  contrast?: number;
  muted?: boolean;
};

const generateCandidate = (bias: Bias, index: number, total: number): Oklch => {
  let h = randomBetween(0, 360);
  if (bias.warmth && bias.warmth !== 0) {
    h += bias.warmth * 15;
  }
  const contrastBias = bias.contrast ?? 0;
  let l = 0.25 + Math.random() * 0.5;
  if (contrastBias) {
    const t = index / Math.max(1, total - 1);
    l = 0.15 + t * 0.7;
    l += contrastBias * (t - 0.5) * 0.2;
  }
  let c = 0.08 + Math.random() * 0.22;
  if (bias.muted) {
    c *= 0.7;
  }
  return { l, c, h };
};

export const createRandomHex = (
  existing: string[],
  bias: Bias,
  index: number,
  total: number
): { hex: string; oklch: Oklch } => {
  const existingOklch = existing
    .map((hex) => {
      const [l, c, h] = hexToOklchSafe(hex);
      return { l, c, h } as Oklch;
    })
    .filter(Boolean) as Oklch[];
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const candidate = generateCandidate(bias, index, total);
    const candidateHex = oklchToHex(candidate);
    const isDistinct = existingOklch.every((color) => deltaE(color, candidate) > 4.5);
    if (isDistinct) {
      return { hex: candidateHex, oklch: candidate };
    }
  }
  return { hex: oklchToHex(generateCandidate(bias, index, total)), oklch: generateCandidate(bias, index, total) };
};

const hexToOklchSafe = (hex: string): [number, number, number] => {
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
  const c = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return [l, c, h];
};
