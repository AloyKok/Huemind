import type { ReadonlyRequestCookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are not configured.");
}

export const createRouteSupabaseClient = (cookieStore: ReadonlyRequestCookies) =>
  createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // Route handlers should use NextResponse cookies to mutate; noop here.
      },
      remove() {
        // Route handlers should use NextResponse cookies to mutate; noop here.
      },
    },
  });
