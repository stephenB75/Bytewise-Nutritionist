/**
 * Session Manager Hook
 * Manages user session with extended 24-hour timeout
 */

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const REFRESH_INTERVAL = 60 * 60 * 1000; // Refresh every hour
const WARNING_BEFORE_EXPIRY = 30 * 60 * 1000; // Warn 30 minutes before expiry

export function useSessionManager() {
  const { toast } = useToast();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Refresh the session token
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        return false;
      }

      if (session) {
        // Refresh the token
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('Token refresh error:', refreshError);
          return false;
        }

        if (data.session) {
          // Session refreshed successfully
          
          // Store refresh timestamp in localStorage
          localStorage.setItem('bytewise-last-refresh', Date.now().toString());
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  }, []);

  // Check if session needs refresh based on activity
  const checkSessionStatus = useCallback(async () => {
    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;
    
    // If user has been inactive for more than 24 hours, prompt re-login
    if (timeSinceActivity > SESSION_TIMEOUT) {
      toast({
        title: "Session Expired",
        description: "Your session has expired due to inactivity. Please log in again.",
        variant: "destructive",
      });
      
      // Sign out the user
      await supabase.auth.signOut();
      window.location.href = '/';
      return;
    }

    // Refresh session proactively
    await refreshSession();
  }, [refreshSession, toast]);

  // Set up session warning
  const setupSessionWarning = useCallback(() => {
    // Clear existing warning timer
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Set warning timer for 30 minutes before expiry
    warningTimerRef.current = setTimeout(() => {
      toast({
        title: "Session Expiring Soon",
        description: "Your session will expire in 30 minutes. Any activity will extend it.",
        variant: "default",
      });
    }, SESSION_TIMEOUT - WARNING_BEFORE_EXPIRY);
  }, [toast]);

  // Initialize session management
  useEffect(() => {
    // Set up activity listeners
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      updateActivity();
      
      // Reset warning timer on activity
      setupSessionWarning();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Set up periodic session refresh
    refreshTimerRef.current = setInterval(() => {
      checkSessionStatus();
    }, REFRESH_INTERVAL);

    // Initial session check
    checkSessionStatus();
    
    // Set up initial warning timer
    setupSessionWarning();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Reset activity and timers on sign in or token refresh
        updateActivity();
        setupSessionWarning();
        
        // Store session start time
        if (event === 'SIGNED_IN') {
          localStorage.setItem('bytewise-session-start', Date.now().toString());
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear timers on sign out
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
        if (warningTimerRef.current) {
          clearTimeout(warningTimerRef.current);
        }
        
        // Clear stored session data
        localStorage.removeItem('bytewise-session-start');
        localStorage.removeItem('bytewise-last-refresh');
      }
    });

    // Cleanup function
    return () => {
      // Remove event listeners
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });

      // Clear timers
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }

      // Unsubscribe from auth listener
      authListener?.subscription.unsubscribe();
    };
  }, [updateActivity, checkSessionStatus, setupSessionWarning]);

  // Return session info for debugging
  return {
    refreshSession,
    updateActivity,
    getSessionInfo: () => {
      const sessionStart = localStorage.getItem('bytewise-session-start');
      const lastRefresh = localStorage.getItem('bytewise-last-refresh');
      const now = Date.now();
      
      return {
        sessionStart: sessionStart ? new Date(parseInt(sessionStart)) : null,
        lastRefresh: lastRefresh ? new Date(parseInt(lastRefresh)) : null,
        lastActivity: new Date(lastActivityRef.current),
        timeUntilExpiry: SESSION_TIMEOUT - (now - lastActivityRef.current),
      };
    },
  };
}