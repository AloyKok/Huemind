import { NextResponse } from "next/server";

import type { ExtractorOptions, RegenerateRequest } from "@/lib/types";
import { regenerateFromSwatches } from "@/lib/color-engine/paletteBuilder";

const defaultOptions: ExtractorOptions = {
  colorCount: 5,
  ignoreExtremes: true,
  skinToneGuard: true,
  requireAA: true,
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as RegenerateRequest;
    if (!Array.isArray(body?.swatches) || !body.swatches.length) {
      return NextResponse.json({ error: "Swatches are required." }, { status: 400 });
    }

    const options: ExtractorOptions = {
      ...defaultOptions,
      ...(body.options ?? {}),
    };

    const result = regenerateFromSwatches({
      swatches: body.swatches,
      adjust: body.adjust,
      lockPrimary: body.lockPrimary,
      options,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[HueMind] /api/regenerate-from-swatches failed", error);
    return NextResponse.json(
      { error: "Unable to regenerate palette from swatches." },
      { status: 500 }
    );
  }
}
