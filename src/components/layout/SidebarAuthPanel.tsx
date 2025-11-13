"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, LogOut, Mail } from "lucide-react";

import { useSupabase } from "@/lib/hooks/useSupabase";
import { cn } from "@/lib/utils";

export const SidebarAuthPanel = () => {
  const { supabase, user, isLoading } = useSupabase();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending">("idle");

  const handleMagicLink = async () => {
    if (!email) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setStatus("idle");
    if (!error) {
      setEmail("");
      alert("Magic link sent! Check your inbox.");
    } else {
      alert(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-surface/70 px-4 py-3 text-xs text-foreground/60">
        <Loader2 className="mr-2 inline h-3.5 w-3.5 animate-spin" /> Connecting…
      </div>
    );
  }

  if (user) {
    const avatarLetter = user.email?.[0]?.toUpperCase() ?? "H";
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/80 px-4 py-3 text-foreground">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-sm font-semibold text-accent">
          {user.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
            avatarLetter
          )}
        </div>
        <div className="flex-1 text-xs">
          <p className="text-sm font-semibold text-foreground">{user.user_metadata?.name ?? "HueMind User"}</p>
          <p className="text-foreground/60">{user.email}</p>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-2 inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[11px] uppercase tracking-[0.25em] text-foreground/70 transition hover:bg-accent/10"
          >
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-surface/80 p-4 text-foreground/80">
      <p className="text-sm font-semibold text-foreground">Sign in to save palettes</p>
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
        <Mail className="h-4 w-4 text-foreground/60" />
        <input
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none"
          placeholder="you@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <button
        type="button"
        disabled={!email || status === "sending"}
        onClick={handleMagicLink}
        className={cn(
          "w-full rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em]",
          email && status !== "sending"
            ? "bg-accent text-white"
            : "bg-accent/20 text-foreground/50"
        )}
      >
        {status === "sending" ? "Sending…" : "Email link"}
      </button>
    </div>
  );
};
