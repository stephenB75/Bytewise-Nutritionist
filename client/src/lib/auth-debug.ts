// Temporary auth debugging helper
export async function checkAuthStatus() {
  // Check Supabase session
  const stored = localStorage.getItem('bytewise-auth');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      return {
        hasSession: !!data.currentSession,
        token: data.currentSession?.access_token?.substring(0, 20) + '...',
        expiresAt: data.currentSession?.expires_at
      };
    } catch (e) {
      return { hasSession: false, error: 'Invalid session data' };
    }
  }
  return { hasSession: false, error: 'No session found' };
}

// Force refresh the session
export async function forceRefreshAuth() {
  const { supabase } = await import('./supabase');
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (session) {
    // Force reload of all components
    window.location.reload();
    return { success: true, session };
  }
  
  return { success: false, error };
}