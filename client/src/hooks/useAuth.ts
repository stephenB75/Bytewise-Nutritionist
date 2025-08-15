import { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';

export function useAuth() {
  // Set up auth state listener
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
          console.log('📡 Triggering auth state change event...');
          window.dispatchEvent(new CustomEvent('auth-state-change'));
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out, clearing auth state...');
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
              console.log('🔍 Found locally stored custom token');
              accessToken = parsedSession.access_token;
            }
          } catch (e) {
            console.log('❌ Failed to parse stored session');
          }
        }
        
        // If no custom token, check Supabase session
        if (!accessToken) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            console.log('🔍 Found Supabase session token');
            accessToken = session.access_token;
          }
        }
        
        if (!accessToken) {
          console.log('❌ No access token found');
          return null;
        }
        
        // Make authenticated request to user endpoint
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          console.log('❌ Auth request failed:', response.status);
          return null;
        }
        
        const userData = await response.json();
        console.log('✅ User data retrieved:', { hasUser: !!userData });
        return userData;
        
      } catch (error) {
        console.log('❌ Auth query error:', error);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Sign out function
  const signOut = async () => {
    try {
      console.log('🚪 Starting sign out process...');
      
      // Clear custom tokens
      localStorage.removeItem('supabase.auth.token');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Call backend signout endpoint
      await fetch('/api/auth/signout', { method: 'POST' });
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('✅ Sign out complete');
      
      // Reload page to reset state
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ Sign out error:', error);
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