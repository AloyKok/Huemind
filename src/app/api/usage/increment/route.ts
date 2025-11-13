import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createRouteSupabaseClient } from "@/lib/supabase/route";
import { fetchUsageContext, incrementUsage } from "@/lib/usage";

export async function POST() {
  const supabase = createRouteSupabaseClient(cookies());
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const usageContext = await fetchUsageContext(supabase, session.user.id);
  await incrementUsage(supabase, session.user.id, usageContext.period);

  return NextResponse.json({
    success: true,
    usage: {
      ...usageContext,
      count: usageContext.count + 1,
    },
  });
}
