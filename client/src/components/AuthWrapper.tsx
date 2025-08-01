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

  // For demo purposes, bypass authentication if Supabase is not configured
  // This allows users to experience the full Bytewise app
  if (!isConfigured) {
    console.log('🚀 Running Bytewise in demo mode - full app access enabled');
    return <>{children}</>;
  }

  // Loading screen
  if (loading) {
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
    return <LoginScreen onNavigate={onNavigate} />;
  }

  // Show authenticated content
  return <>{children}</>;
}