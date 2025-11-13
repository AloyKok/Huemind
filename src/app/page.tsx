"use client";

import { useMemo, useState, useEffect } from "react";

import { PromptBar } from "@/components/chat/PromptBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { PaletteCanvas } from "@/components/palette/PaletteCanvas";
import { WebPreviewOverlay } from "@/components/preview/WebPreviewOverlay";
import { ExtractorPanel } from "@/components/extractor/ExtractorPanel";
import { LandingScreen } from "@/components/landing/LandingScreen";
import { SavedPalettesPanel } from "@/components/saved/SavedPalettesPanel";
import { RandomPalettePanel } from "@/components/random/RandomPalettePanel";
import { mockPalettes } from "@/lib/mocks";
import type {
  PaletteCard as PaletteCardType,
  PalettePreviewMode,
  PaletteResponse,
  PaletteSessionEntry,
  ExtractedSwatch,
} from "@/lib/types";
import type { Tokens } from "@/lib/themeSafety";
import { cn, formatRelativeTime } from "@/lib/utils";
import { contrastRatio, getAccessibilityGrade } from "@/lib/color-utils";
import { useSupabase } from "@/lib/hooks/useSupabase";
import { ChevronLeft, ChevronRight, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { session, isLoading } = useSupabase();
  const [activeMode, setActiveMode] = useState<PalettePreviewMode>("chat");
  const [palettes, setPalettes] = useState<PaletteCardType[]>(mockPalettes);
  const [activePaletteIndex, setActivePaletteIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionEntries, setSessionEntries] = useState<PaletteSessionEntry[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("light");
  const [previewPalette, setPreviewPalette] = useState<PaletteCardType | null>(null);
  const [previewTokens, setPreviewTokens] = useState<Tokens | null>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number; plan: string } | null>(null);
  const [savedPalettes, setSavedPalettes] = useState<PaletteCardType[]>([]);
  const [isSavedLoading, setIsSavedLoading] = useState(false);

  const generateSessionId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const activePalette = useMemo(() => {
    if (!palettes.length) return null;
    const safeIndex = Math.min(Math.max(activePaletteIndex, 0), palettes.length - 1);
    return palettes[safeIndex];
  }, [activePaletteIndex, palettes]);

  const createSessionEntry = (prompt: string, palettesData: PaletteCardType[]): PaletteSessionEntry => ({
    id: generateSessionId(),
    prompt,
    createdAt: new Date().toISOString(),
    palettes: palettesData,
  });

type SavedPaletteRow = {
  id: string;
  name: string;
  prompt?: string | null;
  tokens: PaletteCardType;
  created_at?: string | null;
};

  const handlePromptSubmit = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          context: sessionEntries.map((entry) => ({
            prompt: entry.prompt,
            paletteIds: entry.palettes.map((palette) => palette.id),
          })),
          activePaletteIds: palettes.map((palette) => palette.id),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error ?? "Palette generation failed");
      }

      const data = (await response.json()) as PaletteResponse & {
        prompt: string;
        usage?: { used: number; limit: number; plan: string } | null;
      };

      if (!data?.palettes?.length) {
        throw new Error("Received an empty palette result");
      }

      if (data.provider === "openai") {
        toast.success("Generated palette via OpenAI");
      } else if (data.provider === "mock") {
        toast.warning(data.reason ? `Using fallback palette (${data.reason}).` : "OpenAI unavailable — using fallback palette.");
      }

      const newEntry = createSessionEntry(trimmedPrompt, data.palettes);

      setSessionEntries((prev) => [newEntry, ...prev].slice(0, 24));
      setActiveSessionId(newEntry.id);
      setPalettes(data.palettes);
      setActivePaletteIndex(0);

      if (session) {
        persistPalette(data.palettes[0], trimmedPrompt);
      }

      if (data.usage) {
        setUsage(data.usage);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      console.error("Palette generation error", error);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSlideChange = (index: number) => {
    if (!palettes.length) return;
    const clamped = Math.min(Math.max(index, 0), palettes.length - 1);
    setActivePaletteIndex(clamped);
  };

  const goToPreviousPalette = () => {
    setActivePaletteIndex((prev) => {
      if (!palettes.length) return 0;
      return prev === 0 ? palettes.length - 1 : prev - 1;
    });
  };

  const goToNextPalette = () => {
    setActivePaletteIndex((prev) => {
      if (!palettes.length) return 0;
      return prev === palettes.length - 1 ? 0 : prev + 1;
    });
  };

  const handleSessionRecall = (sessionId: string) => {
    const entry = sessionEntries.find((item) => item.id === sessionId);
    if (!entry) return;
    setPalettes(entry.palettes);
    setActivePaletteIndex(0);
    setActiveSessionId(entry.id);
  };

  const handleSessionReset = () => {
    setSessionEntries([]);
    setActiveSessionId(null);
    setPalettes(mockPalettes);
    setActivePaletteIndex(0);
    toast.info("Session cleared. Start fresh!");
  };

  const handlePreviewOpen = (palette: PaletteCardType, tokens?: Tokens | null) => {
    setPreviewTokens(tokens ?? null);
    setPreviewPalette(palette);
  };

  const handlePreviewClose = () => {
    setPreviewPalette(null);
    setPreviewTokens(null);
  };

  useEffect(() => {
    document.documentElement.dataset.previewTheme = previewTheme;
    return () => {
      delete document.documentElement.dataset.previewTheme;
    };
  }, [previewTheme]);

  useEffect(() => {
    if (!session) {
      setUsage(null);
      setSavedPalettes([]);
      return;
    }
    let isMounted = true;
    fetch("/api/usage")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && typeof data.used === "number") {
          setUsage(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    const loadPalettes = async () => {
      setIsSavedLoading(true);
      try {
        const res = await fetch("/api/palettes");
        if (!res.ok) {
          console.error("[HueMind] Failed to load saved palettes", res.statusText);
          if (!cancelled) {
            setSavedPalettes([]);
            setIsSavedLoading(false);
          }
          return;
        }
        const text = await res.text();
        const data: { palettes?: SavedPaletteRow[] } = text ? JSON.parse(text) : { palettes: [] };
        if (cancelled) return;
        const normalized: PaletteCardType[] = (data?.palettes ?? [])
          .map((entry) => {
            const tokens = entry.tokens;
            if (!tokens) return null;
            return {
              ...tokens,
              id: entry.id ?? tokens.id,
              name: entry.name ?? tokens.name,
              createdAt: entry.created_at ?? tokens.createdAt ?? new Date().toISOString(),
            };
          })
          .filter((palette): palette is PaletteCardType => Boolean(palette));
        setSavedPalettes(normalized);
      } catch (error) {
        console.error("[HueMind] Failed to load saved palettes", error);
        if (!cancelled) setSavedPalettes([]);
      } finally {
        if (!cancelled) setIsSavedLoading(false);
      }
    };

    loadPalettes();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const accessibilityFromHex = (hex: string) => {
    const ratio = contrastRatio(hex, "#0f1117");
    return {
      grade: getAccessibilityGrade(ratio),
      contrastAgainstBackground: Number(ratio.toFixed(2)),
    };
  };

  const persistPalette = async (palette: PaletteCardType, prompt: string) => {
    if (!session) return;
    await fetch("/api/palettes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: palette.name,
        prompt,
        tokens: palette,
      }),
    }).catch(() => {});
    setSavedPalettes((prev) => [palette, ...prev]);
    fetch("/api/usage")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.used === "number") {
          setUsage(data);
        }
      })
      .catch(() => {});
  };

  const createExtractedPalette = (
    tokens: Tokens,
    narrative: string,
    swatches: ExtractedSwatch[]
  ): PaletteCardType => ({
    id: `extract-${Date.now()}`,
    name: "Image Extract",
    narrative,
    colors: swatches.slice(0, 5).map((swatch, index) => ({
      hex: swatch.hex,
      label: swatch.label ?? `Shade ${index + 1}`,
    })),
    neutrals: tokens.neutral.slice(0, 3).map((hex, index) => ({
      hex,
      label: `Neutral ${index + 1}`,
      role: "neutral",
    })),
    accessibility: accessibilityFromHex(tokens.primary),
    sourcePrompt: "Image Extractor",
    createdAt: new Date().toISOString(),
  });

  const handleExtractorPreview = ({
    tokens,
    narrative,
    swatches,
  }: {
    tokens: Tokens;
    narrative: string;
    swatches: ExtractedSwatch[];
  }) => {
    const palette = createExtractedPalette(tokens, narrative, swatches);
    handlePreviewOpen(palette, tokens);
  };

  const handleExtractorSave = async ({
    tokens,
    narrative,
    swatches,
  }: {
    tokens: Tokens;
    narrative: string;
    swatches: ExtractedSwatch[];
  }) => {
    if (!session) {
      toast.error("Sign in to save palettes.");
      return;
    }
    const palette = createExtractedPalette(tokens, narrative, swatches);
    await persistPalette(palette, "Image Extractor");
    toast.success("Palette saved to your library.");
  };

  const handleSaveActivePalette = async () => {
    if (!session) {
      toast.error("Sign in to save palettes.");
      return;
    }
    if (!activePalette) {
      toast.error("Generate a palette first.");
      return;
    }
    await persistPalette(activePalette, activePalette.sourcePrompt ?? "Manual save");
    toast.success("Palette saved.");
  };

  const handleRandomSave = async (palette: PaletteCardType) => {
    const id = `random-${Date.now()}`;
    const paletteWithId = { ...palette, id };
    await persistPalette(paletteWithId, "Random Generator");
    toast.success("Random palette saved.");
  };

  const incrementUsageCount = async () => {
    if (!session) return;
    try {
      const response = await fetch("/api/usage/increment", { method: "POST" });
      if (!response.ok) return;
      const data = await response.json();
      if (data?.usage) {
        setUsage((prev) => ({
          used: data.usage.count ?? data.usage.used ?? prev?.used ?? 0,
          limit: data.usage.limit ?? prev?.limit ?? 0,
          plan: data.usage.plan ?? prev?.plan ?? "FREE",
        }));
      }
    } catch (error) {
      console.error("[HueMind] Usage increment failed", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="mb-4 h-8 w-8 animate-spin" />
        Loading HueMind…
      </div>
    );
  }

  if (!session) {
    return <LandingScreen />;
  }

  return (
    <div
      data-preview-theme={previewTheme}
      className="relative flex min-h-screen bg-background text-foreground transition-colors duration-300"
    >
      <Sidebar activeMode={activeMode} onModeChange={setActiveMode} />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pb-40 pt-10 sm:px-8 xl:px-12">
            {activeMode === "chat" ? (
              <div className="space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">HueMind Palette Studio</h1>
                  <p className="mt-1 text-sm text-foreground/70">
                    Turn mood-rich prompts into production-ready palettes.
                  </p>
                  {usage && Number.isFinite(usage.limit) && usage.limit > 0 && (
                    <div className="mt-3 flex items-center gap-3 text-xs text-foreground/60">
                      <div className="flex-1 rounded-full border border-border/60 bg-surface/70 p-1">
                        <div
                          className="h-2 rounded-full bg-accent"
                          style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
                        />
                      </div>
                      <span className="text-foreground/70">
                        {usage.used} / {usage.limit} palettes this month ({usage.plan})
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 text-xs text-foreground/60">
                  <button
                    type="button"
                    onClick={() => activePalette && handlePreviewOpen(activePalette)}
                    className="flex items-center gap-2 rounded-full border border-border/60 bg-surface/80 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent/20 hover:text-foreground"
                    disabled={!activePalette}
                  >
                    Preview
                  </button>
                  {palettes.length > 1 && (
                    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-surface/80 px-3 py-2 text-foreground/80">
                      <button
                        type="button"
                        onClick={goToPreviousPalette}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-sm transition hover:bg-accent/20 hover:text-foreground"
                        aria-label="Previous palette"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(palettes.length - 1, 0)}
                      value={activePaletteIndex}
                      onChange={(event) => handleSlideChange(Number(event.target.value))}
                      className="h-1 w-40 cursor-pointer appearance-none rounded-full bg-border/60 accent-accent"
                    />
                    <button
                      type="button"
                      onClick={goToNextPalette}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-sm transition hover:bg-accent/20 hover:text-foreground"
                      aria-label="Next palette"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                      <span className="ml-2 text-[11px] tracking-wide text-foreground/60">
                        {activePaletteIndex + 1}/{palettes.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
                {activePalette ? (
                  <div className="relative flex min-h-[55vh] flex-1 rounded-3xl">
                    <PaletteCanvas
                      paletteId={activePalette.id}
                      colors={activePalette.colors}
                      isLoading={isGenerating}
                      className="flex-1"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[55vh] items-center justify-center rounded-3xl border border-border/60 bg-surface/60 text-sm text-foreground/60">
                    Generate a palette to get started.
                  </div>
                )}

                <aside className="flex flex-col gap-4">
                  {activePalette && (
                    <div className="rounded-2xl border border-border/60 bg-surface/90 p-5 shadow-glow">
                      <h2 className="text-lg font-semibold text-foreground">{activePalette.name}</h2>
                      <p className="mt-2 text-sm text-foreground/70">{activePalette.narrative}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-foreground/60">
                        <span className="rounded-full border border-border/60 px-3 py-1 font-medium text-foreground">
                          {activePalette.accessibility.grade}
                        </span>
                        <span>{activePalette.accessibility.contrastAgainstBackground.toFixed(2)}:1 contrast</span>
                      </div>
                      <div className="mt-5 space-y-2 text-xs text-foreground/70">
                        <h3 className="text-[11px] uppercase tracking-[0.28em] text-foreground/50">
                          Neutral Accents
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {activePalette.neutrals.map((neutral) => (
                            <div
                              key={`${activePalette.id}-${neutral.hex}`}
                              className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2"
                            >
                              <span
                                className="h-5 w-5 rounded-full border border-border/60"
                                style={{ backgroundColor: neutral.hex }}
                              />
                              <div>
                                <span className="text-sm font-medium text-foreground">{neutral.hex}</span>
                                {neutral.label && (
                                  <p className="text-[11px] text-foreground/60">{neutral.label}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-surface/90 p-5 text-xs text-foreground/70 shadow-glow">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">Prompt history</h3>
                        <button
                          type="button"
                          onClick={handleSessionReset}
                          disabled={!sessionEntries.length}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full border border-border/60 transition",
                            sessionEntries.length
                              ? "hover:bg-accent/20 hover:text-foreground"
                              : "cursor-not-allowed opacity-40"
                          )}
                          aria-label="Reset session"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.3em] text-foreground/40">
                        {sessionEntries.length} prompts
                      </span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {sessionEntries.length ? (
                        <div
                          className="space-y-3 overflow-y-auto pr-2"
                          style={{ maxHeight: "min(360px, 45vh)" }}
                        >
                          {sessionEntries.map((entry, index) => {
                            const isActiveSession = entry.id === activeSessionId;
                            const leadPalette = entry.palettes[0];
                            const swatches = leadPalette?.colors.slice(0, 5) ?? [];

                            return (
                            <button
                              key={entry.id}
                              type="button"
                              onClick={() => handleSessionRecall(entry.id)}
                              className={cn(
                                "group w-full rounded-xl border px-3 py-3 text-left transition",
                                isActiveSession
                                  ? "border-accent/50 bg-accent/10 text-foreground shadow-glow"
                                  : "border-border/50 bg-background/40 hover:border-border/60 hover:bg-background/55"
                              )}
                              aria-pressed={isActiveSession}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-[13px] font-medium leading-relaxed text-foreground">
                                  {entry.prompt}
                                </p>
                                <span className="shrink-0 text-[11px] uppercase tracking-[0.28em] text-foreground/50">
                                  {formatRelativeTime(entry.createdAt)}
                                </span>
                              </div>
                              <div className="mt-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5">
                                  {swatches.length ? (
                                    swatches.map((swatch, swatchIndex) => (
                                      <span
                                        key={`${entry.id}-${swatch.hex}-${swatchIndex}`}
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{
                                          backgroundColor: swatch.hex,
                                          boxShadow: "0 0 0 1px rgba(15,17,23,0.4), 0 0 0 2px rgba(255,255,255,0.3)",
                                        }}
                                      />
                                    ))
                                  ) : (
                                    <span className="text-[11px] text-foreground/40">No colors</span>
                                  )}
                                </div>
                                <span className="text-[11px] text-foreground/40">
                                  #{sessionEntries.length - index}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                        </div>
                      ) : (
                        <p className="rounded-xl border border-dashed border-border/40 bg-background/20 px-3 py-6 text-center text-foreground/40">
                          Start chatting to see your prompts stack here.
                        </p>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
              </div>
            ) : activeMode === "extractor" ? (
              <ExtractorPanel
                onPreview={handleExtractorPreview}
                onSave={session ? handleExtractorSave : undefined}
                canSave={Boolean(session)}
              />
            ) : activeMode === "random" ? (
              <RandomPalettePanel
                onSave={handleRandomSave}
                usage={usage}
                incrementUsage={session ? incrementUsageCount : undefined}
              />
            ) : (
              <SavedPalettesPanel
                palettes={savedPalettes}
                isLoading={isSavedLoading}
                onPreview={(palette) => handlePreviewOpen(palette)}
              />
            )}
          </div>
        </div>
      </div>
      {activeMode === "chat" && (
        <PromptBar
          onSubmit={handlePromptSubmit}
          isGenerating={isGenerating}
          previewTheme={previewTheme}
          onTogglePreviewTheme={() =>
            setPreviewTheme((prev) => (prev === "dark" ? "light" : "dark"))
          }
          onSave={session ? handleSaveActivePalette : undefined}
          canSave={Boolean(session && activePalette)}
        />
      )}
      <WebPreviewOverlay
        key={previewPalette?.id ?? "preview"}
        palette={previewPalette}
        tokensOverride={previewTokens}
        onClose={handlePreviewClose}
      />
    </div>
  );
}
