"use client";

import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";
import { Bookmark, Dice1, ImageUp, Sparkles } from "lucide-react";
import type { PalettePreviewMode } from "@/lib/types";
import { SidebarAuthPanel } from "./SidebarAuthPanel";

const primaryNav: Array<{
  id: PalettePreviewMode;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}> = [
  { id: "chat", label: "Palette Studio", icon: Sparkles },
  { id: "extractor", label: "Image Extractor", icon: ImageUp },
  { id: "random", label: "Random", icon: Dice1 },
  { id: "saved", label: "Saved Palettes", icon: Bookmark },
];

type SidebarProps = {
  activeMode: PalettePreviewMode;
  onModeChange: (mode: PalettePreviewMode) => void;
};

export const Sidebar = ({ activeMode, onModeChange }: SidebarProps) => (
  <div className="hidden lg:block lg:w-72 lg:flex-shrink-0">
    <aside className="fixed inset-y-0 left-0 z-40 flex h-full w-72 flex-col border-r border-border/60 bg-surface px-6 py-8 shadow-[0_25px_60px_rgba(10,15,35,0.18)]">
      <div className="flex items-center gap-3 text-lg font-semibold tracking-tight text-foreground">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          HM
        </div>
        <div>
          HueMind
          <p className="text-xs font-normal text-foreground/60">Brand Color OS</p>
        </div>
      </div>

      <nav className="mt-8 flex-1 space-y-2 text-sm text-foreground/70">
        {primaryNav.map(({ id, label, icon: Icon }) => {
          const isActive = id === activeMode;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onModeChange(id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
                isActive
                  ? "bg-accent/10 text-foreground shadow-[0_15px_30px_rgba(15,14,32,0.16)]"
                  : "text-foreground/65 hover:bg-muted/10"
              )}
            >
              <Icon className="h-4 w-4 text-accent" />
              <span className="font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      <SidebarAuthPanel />
    </aside>
  </div>
);
