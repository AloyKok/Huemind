import { NextResponse } from "next/server";

import type { ExtractResponse, ExtractorOptions } from "@/lib/types";
import { clusterSamples, samplePixels, buildSystemPalette } from "@/lib/color-engine";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const defaultOptions: ExtractorOptions = {
  colorCount: 5,
  ignoreExtremes: true,
  skinToneGuard: true,
  requireAA: true,
};

const parseBase64Image = (input?: string | null) => {
  if (!input || typeof input !== "string") return null;
  const commaIndex = input.indexOf(",");
  const base64 = commaIndex >= 0 ? input.slice(commaIndex + 1) : input;
  try {
    const buffer = Buffer.from(base64, "base64");
    if (!buffer.byteLength) return null;
    if (buffer.byteLength > MAX_FILE_SIZE) {
      throw new Error("File exceeds the 10MB limit.");
    }
    return buffer;
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const buffer = parseBase64Image(body?.image);
    if (!buffer) {
      return NextResponse.json(
        { error: "Please provide a valid base64 encoded image ≤ 10MB." },
        { status: 400 }
      );
    }

    const options: ExtractorOptions = {
      ...defaultOptions,
      ...(typeof body?.options === "object" ? body.options : {}),
      colorCount: Math.min(Math.max(body?.options?.colorCount ?? defaultOptions.colorCount, 3), 8),
    };

    const samples = await samplePixels(buffer, options);
    if (!samples.length) {
      return NextResponse.json(
        { error: "Could not extract colors from the provided image." },
        { status: 422 }
      );
    }

    const swatches = clusterSamples(samples, options.colorCount);
    if (!swatches.length) {
      return NextResponse.json(
        { error: "Unable to build clusters from the sampled colors." },
        { status: 422 }
      );
    }

    const suggested = buildSystemPalette(swatches, options);
    const payload: ExtractResponse = { swatches, suggested };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[HueMind] /api/extract failed", error);
    return NextResponse.json(
      { error: "Failed to process the image. Please try another file." },
      { status: 500 }
    );
  }
}
