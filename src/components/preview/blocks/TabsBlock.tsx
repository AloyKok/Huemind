"use client";

import { autoTextOn } from "@/lib/themeSafety";

import type { BlockProps } from "./ButtonsBlock";
import { densityUnit } from "./ButtonsBlock";

const tabs = ["Sample tab", "Placeholder tab", "Another tab"];

export const TabsBlock = ({ tokens, mode }: BlockProps) => {
  const containerBg = mode === "light" ? tokens.surface.base : tokens.neutral[1] ?? tokens.surface.sunken;
  const panelBg = mode === "light" ? tokens.surface.raised : tokens.neutral[2] ?? tokens.surface.sunken;
  const panelText = autoTextOn(panelBg, tokens);

  return (
    <section id="tabs" className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--hm-text-muted)]">Sample tabs</p>
        <p className="text-base text-[var(--hm-text)]">Placeholder tab set with accent indicator and content.</p>
      </div>
      <div
        className="rounded-2xl border"
        style={{ borderColor: tokens.outline, backgroundColor: containerBg, padding: densityUnit(1.5) }}
      >
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab, index) => {
            const active = index === 0;
            return (
              <button
                key={tab}
                type="button"
                className="rounded-full border px-4 py-2 text-sm transition"
                style={{
                  borderColor: active ? tokens.accent : tokens.outline,
                  backgroundColor: active ? `${tokens.accent}22` : "transparent",
                  color: active ? tokens.accent : autoTextOn(containerBg, tokens),
                  padding: `${densityUnit(0.65)} ${densityUnit(1.25)}`,
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
        <div
          className="mt-4 rounded-2xl border text-sm"
          style={{
            borderColor: tokens.outline,
            backgroundColor: panelBg,
            color: panelText,
            padding: densityUnit(1.25),
          }}
        >
          <p className="font-semibold">Sample panel heading</p>
          <p className="mt-2 text-sm text-[var(--hm-text-muted)]">
            Lorem ipsum placeholder content for the selected tab. This is a block of sample copy.
          </p>
        </div>
      </div>
    </section>
  );
};
