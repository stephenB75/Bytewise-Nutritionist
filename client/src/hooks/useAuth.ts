import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';
import { apiFetch } from '@/lib/apiUrl';
import { queryClient } from '@/lib/queryClient';

// useAuth is mounted by many components; register auth listeners once so a single
// Supabase event produces a single refetch instead of one per mounted hook.
let authListenersRegistered = false;

function registerAuthListeners() {
  if (authListenersRegistered) return;
  authListenersRegistered = true;

  supabase.auth.onAuthStateChange((event) => {
    // TOKEN_REFRESHED is routine (autoRefreshToken) and doesn't change the user.
    if (event === 'SIGNED_IN') {
      localStorage.setItem('fresh-auth-session', 'true');
      window.dispatchEvent(new CustomEvent('auth-state-change'));
    } else if (event === 'SIGNED_OUT') {
      localStorage.removeItem('fresh-auth-session');
      window.dispatchEvent(new CustomEvent('auth-state-change'));
    } else if (event === 'USER_UPDATED') {
      window.dispatchEvent(new CustomEvent('auth-state-change'));
    }
  });

  window.addEventListener('auth-state-change', () => {
    void queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
  });
}

export function useAuth() {
  registerAuthListeners();

  const { data: user, isLoading, isFetching, refetch } = useQuery({
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
        
        if (!accessToken || !session?.user?.id) {
          return null;
        }

        const authUserId = session.user.id;

        const sessionUser = session?.user ? {
          id: authUserId,
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
        const response = await apiFetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (!response.ok) {
          return sessionUser;
        }
        
        const userData = await response.json();
        const merged = userData || sessionUser;
        const withAuthId = merged ? { ...merged, id: authUserId } : sessionUser;
        const missingName = !withAuthId?.firstName || !withAuthId?.lastName;
        if (withAuthId?.id && missingName) {
          const { data: profile } = await supabase
            .from('users')
            .select('first_name, last_name, profile_icon')
            .eq('id', authUserId)
            .maybeSingle();
          if (profile) {
            return {
              ...withAuthId,
              firstName: withAuthId.firstName || profile.first_name,
              lastName: withAuthId.lastName || profile.last_name,
              profileIcon: withAuthId.profileIcon || profile.profile_icon,
            };
          }
        }
        return withAuthId;
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

  const signOut = async () => {
    try {
      localStorage.removeItem('supabase.auth.token');
      
      // Try to sign out from Supabase
      await supabase.auth.signOut();
      
      // Call backend signout endpoint
      try {
        await apiFetch('/api/auth/signout', { method: 'POST' });
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
    // Background refetches keep showing the current user instead of a loading state.
    isLoading: isLoading || (isFetching && !user),
    isAuthenticated: !!user,
    refetch,
    supabase,
    signOut,
  };
}