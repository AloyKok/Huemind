"use client";

import { useEffect, useMemo } from "react";

import { X } from "lucide-react";

import type { PaletteCard, PaletteColor } from "@/lib/types";
import type { Tokens } from "@/lib/themeSafety";
import { SparkGalleryPreview } from "./SparkGalleryPreview";

const fallbackNeutralRamp = [
  "#0f172a",
  "#111827",
  "#1f2937",
  "#273248",
  "#374151",
  "#4b5563",
  "#6b7280",
  "#9ca3af",
  "#d1d5db",
  "#e5e7eb",
  "#f9fafb",
];

const fallbackPalette: PaletteColor[] = [
  { hex: "#4F46E5" },
  { hex: "#22D3EE" },
  { hex: "#10B981" },
  { hex: "#F97316" },
  { hex: "#FACC15" },
];

type Props = {
  palette: PaletteCard | null;
  onClose: () => void;
  tokensOverride?: Tokens | null;
};

export const WebPreviewOverlay = ({ palette, onClose, tokensOverride }: Props) => {

  useEffect(() => {
    if (!palette) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [palette, onClose]);

  useEffect(() => {
    if (!palette) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [palette]);

  const tokens = useMemo(
    () => tokensOverride ?? buildTokensFromPalette(palette),
    [palette, tokensOverride]
  );

  if (!palette) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 backdrop-blur-md md:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="mt-6 flex h-[92vh] w-full max-w-[1280px] flex-col overflow-hidden rounded-[32px] border bg-white px-4 py-4 shadow-2xl sm:px-6 sm:py-6 md:mt-0 md:w-[95vw]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex flex-wrap items-center justify-between border-b px-6 py-4 text-sm text-slate-600">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-400">Preview</p>
            <h2 className="text-lg font-semibold text-slate-900">{palette.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto rounded-3xl bg-slate-50 p-6">
          <SparkGalleryPreview tokens={tokens} mode="light" />
        </div>
      </div>
    </div>
  );
};

const buildTokensFromPalette = (palette: PaletteCard | null): Tokens => {
  const colors = palette?.colors?.length ? palette.colors : fallbackPalette;
  const neutralRamp = buildNeutralRamp(palette?.neutrals ?? []);

  const colorAt = (index: number, fallback: string) => colors[index]?.hex ?? fallback;

  return {
    primary: colorAt(0, "#4F46E5"),
    secondary: colorAt(1, "#22D3EE"),
    accent: colorAt(2, "#10B981"),
    success: colorAt(2, "#10B981"),
    warning: colorAt(3, "#F97316"),
    error: colorAt(4, "#EF4444"),
    neutral: neutralRamp,
    text: {
      primary: "#111827",
      muted: "#6B7280",
      inverted: "#F9FAFB",
    },
    surface: {
      base: "#F9FBFF",
      raised: "#FFFFFF",
      sunken: "#EEF2FF",
    },
    outline: "rgba(17, 24, 39, 0.08)",
  };
};

const buildNeutralRamp = (paletteNeutrals: PaletteColor[]): string[] => {
  if (!paletteNeutrals.length) return fallbackNeutralRamp;
  const ramp = [...fallbackNeutralRamp];
  paletteNeutrals.forEach((neutral, idx) => {
    const position = 8 + idx * 2;
    ramp[Math.min(ramp.length - 1, position)] = neutral.hex;
  });
  return ramp;
};
