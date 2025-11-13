"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Loader2, Mail } from "lucide-react";

import { useSupabase } from "@/lib/hooks/useSupabase";
import { cn } from "@/lib/utils";

const featureList = [
  "Generate palettes from prompts or imagery",
  "Accessible tokens ready for production",
  "Instant component previews & exports",
];

export const LandingScreen = () => {
  const { supabase, user, isLoading } = useSupabase();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending">("idle");

  const handleMagicLink = async () => {
    if (!email) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    });
    setStatus("idle");
    if (error) {
      alert(error.message);
      return;
    }
    setEmail("");
    alert("Magic link sent! Check your inbox.");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="mb-4 h-8 w-8 animate-spin" />
        Preparing HueMind…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7ff] via-white to-[#eef0ff] px-6 py-12 text-foreground">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="inline-flex items-center rounded-full border border-border/60 bg-white px-4 py-1 text-xs font-medium uppercase tracking-[0.4em] text-muted">
            HueMind
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            Turn any brand idea into a production-ready color system.
          </h1>
          <p className="text-lg text-foreground/70">
            Upload inspiration or describe the vibe. HueMind instantly returns accessible tokens, component previews,
            and exports that you can ship.
          </p>
          <ul className="space-y-2 text-sm text-foreground/80">
            {featureList.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
          {user ? (
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
            >
              Enter HueMind
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="rounded-3xl border border-border/70 bg-white/80 p-6 shadow-lg backdrop-blur">
              <p className="text-sm font-semibold text-foreground">Sign in to start building</p>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3">
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
                  "mt-4 w-full rounded-full px-4 py-3 text-sm font-semibold",
                  email && status !== "sending" ? "bg-foreground text-background" : "bg-muted/20 text-muted"
                )}
              >
                {status === "sending" ? "Sending magic link…" : "Email me a login link"}
              </button>
            </div>
          )}
        </div>
        <div className="rounded-[32px] border border-border/60 bg-white/80 p-8 shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
          <div className="rounded-3xl bg-gradient-to-br from-accent/20 via-white to-transparent p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">Preview</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Spark-ready palettes</h2>
            <p className="mt-2 text-sm text-foreground/70">
              Enter a mood or upload a reference image. We’ll return accessible color systems with tokens, previews, and exports.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {["Brand prompts", "Image extract", "Spark preview", "Token exports"].map((item) => (
                <div key={item} className="rounded-2xl border border-border/60 bg-surface/90 p-4 text-sm text-foreground/70">
                  <p className="font-semibold text-foreground">{item}</p>
                  <p className="text-xs text-foreground/50">Instant, production-ready outputs.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
