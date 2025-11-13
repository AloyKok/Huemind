"use client";

import { FormEvent, useState } from "react";

import { ArrowUp, Save, MoonStar, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

type PromptBarProps = {
  onSubmit: (prompt: string) => Promise<void> | void;
  isGenerating?: boolean;
  previewTheme: "dark" | "light";
  onTogglePreviewTheme: () => void;
  onSave?: () => void;
  canSave?: boolean;
};

export const PromptBar = ({
  onSubmit,
  isGenerating,
  previewTheme,
  onTogglePreviewTheme,
  onSave,
  canSave,
}: PromptBarProps) => {
  const [value, setValue] = useState(
    "Generate a color palette with warm minimalism in mind"
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim() || isGenerating) return;
    try {
      await Promise.resolve(onSubmit(value.trim()));
      setValue("");
    } catch (error) {
      console.error("Prompt submission failed", error);
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 flex justify-center bg-gradient-to-t from-background via-background/90 via-25% to-transparent pb-8 pt-12 lg:left-[18rem]">
      <div className="pointer-events-auto w-full max-w-5xl space-y-3 px-4 sm:px-0">
        <div className="flex items-center justify-end gap-3 text-xs text-foreground/60">
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-full border border-border/40 px-3 py-1.5 transition",
              previewTheme === "dark"
                ? "bg-accent/15 text-foreground"
                : "bg-background/80 hover:bg-muted/70 text-foreground"
            )}
            onClick={onTogglePreviewTheme}
          >
            {previewTheme === "dark" ? (
              <MoonStar className="h-3.5 w-3.5" />
            ) : (
              <Sun className="h-3.5 w-3.5" />
            )}
            {previewTheme === "dark" ? "Dark" : "Light"}
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/80 px-4 py-4 shadow-glow backdrop-blur-xl"
        >
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={!canSave}
              className={cn(
                "absolute -left-16 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-surface text-foreground shadow-lg transition",
                canSave ? "hover:bg-accent/15" : "cursor-not-allowed text-foreground/40"
              )}
            >
              <Save className="h-5 w-5" />
            </button>
          )}
          <input
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
            placeholder="Generate a color palette with [mood/keyword] in mind"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button
            type="submit"
            disabled={isGenerating}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full bg-accent text-background transition",
              "hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
