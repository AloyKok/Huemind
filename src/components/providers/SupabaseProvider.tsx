"use client";

import { useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import type { Session } from "@supabase/supabase-js";

import { createBrowserClient } from "@/lib/supabase/browser";

export const SupabaseProvider = ({
  initialSession,
  children,
}: {
  initialSession: Session | null;
  children: React.ReactNode;
}) => {
  const [supabaseClient] = useState(() => createBrowserClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={initialSession}>
      {children}
    </SessionContextProvider>
  );
};
