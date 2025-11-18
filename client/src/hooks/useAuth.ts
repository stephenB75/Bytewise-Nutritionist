import { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';

export function useAuth() {
  // Always call useEffect first to maintain hook order
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Mark this as a fresh authentication for tour purposes
          if (event === 'SIGNED_IN') {
            localStorage.setItem('fresh-auth-session', 'true');
          }
          
          // Trigger a refetch of user data when auth state changes
          window.dispatchEvent(new CustomEvent('auth-state-change'));
        } else if (event === 'SIGNED_OUT') {
          // Clear user data and fresh auth flag on sign out
          localStorage.removeItem('fresh-auth-session');
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
        let accessToken = null;
        
        // Get current Supabase session - this is the only source of truth
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          // Validate it looks like a proper JWT (3 parts separated by dots)
          if (session.access_token.split('.').length === 3) {
            accessToken = session.access_token;
          }
        }
        
        // Clear any legacy tokens from localStorage
        localStorage.removeItem('supabase.auth.token');
        
        if (!accessToken) {
          return null;
        }
        
        // Use the token to get user data from our backend
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (!response.ok) {
          // If unauthorized, return null instead of throwing
          if (response.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch user');
        }
        
        const userData = await response.json();
        return userData;
      } catch (error) {
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
      localStorage.removeItem('supabase.auth.token');
      
      // Try to sign out from Supabase
      await supabase.auth.signOut();
      
      // Call backend signout endpoint
      try {
        await fetch('/api/auth/signout', { method: 'POST' });
      } catch (fetchError) {
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