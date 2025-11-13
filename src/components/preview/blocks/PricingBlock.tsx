"use client";

import { autoTextOn, ensureButtonPrimary } from "@/lib/themeSafety";

import type { BlockProps } from "./ButtonsBlock";
import { densityUnit } from "./ButtonsBlock";

const plans = [
  {
    name: "Sample Plan One",
    price: "$18",
    highlight: false,
    features: ["Sample bullet", "Placeholder text", "Another line"],
  },
  {
    name: "Sample Plan Two",
    price: "$48",
    highlight: true,
    features: ["Sample benefit", "Lorem ipsum", "Additional copy"],
  },
  {
    name: "Sample Plan Three",
    price: "Custom",
    highlight: false,
    features: ["Enterprise detail", "Placeholder", "Support text"],
  },
];

export const PricingBlock = ({ tokens, mode }: BlockProps) => {
  const cardBg = mode === "light" ? tokens.surface.raised : tokens.neutral[2] ?? tokens.surface.sunken;
  const cardText = autoTextOn(cardBg, tokens);

  return (
    <section id="pricing" className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--hm-text-muted)]">Sample pricing</p>
        <p className="text-base text-[var(--hm-text)]">Placeholder tiers highlighting your palette accents.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan, index) => {
          const palette = [tokens.primary, tokens.secondary, tokens.accent];
          const tierColor = plan.highlight ? tokens.accent : palette[index % palette.length];
          const buttonBg = ensureButtonPrimary(tierColor, mode);
          const buttonText = autoTextOn(buttonBg, tokens);
          return (
            <article
              key={plan.name}
              className="rounded-2xl border transition hover:-translate-y-1 hover:shadow-2xl"
              style={{
                borderColor: plan.highlight ? tokens.accent : tokens.outline,
                backgroundColor: cardBg,
                color: cardText,
                padding: densityUnit(1.5),
              }}
            >
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: tokens.text.muted }}>
                {plan.name}
              </p>
              <p className="mt-4 text-3xl font-semibold">
                {plan.price}
                {plan.price !== "Custom" && <span className="text-base font-normal">/mo</span>}
              </p>
              <div className="mt-4 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs"
                      style={{ backgroundColor: `${tokens.success}22`, color: tokens.success }}
                    >
                      ✓
                    </span>
                    {feature}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-6 w-full rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
                style={{
                  backgroundColor: buttonBg,
                  color: buttonText,
                  padding: `${densityUnit(0.75)} ${densityUnit(1.25)}`,
                }}
              >
                Choose plan
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};
