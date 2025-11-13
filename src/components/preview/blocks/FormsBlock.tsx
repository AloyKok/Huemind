"use client";

import { autoTextOn } from "@/lib/themeSafety";

import type { BlockProps } from "./ButtonsBlock";
import { densityUnit } from "./ButtonsBlock";

export const FormsBlock = ({ tokens, mode }: BlockProps) => {
  const fieldBg = mode === "light" ? tokens.surface.raised : tokens.neutral[2] ?? tokens.surface.sunken;
  const fieldText = autoTextOn(fieldBg, tokens);
  const formBg = mode === "light" ? tokens.surface.base : tokens.neutral[1] ?? tokens.surface.sunken;
  const focusRing = `${tokens.accent}66`;

  return (
    <section id="forms" className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--hm-text-muted)]">Sample forms</p>
        <p className="text-base text-[var(--hm-text)]">Placeholder fields demonstrating inputs, selects, and buttons.</p>
      </div>
      <form
        className="space-y-4 rounded-3xl border"
        style={{ borderColor: tokens.outline, backgroundColor: formBg, padding: densityUnit(1.5) }}
      >
        <input
          className="w-full rounded-2xl border text-sm shadow-sm focus:border-transparent focus:outline-none"
          placeholder="Sample text input"
          style={{
            borderColor: tokens.outline,
            backgroundColor: fieldBg,
            color: fieldText,
            padding: `${densityUnit(0.9)} ${densityUnit(1.25)}`,
            boxShadow: `0 0 0 1px ${tokens.outline}`,
          }}
        />
        <select
          className="w-full rounded-2xl border text-sm"
          style={{
            borderColor: tokens.outline,
            backgroundColor: fieldBg,
            color: fieldText,
            padding: `${densityUnit(0.9)} ${densityUnit(1.25)}`,
          }}
        >
          <option>Sample select option</option>
        </select>
        <div className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-5 w-5 rounded border" style={{ borderColor: tokens.outline, accentColor: tokens.primary }} />
          <span>Sample checkbox label</span>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <span>Sample toggle</span>
          <input type="checkbox" className="h-5 w-10 rounded-full border" style={{ accentColor: tokens.accent }} />
        </label>
        <textarea
          className="w-full rounded-2xl border text-sm"
          rows={3}
          placeholder="Sample textarea placeholder"
          style={{
            borderColor: tokens.outline,
            backgroundColor: fieldBg,
            color: fieldText,
            padding: `${densityUnit(0.9)} ${densityUnit(1.25)}`,
          }}
        />
        <p className="text-xs text-[var(--hm-text-muted)]">Sample helper text for error messaging.</p>
        <button
          type="submit"
          className="rounded-full px-4 py-2 text-sm font-semibold transition"
          style={{
            backgroundColor: tokens.primary,
            color: autoTextOn(tokens.primary, tokens),
            padding: `${densityUnit(0.85)} ${densityUnit(1.4)}`,
            boxShadow: `0 0 0 2px ${focusRing}`,
          }}
        >
          Submit sample
        </button>
      </form>
    </section>
  );
};
