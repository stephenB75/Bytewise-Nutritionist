import { supabase } from '@/lib/supabase';
import { ensureUserProfile, syncGuestMeals } from '@/lib/mealsApi';
import { getAuthRedirectUrl } from '@/lib/authRedirect';
import { apiFetch } from '@/lib/apiUrl';
import { queryClient } from '@/lib/queryClient';

export type AuthCode =
  | 'VERIFICATION_REQUIRED'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_NOT_FOUND'
  | 'SERVICE_ERROR'
  | 'NETWORK_ERROR'
  | 'RATE_LIMIT'
  | 'AUTH_ERROR';

type AuthErrorContext = 'signup' | 'signin' | 'reset' | 'resend' | 'generic';

function isRateLimitMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('too many') ||
    lower.includes('once every') ||
    lower.includes('over_email_send_rate_limit') ||
    lower.includes('429')
  );
}

function rateLimitUserMessage(context: AuthErrorContext, rawMessage: string): string {
  const lower = rawMessage.toLowerCase();
  const secondsMatch = lower.match(/(\d+)\s*seconds?/);
  const waitHint = secondsMatch
    ? ` Please wait about ${secondsMatch[1]} seconds and try again.`
    : ' Please wait a few minutes and try again.';

  switch (context) {
    case 'reset':
      return `Too many password reset emails sent.${waitHint}`;
    case 'resend':
      return `Too many verification emails sent.${waitHint}`;
    case 'signup':
      return `Too many sign-up attempts for this email.${waitHint}`;
    case 'signin':
      return `Too many sign-in attempts.${waitHint}`;
    default:
      if (lower.includes('email') || lower.includes('verification')) {
        return `Too many emails sent for this address.${waitHint}`;
      }
      return `Too many authentication attempts.${waitHint}`;
  }
}

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

function mapApiErrorBody(
  body: { message?: string; code?: string },
  email: string,
  context: AuthErrorContext = 'generic'
): AuthActionResult {
  const message = body.message || 'Authentication failed. Please try again.';
  if (isRateLimitMessage(message)) {
    return {
      ok: false,
      code: 'RATE_LIMIT',
      message: rateLimitUserMessage(context, message),
      email,
    };
  }
  switch (body.code) {
    case 'EMAIL_NOT_VERIFIED':
      return { ok: false, code: 'EMAIL_NOT_VERIFIED', message, email };
    case 'INVALID_CREDENTIALS':
      return { ok: false, code: 'INVALID_CREDENTIALS', message, email };
    case 'ACCOUNT_NOT_FOUND':
      return { ok: false, code: 'ACCOUNT_NOT_FOUND', message, email };
    case 'SERVICE_ERROR':
      return { ok: false, code: 'SERVICE_ERROR', message, email };
    case 'RATE_LIMIT':
      return {
        ok: false,
        code: 'RATE_LIMIT',
        message: rateLimitUserMessage(context, message),
        email,
      };
    default:
      return mapAuthError({ message, code: body.code }, email, context);
  }
}

function mapAuthError(
  error: { message?: string; code?: string } | null,
  email: string,
  context: AuthErrorContext = 'generic'
): AuthActionResult {
  const message = error?.message || 'Authentication failed. Please try again.';
  const lower = message.toLowerCase();

  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('fetch failed') ||
    lower.includes('network request failed') ||
    lower.includes('load failed')
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

  if (
    lower.includes('database error saving new user') ||
    lower.includes('database error') ||
    lower.includes('older profile') ||
    lower.includes('already tied to an account')
  ) {
    return {
      ok: false,
      code: 'ACCOUNT_EXISTS',
      message:
        'This email is already registered. Sign in instead, or use Forgot password to set a new password.',
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

  if (isRateLimitMessage(message)) {
    return {
      ok: false,
      code: 'RATE_LIMIT',
      message: rateLimitUserMessage(context, message),
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

function sessionToAppUser(session: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>) {
  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    emailVerified: !!u.email_confirmed_at,
    firstName: u.user_metadata?.first_name || u.user_metadata?.firstName || null,
    lastName: u.user_metadata?.last_name || u.user_metadata?.lastName || null,
    profileImageUrl: u.user_metadata?.avatar_url || null,
    dailyCalorieGoal: u.user_metadata?.calorie_goal || 2000,
    dailyProteinGoal: 150,
    dailyCarbGoal: 200,
    dailyFatGoal: 70,
    dailyWaterGoal: 8,
  };
}

async function finishSignedIn(): Promise<AuthActionResult> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token || !session.user?.id) {
    return {
      ok: false,
      code: 'AUTH_ERROR',
      message: 'Sign-in succeeded but no session was saved. Try again or refresh the page.',
    };
  }

  queryClient.setQueryData(['/api/auth/user'], sessionToAppUser(session));

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

  void queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
  window.dispatchEvent(new CustomEvent('auth-state-change'));
  return { ok: true, kind: 'signed_in' };
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
      session?: { access_token: string; refresh_token: string };
    };

    if (response.ok && body.session?.access_token && body.session.refresh_token) {
      markNewSignupForProfile();
      const { error: sessionError } = await supabase.auth.setSession(body.session);
      if (!sessionError) {
        return finishSignedIn();
      }
      console.warn('Could not apply sign-up session:', sessionError.message);
    }

    if (response.ok) {
      markNewSignupForProfile();
      return {
        ok: true,
        kind: 'verification_required',
        email: normalized,
      };
    }

    if (response.status === 429 || body.code === 'RATE_LIMIT') {
      return mapApiErrorBody({ ...body, code: 'RATE_LIMIT' }, normalized, 'signup');
    }

    if (response.status >= 500) {
      return mapApiErrorBody({ ...body, code: body.code || 'SERVICE_ERROR' }, normalized, 'signup');
    }

    return mapApiErrorBody(body, normalized, 'signup');
  } catch (error) {
    // Fetch threw (unreachable server, CORS, etc.) — 4xx/5xx responses are handled above.
    if (isNetworkFailure(error)) {
      console.warn('Signup API unreachable, falling back to Supabase client:', error);
    } else {
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
    return mapAuthError(error, normalized, 'signup');
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
    return mapAuthError(error, normalized, 'signin');
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
  // Sign in directly with Supabase (session in browser). Server /api/auth/signin is not required.
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

    const body = (await response.json().catch(() => ({}))) as { message?: string; code?: string };
    if (response.status === 429 || body.code === 'RATE_LIMIT') {
      return mapApiErrorBody({ ...body, code: 'RATE_LIMIT' }, normalized, 'reset');
    }
    const serverMessage = body.message || `Password reset failed (${response.status})`;
    return mapAuthError({ message: serverMessage, code: body.code }, normalized, 'reset');
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
    return mapAuthError(error, normalized, 'reset');
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
    if (response.status === 429 || body.code === 'RATE_LIMIT') {
      return mapApiErrorBody({ ...body, code: 'RATE_LIMIT' }, normalized, 'resend');
    }
    return mapApiErrorBody(body, normalized, 'resend');
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
    return mapAuthError(error, normalized, 'resend');
  }

  return { ok: true, kind: 'verification_required', email: normalized };
}
