import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are not configured.");
}

export const createServerSupabaseClient = () =>
  createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value;
      },
      set() {
        // Server Components cannot set cookies; handled in route handlers.
      },
      remove() {
        // Server Components cannot remove cookies; handled in route handlers.
      },
    },
  });
