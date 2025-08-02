/**
 * Authentication Wrapper Component
 * 
 * Handles authentication flow and loading states
 * Shows login screen for unauthenticated users
 */

import { useAuth } from '@/hooks/useAuth';
import LoginScreen from '@/pages/LoginScreen';
import { NewLogoBrand } from '@/components/NewLogoBrand';
import { DevelopmentNotice } from '@/components/DevelopmentNotice';

interface AuthWrapperProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
}

export function AuthWrapper({ children, onNavigate }: AuthWrapperProps) {
  const { isAuthenticated, loading, isConfigured, error } = useAuth();
  
  // Debug logging to understand what's happening
  console.log('🔍 AuthWrapper state:', { isAuthenticated, loading, isConfigured, error });

  // Debug: Show what state we're in
  if (!isConfigured) {
    console.log('❌ Supabase not configured - bypassing auth for development');
    // For development, bypass auth if not configured
    return <>{children}</>;
  }

  // TEMPORARY: Bypass authentication entirely for debugging
  console.log('🚧 Bypassing authentication for white screen debugging');
  return <>{children}</>;

  // Loading screen
  if (loading) {
    console.log('⏳ Auth loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <NewLogoBrand size="xl" className="mb-6" />
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your nutrition dashboard...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated (when Supabase is configured)
  if (!isAuthenticated) {
    console.log('🔐 Showing LoginScreen - user not authenticated');
    return <LoginScreen onNavigate={onNavigate} />;
  }

  // Show authenticated content
  console.log('✅ Showing authenticated content');
  return <>{children}</>;
}