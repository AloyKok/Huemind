"use client";

import { autoTextOn, ensureButtonPrimary } from "@/lib/themeSafety";

import type { BlockProps } from "./ButtonsBlock";
import { densityUnit } from "./ButtonsBlock";

export const HeroesBlock = ({ tokens, mode }: BlockProps) => {
  const gradientBg = `linear-gradient(135deg, ${tokens.primary}dd, ${tokens.secondary}dd)`;
  const neutralBg = mode === "light" ? tokens.surface.base : tokens.neutral[2] ?? tokens.surface.sunken;
  const neutralText = autoTextOn(neutralBg, tokens);

  return (
    <section id="heroes" className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--hm-text-muted)]">Sample heroes</p>
        <p className="text-base text-[var(--hm-text)]">Placeholder hero sections with sample copy and media.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div
          className="rounded-[32px] border"
          style={{ borderColor: tokens.outline, background: gradientBg, color: autoTextOn(tokens.primary, tokens) }}
        >
          <div style={{ padding: densityUnit(1.5) }}>
            <p className="text-xs uppercase tracking-[0.3em] opacity-90">Sample gradient hero</p>
            <h2 className="mt-3 text-3xl font-semibold">This is a headline</h2>
            <p className="mt-2 text-sm opacity-85">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sample filler text for palette testing.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <button
                type="button"
                className="rounded-full px-4 py-2 font-semibold"
                style={{
                  backgroundColor: ensureButtonPrimary(tokens.primary, mode),
                  color: autoTextOn(tokens.primary, tokens),
                  padding: `${densityUnit(0.75)} ${densityUnit(1.4)}`,
                }}
              >
                Sample CTA
              </button>
              <button
                type="button"
                className="rounded-full border px-4 py-2"
                style={{
                  borderColor: tokens.surface.base,
                  color: autoTextOn(tokens.surface.base, tokens),
                  padding: `${densityUnit(0.75)} ${densityUnit(1.4)}`,
                }}
              >
                Secondary action
              </button>
            </div>
            <div className="mt-6 h-32 rounded-2xl border border-dashed" style={{ borderColor: tokens.surface.base }}>
              <p className="p-4 text-xs uppercase tracking-[0.3em]">Media placeholder</p>
            </div>
          </div>
        </div>
        <div
          className="rounded-[32px] border"
          style={{ borderColor: tokens.outline, backgroundColor: neutralBg, color: neutralText }}
        >
          <div style={{ padding: densityUnit(1.5) }}>
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: tokens.accent }}>
              Sample hero block
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Headline with <span style={{ borderBottom: `3px solid ${tokens.accent}` }}>accent underline</span>
            </h2>
            <p className="mt-2 text-sm">
              Sample paragraph describing the value proposition. Lorem ipsum dolor sit amet et sapien.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-dashed p-4 text-sm" style={{ borderColor: tokens.outline }}>
                Image placeholder
              </div>
              <div className="rounded-2xl border border-dashed p-4 text-sm" style={{ borderColor: tokens.outline }}>
                Secondary media
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
