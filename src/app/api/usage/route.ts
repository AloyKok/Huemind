import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createRouteSupabaseClient } from "@/lib/supabase/route";

const getPeriod = () => {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

const planLimits: Record<string, number> = {
  FREE: 20,
  PRO: 500,
  ADMIN: Infinity,
};

export async function GET() {
  const supabase = createRouteSupabaseClient(cookies());
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ used: 0, limit: 0, plan: "ANON" });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", session.user.id)
    .single();

  const plan = profile?.plan ?? "FREE";
  const limit = planLimits[plan] ?? 20;
  if (!Number.isFinite(limit)) {
    return NextResponse.json({ used: 0, limit, plan });
  }

  const { start, end } = getPeriod();
  const { data } = await supabase
    .from("usage")
    .select("palette_generations")
    .eq("user_id", session.user.id)
    .eq("period_start", start)
    .eq("period_end", end)
    .single();

  return NextResponse.json({ used: data?.palette_generations ?? 0, limit, plan });
}
