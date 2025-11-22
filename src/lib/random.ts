import { deltaE, hexToOklch, oklchToHex, type Oklch } from "@/lib/color-engine/oklch";

export type RandomBiasMode = "none" | "warmer" | "cooler" | "muted" | "contrast";

type BiasProfile = {
  hueRange?: [number, number];
  chromaScale?: number;
  muted?: boolean;
  highContrast?: boolean;
};

const BIAS_PROFILES: Record<RandomBiasMode, BiasProfile> = {
  none: {},
  warmer: { hueRange: [10, 80] },
  cooler: { hueRange: [190, 260] },
  muted: { chromaScale: 0.8, muted: true },
  contrast: { highContrast: true },
};

const clampHue = (value: number) => {
  let hue = value % 360;
  if (hue < 0) hue += 360;
  return hue;
};

const randomBetween = (min: number, max: number, rng: () => number) => min + rng() * (max - min);

const generateCandidate = (
  bias: RandomBiasMode,
  index: number,
  total: number,
  rng: () => number
): Oklch => {
  const profile = BIAS_PROFILES[bias];
  const hueRange = profile?.hueRange ?? [0, 360];
  const h = clampHue(randomBetween(hueRange[0], hueRange[1], rng));

  let l: number;
  if (profile?.highContrast) {
    const steps = Math.max(1, total - 1);
    const t = index / steps;
    const minL = 0.18;
    const maxL = 0.82;
    l = minL + (maxL - minL) * t;
  } else {
    l = randomBetween(0.32, 0.75, rng);
  }

  const baseChroma = randomBetween(0.08, 0.28, rng);
  const chromaScale = profile?.chromaScale ?? 1;
  const c = baseChroma * chromaScale * (profile?.muted ? 0.65 : 1);

  return { l, c, h };
};

type RandomOptions = {
  randomFn?: () => number;
};

export const createRandomHex = (
  existing: string[],
  bias: RandomBiasMode,
  index: number,
  total: number,
  options?: RandomOptions
): { hex: string; oklch: Oklch } => {
  const rng = options?.randomFn ?? Math.random;
  const existingOklch = existing
    .map((hex) => hexToOklch(hex))
    .filter((color): color is Oklch => Boolean(color));

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const candidate = generateCandidate(bias, index, total, rng);
    const isDistinct = existingOklch.every((color) => deltaE(color, candidate) > 4.5);
    if (isDistinct) {
      return { hex: oklchToHex(candidate), oklch: candidate };
    }
  }

  const fallback = generateCandidate(bias, index, total, rng);
  return { hex: oklchToHex(fallback), oklch: fallback };
};
