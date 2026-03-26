export interface TierConfig {
  maxResumes: number;
  themes: string[];
  pdfExport: boolean;
  customDomain: boolean;
  analytics: boolean;
}

export const TIER_CONFIG: Record<string, TierConfig> = {
  free: {
    maxResumes: 1,
    themes: ['classic'],
    pdfExport: false,
    customDomain: false,
    analytics: false,
  },
  pro: {
    maxResumes: Infinity,
    themes: ['classic', 'modern', 'minimal'],
    pdfExport: true,
    customDomain: false,
    analytics: false,
  },
  business: {
    maxResumes: Infinity,
    themes: ['classic', 'modern', 'minimal'],
    pdfExport: true,
    customDomain: true,
    analytics: true,
  },
};

export function getTierConfig(tier: string): TierConfig {
  return TIER_CONFIG[tier] ?? TIER_CONFIG.free;
}

export function canAccessTheme(tier: string, theme: string): boolean {
  return getTierConfig(tier).themes.includes(theme);
}

export function canExportPdf(tier: string): boolean {
  return getTierConfig(tier).pdfExport;
}

export function canUseCustomDomain(tier: string): boolean {
  return getTierConfig(tier).customDomain;
}

export function getMaxResumes(tier: string): number {
  return getTierConfig(tier).maxResumes;
}

export function getThemesForTier(tier: string): string[] {
  return getTierConfig(tier).themes;
}
