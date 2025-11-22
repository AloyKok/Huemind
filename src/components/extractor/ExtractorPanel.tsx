"use client";

import NextImage from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";

import { Camera, Loader2, Plus, RefreshCw, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import type { ExtractResponse, ExtractedSwatch, ExtractorOptions } from "@/lib/types";
import type { Tokens } from "@/lib/themeSafety";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
const MAX_SIZE = 10 * 1024 * 1024;

type ExtractorPanelProps = {
  onPreview: (payload: { tokens: Tokens; narrative: string; swatches: ExtractedSwatch[] }) => void;
  onSave?: (payload: { tokens: Tokens; narrative: string; swatches: ExtractedSwatch[] }) => void;
  canSave?: boolean;
};

const defaultOptions: ExtractorOptions = {
  colorCount: 5,
  ignoreExtremes: true,
  skinToneGuard: true,
  requireAA: true,
};

type UploadState = {
  name: string;
  size: number;
  previewUrl: string;
  payload: string;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const rasterizeImage = async (file: File) => {
  if (file.type === "image/svg+xml") {
    return readFileAsDataUrl(file);
  }

  const base64 = await readFileAsDataUrl(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = base64;
  });

  const maxSide = 600;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return base64;
  }
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/png");
};

const Toggle = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={cn(
      "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
      value ? "border-accent/50 bg-accent/10 text-foreground" : "border-border/60 bg-surface/70 text-foreground/70"
    )}
  >
    <span className="text-sm font-medium">{label}</span>
    <span
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full border transition",
        value ? "border-accent bg-accent/40" : "border-border bg-background/70"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition",
          value ? "translate-x-5" : "translate-x-1"
        )}
      />
    </span>
  </button>
);

