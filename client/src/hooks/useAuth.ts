import { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';

export function useAuth() {
  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          window.dispatchEvent(new CustomEvent('auth-state-change'));
        } else if (event === 'SIGNED_OUT') {
          window.dispatchEvent(new CustomEvent('auth-state-change'));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Query user data
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
              accessToken = parsedSession.access_token;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
        
        // If no custom token, check Supabase session
        if (!accessToken) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            accessToken = session.access_token;
          }
        }
        
        if (!accessToken) {
          return null;
        }
        
        // Make authenticated request to user endpoint
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          return null;
        }
        
        const userData = await response.json();
        return userData;
        
      } catch (error) {
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Sign out function
  const signOut = async () => {
    try {
      // Clear custom tokens
      localStorage.removeItem('supabase.auth.token');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Call backend signout endpoint
      await fetch('/api/auth/signout', { method: 'POST' });
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Reload page to reset state
      window.location.href = '/';
      
    } catch (error) {
      // Force reload anyway
      window.location.href = '/';
    }
  };

  return {
    user,
    isLoading,
    refetch,
    signOut,
    supabase
  };
}