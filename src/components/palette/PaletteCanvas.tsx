"use client";

import { useMemo, useState } from "react";

import { Copy } from "lucide-react";

import { toast } from "sonner";

import { getReadableTextColor } from "@/lib/color-utils";
import type { PaletteColor } from "@/lib/types";
import { cn } from "@/lib/utils";

type PaletteCanvasProps = {
  colors: PaletteColor[];
  isLoading?: boolean;
  paletteId?: string;
  className?: string;
};

export const PaletteCanvas = ({
  colors,
  isLoading,
  paletteId,
  className,
}: PaletteCanvasProps) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const transitionKey = useMemo(
    () => `${paletteId ?? "palette"}-${colors.map((color) => color.hex).join("-")}`,
    [paletteId, colors]
  );

  const shimmerStyles = useMemo(
    () => ({
      backgroundImage:
        "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.6), rgba(255,255,255,0))",
      backgroundSize: "800px 100%",
      animation: "shimmer 1.6s linear infinite",
    }),
    []
  );

  const handleCopy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1200);
      toast.success(`Copied ${hex} to clipboard.`);
    } catch (error) {
      console.error("Unable to copy color", error);
      toast.error("Copy failed. Please try again.");
    }
  };

  return (
    <section
      key={transitionKey}
      className={cn(
        "relative flex h-full min-h-[420px] w-full overflow-hidden rounded-[44px] border border-border/40 bg-surface/70 shadow-panel",
        "gap-[1px] bg-surface",
        !isLoading && "animate-[panel-slide_0.75s_ease]",
        className
      )}
    >
      {colors.map((color, index) => {
        const readable = getReadableTextColor(color.hex);
        const isCopied = copiedHex === color.hex;
        const labelColor =
          readable === "#f9fafb" ? "rgba(249,250,251,0.75)" : "rgba(15,17,23,0.7)";
        const copyBackground = readable === "#f9fafb"
          ? "rgba(15,17,23,0.58)"
          : "rgba(255,255,255,0.42)";
        const copyTextColor = readable === "#f9fafb" ? "#f9fafb" : "#0f1117";

        return (
          <div
            key={`${color.hex}-${index}`}
            style={{ backgroundColor: color.hex }}
            className={cn(
              "group relative flex flex-1 overflow-hidden transition-[flex] duration-500 ease-smooth",
              "hover:flex-[1.25]"
            )}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ boxShadow: "inset 0 0 0 0 rgba(0,0,0,0.08), 0 22px 60px rgba(10,12,18,0.22)" }}
            />
            <div className="relative flex h-full w-full flex-col items-center justify-end pb-10 text-center sm:pb-12">
              {isLoading ? (
                <span
                  className="h-6 w-32 rounded-full opacity-80"
                  style={{ ...shimmerStyles, color: readable }}
                />
              ) : (
                <span
                  className="text-[18px] font-semibold tracking-tight sm:text-[20px]"
                  style={{
                    color: readable,
                    letterSpacing: "0.02em",
                    textShadow:
                      readable === "#f9fafb"
                        ? "0 10px 22px rgba(15,17,23,0.28)"
                        : "0 8px 18px rgba(15,17,23,0.16)",
                  }}
                >
                  {color.hex}
                </span>
              )}
              {color.label && (
                <span
                  className={cn(
                    "px-3 py-1 text-[9px] font-medium uppercase tracking-[0.32em]",
                    isLoading && "h-5 w-28 animate-pulse"
                  )}
                  style={{
                    color: labelColor,
                    letterSpacing: "0.32em",
                    opacity: isLoading ? 0.5 : 0.82,
                  }}
                >
                  {!isLoading && color.label}
                </span>
              )}
              <div className="mt-4 flex flex-col items-center gap-2 pb-4">
                <button
                  type="button"
                  onClick={() => handleCopy(color.hex)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-full border border-border/40 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.28em] opacity-0 backdrop-blur transition-all duration-300",
                    "group-hover:-translate-y-1 group-hover:opacity-100",
                    readable === "#f9fafb"
                      ? "text-white"
                      : "text-foreground"
                  )}
                  disabled={isLoading}
                  style={{
                    backgroundColor: copyBackground,
                    color: copyTextColor,
                    boxShadow:
                      readable === "#f9fafb"
                        ? "0 12px 32px rgba(15,17,23,0.35)"
                        : "0 10px 24px rgba(15,17,23,0.16)",
                  }}
                >
                  <Copy className="h-4 w-4" strokeWidth={1.4} />
                  {isCopied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};
