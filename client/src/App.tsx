/**
 * Bytewise Main Application Component
 * 
 * Complete mobile-first PWA with four main screens
 * Features brand-compliant design and seamless navigation
 */

import React, { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthWrapper } from './components/AuthWrapper';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { NotificationDropdown } from './components/NotificationDropdown';
import { PWAInstallPrompt, IOSInstallInstructions } from './components/PWAInstallPrompt';

// import { useImageRotation } from './hooks/useImageRotation';
import Dashboard from './pages/Dashboard';
import DashboardRedesigned from './pages/DashboardRedesigned';
import FreshRedesign from './pages/FreshRedesign';
import ModernFoodApp from './pages/ModernFoodApp';
import RedesignedApp from './pages/RedesignedApp';
import ModernFoodLayout from './pages/ModernFoodLayout';
import CalorieCalculatorWrapper from './components/CalorieCalculatorWrapper';
import WeeklyLogger from './pages/WeeklyLogger';
import ProfileEnhanced from './pages/ProfileEnhanced';
import EmailConfirmation from './pages/EmailConfirmation';
// import './utils/testCalorieIntegration';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // App loading with visual redesign
  
  // Initialize image rotation system - temporarily disabled to fix React hook error
  // useImageRotation();

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

  const handleLogout = () => {
    // Redirect to logout endpoint
    window.location.href = '/api/logout';
  };

  // Add global notification event listeners
  useEffect(() => {
    const handleShowNotifications = () => {
      setShowNotifications(true);
    };

    const handleUpdateNotificationCount = (event: CustomEvent) => {
      setNotificationCount(event.detail.count);
    };

    const handleToast = (event: CustomEvent) => {
      console.log('Toast:', event.detail.message);
      // Handle toast notifications here if needed
    };

    const handleCaloriesLogged = (event: CustomEvent) => {
      console.log('Calories logged from calculator:', event.detail);
      // Handle weekly logger communication
      // Refresh weekly logger data if it's the active tab
      if (activeTab === 'logger') {
        // Force refresh of weekly logger data
        window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
      }
    };

    window.addEventListener('show-notifications', handleShowNotifications);
    window.addEventListener('update-notification-count', handleUpdateNotificationCount as EventListener);
    window.addEventListener('show-toast', handleToast as EventListener);
    window.addEventListener('calories-logged', handleCaloriesLogged as EventListener);
    
    return () => {
      window.removeEventListener('show-notifications', handleShowNotifications);
      window.removeEventListener('update-notification-count', handleUpdateNotificationCount as EventListener);
      window.removeEventListener('show-toast', handleToast as EventListener);
      window.removeEventListener('calories-logged', handleCaloriesLogged as EventListener);
    };
  }, []);

  // Check for special routes first
  const checkSpecialRoutes = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    
    if (type === 'signup' || window.location.pathname.includes('confirm')) {
      return <EmailConfirmation onNavigate={handleNavigate} />;
    }
    
    return null;
  };

  // Render current page component
  const renderCurrentPage = () => {
    // Check for special routes first
    const specialRoute = checkSpecialRoutes();
    if (specialRoute) return specialRoute;

    switch (activeTab) {
      case 'redesigned':
        return <ModernFoodLayout onNavigate={handleNavigate} />;
      case 'dashboard':
        return <ModernFoodApp onNavigate={handleNavigate} />;
      case 'fresh':
        return <ModernFoodApp onNavigate={handleNavigate} />;
      case 'calculator':
        return <CalorieCalculatorWrapper onNavigate={handleNavigate} />;
      case 'logger':
        return <WeeklyLogger onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfileEnhanced onNavigate={handleNavigate} />;
      default:
        return <RedesignedApp onNavigate={handleNavigate} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthWrapper onNavigate={handleNavigate}>
        <div className="min-h-screen bg-background">
          {/* Global Notification Dropdown - Disabled for visual testing */}

          {/* Main Content - Full Screen Modern Design */}
          <main className="min-h-screen">
            {renderCurrentPage()}
          </main>
          
          {/* PWA Install Prompts */}
          <PWAInstallPrompt />
          <IOSInstallInstructions />
          

        </div>
      </AuthWrapper>
    </QueryClientProvider>
  );
}