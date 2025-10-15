/**
 * Bytewise Main Application Component
 * 
 * Complete mobile-first PWA with four main screens
 * Features brand-compliant design and seamless navigation
 */

import React, { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Route, Router, Switch } from 'wouter';
import ModernFoodLayout from './pages/ModernFoodLayout';
import VerifyEmail from './pages/VerifyEmail';
import { ResetPassword } from './pages/ResetPassword';
import AIFoodAnalyzer from './pages/AIFoodAnalyzer';
import { useDataRestoration } from '@/hooks/useDataRestoration';
import { DataIntegrityManager } from '@/components/DataIntegrityManager';
import { useSessionManager } from '@/hooks/useSessionManager';
import { PWAUpdateNotification } from '@/components/PWAUpdateNotification';

import { runDataMigration } from '@/utils/dataMigration';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('redesigned');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { toast } = useToast();
  
  // Authentication state
  const { user, isLoading: authLoading } = useAuth();
  
  // Debug authentication state
  useEffect(() => {
    console.log('🔍 App authentication state:', { 
      user: user ? 'authenticated' : 'not authenticated', 
      authLoading,
      hasToken: !!localStorage.getItem('auth_token')
    });
  }, [user, authLoading]);
  
  // Automatically restore user data from database
  const { isRestoring, hasRestored } = useDataRestoration();
  
  // Initialize 24-hour session management
  useSessionManager();
  
  // Initialize app on mount
  useEffect(() => {
    
    // Handle email verification success/failure messages from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    const error = urlParams.get('error');
    const message = urlParams.get('message');
    
    if (verified === 'true') {
      toast({
        title: "Email Verified!",
        description: message || "Your email has been verified successfully. You can now sign in.",
        duration: 8000,
      });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (verified === 'false' && error) {
      toast({
        title: "Verification Failed",
        description: decodeURIComponent(error),
        variant: "destructive",
        duration: 8000,
      });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    // Run data migration to convert weeklyMeals to proper format
    setTimeout(() => {
      const migrated = runDataMigration();
      if (migrated) {
        // Data migration completed
        // Refresh components to show migrated data
        window.dispatchEvent(new CustomEvent('data-migrated'));
      }
    }, 500);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleNavigate = (page: string, section?: string) => {
    setActiveTab(page);
    if (section && page === 'profile') {
      // Navigate to specific profile section
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigate-to-profile-section', {
          detail: { section }
        }));
      }, 100);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear custom tokens
      localStorage.removeItem('supabase.auth.token');
      
      // Call backend signout endpoint
      await fetch('/api/auth/signout', { method: 'POST' });
      
      // Clear all app data
      localStorage.clear();
      sessionStorage.clear();
      
      // Reload page to reset state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload anyway
      window.location.href = '/';
    }
  };

  // Add global notification event listeners and error handling
  useEffect(() => {
    const handleShowNotifications = () => {
      setShowNotifications(true);
    };

    const handleUpdateNotificationCount = (event: CustomEvent) => {
      setNotificationCount(event.detail.count);
    };

    const handleToast = (event: CustomEvent) => {
      // Handle toast notifications here if needed
    };

    const handleCaloriesLogged = (event: CustomEvent) => {
      // Handle weekly logger communication
      // Refresh weekly logger data if it's the active tab
      if (activeTab === 'logger') {
        // Force refresh of weekly logger data
        window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
      }
    };

    // Global error handler to suppress cross-origin errors
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.message && (
        event.message.includes('cross-origin') ||
        event.message.includes('Script error') ||
        event.message.includes('CORS')
      )) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && typeof event.reason === 'string' && (
        event.reason.includes('cross-origin') ||
        event.reason.includes('CORS')
      )) {
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('show-notifications', handleShowNotifications);
    window.addEventListener('update-notification-count', handleUpdateNotificationCount as EventListener);
    window.addEventListener('show-toast', handleToast as EventListener);
    window.addEventListener('calories-logged', handleCaloriesLogged as EventListener);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('show-notifications', handleShowNotifications);
      window.removeEventListener('update-notification-count', handleUpdateNotificationCount as EventListener);
      window.removeEventListener('show-toast', handleToast as EventListener);
      window.removeEventListener('calories-logged', handleCaloriesLogged as EventListener);
    };
  }, []);

  // No special routes - direct access to modern layout
  const checkSpecialRoutes = () => {
    return null;
  };

  // Render login screen or main app
  const renderCurrentPage = () => {
    // Show loading screen while checking authentication
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-amber-800 text-lg">Loading...</p>
          </div>
        </div>
      );
    }

    // Show login screen if not authenticated
    if (!user || !localStorage.getItem('auth_token')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <img src="/BWN_Logo.png" alt="ByteWise Nutritionist" className="w-20 h-20 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ByteWise</h1>
                <p className="text-gray-600">Sign in to track your nutrition journey</p>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const email = formData.get('email') as string;
                const password = formData.get('password') as string;
                
                try {
                  const response = await fetch('/api/auth/signin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('auth_token', data.session.access_token);
                    localStorage.setItem('refresh_token', data.session.refresh_token);
                    localStorage.setItem('expires_at', data.session.expires_at.toString());
                    window.location.reload();
                  } else {
                    const error = await response.json();
                    toast({
                      title: "Login Failed",
                      description: error.message || "Invalid credentials",
                      variant: "destructive",
                    });
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Something went wrong. Please try again.",
                    variant: "destructive",
                  });
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Enter your password"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors font-medium"
                  >
                    Sign In
                  </button>
                </div>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Demo: Use any email and password to sign in
                </p>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="mt-2 text-xs text-amber-600 hover:text-amber-700 underline"
                >
                  Clear Auth & Reload
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show main app if authenticated
    return <ModernFoodLayout onNavigate={handleNavigate} />;
  };

  return (
    <Router>
      <div className="min-h-screen">
        <main className="min-h-screen">
          <Switch>
            <Route path="/verify-email" component={VerifyEmail} />
            <Route path="/reset-password" component={ResetPassword} />
            <Route>{renderCurrentPage()}</Route>
          </Switch>
        </main>
        <DataIntegrityManager />
        <PWAUpdateNotification />
        <Toaster />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}