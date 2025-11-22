import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase/route";

export async function GET() {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ palettes: [] });
  }

  const { data, error } = await supabase
    .from("palettes")
    .select("id, name, prompt, tokens, tags, is_public, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[HueMind] Failed to fetch palettes", error);
    return NextResponse.json({ error: "Unable to fetch palettes" }, { status: 500 });
  }

  return NextResponse.json({ palettes: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : "Untitled Palette";
  const prompt = typeof body?.prompt === "string" ? body.prompt : null;
  const tokens = body?.tokens ?? null;
  const tags = Array.isArray(body?.tags) ? body.tags : [];

  if (!tokens) {
    return NextResponse.json({ error: "Palette tokens are required" }, { status: 400 });
  }

  const { error } = await supabase.from("palettes").insert({
    user_id: user.id,
    name,
    prompt,
    tokens,
    tags,
  });

  if (error) {
    console.error("[HueMind] Failed to save palette", error);
    return NextResponse.json({ error: "Unable to save palette" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
