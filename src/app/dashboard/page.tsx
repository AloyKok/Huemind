/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { PaletteCard } from "@/lib/types";
import { useSupabase } from "@/lib/hooks/useSupabase";

export default function DashboardPage() {
  const { session } = useSupabase();
  const [palettes, setPalettes] = useState<PaletteCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    fetch("/api/palettes")
      .then((res) => res.json())
      .then((data) => setPalettes(data?.palettes ?? []))
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) {
    return (
      <div className="px-6 py-16 text-center text-foreground/60">
        <p>Sign in to view your saved palettes.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-foreground/40">Library</p>
          <h1 className="text-2xl font-semibold text-foreground">Saved palettes</h1>
        </div>
        <Link
          href="/"
          className="rounded-full border border-border/60 px-4 py-2 text-sm text-foreground/70 transition hover:bg-accent/15"
        >
          Back to studio
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="text-sm text-foreground/60">Loading…</p>}
        {!loading && palettes.length === 0 && (
          <p className="text-sm text-foreground/60">No saved palettes yet. Generate one to add here.</p>
        )}
        {palettes.map((palette) => (
          <div
            key={palette.id}
            className="rounded-2xl border border-border/60 bg-surface/70 p-4 shadow-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">{palette.name}</h3>
                <p className="text-xs text-foreground/60">{new Date(palette.createdAt).toLocaleDateString()}</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-border/60 px-3 py-1 text-xs text-foreground/70 transition hover:bg-accent/15"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(palette));
                }}
              >
                Export
              </button>
            </div>
            <div className="mt-3 flex items-center gap-1">
              {palette.colors.slice(0, 5).map((color) => (
                <span
                  key={`${palette.id}-${color.hex}`}
                  className="h-10 flex-1 rounded-xl border border-border/40"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
