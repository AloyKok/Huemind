import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase/route";
import { fetchUsageContext, incrementUsage } from "@/lib/usage";

export async function POST() {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const usageContext = await fetchUsageContext(supabase, user.id);
  await incrementUsage(supabase, user.id, usageContext.period);

  return NextResponse.json({
    success: true,
    usage: {
      ...usageContext,
      count: usageContext.count + 1,
    },
  });
}
