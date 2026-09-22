export type AuthLinkParams = {
  code: string | null;
  token_hash: string | null;
  type: string | null;
  access_token: string | null;
  refresh_token: string | null;
  error: string | null;
  error_description: string | null;
};

export function parseAuthLinkParams(location: Location = window.location): AuthLinkParams {
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
  const query = new URLSearchParams(location.search);
  const get = (key: string) => query.get(key) || hash.get(key);

  return {
    code: get('code'),
    token_hash: get('token_hash'),
    type: get('type'),
    access_token: get('access_token'),
    refresh_token: get('refresh_token'),
    error: get('error'),
    error_description: get('error_description'),
  };
}

export function hasRecoveryAuthParams(params: AuthLinkParams = parseAuthLinkParams()): boolean {
  if (params.type === 'recovery') return true;
  if (params.token_hash && (!params.type || params.type === 'recovery')) return true;
  if (params.access_token && params.type === 'recovery') return true;
  if (params.code) return true;
  return false;
}

/** Send users with recovery tokens on the wrong path to the reset flow. */
export function routeAuthCallbackPath(): void {
  if (typeof window === 'undefined') return;

  const path = window.location.pathname;
  const params = parseAuthLinkParams();
  const suffix = `${window.location.search}${window.location.hash}`;

  if (params.error && params.type === 'recovery' && path !== '/reset-password') {
    const msg = encodeURIComponent(params.error_description || params.error || 'Reset link failed');
    window.location.replace(`/reset-password?auth_error=${msg}`);
    return;
  }

  if (!hasRecoveryAuthParams(params)) {
    return;
  }

  if (path === '/reset-password' || path === '/auth/confirm') {
    return;
  }

  if (params.token_hash || params.code) {
    window.location.replace(`/auth/confirm${suffix}`);
    return;
  }

  window.location.replace(`/reset-password${suffix}`);
}
