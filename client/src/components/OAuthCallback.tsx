/**
 * OAuth Callback Handler
 * Handles OAuth redirects from Google and GitHub
 */

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function OAuthCallback() {
  const { supabase, refetch } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data.session) {
          toast({
            title: "Successfully signed in!",
            description: "Welcome to ByteWise Nutritionist",
          });
          
          // Refresh auth state
          await refetch();
          
          // Redirect to main app
          window.location.href = '/';
        }
      } catch (error: any) {
        toast({
          title: "Authentication Error",
          description: "Something went wrong during sign in. Please try again.",
          variant: "destructive",
        });
      }
    };

    // Check if this is an OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code') || urlParams.get('access_token')) {
      handleAuthCallback();
    }
  }, [supabase, toast, refetch]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Completing sign in...</p>
      </div>
    </div>
  );
}