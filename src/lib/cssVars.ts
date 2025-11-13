import type { Tokens } from "@/lib/themeSafety";

export const cssVarsFromTokens = (tokens: Tokens) => ({
  "--hm-primary": tokens.primary,
  "--hm-secondary": tokens.secondary,
  "--hm-accent": tokens.accent,
  "--hm-success": tokens.success,
  "--hm-warning": tokens.warning,
  "--hm-error": tokens.error,
  "--hm-surface-base": tokens.surface.base,
  "--hm-surface-raised": tokens.surface.raised,
  "--hm-surface-sunken": tokens.surface.sunken,
  "--hm-text": tokens.text.primary,
  "--hm-text-muted": tokens.text.muted,
  "--hm-text-inv": tokens.text.inverted,
  "--hm-outline": tokens.outline,
});
