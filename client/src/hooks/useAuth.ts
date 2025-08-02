/**
 * Supabase Authentication Hook
 * Manages user authentication state with Supabase Auth
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { userApi } from '../lib/api';
import { config } from '../lib/config';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Check if Supabase is properly configured
  const isConfigured = config.supabase.isConfigured;

  // Get user profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => userApi.getCurrentUser(),
    enabled: !!user,
    retry: false,
  });

  useEffect(() => {
    // Skip auth setup if not configured
    if (!isConfigured) {
      setLoading(false);
      setError('Supabase not configured');
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth session error:', error);
        setError(error.message);
      }
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      console.error('Auth setup error:', err);
      setError('Authentication setup failed');
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle user creation on sign up
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        
        try {
          await userApi.upsertUser({
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name,
            last_name: user.user_metadata?.last_name,
            profile_image_url: user.user_metadata?.avatar_url,
          });
          
          // Invalidate and refetch user profile
          queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        } catch (error) {
          console.error('Error upserting user:', error);
        }
      }

      // Clear queries on sign out
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Sign in with email
  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Sign up with email
  const signUpWithEmail = async (
    email: string, 
    password: string, 
    userData?: { first_name?: string; last_name?: string }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    if (error) throw error;
    return data;
  };

  // Sign in with OAuth provider
  const signInWithProvider = async (provider: 'google' | 'github' | 'discord') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Reset password
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  };

  return {
    user,
    profile,
    loading: loading || profileLoading,
    isAuthenticated: !!user && isConfigured,
    isConfigured,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithProvider,
    signOut,
    resetPassword,
  };
}