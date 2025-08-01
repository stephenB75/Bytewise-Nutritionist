/**
 * Bytewise Main Application Component
 * 
 * Complete mobile-first PWA with four main screens
 * Features brand-compliant design and seamless navigation
 */

import React, { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { SupabaseAuthWrapper } from './components/SupabaseAuthWrapper';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { NotificationDropdown } from './components/NotificationDropdown';
import { PWAInstallPrompt, IOSInstallInstructions } from './components/PWAInstallPrompt';
import { useImageRotation } from './hooks/useImageRotation';
import Dashboard from './pages/Dashboard';
import CalorieCalculatorWrapper from './components/CalorieCalculatorWrapper';
import WeeklyLogger from './pages/WeeklyLogger';
import ProfileEnhanced from './pages/ProfileEnhanced';
import CalorieCalculatorValidation from './test/CalorieCalculatorValidation';
import CalorieCalculatorDemo from './components/CalorieCalculatorDemo';
import CalculatorValidationTest from './components/CalculatorValidationTest';
import { AuthDebugInfo } from './components/AuthDebugInfo';
import { SimpleAuthTest } from './components/SimpleAuthTest';
import { WorkingAuth } from './components/WorkingAuth';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Example notification count
  
  // Initialize image rotation system
  useImageRotation();

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
    // Logout will be handled by the Header component directly via useAuth hook
    console.log('Logout triggered from App component');
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

  // Render current page component
  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'calculator':
        return <CalorieCalculatorWrapper onNavigate={handleNavigate} />;
      case 'logger':
        return <WeeklyLogger onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfileEnhanced onNavigate={handleNavigate} />;
      case 'validation':
        return <CalorieCalculatorValidation />;
      case 'demo':
        return <CalorieCalculatorDemo />;
      case 'test':
        return <CalculatorValidationTest />;
      case 'auth-debug':
        return <AuthDebugInfo />;
      case 'auth-test':
        return <SimpleAuthTest />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WorkingAuth>
        <div className="min-h-screen bg-background">
          {/* Global Notification Dropdown */}
          <NotificationDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            notifications={[]}
            onMarkAsRead={() => {}}
            onMarkAllAsRead={() => {}}
            onDeleteNotification={() => {}}
          />

          {/* Fixed Header */}
          <Header 
            currentPage={activeTab}
            onNavigate={handleNavigate}
            showNotifications={true}
            notificationCount={notificationCount}
          />

          {/* Main Content Area with top/bottom padding for fixed elements */}
          <main className="pt-16 pb-20">
            {renderCurrentPage()}
          </main>

          {/* Fixed Bottom Navigation */}
          <Navigation 
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          
          {/* PWA Install Prompts */}
          <PWAInstallPrompt />
          <IOSInstallInstructions />
        </div>
      </WorkingAuth>
    </QueryClientProvider>
  );
}