import { describe, it, expect } from 'vitest';
import {
  getTierConfig,
  canAccessTheme,
  canExportPdf,
  canUseCustomDomain,
  getMaxResumes,
  getThemesForTier,
  TIER_CONFIG,
} from './tier';

describe('getTierConfig', () => {
  it('returns free config', () => {
    expect(getTierConfig('free')).toEqual(TIER_CONFIG.free);
  });

  it('returns pro config', () => {
    expect(getTierConfig('pro')).toEqual(TIER_CONFIG.pro);
  });

  it('returns business config', () => {
    expect(getTierConfig('business')).toEqual(TIER_CONFIG.business);
  });

  it('falls back to free for unknown tier', () => {
    expect(getTierConfig('unknown')).toEqual(TIER_CONFIG.free);
  });

  it('falls back to free for empty string', () => {
    expect(getTierConfig('')).toEqual(TIER_CONFIG.free);
  });
});

describe('canAccessTheme', () => {
  it('free can access classic', () => {
    expect(canAccessTheme('free', 'classic')).toBe(true);
  });

  it('free cannot access modern', () => {
    expect(canAccessTheme('free', 'modern')).toBe(false);
  });

  it('free cannot access minimal', () => {
    expect(canAccessTheme('free', 'minimal')).toBe(false);
  });

  it('pro can access all three themes', () => {
    expect(canAccessTheme('pro', 'classic')).toBe(true);
    expect(canAccessTheme('pro', 'modern')).toBe(true);
    expect(canAccessTheme('pro', 'minimal')).toBe(true);
  });

  it('business can access all three themes', () => {
    expect(canAccessTheme('business', 'classic')).toBe(true);
    expect(canAccessTheme('business', 'modern')).toBe(true);
    expect(canAccessTheme('business', 'minimal')).toBe(true);
  });

  it('returns false for nonexistent theme', () => {
    expect(canAccessTheme('business', 'nope')).toBe(false);
  });
});

describe('canExportPdf', () => {
  it('free cannot export PDF', () => {
    expect(canExportPdf('free')).toBe(false);
  });

  it('pro can export PDF', () => {
    expect(canExportPdf('pro')).toBe(true);
  });

  it('business can export PDF', () => {
    expect(canExportPdf('business')).toBe(true);
  });

  it('unknown tier cannot export PDF', () => {
    expect(canExportPdf('unknown')).toBe(false);
  });
});

describe('canUseCustomDomain', () => {
  it('free cannot use custom domain', () => {
    expect(canUseCustomDomain('free')).toBe(false);
  });

  it('pro cannot use custom domain', () => {
    expect(canUseCustomDomain('pro')).toBe(false);
  });

  it('business can use custom domain', () => {
    expect(canUseCustomDomain('business')).toBe(true);
  });
});

describe('getMaxResumes', () => {
  it('free gets 1', () => {
    expect(getMaxResumes('free')).toBe(1);
  });

  it('pro gets Infinity', () => {
    expect(getMaxResumes('pro')).toBe(Infinity);
  });

  it('business gets Infinity', () => {
    expect(getMaxResumes('business')).toBe(Infinity);
  });

  it('unknown falls back to 1', () => {
    expect(getMaxResumes('unknown')).toBe(1);
  });
});

describe('getThemesForTier', () => {
  it('free gets only classic', () => {
    expect(getThemesForTier('free')).toEqual(['classic']);
  });

  it('pro gets classic, modern, minimal', () => {
    expect(getThemesForTier('pro')).toEqual(['classic', 'modern', 'minimal']);
  });

  it('business gets classic, modern, minimal', () => {
    expect(getThemesForTier('business')).toEqual(['classic', 'modern', 'minimal']);
  });

  it('unknown falls back to free themes', () => {
    expect(getThemesForTier('unknown')).toEqual(['classic']);
  });
});
