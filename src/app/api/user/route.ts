import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase/route";

export async function GET() {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("name, image, plan, stripe_customer_id, created_at")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("[HueMind] Failed to load profile", error);
    return NextResponse.json({ error: "Unable to fetch profile" }, { status: 500 });
  }

  return NextResponse.json({ user: data, email: user.email });
}

export async function PATCH(request: Request) {
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
  if (typeof body?.image === "string") updates.image = body.image;

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      ...updates,
    });

  if (error) {
    console.error("[HueMind] Failed to update profile", error);
    return NextResponse.json({ error: "Unable to update profile" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
