import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

const planLimits: Record<string, number> = {
  FREE: 20,
  PRO: 500,
  ADMIN: Number.POSITIVE_INFINITY,
};

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

export const fetchUsageContext = async (
  supabase: SupabaseClient<Database>,
  userId: string
) => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();
  const plan = profile?.plan ?? "FREE";
  const limit = planLimits[plan] ?? 20;
  const { start, end } = getPeriod();
  const { data } = await supabase
    .from("usage")
    .select("palette_generations")
    .eq("user_id", userId)
    .eq("period_start", start)
    .eq("period_end", end)
    .single();
  return {
    plan,
    limit,
    count: data?.palette_generations ?? 0,
    period: { start, end },
  };
};

export const incrementUsage = async (
  supabase: SupabaseClient<Database>,
  userId: string,
  period: { start: string; end: string }
) => {
  const { data } = await supabase
    .from("usage")
    .select("id, palette_generations")
    .eq("user_id", userId)
    .eq("period_start", period.start)
    .eq("period_end", period.end)
    .single();

  if (data) {
    await supabase
      .from("usage")
      .update({ palette_generations: data.palette_generations + 1 })
      .eq("id", data.id);
  } else {
    await supabase.from("usage").insert({
      user_id: userId,
      period_start: period.start,
      period_end: period.end,
      palette_generations: 1,
    });
  }
};
