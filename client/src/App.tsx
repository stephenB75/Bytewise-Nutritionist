/**
 * Bytewise Main Application Component
 * 
 * Complete mobile-first PWA with four main screens
 * Features brand-compliant design and seamless navigation
 */

import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthWrapper } from './components/AuthWrapper';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { NotificationDropdown } from './components/NotificationDropdown';
import Dashboard from './pages/Dashboard';
import CalorieCalculatorWrapper from './components/CalorieCalculatorWrapper';
import WeeklyLogger from './pages/WeeklyLogger';
import ProfileEnhanced from './pages/ProfileEnhanced';

// Mobile detection hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(true);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

// Desktop warning component
function DesktopWarning() {
  return (
    <div className="mobile-only-app">
      <div className="mobile-only-message">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📱</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bytewise Nutritionist</h1>
          <p className="text-gray-600">Mobile Nutrition Tracking App</p>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">📱 Mobile-Only Experience</h2>
            <p className="text-blue-700 text-sm">
              This app is designed exclusively for mobile devices to provide the best nutrition tracking experience.
            </p>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>To access Bytewise:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Open this URL on your smartphone</li>
              <li>Add to your home screen for a native app experience</li>
              <li>Enjoy seamless nutrition tracking on-the-go</li>
            </ul>
          </div>
          
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              Optimized for iOS Safari and Android Chrome browsers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const isMobile = useIsMobile();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleNavigate = (page: string) => {
    setActiveTab(page);
  };

  const handleLogout = () => {
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
  }, [activeTab]);

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
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  // Show desktop warning if not on mobile (after all hooks)
  if (!isMobile) {
    return <DesktopWarning />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthWrapper onNavigate={handleNavigate}>
        <div className="min-h-screen bg-[#fef7cd] bg-gradient-to-br from-[#fef7cd] via-[#ffffff] to-[#a8dadc] mobile-content">
          {/* Mobile Header with Safe Area */}
          <div className="safe-area-top">
            <Header 
              currentPage={activeTab}
              onNavigate={handleNavigate}
              showNotifications={showNotifications}
              notificationCount={notificationCount}
              onLogout={handleLogout}
            />
          </div>

          {/* Main Content - Mobile Optimized */}
          <main className="pb-20">
            {renderCurrentPage()}
          </main>

          {/* Bottom Navigation with Safe Area */}
          <div className="mobile-nav safe-area-bottom">
            <Navigation 
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          {/* Notification Dropdown */}
          {showNotifications && (
            <NotificationDropdown
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              notifications={[]}
              onMarkAsRead={() => {}}
              onMarkAllAsRead={() => {}}
              onDeleteNotification={() => {}}
            />
          )}
        </div>
      </AuthWrapper>
    </QueryClientProvider>
  );
}