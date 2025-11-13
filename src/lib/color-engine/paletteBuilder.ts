import type { Tokens } from "@/lib/themeSafety";
import { ensureAA } from "@/lib/themeSafety";
import type { ExtractedSwatch, ExtractorOptions, RegenerateRequest } from "@/lib/types";
import { adjustOklch, hexToOklch, oklchToHex, type Oklch } from "./oklch";

const FALLBACK_SUCCESS = "#3BB273";
const FALLBACK_WARNING = "#F5A623";
const FALLBACK_ERROR = "#D0021B";

const pickSwatch = (
  swatches: ExtractedSwatch[],
  predicate: (swatch: ExtractedSwatch) => boolean,
  scorer: (swatch: ExtractedSwatch) => number
) => {
  const filtered = swatches.filter(predicate);
  const target = filtered.length ? filtered : swatches;
  return target.slice().sort((a, b) => scorer(b) - scorer(a))[0];
};

const buildNeutralRamp = (primary: ExtractedSwatch): string[] => {
  const base = hexToOklch(primary.hex) ?? { l: 0.6, c: 0.05, h: 220 };
  const neutrals: string[] = [];
  for (let step = 0; step <= 10; step += 1) {
    const l = 0.03 + (step / 10) * 0.94;
    const neutral = oklchToHex({
      l,
      c: Math.max(0, Math.min(0.06, base.c * 0.2)),
      h: base.h,
    });
    neutrals.push(neutral);
  }
  return neutrals;
};

const enforceTextContrast = (tokens: Tokens, requireAA: boolean) => {
  if (!requireAA) return tokens;
  const primaryText = ensureAA(tokens.text.primary, tokens.surface.base);
  const mutedText = ensureAA(tokens.text.muted, tokens.surface.base);
  const invertedText = ensureAA(tokens.text.inverted, tokens.surface.sunken);
  return {
    ...tokens,
    text: {
      primary: primaryText.fg,
      muted: mutedText.fg,
      inverted: invertedText.fg,
    },
  };
};

export const buildSystemPalette = (
  swatches: ExtractedSwatch[],
  options: ExtractorOptions
): { tokens: Tokens; narrative: string } => {
  if (!swatches.length) {
    throw new Error("No swatches were extracted from the image.");
  }

  const primary = pickSwatch(
    swatches,
    (swatch) => swatch.oklch[0] >= 0.45 && swatch.oklch[0] <= 0.75 && swatch.oklch[1] <= 0.25,
    (swatch) => swatch.share - Math.abs(swatch.oklch[0] - 0.6)
  );

  const secondary = pickSwatch(
    swatches.filter(
      (swatch) => Math.abs(swatch.oklch[2] - primary.oklch[2]) > 25
    ),
    () => true,
    (swatch) => swatch.share - Math.abs(swatch.oklch[1] - primary.oklch[1])
  );

  const accent = pickSwatch(
    swatches.filter(
      (swatch) => Math.abs(swatch.oklch[2] - primary.oklch[2]) > 45
    ),
    () => true,
    (swatch) => swatch.oklch[1]
  );

  const neutralRamp = buildNeutralRamp(primary);
  const tokens: Tokens = {
    primary: primary.hex,
    secondary: secondary?.hex ?? swatches[1]?.hex ?? primary.hex,
    accent: accent?.hex ?? swatches[2]?.hex ?? primary.hex,
    success: FALLBACK_SUCCESS,
    warning: FALLBACK_WARNING,
    error: FALLBACK_ERROR,
    neutral: neutralRamp,
    text: {
      primary: neutralRamp[1] ?? "#111827",
      muted: neutralRamp[4] ?? "#6B7280",
      inverted: neutralRamp[9] ?? "#F9FAFB",
    },
    surface: {
      base: neutralRamp[10] ?? "#FFFFFF",
      raised: neutralRamp[9] ?? "#F5F7FA",
      sunken: neutralRamp[7] ?? "#E5E7EB",
    },
    outline: "rgba(15,17,23,0.12)",
  };

  const adjustedTokens = enforceTextContrast(tokens, options.requireAA);

  const narrative = `Palette grounded in your upload — anchored by ${primary.hex} with ${adjustedTokens.accent} accents.`;
  return { tokens: adjustedTokens, narrative };
};

export const regenerateFromSwatches = ({
  swatches,
  adjust,
  lockPrimary,
  options,
}: RegenerateRequest & { options: ExtractorOptions }) => {
  const adjustment = adjust ?? {};
  const adjustedSwatches = swatches.map((swatch) => {
    const [l, c, h] = swatch.oklch;
    const deltaHue = (adjustment.warmth ?? 0) * 10;
    const deltaChroma = adjustment.mute ? -Math.abs(adjustment.mute) * 0.08 : 0;
    const deltaLightness = (adjustment.contrast ?? 0) * 0.05;
    const updated: Oklch = adjustOklch(
      { l, c, h },
      { l: deltaLightness, c: deltaChroma, h: deltaHue }
    );
    return {
      ...swatch,
      oklch: [updated.l, updated.c, updated.h] as [number, number, number],
      hex: oklchToHex(updated),
    };
  });

  if (lockPrimary) {
    const locked = adjustedSwatches.find((swatch) => swatch.hex === lockPrimary);
    if (locked) {
      adjustedSwatches.unshift(locked);
    }
  }

  return buildSystemPalette(adjustedSwatches, options);
};
