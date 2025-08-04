import { useQuery } from "@tanstack/react-query";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ykgqcftrfvjblmqzbqvr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZ3FjZnRyZnZqYmxtcXpicXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3ODcxNjQsImV4cCI6MjA1MTM2MzE2NH0.x7kMQbFJevYhYe4LvBTIb3VjcL6H6M7AQwvR8IbgAY4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return null;
      }
      
      // Use the session token to get user data from our backend
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      
      return response.json();
    },
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch,
    supabase,
  };
}