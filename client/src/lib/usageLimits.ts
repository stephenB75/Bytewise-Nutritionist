export const FREE_LIMITS = {
  aiAnalysesPerMonth: 10,
  pdfExportsPerWeek: 1,
  recipes: 5,
} as const;

type LimitedFeature = 'ai' | 'pdf';

function isoWeekKey(date = new Date()): string {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${utc.getUTCFullYear()}-w${week}`;
}

function storageKey(feature: LimitedFeature, userId?: string | null): string {
  const owner = userId || 'guest';
  const now = new Date();
  if (feature === 'ai') {
    return `usage-ai-${owner}-${now.getFullYear()}-${now.getMonth() + 1}`;
  }
  return `usage-pdf-${owner}-${isoWeekKey(now)}`;
}

export function getUsageCount(feature: LimitedFeature, userId?: string | null): number {
  try {
    const raw = localStorage.getItem(storageKey(feature, userId));
    const count = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(count) && count > 0 ? count : 0;
  } catch {
    return 0;
  }
}

export function incrementUsage(feature: LimitedFeature, userId?: string | null): number {
  const next = getUsageCount(feature, userId) + 1;
  try {
    localStorage.setItem(storageKey(feature, userId), String(next));
  } catch {
    // Ignore quota errors; the local UI limit is best-effort.
  }
  return next;
}

export function getFeatureAllowance(
  feature: LimitedFeature,
  isPremium: boolean,
  userId?: string | null
) {
  const limit = feature === 'ai' ? FREE_LIMITS.aiAnalysesPerMonth : FREE_LIMITS.pdfExportsPerWeek;
  if (isPremium) {
    return { allowed: true, remaining: Number.POSITIVE_INFINITY, used: 0, limit };
  }
  const used = getUsageCount(feature, userId);
  return {
    allowed: used < limit,
    remaining: Math.max(0, limit - used),
    used,
    limit,
  };
}
