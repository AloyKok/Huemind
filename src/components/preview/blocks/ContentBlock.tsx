"use client";

import { autoTextOn } from "@/lib/themeSafety";

import type { BlockProps } from "./ButtonsBlock";
import { densityUnit } from "./ButtonsBlock";

export const ContentBlock = ({ tokens, mode }: BlockProps) => {
  const cardBg = mode === "light" ? tokens.surface.raised : tokens.neutral[2] ?? tokens.surface.sunken;
  const cardText = autoTextOn(cardBg, tokens);
  const secondaryBg = mode === "light" ? tokens.surface.base : tokens.neutral[1] ?? tokens.surface.sunken;
  const secondaryText = autoTextOn(secondaryBg, tokens);

  return (
    <section id="content" className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--hm-text-muted)]">Sample content</p>
        <p className="text-base text-[var(--hm-text)]">Placeholder text/media compositions powered by your palette.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <article
          className="space-y-4 rounded-3xl border"
          style={{ borderColor: tokens.outline, backgroundColor: cardBg, color: cardText, padding: densityUnit(1.5) }}
        >
          <h3 className="text-xl font-semibold">Sample heading text</h3>
          <p className="text-sm opacity-80">
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Sample descriptive sentence for balance.
          </p>
          <div className="space-y-3 text-sm">
            {["Sample bullet text", "Another placeholder line", "This is a feature"].map((item) => (
              <p key={item} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tokens.accent }} />
                {item}
              </p>
            ))}
          </div>
          <a href="#" className="text-sm font-semibold text-[var(--hm-accent)] hover:underline">
            This is a link →
          </a>
        </article>
        <div
          className="space-y-4 rounded-3xl border"
          style={{ borderColor: tokens.outline, backgroundColor: secondaryBg, color: secondaryText, padding: densityUnit(1.5) }}
        >
          <div className="rounded-2xl border border-dashed text-sm" style={{ borderColor: tokens.outline, padding: densityUnit(1.25) }}>
            Media placeholder
          </div>
          <div
            className="rounded-2xl border text-sm"
            style={{ borderColor: tokens.outline, backgroundColor: cardBg, color: cardText, padding: densityUnit(1.25) }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--hm-text-muted)]">Sample card title</p>
            <p className="mt-2 text-sm">Placeholder descriptive text for cards using your neutral ramp.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
