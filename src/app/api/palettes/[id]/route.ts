import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createRouteSupabaseClient } from "@/lib/supabase/route";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteSupabaseClient(cookies());
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};
  if (typeof body?.name === "string") updates.name = body.name;
  if (Array.isArray(body?.tags)) updates.tags = body.tags;
  if (typeof body?.isPublic === "boolean") updates.is_public = body.isPublic;

  const { error } = await supabase
    .from("palettes")
    .update(updates)
    .eq("id", params.id)
    .eq("user_id", session.user.id);

  if (error) {
    console.error("[HueMind] Failed to update palette", error);
    return NextResponse.json({ error: "Unable to update palette" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteSupabaseClient(cookies());
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { error } = await supabase
    .from("palettes")
    .delete()
    .eq("id", params.id)
    .eq("user_id", session.user.id);

  if (error) {
    console.error("[HueMind] Failed to delete palette", error);
    return NextResponse.json({ error: "Unable to delete palette" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
