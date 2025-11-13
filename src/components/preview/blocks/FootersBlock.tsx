"use client";

import { autoTextOn } from "@/lib/themeSafety";

import type { BlockProps } from "./ButtonsBlock";
import { densityUnit } from "./ButtonsBlock";

export const FootersBlock = ({ tokens }: BlockProps) => {
  const lightBg = tokens.neutral[9] ?? tokens.surface.raised;
  const darkBg = tokens.neutral[1] ?? tokens.surface.sunken;

  return (
    <section id="footers" className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--hm-text-muted)]">Footers</p>
        <p className="text-base text-[var(--hm-text)]">Light and dark footers with links and newsletter form.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[lightBg, darkBg].map((bg, index) => (
          <footer
            key={bg}
            className="rounded-3xl border"
            style={{ borderColor: tokens.outline, backgroundColor: bg, color: autoTextOn(bg, tokens), padding: densityUnit(1.5) }}
          >
            <p className="text-lg font-semibold">Sample footer {index + 1}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm opacity-80">
              {["This is a link", "Sample link", "Placeholder", "Contact"].map((link) => (
                <a key={link} href="#" className="transition hover:text-[var(--hm-accent)] hover:underline">
                  {link}
                </a>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                className="flex-1 rounded-full border text-sm"
                placeholder="Email address"
                style={{
                  borderColor: tokens.outline,
                  backgroundColor: index === 0 ? tokens.surface.base : tokens.neutral[2] ?? tokens.surface.sunken,
                  color: autoTextOn(index === 0 ? tokens.surface.base : tokens.neutral[2] ?? tokens.surface.sunken, tokens),
                  padding: `${densityUnit(0.85)} ${densityUnit(1.25)}`,
                }}
              />
              <button
                type="button"
                className="rounded-full px-4 py-2 text-sm font-semibold"
                style={{
                  backgroundColor: tokens.accent,
                  color: autoTextOn(tokens.accent, tokens),
                  padding: `${densityUnit(0.85)} ${densityUnit(1.5)}`,
                }}
              >
                Subscribe
              </button>
            </div>
            <p className="mt-4 text-xs opacity-70">© {new Date().getFullYear()} Sample company. Placeholder legal copy.</p>
          </footer>
        ))}
      </div>
    </section>
  );
};
