import { Capacitor } from '@capacitor/core';

/** Public site origin for auth email links (must match Supabase redirect allow list). */
export function getAppOrigin(): string {
  if (typeof window !== 'undefined' && !Capacitor.isNativePlatform()) {
    return window.location.origin;
  }

  try {
    const configured = String(import.meta.env.VITE_APP_URL || '').replace(/\/$/, '');
    if (configured) {
      return configured;
    }
  } catch {
    // ignore
  }

  return 'https://www.bytewisenutritionist.com';
}

export function getAuthRedirectUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getAppOrigin()}${normalized}`;
}
