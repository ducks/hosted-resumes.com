import type { JoblResume } from "$lib/jobl/schema";

export interface ThemeProps {
  resume: JoblResume;
}

export interface ThemeMeta {
  id: string;
  name: string;
  description: string;
  tier: "free" | "pro" | "business";
}
