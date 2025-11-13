import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are not configured.");
}

export const createBrowserClient = () =>
  createSupabaseBrowserClient<Database>(supabaseUrl, supabaseKey);
