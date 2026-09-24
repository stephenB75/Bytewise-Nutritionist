import { apiRequest } from '@/lib/queryClient';

export const ACTIVE_FAST_QUERY_KEY = ['/api/fasting/active'] as const;

export type ServerActiveFast = {
  id: string;
  planId: string;
  planName?: string;
  startTime: string;
  targetDuration: number;
  status: 'active' | 'completed' | 'paused';
} | null;

/** Throws on failure so callers never mistake an outage for "no active fast". */
export async function fetchActiveFast(): Promise<ServerActiveFast> {
  const response = await apiRequest('GET', '/api/fasting/active');
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
