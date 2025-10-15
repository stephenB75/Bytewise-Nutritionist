/**
 * Session Manager Hook
 * Manages user session state and token refresh
 */

import { useEffect, useCallback } from 'react';

export function useSessionManager() {
  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!token || !refreshToken) {
      return false;
    }
    
    try {
      // Check if token is expired
      const expiresAt = parseInt(localStorage.getItem('expires_at') || '0');
      const now = Math.floor(Date.now() / 1000);
      
      if (now >= expiresAt) {
        // Token expired, try to refresh
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('auth_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          localStorage.setItem('expires_at', data.expires_at.toString());
          return true;
        } else {
          // Refresh failed, clear tokens
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('expires_at');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  }, []);

  const getSessionInfo = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    const expiresAt = parseInt(localStorage.getItem('expires_at') || '0');
    const now = Math.floor(Date.now() / 1000);
    
    return {
      isAuthenticated: !!token,
      isExpired: now >= expiresAt,
      expiresAt,
      timeUntilExpiry: Math.max(0, expiresAt - now),
    };
  }, []);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const sessionInfo = getSessionInfo();
      if (sessionInfo.isAuthenticated && sessionInfo.isExpired) {
        await refreshSession();
      }
    };
    
    checkSession();
  }, [getSessionInfo, refreshSession]);

  return {
    refreshSession,
    getSessionInfo,
  };
}
