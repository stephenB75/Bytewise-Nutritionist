import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ykgqcftrfvjblmqzbqvr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZ3FjZnRyZnZqYmxtcXpicXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3ODcxNjQsImV4cCI6MjA1MTM2MzE2NH0.x7kMQbFJevYhYe4LvBTIb3VjcL6H6M7AQwvR8IbgAY4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Use the session token to get user data from our backend
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          checkAuth();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    // Re-run the auth check
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch,
    supabase,
  };
}