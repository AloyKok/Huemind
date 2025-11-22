"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Lock, Unlock, RefreshCw, Sun, Moon, Sparkles, Loader2 } from "lucide-react";

import type { PaletteCard } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createRandomHex, type RandomBiasMode } from "@/lib/random";
import { PaletteCanvas } from "@/components/palette/PaletteCanvas";

export type RandomSwatch = {
  hex: string;
  label: string;
  locked: boolean;
};

type Props = {
  onSave: (palette: PaletteCard, source?: string) => Promise<void>;
  usage?: { used: number; limit: number; plan: string } | null;
  incrementUsage?: () => Promise<void>;
};

const biasOptions: { value: RandomBiasMode; label: string }[] = [
  { value: "none", label: "No bias" },
  { value: "warmer", label: "Warmer" },
  { value: "cooler", label: "Cooler" },
  { value: "muted", label: "More muted" },
  { value: "contrast", label: "More contrast" },
];

export const RandomPalettePanel = ({ onSave, usage, incrementUsage }: Props) => {
  const [swatches, setSwatches] = useState<RandomSwatch[]>([]);
  const [bias, setBias] = useState<RandomBiasMode>("none");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [name, setName] = useState("Random Palette");
  const [isGenerating, setIsGenerating] = useState(false);

  const allLocked = swatches.length > 0 && swatches.every((swatch) => swatch.locked);

  const generateSwatches = useCallback(
    async (preserveLocks = true, increment = true) => {
      if (isGenerating || allLocked) return;
      setIsGenerating(true);
      const existingLocked = preserveLocks ? swatches : [];
      const newSwatches: RandomSwatch[] = [];
      for (let index = 0; index < 5; index += 1) {
        const locked = existingLocked[index]?.locked ?? false;
        if (locked && preserveLocks) {
          newSwatches[index] = existingLocked[index];
          continue;
        }
        const existingHexes = newSwatches.slice(0, index).map((swatch) => swatch.hex);
        const { hex } = createRandomHex(existingHexes, bias, index, 5);
        newSwatches[index] = {
          hex,
          label: `Shade ${index + 1}`,
          locked: false,
        };
      }
      setSwatches(newSwatches);
      setIsGenerating(false);
      if (incrementUsage && increment) {
        incrementUsage().catch(() => {});
      }
    },
    [allLocked, bias, incrementUsage, isGenerating, swatches]
  );

  const initialisedRef = useRef(false);
  useEffect(() => {
    if (!initialisedRef.current) {
      initialisedRef.current = true;
      requestAnimationFrame(() => generateSwatches(false, true));
    }
  }, [generateSwatches]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
      if (event.code === "Space") {
        event.preventDefault();
        generateSwatches(true, true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [generateSwatches]);

  const toggleLock = (index: number) => {
    setSwatches((prev) => prev.map((swatch, i) => (i === index ? { ...swatch, locked: !swatch.locked } : swatch)));
  };

  const replaceSwatch = (index: number) => {
    const existingHexes = swatches.filter((_, idx) => idx !== index).map((swatch) => swatch.hex);
    const { hex } = createRandomHex(existingHexes, bias, index, 5);
    setSwatches((prev) => prev.map((swatch, i) => (i === index ? { ...swatch, hex, locked: false } : swatch)));
  };

  const reorderSwatches = (from: number, to: number) => {
    setSwatches((prev) => {
      const clone = [...prev];
      const [item] = clone.splice(from, 1);
      clone.splice(to, 0, item);
      return clone;
    });
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      // optional toast hook
    });
  };

  const paletteColors = useMemo(
    () => swatches.map((swatch) => ({ hex: swatch.hex, label: swatch.label })),
    [swatches]
  );

  const builtPalette: PaletteCard | null = useMemo(() => {
    if (!swatches.length) return null;
    return {
      id: "random-preview",
      name,
      narrative: "Randomly generated palette",
      colors: swatches.map((swatch) => ({ hex: swatch.hex, label: swatch.label })),
      neutrals: buildNeutralRamp(swatches[0]?.hex ?? "#ffffff"),
      accessibility: { grade: "AA", contrastAgainstBackground: 4.5 },
      sourcePrompt: "Random",
      createdAt: new Date().toISOString(),
    } as PaletteCard;
  }, [name, swatches]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold text-foreground">Random Palette</h2>
        <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
          {usage && Number.isFinite(usage.limit) && usage.limit > 0 && (
            <span>
              {usage.used}/{usage.limit} this month
            </span>
          )}
          <button
            type="button"
          onClick={() => generateSwatches(true, true)}
            disabled={isGenerating || allLocked}
            className="flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm text-foreground transition hover:bg-accent/15"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate
          </button>
          {allLocked && <span className="text-[11px] text-red-500">Unlock a swatch to shuffle.</span>}
          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            className="rounded-full border border-border/60 px-3 py-1 text-xs text-foreground/70"
          >
            {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="bias-select" className="text-sm text-foreground/70">
        Tuning
      </label>
      <div className="w-56">
        <select
          id="bias-select"
          className="w-full rounded-xl border border-border/60 bg-surface/80 px-3 py-2 text-sm text-foreground"
          value={bias}
          onChange={(event) => setBias(event.target.value as RandomBiasMode)}
        >
          {biasOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
      <div className="rounded-[32px] border border-border/70 bg-surface/95 p-5 shadow-[0_25px_60px_rgba(10,15,35,0.2)]">
        {swatches.length ? (
          <>
            <div className="rounded-[32px] border border-border/40 bg-background/40 p-3">
              <PaletteCanvas
                colors={paletteColors}
                paletteId="random-preview"
                isLoading={isGenerating}
                className="min-h-[340px]"
              />
            </div>
            <div className="mt-6 space-y-3">
              {swatches.map((swatch, index) => (
                <div
                  key={`${swatch.hex}-${index}`}
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData("text/plain", String(index))}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    const from = Number(event.dataTransfer.getData("text/plain"));
                    reorderSwatches(from, index);
                  }}
                  className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background/50 px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => copyHex(swatch.hex)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className="h-12 w-12 rounded-xl border border-border/40 shadow-inner"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span className="text-lg font-semibold text-foreground">{swatch.hex}</span>
                    <span className="text-[11px] uppercase tracking-[0.3em] text-foreground/50">
                      {swatch.label}
                    </span>
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleLock(index)}
                      className="rounded-full border border-border/60 p-2 text-foreground/70"
                    >
                      {swatch.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => replaceSwatch(index)}
                      className="rounded-full border border-border/60 p-2 text-foreground/70"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex min-h-[320px] items-center justify-center text-sm text-foreground/60">
            Generate a palette to preview it here.
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-border/60 bg-surface/80 p-4 text-sm text-foreground">
        <p className="font-semibold">Preview</p>
        <div className={cn("mt-3 rounded-2xl border px-4 py-6", theme === "dark" ? "bg-[#0f1117] text-white" : "bg-white text-[#0f172a]")}
        >
          <p className="text-lg font-semibold">This is a header</p>
          <p className="text-sm opacity-70">Body text demonstrating contrast.</p>
          <div className="mt-4 flex gap-3">
            <button className="rounded-full px-3 py-1 text-xs" style={{ backgroundColor: swatches[0]?.hex ?? "#000", color: theme === "dark" ? "#0f1117" : "#fff" }}>Primary</button>
            <button className="rounded-full px-3 py-1 text-xs" style={{ backgroundColor: swatches[2]?.hex ?? "#000", color: theme === "dark" ? "#0f1117" : "#fff" }}>Accent</button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="flex-1 rounded-2xl border border-border/60 bg-surface/80 px-4 py-2 text-sm text-foreground"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          type="button"
          onClick={() => builtPalette && onSave(builtPalette)}
          disabled={!builtPalette}
          className="rounded-full border border-border/60 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/10"
        >
          Save palette
        </button>
      </div>
    </div>
  );
};

const buildNeutralRamp = (startHex: string): { hex: string; label: string; role: "neutral" }[] => {
  const base = hexToRgb(startHex);
  const shades = [0.1, 0.5, 0.85];
  return shades.map((shade, index) => {
    const r = Math.round(base.r * shade + 255 * (1 - shade));
    const g = Math.round(base.g * shade + 255 * (1 - shade));
    const b = Math.round(base.b * shade + 255 * (1 - shade));
    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
      .toString(16)
      .padStart(2, "0")}`;
    return { hex, label: `Neutral ${index + 1}`, role: "neutral" };
  });
};

const hexToRgb = (hex: string) => {
  const sanitized = hex.replace("#", "");
  const value = sanitized.length === 3
    ? sanitized.split("").map((c) => c + c).join("")
    : sanitized;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
};
