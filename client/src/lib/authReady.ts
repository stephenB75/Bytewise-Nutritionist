import { supabase } from '@/lib/supabase';

/**
 * supabase.auth.getSession() can return null on the first tick while storage is
 * still hydrating (iOS WebView / PWA / Capacitor). INITIAL_SESSION is the signal
 * that restore finished — including "there is no session".
 */
let settled = false;
let resolveReady: () => void = () => {};
const ready = new Promise<void>((resolve) => {
  resolveReady = resolve;
});

function markReady() {
  if (settled) return;
  settled = true;
  resolveReady();
}

supabase.auth.onAuthStateChange((event) => {
  markReady();

  if (event === 'TOKEN_REFRESHED') return;

  if (event === 'SIGNED_IN') {
    localStorage.setItem('fresh-auth-session', 'true');
  } else if (event === 'SIGNED_OUT') {
    localStorage.removeItem('fresh-auth-session');
  }

  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
    window.dispatchEvent(new CustomEvent('auth-state-change'));
  }
});

const AUTH_READY_TIMEOUT_MS = 4000;

export function whenAuthReady(): Promise<void> {
  if (settled) return Promise.resolve();
  return Promise.race([
    ready,
    new Promise<void>((resolve) => {
      window.setTimeout(() => {
        markReady();
        resolve();
      }, AUTH_READY_TIMEOUT_MS);
    }),
  ]);
}
