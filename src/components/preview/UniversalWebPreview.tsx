"use client";

import { motion } from "framer-motion";

import { cssVarsFromTokens } from "@/lib/cssVars";
import {
  Tokens,
  autoTextOn,
  ensureButtonPrimary,
  neutralBackgroundFor,
  raisedSurfaceFor,
} from "@/lib/themeSafety";
import { cn } from "@/lib/utils";

type Props = {
  tokens: Tokens;
  mode?: "light" | "dark";
  className?: string;
};

const sections = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const navLinks = ["Nav Link", "Menu Item", "Sample CTA"];

const featureBullets = [
  "Sample feature description text",
  "Placeholder copy can live here",
  "This is a label for a benefit",
  "Another sample bullet for the UI",
];

const pricingPlans = [
  {
    title: "Plan Alpha",
    price: "$18",
    description: "Sample description for this tier",
    highlight: false,
    features: ["Sample bullet", "Placeholder text", "Another feature"],
  },
  {
    title: "Plan Beta",
    price: "$48",
    description: "Use this line for key messaging",
    highlight: true,
    features: ["Sample capability", "Generic benefit", "Lorem ipsum"],
  },
  {
    title: "Plan Gamma",
    price: "Custom",
    description: "Placeholder enterprise copy",
    highlight: false,
    features: ["Sample bullet", "Additional text", "Extra placeholder"],
  },
];

const footerLinks = ["Footer Link", "Sample Link", "Placeholder", "Support"];

