/**
 * Bytewise Main Application Component
 * 
 * Complete mobile-first PWA with four main screens
 * Features brand-compliant design and seamless navigation
 */

import React, { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('redesigned');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

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

  // No special routes - direct access to modern layout
  const checkSpecialRoutes = () => {
    return null;
  };

  // Direct render without lazy loading to fix React hooks
  const renderCurrentPage = () => {
    return (
      <div className="p-8 text-white bg-black min-h-screen">
        <h1 className="text-2xl mb-4">ByteWise Nutrition Tracker</h1>
        <p className="mb-4">Testing React hooks functionality...</p>
        <div className="mb-4">
          <button 
            onClick={() => setActiveTab('test')}
            className="bg-blue-500 px-4 py-2 rounded mr-2"
          >
            Test Button (activeTab: {activeTab})
          </button>
        </div>
        <p className="text-sm">If this button works, React hooks are functioning properly.</p>
      </div>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-black">
        <main className="min-h-screen">
          {renderCurrentPage()}
        </main>
      </div>
    </QueryClientProvider>
  );
}