import React, { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';

export function useAuth() {
  // Always call useEffect first to maintain hook order  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id?.substring(0, 8) + '...' || 'none'
        });
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Trigger a refetch of user data when auth state changes
          console.log('📡 Triggering auth state change event...');
          window.dispatchEvent(new CustomEvent('auth-state-change'));
        } else if (event === 'SIGNED_OUT') {
          // Clear user data on sign out
          console.log('🚪 User signed out, clearing auth state...');
          window.dispatchEvent(new CustomEvent('auth-state-change'));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        // Check for locally stored custom tokens first
        const storedSession = localStorage.getItem('supabase.auth.token');
        let accessToken = null;
        
        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            if (parsedSession.access_token) {
              console.log('🔍 Found locally stored custom token:', {
                hasToken: true,
                tokenLength: parsedSession.access_token.length,
                isCustomToken: parsedSession.access_token.startsWith('verified_')
              });
              accessToken = parsedSession.access_token;
            }
          } catch (parseError) {
            console.log('⚠️ Failed to parse stored session:', parseError);
          }
        }
        
        // If no custom token, check Supabase session
        if (!accessToken) {
          const { data: { session } } = await supabase.auth.getSession();
          
          console.log('🔍 useAuth query - Supabase session check:', {
            hasSession: !!session,
            hasAccessToken: !!session?.access_token,
            tokenLength: session?.access_token?.length
          });
          
          if (session?.access_token) {
            accessToken = session.access_token;
          }
        }
        
        if (!accessToken) {
          console.log('❌ No valid session found (neither custom nor Supabase)');
          return null;
        }
        
        // Use the token to get user data from our backend
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        console.log('🔍 Backend user fetch response:', {
          status: response.status,
          ok: response.ok
        });
        
        if (!response.ok) {
          // If unauthorized, return null instead of throwing
          if (response.status === 401) {
            console.log('❌ Unauthorized - token may be invalid');
            return null;
          }
          throw new Error('Failed to fetch user');
        }
        
        const userData = await response.json();
        console.log('✅ User data fetched successfully:', !!userData);
        return userData;
      } catch (error) {
        console.log('❌ Auth query error:', error);
        // Return null for any authentication errors
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Listen for auth state changes to refetch
  useEffect(() => {
    const handleAuthChange = () => refetch();
    window.addEventListener('auth-state-change', handleAuthChange);
    return () => window.removeEventListener('auth-state-change', handleAuthChange);
  }, [refetch]);

  const signOut = async () => {
    try {
      console.log('🚪 Starting sign out process...');
      
      // Clear localStorage first
      localStorage.removeItem('supabase.auth.token');
      console.log('✅ Cleared localStorage custom tokens');
      
      // Try to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('⚠️ Supabase signOut error:', error);
      } else {
        console.log('✅ Supabase session cleared');
      }
      
      // Call backend signout endpoint
      try {
        await fetch('/api/auth/signout', { method: 'POST' });
        console.log('✅ Backend signout called');
      } catch (fetchError) {
        console.log('⚠️ Backend signout error:', fetchError);
      }
      
      // Force refresh auth state
      await refetch();
      
      // Trigger custom event for auth state change
      window.dispatchEvent(new CustomEvent('auth-state-change'));
      
      console.log('✅ Sign out completed');
      
      // Optionally reload page to clear all state
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch,
    supabase,
    signOut,
  };
}