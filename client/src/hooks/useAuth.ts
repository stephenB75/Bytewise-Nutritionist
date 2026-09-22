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

        const sessionUser = session?.user ? {
          id: session.user.id,
          email: session.user.email,
          emailVerified: !!session.user.email_confirmed_at,
          firstName: session.user.user_metadata?.first_name || session.user.user_metadata?.firstName || null,
          lastName: session.user.user_metadata?.last_name || session.user.user_metadata?.lastName || null,
          profileImageUrl: session.user.user_metadata?.avatar_url || null,
          dailyCalorieGoal: session.user.user_metadata?.calorie_goal || 2000,
          dailyProteinGoal: 150,
          dailyCarbGoal: 200,
          dailyFatGoal: 70,
          dailyWaterGoal: 8,
        } : null;
        
        // Use the token to get user data from our backend
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (!response.ok) {
          return sessionUser;
        }
        
        const userData = await response.json();
        const merged = userData || sessionUser;
        const missingName = !merged?.firstName || !merged?.lastName;
        if (merged?.id && missingName) {
          const { data: profile } = await supabase
            .from('users')
            .select('first_name, last_name, profile_icon')
            .eq('id', merged.id)
            .maybeSingle();
          if (profile) {
            return {
              ...merged,
              firstName: merged.firstName || profile.first_name,
              lastName: merged.lastName || profile.last_name,
              profileIcon: merged.profileIcon || profile.profile_icon,
            };
          }
        }
        return merged;
      } catch (error) {
        const { data: { session: fallbackSession } } = await supabase.auth.getSession();
        if (!fallbackSession?.user) {
          return null;
        }
        return {
          id: fallbackSession.user.id,
          email: fallbackSession.user.email,
          emailVerified: !!fallbackSession.user.email_confirmed_at,
          firstName: fallbackSession.user.user_metadata?.first_name || null,
          lastName: fallbackSession.user.user_metadata?.last_name || null,
        };
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