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
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('redesigned');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
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

  // Render ModernFoodLayout
  const renderCurrentPage = () => {
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