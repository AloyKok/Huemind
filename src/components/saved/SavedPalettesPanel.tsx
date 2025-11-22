"use client";

import { useMemo } from "react";
import { Loader2, Trash2 } from "lucide-react";

import type { PaletteCard } from "@/lib/types";

type SavedPalettesPanelProps = {
  palettes: PaletteCard[];
  isLoading: boolean;
  onPreview: (palette: PaletteCard) => void;
  onRemove: (paletteId: string) => void;
};

export const SavedPalettesPanel = ({
  palettes,
  isLoading,
  onPreview,
  onRemove,
}: SavedPalettesPanelProps) => {
  const displayPalettes = useMemo(() => palettes ?? [], [palettes]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-foreground/60">
        <Loader2 className="mb-3 h-6 w-6 animate-spin" /> Fetching saved palettes…
      </div>
    );
  }

  if (!displayPalettes.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-border/60 bg-surface/80 text-sm text-foreground/60">
        No saved palettes yet. Generate one and hit Save to see it here.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Saved palettes</h2>
        <p className="text-sm text-foreground/60">Your personal library, ready to preview and export.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {displayPalettes.map((palette) => {
          const createdLabel = palette.createdAt
            ? new Date(palette.createdAt).toLocaleDateString()
            : "Recently saved";

          return (
            <div
              key={palette.id}
              className="group relative rounded-3xl border border-border/60 bg-surface/90 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                role="button"
                tabIndex={0}
                className="flex flex-col text-left"
                onClick={() => onPreview(palette)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onPreview(palette);
                  }
                }}
              >
                <div className="mb-3 flex overflow-hidden rounded-2xl">
                  {palette.colors.slice(0, 6).map((color) => (
                    <div key={`${palette.id}-${color.hex}`} className="h-20 flex-1" style={{ backgroundColor: color.hex }} />
                  ))}
                </div>
                <p className="text-base font-semibold text-foreground">{palette.name}</p>
                <p className="text-xs text-foreground/60">{createdLabel}</p>
              </div>
              <button
                type="button"
                aria-label={`Remove ${palette.name}`}
                disabled={!palette.id}
                onClick={(event) => {
                  event.stopPropagation();
                  if (palette.id) onRemove(palette.id);
                }}
                className="absolute bottom-3 right-3 rounded-full border border-border/60 bg-background/90 p-2 text-foreground/70 shadow-sm transition hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
