import { supabase } from '@/lib/supabase';
import { ensureUserProfile, syncGuestMeals } from '@/lib/mealsApi';
import { getAuthRedirectUrl } from '@/lib/authRedirect';
import { apiFetch } from '@/lib/apiUrl';

export type AuthCode =
  | 'VERIFICATION_REQUIRED'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_NOT_FOUND'
  | 'SERVICE_ERROR'
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR';

export type AuthActionResult =
  | { ok: true; kind: 'signed_in' }
  | { ok: true; kind: 'verification_required'; email: string }
  | { ok: false; code: AuthCode; message: string; email?: string };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isNetworkFailure(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  const message = error instanceof Error ? error.message : String(error ?? '');
  const lower = message.toLowerCase();
  return (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('load failed') ||
    lower.includes('network request failed')
  );
}

function mapApiErrorBody(body: { message?: string; code?: string }, email: string): AuthActionResult {
  const message = body.message || 'Authentication failed. Please try again.';
  switch (body.code) {
    case 'EMAIL_NOT_VERIFIED':
      return { ok: false, code: 'EMAIL_NOT_VERIFIED', message, email };
    case 'INVALID_CREDENTIALS':
      return { ok: false, code: 'INVALID_CREDENTIALS', message, email };
    case 'ACCOUNT_NOT_FOUND':
      return { ok: false, code: 'ACCOUNT_NOT_FOUND', message, email };
    case 'SERVICE_ERROR':
      return { ok: false, code: 'SERVICE_ERROR', message, email };
    default:
      return mapAuthError({ message, code: body.code }, email);
  }
}

function mapAuthError(error: { message?: string; code?: string } | null, email: string): AuthActionResult {
  const message = error?.message || 'Authentication failed. Please try again.';
  const lower = message.toLowerCase();

  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('fetch failed') ||
    lower.includes('connection')
  ) {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message:
        'Could not reach the authentication service. Check your connection, then try again. If this continues, refresh the page.',
      email,
    };
  }

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

  if (lower.includes('redirect') || lower.includes('redirect_to')) {
    return {
      ok: false,
      code: 'AUTH_ERROR',
      message:
        'Password reset could not be started because the redirect URL is not allowed in Supabase. Add /auth/confirm to Auth redirect URLs.',
      email,
    };
  }

  if (lower.includes('rate limit') || lower.includes('too many')) {
    return {
      ok: false,
      code: 'AUTH_ERROR',
      message: 'Too many reset attempts. Please wait a few minutes and try again.',
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
  try {
    await ensureUserProfile();
  } catch (error) {
    console.warn('ensureUserProfile after sign-in:', error);
  }
  try {
    await syncGuestMeals();
  } catch (error) {
    console.warn('syncGuestMeals after sign-in:', error);
  }
  window.dispatchEvent(new CustomEvent('auth-state-change'));
  return { ok: true, kind: 'signed_in' };
}

async function applyServerSession(session: {
  access_token: string;
  refresh_token: string;
}): Promise<AuthActionResult | null> {
  const { error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (error) {
    return mapAuthError(error, '');
  }
  return finishSignedIn();
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthActionResult> {
  const normalized = normalizeEmail(email);

  try {
    const response = await apiFetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized, password }),
    });

    const body = (await response.json().catch(() => ({}))) as {
      message?: string;
      code?: string;
      requiresVerification?: boolean;
    };

    if (response.ok) {
      markNewSignupForProfile();
      return {
        ok: true,
        kind: 'verification_required',
        email: normalized,
      };
    }

    if (response.status >= 500) {
      return mapApiErrorBody({ ...body, code: body.code || 'SERVICE_ERROR' }, normalized);
    }

    return mapApiErrorBody(body, normalized);
  } catch (error) {
    if (!isNetworkFailure(error)) {
      console.warn('Signup API failed, falling back to Supabase client:', error);
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalized,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl('/auth/confirm'),
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

async function signInWithSupabaseClient(
  normalized: string,
  password: string
): Promise<AuthActionResult> {
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
      message:
        'Please verify your email before signing in. Check your inbox for the verification link.',
      email: normalized,
    };
  }

  return finishSignedIn();
}

