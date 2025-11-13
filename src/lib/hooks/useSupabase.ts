"use client";

import { useSessionContext, useUser } from "@supabase/auth-helpers-react";

export const useSupabase = () => {
  const context = useSessionContext();
  const user = useUser();

  return {
    supabase: context.supabaseClient,
    session: context.session,
    user,
    isLoading: context.isLoading,
  };
};
