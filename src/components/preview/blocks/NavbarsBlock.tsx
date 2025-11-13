"use client";

import { autoTextOn, tone } from "@/lib/themeSafety";

import type { BlockProps } from "./ButtonsBlock";
import { densityUnit } from "./ButtonsBlock";

export const NavbarsBlock = ({ tokens, mode }: BlockProps) => {
  const solidBg = mode === "light" ? tokens.surface.base : tokens.neutral[1] ?? tokens.surface.sunken;
  const solidText = autoTextOn(solidBg, tokens);
  const translucentBg = `${solidBg}dd`;
  const translucentText = autoTextOn(solidBg, tokens);
  const secondaryBg = tone(tokens.surface.base, mode === "light" ? 0.02 : -0.04);
  const secondaryText = autoTextOn(secondaryBg, tokens);

  return (
    <section id="navbars" className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--hm-text-muted)]">Sample navigation</p>
        <p className="text-base text-[var(--hm-text)]">Placeholder navbars showing brand, links, and actions.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <nav
          className="rounded-2xl border px-4"
          style={{ backgroundColor: solidBg, borderColor: tokens.outline, color: solidText, padding: densityUnit(0.75) }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm font-semibold">Sample Logo</span>
            <div className="flex items-center gap-4 text-sm">
              {["This is a link", "Sample link", "Placeholder"].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="transition hover:text-[var(--hm-accent)] hover:underline"
                >
                  {label}
                </a>
              ))}
            </div>
            <button
              type="button"
              className="rounded-full px-4 py-2 text-xs font-semibold"
              style={{ backgroundColor: tokens.primary, color: autoTextOn(tokens.primary, tokens) }}
            >
              Sample button
            </button>
          </div>
        </nav>
        <nav
          className="rounded-2xl border px-4"
          style={{
            backgroundColor: translucentBg,
            borderColor: tokens.outline,
            backdropFilter: "blur(12px)",
            color: translucentText,
            padding: densityUnit(0.75),
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm font-semibold">Translucent Sample</span>
            <div className="flex items-center gap-3 text-xs">
              {["Sample item", "This is a link", "Help"].map((item) => (
                <a key={item} href="#" className="transition hover:text-[var(--hm-accent)] hover:underline">
                  {item}
                </a>
              ))}
            </div>
            <button
              type="button"
              className="rounded-full border px-4 py-2 text-xs"
              style={{ borderColor: tokens.outline, color: secondaryText, backgroundColor: secondaryBg }}
            >
              Secondary action
            </button>
          </div>
        </nav>
      </div>
    </section>
  );
};
