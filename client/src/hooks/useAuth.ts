import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export function useAuth() {
  // Always call useEffect first to maintain hook order
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Trigger a refetch of user data when auth state changes
          window.dispatchEvent(new CustomEvent('auth-state-change'));
        } else if (event === 'SIGNED_OUT') {
          // Clear user data on sign out
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
        // Get current session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('🔍 useAuth query - session check:', {
          hasSession: !!session,
          hasAccessToken: !!session?.access_token,
          tokenLength: session?.access_token?.length
        });
        
        if (!session?.access_token) {
          console.log('❌ No valid session found');
          return null;
        }
        
        // Use the session token to get user data from our backend
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
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

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch,
    supabase,
  };
}