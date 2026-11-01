import { apiRequest } from '@/lib/queryClient';

export const ACTIVE_FAST_QUERY_KEY = ['/api/fasting/active'] as const;

const ENDED_FASTS_KEY = 'bytewise_ended_fasts';
const FASTING_SESSION_KEY = 'bytewise_fasting_session';
const FASTING_ACTIVE_KEY = 'bytewise_fasting_active';

export type ServerActiveFast = {
  id: string;
  planId: string;
  planName?: string;
  startTime: string;
  targetDuration: number;
  status: 'active' | 'completed' | 'paused';
} | null;

type EndedFast = { id: string; endTime: string };

function readEndedFasts(): EndedFast[] {
  try {
    const list = JSON.parse(localStorage.getItem(ENDED_FASTS_KEY) || '[]');
    return Array.isArray(list) ? list.filter((item) => item?.id && item?.endTime) : [];
  } catch {
    return [];
  }
}

export function isFastEndedHere(id: string | null | undefined): boolean {
  return !!id && readEndedFasts().some((item) => item.id === String(id));
}

export function completeFastRequest(id: string, endTime: Date | string) {
  const iso = typeof endTime === 'string' ? endTime : endTime.toISOString();
  return apiRequest('PUT', `/api/fasting/${id}/complete`, { endTime: iso });
}

/**
 * Remembers a fast ended on this device. Until the server saves the end, the active-fast
 * request can still return it, and no screen may bring it back as running.
 */
export function markFastEndedHere(id: string, endTime: Date) {
  try {
    const list = [
      { id: String(id), endTime: endTime.toISOString() },
      ...readEndedFasts().filter((item) => item.id !== String(id)),
    ];
    localStorage.setItem(ENDED_FASTS_KEY, JSON.stringify(list.slice(0, 20)));
    const stored = JSON.parse(localStorage.getItem(FASTING_SESSION_KEY) || 'null');
    if (stored?.id && String(stored.id) === String(id)) {
      localStorage.removeItem(FASTING_SESSION_KEY);
      localStorage.removeItem(FASTING_ACTIVE_KEY);
    }
  } catch {
    // localStorage may be unavailable.
  }
}

/** Throws on failure so callers never mistake an outage for "no active fast". */
export async function fetchActiveFast(): Promise<ServerActiveFast> {
  const response = await apiRequest('GET', '/api/fasting/active');
  const text = await response.text();
  const fast: ServerActiveFast = text ? JSON.parse(text) : null;
  if (!fast) return null;
  const ended = readEndedFasts().find((item) => item.id === String(fast.id));
  if (!ended) return fast;
  // The end never reached the server (offline, or the request failed): send it again.
  void completeFastRequest(ended.id, ended.endTime).catch(() => {});
  return null;
}