export const UniversalWebPreview = ({ tokens, mode = "light", className }: Props) => {
  const pageBg = mode === "light" ? tokens.surface.base : neutralBackgroundFor(tokens, "dark");
  const cardBg = raisedSurfaceFor(tokens, mode);
  const navBg = mode === "light" ? tokens.surface.base : tokens.neutral[1] ?? tokens.surface.sunken;
  const textColor = mode === "light" ? tokens.text.primary : tokens.text.inverted;
  const mutedColor = mode === "light" ? tokens.text.muted : tokens.text.inverted + "CC";
  const footerBg = mode === "light" ? tokens.neutral[9] ?? cardBg : tokens.neutral[1] ?? cardBg;

  const primaryBtnBg = ensureButtonPrimary(tokens.primary, mode);
  const primaryBtnText = autoTextOn(primaryBtnBg, tokens);
  const ghostHover = mode === "light" ? tokens.neutral[9] ?? cardBg : tokens.neutral[2] ?? cardBg;

  return (
    <section
      className={cn("flex flex-col gap-10 px-4 py-8 sm:px-8", className)}
      style={{ ...cssVarsFromTokens(tokens), backgroundColor: pageBg, color: textColor }}
    >
      {/* Navbar */}
      <motion.header
        variants={sections}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.18 }}
        className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border px-4 py-4 sm:px-6"
        style={{ borderColor: tokens.outline, backgroundColor: navBg }}
      >
        <span className="text-lg font-semibold">HueMind</span>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              className="relative pb-1 text-[color:var(--hm-text)] transition hover:text-[var(--hm-accent)]"
              href="#"
            >
              {link}
              <span className="absolute inset-x-0 bottom-0 h-px scale-x-0 bg-[var(--hm-accent)] transition group-hover:scale-x-100" />
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="rounded-full px-4 py-2 text-sm font-medium transition"
          style={{ backgroundColor: primaryBtnBg, color: primaryBtnText }}
        >
          Sample button
        </button>
      </motion.header>

      {/* Features / hero block */}
      <motion.section
        variants={sections}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.18, delay: 0.05 }}
        className="mx-auto grid w-full max-w-6xl gap-8 rounded-[32px] border p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_320px]"
        style={{ borderColor: tokens.outline, backgroundColor: tokens.surface.base }}
      >
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: tokens.accent }}>
            Sample eyebrow text
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl" style={{ color: textColor }}>
            This is a placeholder hero headline using your palette.
          </h1>
          <p className="text-base" style={{ color: mutedColor }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Use this copy to preview long-form text.
          </p>
          <div className="space-y-3 text-sm" style={{ color: mutedColor }}>
            {featureBullets.map((bullet) => (
              <p key={bullet} className="flex items-center gap-3">
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs"
                  style={{ borderColor: tokens.accent, color: tokens.accent }}
                >
                  ✓
                </span>
                {bullet}
              </p>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              className="rounded-full px-4 py-2 font-semibold transition"
              style={{ backgroundColor: primaryBtnBg, color: primaryBtnText, boxShadow: "0 18px 45px rgba(15,17,23,0.12)" }}
            >
              Primary button
            </button>
            <button
              type="button"
              className="rounded-full border px-4 py-2 font-medium transition"
              style={{ borderColor: tokens.secondary, color: tokens.secondary, backgroundColor: ghostHover }}
            >
              Ghost button
            </button>
            <button
              type="button"
              className="rounded-full border px-4 py-2 text-sm font-medium transition hover:text-[var(--hm-accent)]"
              style={{ borderColor: "transparent", color: tokens.accent }}
            >
              This is a link →
            </button>
          </div>
        </div>
        <div
          className="rounded-[28px] border p-5"
          style={{ borderColor: tokens.outline, backgroundColor: cardBg }}
        >
          <div className="space-y-4 text-sm" style={{ color: textColor }}>
            <div className="rounded-2xl border p-4" style={{ borderColor: tokens.outline }}>
              <p className="text-xs" style={{ color: mutedColor }}>
                Surface sample
              </p>
              <p className="mt-1 font-semibold">{tokens.surface.base}</p>
            </div>
            <div className="rounded-2xl border p-4" style={{ borderColor: tokens.outline }}>
              <p className="text-xs" style={{ color: mutedColor }}>
                Button example
              </p>
              <p className="mt-1 font-semibold">{tokens.secondary}</p>
            </div>
            <div className="rounded-2xl border p-4" style={{ borderColor: tokens.outline }}>
              <p className="text-xs" style={{ color: mutedColor }}>
                Accent text
              </p>
              <p className="mt-1 font-semibold">{tokens.accent}</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Pricing */}
      <motion.section
        variants={sections}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.18, delay: 0.08 }}
        className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-3"
      >
        {pricingPlans.map((plan, index) => {
          const palette = [tokens.primary, tokens.secondary, tokens.accent];
          const tierColor = plan.highlight ? tokens.accent : palette[index % palette.length];
          const buttonBg = ensureButtonPrimary(tierColor, mode);
          const buttonText = autoTextOn(buttonBg, tokens);
          return (
            <article
              key={plan.title}
              className={cn(
                "rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-2xl",
                plan.highlight && "shadow-[0_18px_60px_rgba(168,85,247,0.25)]"
              )}
              style={{ borderColor: plan.highlight ? tokens.accent : tokens.outline, backgroundColor: cardBg }}
            >
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: mutedColor }}>
                {plan.title}
              </p>
              <p className="mt-4 text-3xl font-semibold" style={{ color: textColor }}>
                {plan.price}
                <span className="text-base font-normal" style={{ color: mutedColor }}>
                  {plan.price !== "Custom" ? "/mo" : ""}
                </span>
              </p>
              <p className="text-sm" style={{ color: mutedColor }}>
                {plan.description}
              </p>
              <div className="mt-4 space-y-2 text-sm" style={{ color: textColor }}>
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
                className="mt-6 w-full rounded-full px-4 py-2 text-sm font-semibold transition"
                style={{ backgroundColor: buttonBg, color: buttonText }}
              >
                Choose plan
              </button>
            </article>
          );
        })}
      </motion.section>

      {/* Footer */}
      <motion.footer
        variants={sections}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.18, delay: 0.1 }}
        className="mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-2xl border p-6 text-sm md:flex-row md:items-center md:justify-between"
        style={{ borderColor: tokens.outline, backgroundColor: footerBg, color: textColor }}
      >
        <p>© {new Date().getFullYear()} HueMind. Built for palettes that ship.</p>
        <div className="flex flex-wrap gap-4" style={{ color: mutedColor }}>
          {footerLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="transition hover:text-[var(--hm-accent)] hover:underline"
            >
              {link}
            </a>
          ))}
        </div>
      </motion.footer>
    </section>
  );
};
