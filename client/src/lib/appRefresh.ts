import { queryClient } from '@/lib/queryClient';

let inFlight: Promise<void> | null = null;
let lastRefreshAt = 0;

/** Re-pull everything shown in the app from the account (meals, water, fasting, friends, stats). */
export function refreshAppData(): Promise<void> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    window.dispatchEvent(new CustomEvent('reload-meal-data'));
    window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
    window.dispatchEvent(new CustomEvent('app-data-refresh'));
    await queryClient.invalidateQueries({
      refetchType: 'active',
      predicate: (query) => !String(query.queryKey[0] ?? '').startsWith('/api/auth'),
    });
  })()
    .catch(() => undefined)
    .finally(() => {
      lastRefreshAt = Date.now();
      inFlight = null;
    });

  return inFlight;
}

/**
 * Keep this device in step with the user's other devices: refresh when the app comes back
 * to the foreground, regains focus or connectivity, and every minute while it is open.
 */
export function startAutoSync({ intervalMs = 60_000, minGapMs = 15_000 } = {}): () => void {
  const refreshIfDue = () => {
    if (document.visibilityState !== 'visible') return;
    if (Date.now() - lastRefreshAt < minGapMs) return;
    void refreshAppData();
  };

  document.addEventListener('visibilitychange', refreshIfDue);
  window.addEventListener('focus', refreshIfDue);
  window.addEventListener('online', refreshIfDue);
  const interval = window.setInterval(refreshIfDue, intervalMs);

  return () => {
    document.removeEventListener('visibilitychange', refreshIfDue);
    window.removeEventListener('focus', refreshIfDue);
    window.removeEventListener('online', refreshIfDue);
    window.clearInterval(interval);
  };
}
