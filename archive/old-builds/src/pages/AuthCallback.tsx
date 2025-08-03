/**
 * OAuth Authentication Callback Page
 * Handles OAuth provider redirects for Supabase Auth
 */

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface NavigateFunction {
  (path: string): void;
}

export function AuthCallback() {
  // Simple navigation replacement since wouter's useNavigate is not available
  const navigate: NavigateFunction = (path: string) => {
    window.location.href = path;
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login?error=auth_callback_failed');
          return;
        }

        if (data.session) {
          console.log('Auth callback successful');
          navigate('/');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Unexpected auth callback error:', error);
        navigate('/login?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we finish setting up your account.</p>
      </div>
    </div>
  );
}

export default AuthCallback;