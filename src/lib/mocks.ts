import { contrastRatio, getAccessibilityGrade } from "./color-utils";
import type { PaletteCard } from "./types";

const prompt = "Luxury skincare brand, warm minimalism";

const buildAccessibility = (hex: string) => {
  const ratio = contrastRatio(hex, "#0f1117");
  return {
    grade: getAccessibilityGrade(ratio),
    contrastAgainstBackground: ratio,
  } as const;
};

export const mockPalettes: PaletteCard[] = [
  {
    id: "sunrise-serum",
    name: "Sunrise Serum",
    narrative: "Warm optimism with clean luxury for elevated skincare moments.",
    colors: [
      { hex: "#F2D6B3", label: "Champagne Foam", role: "primary" },
      { hex: "#E89F71", label: "Amber Silk", role: "accent" },
      { hex: "#C67B5B", label: "Terracotta Veil", role: "secondary" },
      { hex: "#8C4A3E", label: "Cedar Clove" },
      { hex: "#FDF5ED", label: "Feather Mist" },
    ],
    neutrals: [
      { hex: "#191D26", label: "Night Slate", role: "neutral" },
      { hex: "#212633", label: "Halo Graphite", role: "neutral" },
      { hex: "#3A4252", label: "Moon Alloy", role: "neutral" },
    ],
    accessibility: buildAccessibility("#FDF5ED"),
    sourcePrompt: prompt,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lilac-luminary",
    name: "Lilac Luminary",
    narrative: "Soft florals meet futuristic glow for boutique wellness.",
    colors: [
      { hex: "#E7D5FF", label: "Opal Lilac", role: "primary" },
      { hex: "#B387F6", label: "Aurora Orchid", role: "accent" },
      { hex: "#6C63FF", label: "Iris Pulse", role: "secondary" },
      { hex: "#252839", label: "Satellite Slate" },
      { hex: "#F6F8FF", label: "Cloud Glow" },
    ],
    neutrals: [
      { hex: "#151723", label: "Nebula Ink", role: "neutral" },
      { hex: "#1E2130", label: "Orbit Stone", role: "neutral" },
      { hex: "#32354A", label: "Cosmic Blue", role: "neutral" },
    ],
    accessibility: buildAccessibility("#F6F8FF"),
    sourcePrompt: prompt,
    createdAt: new Date().toISOString(),
  },
  {
    id: "velvet-halo",
    name: "Velvet Halo",
    narrative: "Deep violets contrast with luminous creams to command attention.",
    colors: [
      { hex: "#2E1A47", label: "Velvet Plum", role: "primary" },
      { hex: "#A855F7", label: "Electric Amethyst", role: "accent" },
      { hex: "#F1E4FF", label: "Gossamer Glow", role: "secondary" },
      { hex: "#FFD1A1", label: "Apricot Sheen" },
      { hex: "#FFE9D6", label: "Ivory Radiance" },
    ],
    neutrals: [
      { hex: "#10121A", label: "Quantum Black", role: "neutral" },
      { hex: "#1A1D29", label: "Graphene Gray", role: "neutral" },
      { hex: "#2B2F3F", label: "Ion Slate", role: "neutral" },
    ],
    accessibility: buildAccessibility("#FFE9D6"),
    sourcePrompt: prompt,
    createdAt: new Date().toISOString(),
  },
];
