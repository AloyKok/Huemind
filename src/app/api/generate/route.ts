import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";

import { contrastRatio, getAccessibilityGrade } from "@/lib/color-utils";
import { mockPalettes } from "@/lib/mocks";
import type { PaletteCard, PaletteColor } from "@/lib/types";
import { createRouteSupabaseClient } from "@/lib/supabase/route";
import { fetchUsageContext, incrementUsage } from "@/lib/usage";

console.log("[HueMind] OPENAI key detected?", Boolean(process.env.OPENAI_API_KEY));

type ContextEntry = {
  prompt?: string;
  paletteIds?: string[];
};

type AiPalettePayload = {
  name?: string;
  narrative?: string;
  colors?: Array<{ hex?: string; label?: string; role?: string }>;
  neutrals?: Array<{ hex?: string; label?: string }>;
};

type AiResponsePayload = {
  palettes?: AiPalettePayload[];
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_COLOR_MODEL ?? "gpt-4o-mini";
const openaiClient = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const SUPABASE_AVAILABLE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const HEX_REGEX = /^#?([0-9a-fA-F]{6})$/;
const ALLOWED_ROLES = new Set(["primary", "secondary", "accent", "neutral"]);
const FALLBACK_COLORS = mockPalettes[0]?.colors ?? [];
const FALLBACK_NEUTRALS = mockPalettes[0]?.neutrals ?? [];
const APP_BACKGROUND = "#0f1117";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const normalizeHex = (value?: string | null) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const match = trimmed.match(HEX_REGEX);
  if (!match) return null;
  return `#${match[1].toUpperCase()}`;
};

const sanitizeRole = (value?: string) => {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  return ALLOWED_ROLES.has(normalized) ? (normalized as PaletteColor["role"]) : undefined;
};

const sanitizeSwatches = (
  swatches: Array<{ hex?: string; label?: string; role?: string }> | undefined,
  fallbackLabelPrefix: string
): PaletteColor[] => {
  if (!Array.isArray(swatches)) return [];
  return swatches
    .map((swatch, index) => {
      const hex = normalizeHex(swatch?.hex);
      if (!hex) return null;
      const label =
        typeof swatch?.label === "string" && swatch.label.trim()
          ? swatch.label.trim()
          : `${fallbackLabelPrefix} ${index + 1}`;
      const role = sanitizeRole(swatch?.role);
      return { hex, label, role };
    })
    .filter((swatch): swatch is PaletteColor => Boolean(swatch));
};

const ensureLength = (
  values: PaletteColor[],
  target: number,
  fallback: PaletteColor[]
) => {
  if (values.length >= target) return values.slice(0, target);
  const padded = [...values];
  let fallbackIndex = 0;
  while (padded.length < target && fallbackIndex < fallback.length) {
    padded.push(fallback[fallbackIndex]);
    fallbackIndex += 1;
  }
  return padded.slice(0, target);
};

const buildAccessibility = (hex: string) => {
  const ratio = contrastRatio(hex, APP_BACKGROUND);
  return {
    grade: getAccessibilityGrade(ratio),
    contrastAgainstBackground: Number(ratio.toFixed(2)),
  };
};

const formatContextForModel = (context: ContextEntry[]) => {
  if (!Array.isArray(context) || !context.length) return "";
  const snippets = context
    .map((entry, index) => {
      if (!entry?.prompt) return null;
      const trimmed = entry.prompt.trim();
      if (!trimmed) return null;
      return `Step ${index + 1}: ${trimmed}`;
    })
    .filter((entry): entry is string => Boolean(entry));
  return snippets.length ? snippets.join("\n") : "";
};

const extractJsonFromResponse = (payload: Awaited<ReturnType<OpenAI["responses"]["create"]>>) => {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const textBlocks =
    payload.output
      ?.flatMap((item) =>
        item.content
          ?.filter((content): content is { type: "output_text"; text: string } => content.type === "output_text")
          .map((content) => content.text)
      )
      .filter(Boolean) ?? [];

  const combined = textBlocks.join("\n").trim();
  return combined || null;
};

const aiPaletteToCard = (
  palette: AiPalettePayload,
  index: number,
  promptRaw: string,
  timestamp: number
): PaletteCard | null => {
  const name =
    typeof palette?.name === "string" && palette.name.trim()
      ? palette.name.trim()
      : `Palette ${index + 1}`;
  const narrative =
    typeof palette?.narrative === "string" && palette.narrative.trim()
      ? palette.narrative.trim()
      : `Palette inspired by "${promptRaw}"`;

  const rawColors = sanitizeSwatches(palette?.colors, "Shade");
  if (!rawColors.length) return null;
  const colors = ensureLength(rawColors, 5, FALLBACK_COLORS);
  const neutralsRaw = sanitizeSwatches(palette?.neutrals, "Neutral").map((color) => ({
    ...color,
    role: "neutral" as const,
  }));
  const neutrals = ensureLength(neutralsRaw, 3, FALLBACK_NEUTRALS.map((color) => ({ ...color, role: "neutral" as const })));
  const focusHex = colors[colors.length - 1]?.hex ?? colors[0]?.hex;
  if (!focusHex) return null;

  const idBase = slugify(name) || `palette-${index + 1}`;
  return {
    id: `${idBase}-${timestamp}-${index}`,
    name,
    narrative,
    colors,
    neutrals,
    accessibility: buildAccessibility(focusHex),
    sourcePrompt: promptRaw,
    createdAt: new Date().toISOString(),
  };
};

