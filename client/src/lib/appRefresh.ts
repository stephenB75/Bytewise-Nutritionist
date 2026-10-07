import { queryClient } from '@/lib/queryClient';

let inFlight: Promise<void> | null = null;
let lastRefreshAt = 0;

/** Broadcast so dashboard cards, HealthKit widgets, and trackers re-read local + server state. */
export const APP_DATA_REFRESH_EVENT = 'app-data-refresh';

export type RefreshAppDataOptions = {
  /** When true, start a new refresh even if one just finished (used by pull-to-refresh). */
  force?: boolean;
};

/**
 * Re-pull everything shown in the app: meals, water, fasting, friends, stats,
 * Apple Health cards, and any react-query caches (except auth session).
 */
export function refreshAppData(options: RefreshAppDataOptions = {}): Promise<void> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    // Order: local UI listeners first, then query refetch.
    window.dispatchEvent(new CustomEvent('reload-meal-data'));
    window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
    window.dispatchEvent(new CustomEvent('refresh-meals'));
    window.dispatchEvent(new CustomEvent('meals-updated'));
    window.dispatchEvent(new CustomEvent(APP_DATA_REFRESH_EVENT, {
      detail: { source: options.force ? 'pull' : 'auto', at: Date.now() },
    }));
    // HealthKit cards listen to this as well as app-data-refresh.
    window.dispatchEvent(new CustomEvent('apple-health-changed'));
    window.dispatchEvent(new CustomEvent('fasting-status-changed'));

    await queryClient.invalidateQueries({
      // Refetch mounted and unmounted queries so switching tabs shows fresh data.
      refetchType: 'all',
      predicate: (query) => {
        const key = String(query.queryKey[0] ?? '');
        // Keep the signed-in session stable during a pull refresh.
        return !key.startsWith('/api/auth');
      },
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
