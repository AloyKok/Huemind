"use client";

import { autoTextOn, ensureButtonPrimary, tone, Tokens } from "@/lib/themeSafety";

export type BlockProps = {
  tokens: Tokens;
  mode: "light" | "dark";
};

export const densityUnit = (value: number) => `calc(var(--hm-density, 1) * ${value}rem)`;

const buttonBase = "rounded-full text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export const ButtonsBlock = ({ tokens, mode }: BlockProps) => {
  const primaryBg = ensureButtonPrimary(tokens.primary, mode);
  const primaryFg = autoTextOn(primaryBg, tokens);
  const secondaryBorder = tokens.accent;
  const secondaryText = tokens.accent;
  const ghostBg = mode === "light" ? tone(tokens.surface.base, 0.02) : tone(tokens.neutral[2] ?? tokens.surface.sunken, 0.02);
  const ghostText = autoTextOn(ghostBg, tokens);
  const baseShadow = mode === "light" ? tokens.neutral[2] ?? tokens.surface.sunken : tokens.neutral[0] ?? "#000000";
  const shadowColor = `${baseShadow}${mode === "light" ? "29" : "80"}`;

  return (
    <section id="buttons" className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--hm-text-muted)]">Sample buttons</p>
        <p className="text-base text-[var(--hm-text)]">Placeholder controls demonstrating your palette application.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <button
          type="button"
          className={`${buttonBase} shadow-sm hover:-translate-y-0.5 hover:shadow-lg`}
          style={{
            backgroundColor: primaryBg,
            color: primaryFg,
            padding: `${densityUnit(0.75)} ${densityUnit(1.25)}`,
            fontSize: densityUnit(0.85),
            boxShadow: `0 18px 35px ${shadowColor}`,
          }}
        >
          This is a button
        </button>
        <button
          type="button"
          className={`${buttonBase} border`}
          style={{
            borderColor: secondaryBorder,
            color: secondaryText,
            padding: `${densityUnit(0.75)} ${densityUnit(1.25)}`,
            fontSize: densityUnit(0.85),
            backgroundColor: mode === "light" ? "transparent" : tone(tokens.neutral[2] ?? tokens.surface.sunken, -0.02),
          }}
        >
          Sample outline button
        </button>
        <button
          type="button"
          className={`${buttonBase} border opacity-80 hover:opacity-100`}
          style={{
            borderColor: tokens.outline,
            color: ghostText,
            backgroundColor: ghostBg,
            padding: `${densityUnit(0.75)} ${densityUnit(1.25)}`,
            fontSize: densityUnit(0.85),
          }}
        >
          Ghost button text
        </button>
      </div>
    </section>
  );
};
