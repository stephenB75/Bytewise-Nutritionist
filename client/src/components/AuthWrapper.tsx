/**
 * Authentication Wrapper Component
 * 
 * Modern layout with sign-on module integration
 * Handles authentication state and routing
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginScreen from '@/pages/LoginScreen';

interface AuthWrapperProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
}

export function AuthWrapper({ children, onNavigate }: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  
  useEffect(() => {
    if (!loading && !user) {
      setShowLogin(true);
    } else if (user) {
      setShowLogin(false);
    }
  }, [user, loading]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading ByteWise...</p>
        </div>
      </div>
    );
  }
  
  if (showLogin && !user) {
    return <LoginScreen onNavigate={onNavigate} />;
  }
  
  return <>{children}</>;
}