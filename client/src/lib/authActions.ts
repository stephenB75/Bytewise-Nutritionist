import { supabase } from '@/lib/supabase';
import { ensureUserProfile, syncGuestMeals } from '@/lib/mealsApi';

export type AuthCode =
  | 'VERIFICATION_REQUIRED'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_NOT_FOUND'
  | 'AUTH_ERROR';

export type AuthActionResult =
  | { ok: true; kind: 'signed_in' }
  | { ok: true; kind: 'verification_required'; email: string }
  | { ok: false; code: AuthCode; message: string; email?: string };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function mapAuthError(error: { message?: string; code?: string } | null, email: string): AuthActionResult {
  const message = error?.message || 'Authentication failed. Please try again.';
  const lower = message.toLowerCase();

  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
    return {
      ok: false,
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email before signing in. Check your inbox for the verification link.',
      email,
    };
  }

  if (lower.includes('already registered') || lower.includes('user already exists')) {
    return {
      ok: false,
      code: 'ACCOUNT_EXISTS',
      message: 'An account with this email already exists. Please sign in instead.',
      email,
    };
  }

  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return {
      ok: false,
      code: 'INVALID_CREDENTIALS',
      message: 'Email or password is incorrect.',
      email,
    };
  }

  return { ok: false, code: 'AUTH_ERROR', message, email };
}

const PROFILE_COMPLETION_KEY = 'profile-completion-pending';

export function markNewSignupForProfile() {
  localStorage.setItem(PROFILE_COMPLETION_KEY, 'true');
}

export function clearProfileCompletionPrompt() {
  localStorage.removeItem(PROFILE_COMPLETION_KEY);
}

export function shouldShowProfileCompletion() {
  return localStorage.getItem(PROFILE_COMPLETION_KEY) === 'true';
}

async function finishSignedIn(): Promise<AuthActionResult> {
  await ensureUserProfile();
  await syncGuestMeals();
  window.dispatchEvent(new CustomEvent('auth-state-change'));
  return { ok: true, kind: 'signed_in' };
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthActionResult> {
  const normalized = normalizeEmail(email);
  const { data, error } = await supabase.auth.signUp({
    email: normalized,
    password,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) {
    return mapAuthError(error, normalized);
  }

  if (data?.user?.identities?.length === 0) {
    return {
      ok: false,
      code: 'ACCOUNT_EXISTS',
      message: 'An account with this email already exists. Please sign in instead.',
      email: normalized,
    };
  }

  markNewSignupForProfile();

  if (data.session && data.user?.email_confirmed_at) {
    return finishSignedIn();
  }

  return {
    ok: true,
    kind: 'verification_required',
    email: normalized,
  };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthActionResult> {
  const normalized = normalizeEmail(email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalized,
    password,
  });

  if (error) {
    return mapAuthError(error, normalized);
  }

  if (data?.user && !data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    return {
      ok: false,
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email before signing in. Check your inbox for the verification link.',
      email: normalized,
    };
  }

  return finishSignedIn();
}

export async function resetPasswordForEmail(email: string): Promise<AuthActionResult> {
  const normalized = normalizeEmail(email);
  const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    return mapAuthError(error, normalized);
  }

  return { ok: true, kind: 'verification_required', email: normalized };
}

export async function resendVerificationEmail(email: string): Promise<AuthActionResult> {
  const normalized = normalizeEmail(email);
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: normalized,
  });

  if (error) {
    return mapAuthError(error, normalized);
  }

  return { ok: true, kind: 'verification_required', email: normalized };
}
