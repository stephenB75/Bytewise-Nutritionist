import { Capacitor } from '@capacitor/core';

const PRODUCTION_ORIGIN = 'https://www.bytewisenutritionist.com';

function getEnvAppUrl(): string {
  try {
    return String(import.meta.env.VITE_APP_URL || '').replace(/\/$/, '');
  } catch {
    return '';
  }
}

/** Web origin for API calls (production URL when running inside Capacitor). */
export function getApiOrigin(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  // Bundled native assets are served from <scheme>://localhost, which has no API behind it.
  if (Capacitor.isNativePlatform()) {
    return getEnvAppUrl() || PRODUCTION_ORIGIN;
  }

  return `${window.location.protocol}//${window.location.host}`;
}

/** Resolve `/api/...` paths for native shells that load bundled assets from capacitor://localhost. */
export function resolveApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const origin = getApiOrigin();
  if (path.startsWith('/')) {
    return `${origin}${path}`;
  }
  return `${origin}/${path}`;
}

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  return fetch(resolveApiUrl(input), init);
}