export async function signInWithEmail(email: string, password: string): Promise<AuthActionResult> {
  const normalized = normalizeEmail(email);

  try {
    const response = await apiFetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized, password }),
    });

    const body = (await response.json().catch(() => ({}))) as {
      message?: string;
      code?: string;
      session?: { access_token: string; refresh_token: string };
    };

    if (response.ok && body.session?.access_token && body.session?.refresh_token) {
      const applied = await applyServerSession(body.session);
      if (applied?.ok) {
        return applied;
      }
      console.warn('Server session could not be applied, trying direct sign-in');
    }

    if (response.ok && !body.session?.access_token) {
      console.warn('Sign-in API returned 200 without session');
    }

    if (!response.ok && response.status < 500) {
      const code = body.code;
      if (code === 'EMAIL_NOT_VERIFIED') {
        return mapApiErrorBody(body, normalized);
      }
      if (code === 'INVALID_CREDENTIALS' || code === 'SIGNIN_FAILED') {
        const clientResult = await signInWithSupabaseClient(normalized, password);
        if (clientResult.ok || clientResult.code === 'EMAIL_NOT_VERIFIED') {
          return clientResult;
        }
        return mapApiErrorBody(body, normalized);
      }
      if (code !== 'ACCOUNT_NOT_FOUND') {
        return mapApiErrorBody(body, normalized);
      }
    }

    if (!response.ok && response.status >= 500) {
      return mapApiErrorBody({ ...body, code: body.code || 'SERVICE_ERROR' }, normalized);
    }
  } catch (error) {
    if (isNetworkFailure(error)) {
      return signInWithSupabaseClient(normalized, password);
    }
    console.warn('Sign-in API failed, falling back to Supabase client:', error);
  }

  return signInWithSupabaseClient(normalized, password);
}

export async function resetPasswordForEmail(email: string): Promise<AuthActionResult> {
  const normalized = normalizeEmail(email);
  const redirectTo = getAuthRedirectUrl('/auth/confirm');

  // Server uses APP_URL + service role — avoids browser redirect/CORS issues
  try {
    const response = await apiFetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized, redirectTo }),
    });

    if (response.ok) {
      return { ok: true, kind: 'verification_required', email: normalized };
    }

    const body = (await response.json().catch(() => ({}))) as { message?: string };
    const serverMessage = body.message || `Password reset failed (${response.status})`;
    return mapAuthError({ message: serverMessage, code: body.code }, normalized);
  } catch (error) {
    if (isNetworkFailure(error)) {
      return {
        ok: false,
        code: 'NETWORK_ERROR',
        message: 'Could not reach the server to send a reset email. Check your connection and try again.',
        email: normalized,
      };
    }
    // Fall back to direct Supabase when API is unreachable (e.g. local dev without server)
  }

  const { error } = await supabase.auth.resetPasswordForEmail(normalized, { redirectTo });

  if (error) {
    return mapAuthError(error, normalized);
  }

  return { ok: true, kind: 'verification_required', email: normalized };
}

export async function resendVerificationEmail(email: string): Promise<AuthActionResult> {
  const normalized = normalizeEmail(email);

  try {
    const response = await apiFetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized }),
    });

    if (response.ok) {
      return { ok: true, kind: 'verification_required', email: normalized };
    }

    const body = (await response.json().catch(() => ({}))) as { message?: string; code?: string };
    return mapApiErrorBody(body, normalized);
  } catch (error) {
    if (isNetworkFailure(error)) {
      return {
        ok: false,
        code: 'NETWORK_ERROR',
        message: 'Could not resend verification email. Check your connection and try again.',
        email: normalized,
      };
    }
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: normalized,
    options: {
      emailRedirectTo: getAuthRedirectUrl('/auth/confirm'),
    },
  });

  if (error) {
    return mapAuthError(error, normalized);
  }

  return { ok: true, kind: 'verification_required', email: normalized };
}
