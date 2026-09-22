import type { EmailOtpType, SupabaseClient } from '@supabase/supabase-js';
import { parseAuthLinkParams } from '@/lib/authLinkParams';

export type RecoverySessionResult =
  | { ok: true }
  | { ok: false; message: string };

function cleanRecoveryUrl(): void {
  if (typeof window === 'undefined') return;
  window.history.replaceState({}, document.title, '/reset-password');
}

function decodeAuthError(message: string | null): string | null {
  if (!message) return null;
  try {
    return decodeURIComponent(message.replace(/\+/g, ' '));
  } catch {
    return message;
  }
}

async function waitForSession(
  supabase: SupabaseClient,
  attempts = 8,
  delayMs = 200
): Promise<boolean> {
  for (let i = 0; i < attempts; i += 1) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return true;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
}

/**
 * Establishes a Supabase session from a password-reset email link.
 * Supports PKCE (?code=), token_hash (?token_hash=&type=recovery), and implicit (#access_token=) flows.
 */
export async function establishRecoverySession(
  supabase: SupabaseClient
): Promise<RecoverySessionResult> {
  const params = parseAuthLinkParams();
  const authErrorQuery = new URLSearchParams(window.location.search).get('auth_error');

  if (params.error) {
    return {
      ok: false,
      message: decodeAuthError(params.error_description) || params.error,
    };
  }

  if (authErrorQuery) {
    return { ok: false, message: decodeAuthError(authErrorQuery) || 'Reset link failed.' };
  }

  try {
    if (params.code) {
      const { error } = await supabase.auth.exchangeCodeForSession(params.code);
      if (error) {
        return { ok: false, message: error.message || 'Invalid or expired reset link.' };
      }
      cleanRecoveryUrl();
      return { ok: true };
    }

    if (params.token_hash) {
      const otpType = (params.type || 'recovery') as EmailOtpType;
      const { error } = await supabase.auth.verifyOtp({
        token_hash: params.token_hash,
        type: otpType,
      });
      if (error) {
        return { ok: false, message: error.message || 'Invalid or expired reset link.' };
      }
      cleanRecoveryUrl();
      return { ok: true };
    }

    if (params.type === 'recovery' && params.access_token) {
      const { error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token || '',
      });
      if (error) {
        return { ok: false, message: error.message || 'Invalid or expired reset link.' };
      }
      cleanRecoveryUrl();
      return { ok: true };
    }

    const hasSession = await waitForSession(supabase);
    if (hasSession) {
      cleanRecoveryUrl();
      return { ok: true };
    }

    return {
      ok: false,
      message:
        'Invalid or expired reset link. Request a new password reset from Profile (Forgot password?).',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not open reset link.';
    return { ok: false, message };
  }
}
