"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import { motion } from "framer-motion";

import { autoTextOn, tone } from "@/lib/themeSafety";
import type { Tokens } from "@/lib/themeSafety";
import { cssVarsFromTokens } from "@/lib/cssVars";
import { ButtonsBlock } from "@/components/preview/blocks/ButtonsBlock";
import { NavbarsBlock } from "@/components/preview/blocks/NavbarsBlock";
import { HeroesBlock } from "@/components/preview/blocks/HeroesBlock";
import { ContentBlock } from "@/components/preview/blocks/ContentBlock";
import { PricingBlock } from "@/components/preview/blocks/PricingBlock";
import { TabsBlock } from "@/components/preview/blocks/TabsBlock";
import { FormsBlock } from "@/components/preview/blocks/FormsBlock";
import { FootersBlock } from "@/components/preview/blocks/FootersBlock";

export type SparkGalleryPreviewProps = {
  tokens: Tokens;
  mode?: "light" | "dark";
};

const sectionsOrder = [
  { id: "buttons", label: "Buttons" },
  { id: "navbars", label: "Navbars" },
  { id: "heroes", label: "Heroes" },
  { id: "content", label: "Content" },
  { id: "pricing", label: "Pricing" },
  { id: "tabs", label: "Tabs" },
  { id: "forms", label: "Forms" },
  { id: "footers", label: "Footers" },
];

export const SparkGalleryPreview = ({ tokens, mode = "light" }: SparkGalleryPreviewProps) => {
  const [activeSection, setActiveSection] = useState<string>(sectionsOrder[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    const elements = sectionsOrder
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is Element => Boolean(el));
    elements.forEach((el) => observer.observe(el));
    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  const densityScale = 1;

  const rootStyles = useMemo(() => {
    const isLight = mode === "light";
    const baseSurface = isLight ? tokens.surface.base : tokens.neutral[1] ?? tokens.surface.sunken;
    const raisedSurface = isLight ? tokens.surface.raised : tokens.neutral[2] ?? tokens.surface.sunken;
    const sunkenSurface = isLight ? tokens.surface.sunken : tokens.neutral[0] ?? tokens.surface.sunken;
    const textPrimary = isLight ? tokens.text.primary : tokens.text.inverted;
    const textMuted = isLight ? tokens.text.muted : tone(tokens.text.inverted, -0.2);

    return {
      ...cssVarsFromTokens(tokens),
      "--hm-surface-base": baseSurface,
      "--hm-surface-raised": raisedSurface,
      "--hm-surface-sunken": sunkenSurface,
      "--hm-text": textPrimary,
      "--hm-text-muted": textMuted,
      "--hm-density": densityScale.toString(),
      backgroundColor: baseSurface,
      color: textPrimary,
    } as CSSProperties;
  }, [tokens, mode, densityScale]);

  const isLightMode = mode === "light";
  const controlSurface = isLightMode ? tokens.surface.raised : tokens.neutral[2] ?? tokens.surface.sunken;
  const subtleSurface = isLightMode ? tokens.surface.base : tokens.neutral[1] ?? tokens.surface.sunken;
  const controlText = autoTextOn(controlSurface, tokens, isLightMode ? "primary" : "inverted");
  const accentText = autoTextOn(tokens.accent, tokens, "inverted");

  const blockMap: Record<string, JSX.Element> = {
    buttons: <ButtonsBlock tokens={tokens} mode={mode} />,
    navbars: <NavbarsBlock tokens={tokens} mode={mode} />,
    heroes: <HeroesBlock tokens={tokens} mode={mode} />,
    content: <ContentBlock tokens={tokens} mode={mode} />,
    pricing: <PricingBlock tokens={tokens} mode={mode} />,
    tabs: <TabsBlock tokens={tokens} mode={mode} />,
    forms: <FormsBlock tokens={tokens} mode={mode} />,
    footers: <FootersBlock tokens={tokens} mode={mode} />,
  };

  return (
    <div className="flex gap-6">
      <aside
        className="sticky top-6 hidden min-w-[160px] flex-col gap-2 rounded-2xl border p-4 text-sm shadow-sm lg:flex"
        style={{ backgroundColor: controlSurface, borderColor: tokens.outline, color: controlText }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--hm-text-muted)]">Sections</p>
        {sectionsOrder.map(({ id, label }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => {
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="rounded-full px-3 py-1 text-left text-sm transition hover:opacity-80"
              style={{
                backgroundColor: isActive ? tokens.accent : "transparent",
                color: isActive ? accentText : controlText,
              }}
            >
              {label}
            </button>
          );
        })}
      </aside>
      <section className="flex-1 space-y-6" style={rootStyles}>
        <motion.div
          variants={sectionMotion}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.2 }}
          className="rounded-2xl border p-4 shadow-sm backdrop-blur"
          style={{ borderColor: tokens.outline, backgroundColor: controlSurface }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm" style={{ color: controlText }}>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--hm-text-muted)]">Sample preview</p>
              <h2 className="text-lg font-semibold text-[var(--hm-text)]">Sample Component Showcase</h2>
              <p className="text-xs text-[var(--hm-text-muted)]">Placeholder copy showcasing your palette.</p>
            </div>
          </div>
        </motion.div>
        <div className="space-y-12 pb-12" style={{ backgroundColor: subtleSurface }}>
          {sectionsOrder.map(({ id }) => (
            <motion.div
              key={id}
              variants={sectionMotion}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.2 }}
            >
              {blockMap[id]}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const sectionMotion = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
