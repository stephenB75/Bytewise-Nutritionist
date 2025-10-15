/**
 * Authentication Hook
 * Manages user authentication state and provides auth methods
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileIcon?: number;
  dailyCalorieGoal?: number;
  dailyProteinGoal?: number;
  dailyCarbGoal?: number;
  dailyFatGoal?: number;
  dailyWaterGoal?: number;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  // Force clear any invalid tokens on initialization
  useEffect(() => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token && typeof token === 'string' && token.length < 10) {
        console.log('🧹 Clearing invalid token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_at');
      }
    } catch (error) {
      console.error('Error checking token validity:', error);
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        console.log('🔍 Checking authentication state...', { token: token ? 'exists' : 'none' });
        
        if (token && typeof token === 'string' && token.length > 10) {
          const response = await fetch('/api/auth/user', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const user = await response.json();
            console.log('✅ User authenticated:', user.email);
            setAuthState({
              user,
              session: {
                access_token: token,
                refresh_token: localStorage.getItem('refresh_token') || '',
                expires_at: parseInt(localStorage.getItem('expires_at') || '0'),
                token_type: 'bearer',
                user,
              },
              isLoading: false,
              error: null,
            });
          } else {
            // Token is invalid, clear it
            console.log('❌ Token invalid, clearing authentication');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('expires_at');
            setAuthState({
              user: null,
              session: null,
              isLoading: false,
              error: null,
            });
          }
        } else {
          console.log('🔓 No token found, user not authenticated');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Session check error:', error);
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          error: 'Failed to check session',
        });
      }
    };

    checkSession();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store tokens in localStorage
      localStorage.setItem('auth_token', data.session.access_token);
      localStorage.setItem('refresh_token', data.session.refresh_token);
      localStorage.setItem('expires_at', data.session.expires_at.toString());
      
      setAuthState({
        user: data.user,
        session: data.session,
        isLoading: false,
        error: null,
      });

      return { data, error: null };
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      return { data: null, error };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      const data = await response.json();
      
      // Store tokens in localStorage
      localStorage.setItem('auth_token', data.session.access_token);
      localStorage.setItem('refresh_token', data.session.refresh_token);
      localStorage.setItem('expires_at', data.session.expires_at.toString());
      
      setAuthState({
        user: data.user,
        session: data.session,
        isLoading: false,
        error: null,
      });

      return { data, error: null };
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      return { data: null, error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('/api/auth/signout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expires_at');
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const refetch = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const user = await response.json();
          setAuthState(prev => ({
            ...prev,
            user,
            session: prev.session ? { ...prev.session, user } : null,
          }));
        }
      } catch (error) {
        console.error('Refetch error:', error);
      }
    }
  }, []);

  return {
    user: authState.user,
    session: authState.session,
    isLoading: authState.isLoading,
    error: authState.error,
    signIn,
    signUp,
    signOut,
    refetch,
    supabase, // For compatibility with existing code
  };
}
