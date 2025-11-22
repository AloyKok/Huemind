import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase/route";

type RouteParams = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: RouteParams }) {
  const { id } = await params;
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[HueMind] Failed to update palette", error);
    return NextResponse.json({ error: "Unable to update palette" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: RouteParams }) {
  const { id } = await params;
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { error } = await supabase
    .from("palettes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[HueMind] Failed to delete palette", error);
    return NextResponse.json({ error: "Unable to delete palette" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
