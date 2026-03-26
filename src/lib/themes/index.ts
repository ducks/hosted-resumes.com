import type { Component } from "svelte";
import type { ThemeMeta, ThemeProps } from "./types";
import Classic from "./classic/Classic.svelte";
import Modern from "./modern/Modern.svelte";
import Minimal from "./minimal/Minimal.svelte";

export type { ThemeProps, ThemeMeta } from "./types";

export interface ThemeEntry {
  meta: ThemeMeta;
  component: Component<ThemeProps>;
}

const themes: Record<string, ThemeEntry> = {
  classic: {
    meta: {
      id: "classic",
      name: "Classic",
      description: "Traditional serif layout, single column",
      tier: "free",
    },
    component: Classic as Component<ThemeProps>,
  },
  modern: {
    meta: {
      id: "modern",
      name: "Modern",
      description: "Two-column grid with accent sidebar",
      tier: "pro",
    },
    component: Modern as Component<ThemeProps>,
  },
  minimal: {
    meta: {
      id: "minimal",
      name: "Minimal",
      description: "Monospace accents, maximum whitespace",
      tier: "pro",
    },
    component: Minimal as Component<ThemeProps>,
  },
};

export function getTheme(id: string): ThemeEntry | undefined {
  return themes[id];
}

export function getDefaultTheme(): ThemeEntry {
  return themes.classic;
}

export function getThemesForTier(
  tier: "free" | "pro" | "business"
): ThemeEntry[] {
  const tierRank = { free: 0, pro: 1, business: 2 };
  const rank = tierRank[tier];
  return Object.values(themes).filter(
    (t) => tierRank[t.meta.tier] <= rank
  );
}

export function getAllThemes(): ThemeEntry[] {
  return Object.values(themes);
}
