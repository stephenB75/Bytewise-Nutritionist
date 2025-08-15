import { useEffect } from "react";
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
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            return null;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        return userData;
        
      } catch (error) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false
  });

  // Sign out function
  const signOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear custom tokens from localStorage
      localStorage.removeItem('supabase.auth.token');
      
      // Make request to backend signout endpoint
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Trigger auth state change event
      window.dispatchEvent(new CustomEvent('auth-state-change'));
      
      // Force page reload to clear all state
      window.location.reload();
      
    } catch (error) {
      // Still clear tokens on error
      localStorage.removeItem('supabase.auth.token');
      window.location.reload();
    }
  };

  return {
    user,
    isLoading,
    refetch,
    signOut
  };
}