const generateViaOpenAI = async (promptRaw: string, context: ContextEntry[]): Promise<PaletteCard[] | null> => {
  if (!openaiClient) return null;

  const contextText = formatContextForModel(context);
  const instructions = [
    `User request:\n${promptRaw}`,
    contextText ? `Recent session context:\n${contextText}` : null,
    contextText
      ? "Treat the latest prompt as a refinement of the previous steps unless the user explicitly asks to reset or start fresh."
      : null,
    [
      "Return between 3 and 4 palettes.",
      "Each palette must contain exactly 5 evocative colors (HEX strings) plus 3 neutral support tones.",
      "Every color should include a short uppercase label and an optional role (primary, secondary, accent, neutral).",
      "Favor accessible, production-ready palettes rooted in the cumulative brief above.",
      "Respond only with JSON following { \"palettes\": [ { \"name\": string, \"narrative\": string, \"colors\": [{\"hex\": \"#000000\", \"label\": \"NAME\", \"role\": \"primary\"}, ...], \"neutrals\": [{\"hex\": \"#111111\", \"label\": \"CHARCOAL\"}, ...] } ] }.",
    ].join(" "),
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await openaiClient.responses.create({
    model: OPENAI_MODEL,
    input: [
      {
        role: "system",
        content: "You are HueMind, an elite brand color strategist. You output JSON only and never include markdown or commentary.",
      },
      {
        role: "user",
        content: instructions,
      },
    ],
    temperature: 0.6,
  });

  const jsonPayload = extractJsonFromResponse(response);
  if (!jsonPayload) throw new Error("OpenAI returned an empty response");

  const parsed = JSON.parse(jsonPayload) as AiResponsePayload;
  const palettes = Array.isArray(parsed?.palettes) ? parsed.palettes : [];
  if (!palettes.length) throw new Error("OpenAI did not return any palettes");

  const timestamp = Date.now();
  return palettes
    .map((palette, index) => aiPaletteToCard(palette, index, promptRaw, timestamp))
    .filter((palette): palette is PaletteCard => Boolean(palette));
};

const buildFallbackPalettes = (promptRaw: string, contextLength: number): PaletteCard[] => {
  const timestamp = Date.now();
  return mockPalettes.map((palette, index) => {
    const rotation = palette.colors.length
      ? (contextLength + index) % palette.colors.length
      : 0;
    const rotatedColors = palette.colors.length
      ? [
          ...palette.colors.slice(rotation),
          ...palette.colors.slice(0, rotation),
        ]
      : palette.colors;

    return {
      ...palette,
      id: `${palette.id}-${timestamp}-${index}`,
      colors: rotatedColors,
      sourcePrompt: promptRaw,
      createdAt: new Date().toISOString(),
    };
  });
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const promptRaw = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const context = Array.isArray(body?.context) ? (body.context as ContextEntry[]) : [];

  if (!promptRaw) {
    return NextResponse.json(
      { error: "Prompt is required" },
      { status: 400 }
    );
  }

  const supabase = SUPABASE_AVAILABLE ? createRouteSupabaseClient(cookies()) : null;
  let sessionUserId: string | null = null;
  let usageContext: Awaited<ReturnType<typeof fetchUsageContext>> | null = null;

  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    sessionUserId = session?.user?.id ?? null;
    if (sessionUserId) {
      usageContext = await fetchUsageContext(supabase, sessionUserId);
      if (
        Number.isFinite(usageContext.limit) &&
        usageContext.limit !== Number.POSITIVE_INFINITY &&
        usageContext.count >= usageContext.limit
      ) {
        return NextResponse.json(
          { error: "You have reached your monthly palette limit. Upgrade to continue." },
          { status: 402 }
        );
      }
    }
  }

  let palettes: PaletteCard[] | null = null;
  let provider: "openai" | "mock" = "mock";
  let providerReason: string | null = null;

  if (!openaiClient) {
    providerReason = "Missing OPENAI_API_KEY";
  } else {
    try {
      palettes = await generateViaOpenAI(promptRaw, context);
      if (palettes?.length) {
        provider = "openai";
      } else {
        providerReason = "OpenAI returned an empty palette set";
      }
    } catch (error) {
      providerReason =
        error instanceof Error ? error.message : "OpenAI request failed";
      console.error("[HueMind] OpenAI palette generation failed", error);
    }
  }

  if (!palettes?.length) {
    palettes = buildFallbackPalettes(promptRaw, context.length);
  }

  if (supabase && sessionUserId && usageContext) {
    await incrementUsage(supabase, sessionUserId, usageContext.period);
    usageContext = {
      ...usageContext,
      count: usageContext.count + 1,
    };
  }

  return NextResponse.json({
    prompt: promptRaw,
    palettes,
    provider,
    reason: provider === "openai" ? null : providerReason,
    usage: usageContext
      ? {
          used: usageContext.count,
          limit: usageContext.limit,
          plan: usageContext.plan,
        }
      : null,
  });
}
