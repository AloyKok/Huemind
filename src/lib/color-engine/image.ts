import sharp from "sharp";

import type { ExtractorOptions } from "@/lib/types";
import { hexToOklch, isSkinTone, rgbToHex, type Oklch } from "./oklch";

const MAX_ANALYSIS_SIZE = 600;
const TARGET_SAMPLE_COUNT = 5000;

export type SampledPixel = {
  oklch: Oklch;
  weight: number;
};

const defaultOptions: ExtractorOptions = {
  colorCount: 5,
  ignoreExtremes: true,
  skinToneGuard: true,
  requireAA: true,
};

export const downscaleImage = async (buffer: Buffer) =>
  sharp(buffer, { limitInputPixels: 268402689 })
    .resize(MAX_ANALYSIS_SIZE, MAX_ANALYSIS_SIZE, {
      fit: "inside",
      withoutEnlargement: true,
      fastShrinkOnLoad: true,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

export const samplePixels = async (
  buffer: Buffer,
  options: Partial<ExtractorOptions>
): Promise<SampledPixel[]> => {
  const merged = { ...defaultOptions, ...options };
  const { data, info } = await downscaleImage(buffer);
  const { width, height, channels } = info;

  const samples: SampledPixel[] = [];
  const totalPixels = width * height;
  const stride = Math.max(1, Math.floor(totalPixels / TARGET_SAMPLE_COUNT));
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let index = 0, pixelIndex = 0; index < data.length; index += channels, pixelIndex += 1) {
    if (pixelIndex % stride !== 0) continue;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const alpha = channels === 4 ? data[index + 3] : 255;
    if (alpha < 32) continue;

    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const centerBias = 1 - distance / maxDistance;

    const hex = rgbToHex(r, g, b);
    const oklch = hexToOklch(hex);
    if (!oklch) continue;

    if (merged.ignoreExtremes && (oklch.l < 0.08 || oklch.l > 0.92)) {
      continue;
    }

    let weight = 1 + Math.max(0, centerBias);
    if (merged.skinToneGuard && isSkinTone(oklch)) {
      weight *= 0.35;
    }

    samples.push({ oklch, weight });
  }

  return samples;
};
