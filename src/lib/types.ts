import type { AccessibilityGrade } from "./color-utils";
import type { Tokens } from "./themeSafety";

export type PaletteColor = {
  hex: string;
  label?: string;
  role?: "primary" | "secondary" | "accent" | "neutral";
};

export type PalettePreviewMode =
  | "chat"
  | "extractor"
  | "saved"
  | "random"
  | "scheme"
  | "customize";

export type AccessibilityReport = {
  grade: AccessibilityGrade;
  contrastAgainstBackground: number;
};

export type PaletteCard = {
  id: string;
  name: string;
  narrative: string;
  colors: PaletteColor[];
  neutrals: PaletteColor[];
  accessibility: AccessibilityReport;
  sourcePrompt: string;
  createdAt: string;
};

export type PaletteResponse = {
  palettes: PaletteCard[];
  provider?: "openai" | "mock";
  reason?: string | null;
};

export type PaletteSessionEntry = {
  id: string;
  prompt: string;
  createdAt: string;
  palettes: PaletteCard[];
};

export type ExtractorOptions = {
  colorCount: number;
  ignoreExtremes: boolean;
  skinToneGuard: boolean;
  requireAA: boolean;
};

export type ExtractedSwatch = {
  hex: string;
  oklch: [number, number, number];
  share: number;
  label?: string;
};

export type ExtractResponse = {
  swatches: ExtractedSwatch[];
  suggested: {
    tokens: Tokens;
    narrative: string;
  };
};

export type RegenerateRequest = {
  swatches: ExtractedSwatch[];
  adjust?: {
    warmth?: number;
    contrast?: number;
    mute?: number;
  };
  lockPrimary?: string;
  options?: Partial<ExtractorOptions>;
};