export const ExtractorPanel = ({ onPreview, onSave, canSave }: ExtractorPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [options, setOptions] = useState<ExtractorOptions>(defaultOptions);
  const [swatches, setSwatches] = useState<ExtractedSwatch[]>([]);
  const [suggested, setSuggested] = useState<ExtractResponse["suggested"] | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file?: File | null) => {
      if (!file) return;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Unsupported file type. Please upload PNG, JPG, or SVG.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("File is larger than 10MB. Please upload a smaller image.");
        return;
      }

      try {
        setError(null);
        const payload = await rasterizeImage(file);
        setUpload({
          name: file.name,
          size: file.size,
          previewUrl: URL.createObjectURL(file),
          payload,
        });
        setSwatches([]);
        setSuggested(null);
      } catch (uploadError) {
        console.error("[HueMind] Failed to read file", uploadError);
        setError("Unable to read the selected file.");
      }
    },
    []
  );

  const handleExtract = useCallback(async () => {
    if (!upload?.payload) return;
    setIsExtracting(true);
    setError(null);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: upload.payload, options }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error ?? "Color extraction failed.");
      }
      const data = (await response.json()) as ExtractResponse;
      setSwatches(data.swatches);
      setSuggested(data.suggested);
      toast.success("Colors extracted from your image.");
    } catch (extractError) {
      console.error("[HueMind] Extract failed", extractError);
      setError(extractError instanceof Error ? extractError.message : "Extraction failed.");
      toast.error("Extraction failed. Please try another image.");
    } finally {
      setIsExtracting(false);
    }
  }, [options, upload]);

  const handleAdjust = useCallback(
    async (adjustment: { warmth?: number; contrast?: number; mute?: number }) => {
      if (!swatches.length) return;
      try {
        const response = await fetch("/api/regenerate-from-swatches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            swatches,
            adjust: adjustment,
            options,
          }),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.error ?? "Unable to regenerate palette.");
        }
        const data = await response.json();
        setSuggested(data);
        toast.success("Palette adjusted.");
      } catch (adjustError) {
        console.error("[HueMind] Adjustment failed", adjustError);
        toast.error("Adjustment failed.");
      }
    },
    [options, swatches]
  );

  const handlePreview = useCallback(() => {
    if (!suggested) return;
    onPreview({
      tokens: suggested.tokens,
      narrative: suggested.narrative,
      swatches,
    });
  }, [onPreview, suggested, swatches]);

  const handleSave = useCallback(() => {
    if (!suggested || !onSave) return;
    onSave({
      tokens: suggested.tokens,
      narrative: suggested.narrative,
      swatches,
    });
  }, [onSave, suggested, swatches]);

  const handleExport = useCallback(() => {
    if (!suggested) return;
    const payload = JSON.stringify(suggested.tokens, null, 2);
    navigator.clipboard.writeText(payload).then(
      () => toast.success("Tokens copied to clipboard."),
      () => toast.error("Clipboard unavailable.")
    );
  }, [suggested]);

  const resetUpload = () => {
    setUpload(null);
    setSwatches([]);
    setSuggested(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canExtract = Boolean(upload?.payload) && !isExtracting;

  const swatchGrid = useMemo(
    () =>
      swatches.map((swatch) => (
        <button
          key={swatch.hex}
          type="button"
          className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface/70 px-4 py-3 text-left"
          onClick={() => {
            navigator.clipboard.writeText(swatch.hex);
            toast.success(`Copied ${swatch.hex}`);
          }}
        >
          <span className="flex items-center gap-3">
            <span
              className="h-10 w-10 rounded-xl border border-border/40 shadow-inner"
              style={{ backgroundColor: swatch.hex }}
            />
            <span className="text-sm font-semibold text-foreground">{swatch.hex}</span>
          </span>
          <span className="text-xs text-foreground/60">{(swatch.share * 100).toFixed(1)}%</span>
        </button>
      )),
    [swatches]
  );

  const systemPaletteColors = useMemo(() => {
    if (!suggested) return [];
    const { tokens } = suggested;
    return [
      { label: "Primary", hex: tokens.primary },
      { label: "Secondary", hex: tokens.secondary },
      { label: "Accent", hex: tokens.accent },
    ].filter((item) => typeof item.hex === "string" && item.hex);
  }, [suggested]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-glow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-foreground/40">Image Extractor</p>
            <h2 className="text-2xl font-semibold text-foreground">Upload an image to ground your palette.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
            >
              <Upload className="h-4 w-4" />
              Upload Image
            </button>
            <button
              type="button"
              onClick={resetUpload}
              className="flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm text-foreground/70 transition hover:bg-background/40"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          hidden
          onChange={(event) => handleFile(event.target.files?.[0])}
        />

        {upload ? (
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/30 p-4 sm:flex-row sm:items-center">
            <NextImage
              src={upload.previewUrl}
              alt={upload.name}
              width={128}
              height={128}
              className="h-32 w-full rounded-xl object-cover sm:w-32"
            />
            <div className="flex-1 space-y-2 text-sm text-foreground/70">
              <p className="font-semibold text-foreground">{upload.name}</p>
              <p>{(upload.size / 1024).toFixed(1)} KB</p>
              <p className="text-xs text-foreground/50">Ready to extract {options.colorCount} colors.</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/60 bg-background/30 px-6 py-12 text-center text-foreground/60">
            <Camera className="h-10 w-10 text-foreground/40" />
            <p className="text-sm">Drop an image here or click Upload to get started.</p>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Toggle
            label="Ignore highlights & shadows"
            value={options.ignoreExtremes}
            onChange={(next) => setOptions((prev) => ({ ...prev, ignoreExtremes: next }))}
          />
          <Toggle
            label="Skin-tone guard"
            value={options.skinToneGuard}
            onChange={(next) => setOptions((prev) => ({ ...prev, skinToneGuard: next }))}
          />
          <Toggle
            label="Require AA contrast"
            value={options.requireAA}
            onChange={(next) => setOptions((prev) => ({ ...prev, requireAA: next }))}
          />
          <div className="rounded-2xl border border-border/60 bg-surface/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Color count</p>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={3}
                max={8}
                value={options.colorCount}
                onChange={(event) =>
                  setOptions((prev) => ({ ...prev, colorCount: Number(event.target.value) }))
                }
                className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-accent"
              />
              <span className="text-sm font-semibold text-foreground">{options.colorCount}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!canExtract}
            onClick={handleExtract}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition",
              canExtract
                ? "bg-accent text-white shadow-glow hover:-translate-y-0.5"
                : "bg-muted/30 text-foreground/50"
            )}
          >
            {isExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Extract colors
          </button>
        </div>
      </div>

      {swatches.length > 0 && (
        <div className="space-y-6 rounded-3xl border border-border/60 bg-surface/90 p-6 shadow-glow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Extracted palette</p>
              <h3 className="text-xl font-semibold text-foreground">
                {suggested?.narrative ?? "Fresh palette from your image"}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Warmer", "Cooler", "More muted", "Higher contrast"].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (label === "Warmer") handleAdjust({ warmth: 1 });
                    if (label === "Cooler") handleAdjust({ warmth: -1 });
                    if (label === "More muted") handleAdjust({ mute: 1 });
                    if (label === "Higher contrast") handleAdjust({ contrast: 1 });
                  }}
                  className="rounded-full border border-border/50 px-4 py-2 text-xs font-medium text-foreground/80 transition hover:bg-background/50"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">{swatchGrid}</div>

          {suggested && (
            <div className="space-y-5 rounded-[32px] border border-border/60 bg-background/50 p-6 shadow-glow">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">System palette</p>
                  <h4 className="text-lg font-semibold text-foreground">
                    Cohesive roles, ready for your UI.
                  </h4>
                </div>
                <span className="rounded-full border border-border/50 px-3 py-1 text-xs font-medium text-foreground/70">
                  {systemPaletteColors.length} roles
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {systemPaletteColors.map((role) => (
                  <button
                    key={role.label}
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(role.hex);
                      toast.success(`Copied ${role.hex}`);
                    }}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-surface/80 p-4 text-center transition hover:-translate-y-0.5 hover:border-accent/40"
                  >
                    <span
                      className="h-24 w-full rounded-2xl border border-border/40 shadow-inner"
                      style={{ backgroundColor: role.hex }}
                    />
                    <span className="text-sm font-semibold text-foreground">{role.hex}</span>
                    <span className="text-[11px] uppercase tracking-[0.35em] text-foreground/60">
                      {role.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-border/60 bg-surface/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Neutral ramp</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggested.tokens.neutral.map((neutral) => (
                    <button
                      key={neutral}
                      type="button"
                      className="flex items-center gap-2 rounded-2xl border border-border/40 bg-background/50 px-3 py-2 text-xs font-semibold text-foreground/70 transition hover:border-accent/40"
                      onClick={() => {
                        navigator.clipboard.writeText(neutral);
                        toast.success(`Copied ${neutral}`);
                      }}
                    >
                      <span
                        className="h-6 w-6 rounded-full border border-border/40"
                        style={{ backgroundColor: neutral }}
                      />
                      {neutral}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
                >
                  <Plus className="h-4 w-4" />
                  Preview
                </button>
                {onSave && (
                  <button
                    type="button"
                    disabled={!canSave}
                    onClick={handleSave}
                    className={cn(
                      "flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm transition",
                      canSave
                        ? "text-foreground hover:bg-accent/15"
                        : "text-foreground/40"
                    )}
                  >
                    <Sparkles className="h-4 w-4" />
                    Save palette
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm text-foreground/80 transition hover:bg-background/50"
                >
                  <Upload className="h-4 w-4" />
                  Export tokens
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
