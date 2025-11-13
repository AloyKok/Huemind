"use client";

import { Download, Bookmark, Share2 } from "lucide-react";

import type { PaletteCard as PaletteCardType } from "@/lib/types";
import { cn } from "@/lib/utils";

type PaletteCardProps = {
  palette: PaletteCardType;
  onExport?: (palette: PaletteCardType) => void;
  onSave?: (palette: PaletteCardType) => void;
  onShare?: (palette: PaletteCardType) => void;
  isActive?: boolean;
};

export const PaletteCard = ({
  palette,
  onExport,
  onSave,
  onShare,
  isActive,
}: PaletteCardProps) => (
  <article
    className={cn(
      "flex w-full flex-col gap-4 rounded-2xl border border-border/60 bg-surface/80 p-4 shadow-glow transition",
      isActive && "border-accent/50 shadow-[0_0_45px_rgba(168,85,247,0.15)]"
    )}
  >
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-base font-semibold text-foreground">{palette.name}</h2>
        <p className="mt-1 max-w-md text-sm text-foreground/70">{palette.narrative}</p>
      </div>
      <span className="flex items-center rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-foreground/80">
        Accessibility {palette.accessibility.grade}
      </span>
    </div>

    <div className="flex flex-wrap gap-2">
      {palette.colors.map((color) => (
        <div
          key={`${palette.id}-${color.hex}`}
          className="flex min-w-[110px] flex-1 flex-col items-center gap-2 rounded-xl border border-border/40 bg-background/40 p-3"
        >
          <div
            className="h-14 w-full rounded-lg"
            style={{ backgroundColor: color.hex, boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.08)" }}
          />
          <span className="text-sm font-semibold text-foreground">{color.hex}</span>
          {color.label && (
            <span className="text-xs text-foreground/60">{color.label}</span>
          )}
        </div>
      ))}
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-foreground/60">
      <div className="flex items-center gap-2">
        {palette.neutrals.map((neutral) => (
          <div key={`${palette.id}-${neutral.hex}`} className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded-full border border-border/40"
              style={{ backgroundColor: neutral.hex }}
            />
            <span>{neutral.hex}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm font-medium">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border/60 px-3 py-2 text-foreground/80 transition hover:bg-accent/20 hover:text-foreground"
          onClick={() => onExport?.(palette)}
        >
          <Download className="h-4 w-4" />
          Export
        </button>
        <button
          type="button"
          className="hidden items-center gap-2 rounded-full border border-border/60 px-3 py-2 text-foreground/80 transition hover:bg-accent/20 hover:text-foreground sm:flex"
          onClick={() => onSave?.(palette)}
        >
          <Bookmark className="h-4 w-4" />
          Save
        </button>
        <button
          type="button"
          className="hidden items-center gap-2 rounded-full border border-border/60 px-3 py-2 text-foreground/80 transition hover:bg-accent/20 hover:text-foreground lg:flex"
          onClick={() => onShare?.(palette)}
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>
    </div>
  </article>
);
