/**
 * Bytewise App Content Component
 * 
 * Main application content with provider-dependent logic
 * Features:
 * - Achievement system integration
 * - Enhanced notification system with visual feedback
 * - Development tools
 * - Header and navigation
 * - Tab content rendering
 * - System status management
 */

import React, { useCallback, useMemo } from 'react';
import { Bell, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Dashboard } from './Dashboard';
import { CalorieCalculator } from './CalorieCalculator';
import { MealPlanner } from './MealPlanner';
import { BrandStandard } from './Brand';
import { CalendarScreen } from './screens/CalendarScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AchievementSystem } from './AchievementSystem';
import { AchievementNotification, useAchievementNotification } from './AchievementNotification';
import { Navigation } from './Navigation';
import { NotificationSystem, useNotificationSystem } from './NotificationSystem';
import {
  DevToolsButtonBar,
  DatabaseVerificationPanel,
  RecipeBuilderVerificationPanel,
  SystemStatusDisplay,
  useDevKeyboardShortcuts,
  SystemStatus
} from './utils/DevTools';
import {
  useRecipeBuilderEvents,
  useRecipeBuilderDragStyles,
  useEnhancedNavigation,
  useNotificationsHandler,
  useMealLoggingNotifications,
  useProfileNavigation,
  useFunctionalityTesting,
  useSystemReset,
  useAppInitialization
} from './utils/EventHooks';
import { getCurrentUser } from './utils/AuthUtils';
import { PAGE_TITLES } from './utils/AppConstants';

interface AppContentProps {
  isAuthenticated: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  isScrolling: boolean;
  setIsScrolling: (scrolling: boolean) => void;
  toastMessage: string | null;
  setToastMessage: (message: string | null) => void;
  systemStatus: SystemStatus;
  setSystemStatus: (updater: (prev: SystemStatus) => SystemStatus) => void;
  notifications: string[];
  setNotifications: (notifications: string[]) => void;
  showSystemStatus: boolean;
  setShowSystemStatus: (show: boolean) => void;
  showDatabaseVerification: boolean;
  setShowDatabaseVerification: (show: boolean) => void;
  showRecipeBuilderVerification: boolean;
  setShowRecipeBuilderVerification: (show: boolean) => void;
  showToast: (message: string, duration?: number) => void;
  handleLogout: () => void;
}

export function AppContent({
  isAuthenticated,
  activeTab,
  setActiveTab,
  isDragging,
  setIsDragging,
  isScrolling,
  setIsScrolling,
  toastMessage,
  setToastMessage,
  systemStatus,
  setSystemStatus,
  notifications,
  setNotifications,
  showSystemStatus,
  setShowSystemStatus,
  showDatabaseVerification,
  setShowDatabaseVerification,
  showRecipeBuilderVerification,
  setShowRecipeBuilderVerification,
  showToast,
  handleLogout
}: AppContentProps) {
  // Achievement notification system
  const { 
    currentAchievement, 
    isVisible: isAchievementVisible, 
    hideAchievement 
  } = useAchievementNotification();

  // Enhanced notification system
  const {
    notifications: visualNotifications,
    addNotification,
    dismissNotification,
    clearAllNotifications
  } = useNotificationSystem();

  // Memoized notification callback to prevent unnecessary re-renders
  const handleShowNotification = useCallback((message: string, notificationData?: any) => {
    // Parse the message to determine notification type and create appropriate visual notification
    const isError = message.includes('❌') || message.includes('Failed') || message.includes('Error');
    const isSuccess = message.includes('✅') || message.includes('logged') || message.includes('added');
    const isWarning = message.includes('🗑️') || message.includes('removed') || message.includes('deleted');
    const isGoal = message.includes('🎯') || message.includes('goal') || message.includes('achieved');
    const isStreak = message.includes('🔥') || message.includes('streak');
    const isEdit = message.includes('📝') || message.includes('updated');
    const isSearch = message.includes('🔍') || message.includes('Found');

    let notificationType: 'success' | 'error' | 'warning' | 'info' | 'meal' | 'goal' | 'achievement' = 'info';

    if (isError) notificationType = 'error';
    else if (isSuccess && (message.includes('logged') || message.includes('added'))) notificationType = 'meal';
    else if (isSuccess) notificationType = 'success';
    else if (isWarning) notificationType = 'warning';
    else if (isGoal) notificationType = 'goal';
    else if (isStreak) notificationType = 'achievement';

    // Extract metadata from message if possible
    let metadata = {};
    const calorieMatch = message.match(/(\d+)\s*cal/);
    const proteinMatch = message.match(/(\d+(?:\.\d+)?)\s*g\s*protein/);
    const mealTypeMatch = message.match(/to\s+(\w+)/);

    if (calorieMatch) metadata = { ...metadata, calories: parseInt(calorieMatch[1]) };
    if (proteinMatch) metadata = { ...metadata, protein: parseFloat(proteinMatch[1]) };
    if (mealTypeMatch) metadata = { ...metadata, mealType: mealTypeMatch[1] };

    // Use provided notification data if available
    if (notificationData && typeof notificationData === 'object') {
      addNotification({
        ...notificationData,
        message: message.replace(/[🔍✅❌🗑️🎯🔥📝📊]/g, '').trim(), // Clean emoji for better visual design
      });
    } else {
      addNotification({
        type: notificationType,
        message: message.replace(/[🔍✅❌🗑️🎯🔥📝📊]/g, '').trim(), // Clean emoji for better visual design
        duration: isError ? 6000 : isGoal || isStreak ? 8000 : 4000,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined
      });
    }
  }, [addNotification]);

  // Navigation and interaction handlers (now inside providers)
  const handleTabChangeBase = useEnhancedNavigation(activeTab, isDragging, setIsDragging, setSystemStatus);
  const handleTabChange = useCallback((tab: string) => {
    const newTab = handleTabChangeBase(tab);
    setActiveTab(newTab);
  }, [handleTabChangeBase, setActiveTab]);

  // Enhanced notification handler that integrates with visual system
  const handleNotifications = useNotificationsHandler(
    isDragging, notifications, setNotifications, setSystemStatus, handleShowNotification
  );

  // Enhanced meal logging notifications that create visual notifications
  useMealLoggingNotifications(setNotifications, handleShowNotification);

  const handleProfileNavigation = useProfileNavigation(isDragging, handleTabChange);

  // Development tools handlers (now inside providers) - memoized to prevent re-renders
  const runFunctionalityTest = useFunctionalityTesting(
    isAuthenticated, activeTab, notifications, isDragging, isScrolling,
    setSystemStatus, setShowSystemStatus, handleShowNotification
  );

  const resetSystemStatus = useSystemReset(
    setSystemStatus, setNotifications, setToastMessage,
    setShowSystemStatus, setShowDatabaseVerification, setShowRecipeBuilderVerification,
    handleShowNotification
  );

  // Memoized toast message handler to prevent unnecessary calls
  const handleToastMessage = useCallback((message: string | null) => {
    if (message) {
      handleShowNotification(message);
    } else {
      // Handle clear message case
      clearAllNotifications();
    }
  }, [handleShowNotification, clearAllNotifications]);

  // Custom hooks for event management (now inside providers)
  useRecipeBuilderEvents(
    activeTab, isDragging, setIsDragging, setIsScrolling, setSystemStatus, handleToastMessage
  );

  useRecipeBuilderDragStyles(isDragging, activeTab);

  useDevKeyboardShortcuts(
    setShowSystemStatus, setShowDatabaseVerification, setShowRecipeBuilderVerification,
    resetSystemStatus, runFunctionalityTest
  );

  useAppInitialization(isAuthenticated, activeTab, setSystemStatus);

  // Memoized tab content renderer to prevent unnecessary re-renders
  const renderActiveTab = useCallback(() => {
    const currentUser = getCurrentUser();
    console.log(`🧭 Rendering tab: ${activeTab}`);
    
    try {
      switch (activeTab) {
        case 'dashboard':
          return <Dashboard userName={currentUser.name} onNavigate={handleTabChange} />;
        case 'calculator':
          return <CalorieCalculator onNavigate={handleTabChange} />;
        case 'planner':
          return <MealPlanner onNavigate={handleTabChange} />;
        case 'calendar':
          return <CalendarScreen onNavigate={handleTabChange} />;
        case 'profile':
          return <ProfileScreen onLogout={handleLogout} />;
        default:
          console.warn(`⚠️ Unknown tab: ${activeTab}, defaulting to dashboard`);
          return <Dashboard userName={currentUser.name} onNavigate={handleTabChange} />;
      }
    } catch (error) {
      console.error(`❌ Error rendering ${activeTab} tab:`, error);
      handleShowNotification('Error loading page. Please try again.');
      return <Dashboard userName={currentUser.name} onNavigate={handleTabChange} />;
    }
  }, [activeTab, handleTabChange, handleLogout, handleShowNotification]);

  // Memoized page title to prevent unnecessary calculations
  const pageTitle = useMemo(() => {
    return PAGE_TITLES[activeTab as keyof typeof PAGE_TITLES] || 'Dashboard';
  }, [activeTab]);

  // Handle achievement profile navigation
  const handleAchievementViewProfile = useCallback(() => {
    handleTabChange('profile');
  }, [handleTabChange]);

  // Memoized position classes for header
  const headerClasses = useMemo(() => 
    `fixed top-0 left-0 right-0 backdrop-blur-sm border-b border-border transition-all duration-300 ${
      isDragging 
        ? 'z-20 bg-background/60 pointer-events-none' 
        : 'z-50 bg-background/95 pointer-events-auto'
    }`, [isDragging]
  );

  const mainClasses = useMemo(() =>
    `pt-16 pb-28 transition-all duration-300 ${
      isDragging && activeTab === 'calculator' && !isScrolling 
        ? 'select-none' 
        : 'select-auto'
    }`, [isDragging, activeTab, isScrolling]
  );

  const navClasses = useMemo(() =>
    `fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border transition-all duration-300 ${
      isDragging 
        ? 'z-20 opacity-60 scale-95 blur-sm' 
        : 'z-40 opacity-100 scale-100 blur-0'
    }`, [isDragging]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Achievement System - Automatic background process */}
      <AchievementSystem />

      {/* Achievement Notification Modal */}
      <AchievementNotification
        achievement={currentAchievement}
        isVisible={isAchievementVisible}
        onClose={hideAchievement}
        onViewProfile={handleAchievementViewProfile}
      />

      {/* Enhanced Visual Notification System */}
      <NotificationSystem
        notifications={visualNotifications}
        onDismiss={dismissNotification}
        maxNotifications={5}
        position="bottom-center"
      />

      {/* Development Tools */}
      <DevToolsButtonBar
        onRunTest={runFunctionalityTest}
        onToggleRecipeBuilder={() => setShowRecipeBuilderVerification(!showRecipeBuilderVerification)}
        onToggleDatabase={() => setShowDatabaseVerification(!showDatabaseVerification)}
        onToggleStatus={() => setShowSystemStatus(!showSystemStatus)}
        onReset={resetSystemStatus}
        showRecipeBuilderVerification={showRecipeBuilderVerification}
        showDatabaseVerification={showDatabaseVerification}
        showSystemStatus={showSystemStatus}
      />

      <RecipeBuilderVerificationPanel
        show={showRecipeBuilderVerification}
        onClose={() => setShowRecipeBuilderVerification(false)}
      />

      <DatabaseVerificationPanel
        show={showDatabaseVerification}
        onClose={() => setShowDatabaseVerification(false)}
      />

      {/* Fixed Header */}
      <header className={headerClasses}>
        <div className="w-full max-w-lg mx-auto px-3 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0 pointer-events-auto">
              <button 
                onClick={() => {
                  console.log('🧭 Logo clicked - navigating to dashboard');
                  handleTabChange('dashboard');
                }}
                className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                aria-label="Go to Dashboard"
              >
                <BrandStandard size="sm" />
              </button>
            </div>
            
            <div className={`flex-1 text-center transition-all duration-300 ${
              isDragging 
                ? 'opacity-40 scale-95 blur-sm' 
                : 'opacity-100 scale-100 blur-0'
            }`}>
              <h2 className="text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>{pageTitle}</h2>
            </div>
            
            <div className={`flex items-center gap-3 flex-shrink-0 transition-all duration-300 ${
              isDragging 
                ? 'opacity-40 scale-95 pointer-events-none' 
                : 'opacity-100 scale-100 pointer-events-auto'
            }`}>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-9 w-9 p-0 relative transition-all duration-200 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                onClick={() => {
                  console.log('🔔 Notifications button clicked');
                  handleNotifications();
                }}
                disabled={isDragging}
                aria-label={`Notifications${notifications.length > 0 ? ` (${notifications.length})` : ''}`}
              >
                <Bell size={18} />
                {(notifications.length > 0 || visualNotifications.length > 0) && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse">
                    <span className="sr-only">{notifications.length + visualNotifications.length} notifications</span>
                  </div>
                )}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-9 w-9 p-0 transition-all duration-200 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                onClick={() => {
                  console.log('⚙️ Settings button clicked');
                  handleProfileNavigation();
                }}
                disabled={isDragging}
                aria-label="Profile settings"
              >
                <Settings size={18} />
              </Button>
            </div>
          </div>
        </div>
        
        {isDragging && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/50 animate-pulse">
            <div className="h-full bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
          </div>
        )}
      </header>

      {/* Recipe Builder Drag Drop Zone Overlay */}
      {isDragging && activeTab === 'calculator' && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-xs"></div>
          <div className="absolute top-16 left-0 right-0 bottom-20 flex items-center justify-center px-3">
            <div className="bg-primary/10 border-2 border-dashed border-primary/40 rounded-2xl p-8 text-center animate-pulse max-w-sm mx-auto">
              <p className="text-sm text-primary/80 text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>Recipe Builder Active</p>
              <p className="text-xs text-primary/60 text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>Drop ingredients into meal categories</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main 
        className={mainClasses}
        style={{
          minHeight: '100vh',
          overscrollBehavior: 'contain',
          overflowY: 'auto',
          scrollBehavior: 'smooth'
        }}
      >
        <div className={`w-full max-w-lg mx-auto transition-all duration-300 ${
          activeTab === 'calculator' 
            ? 'px-0'
            : 'px-3'
        }`}>
          {renderActiveTab()}
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <nav className={navClasses}>
        <div className="w-full max-w-lg mx-auto py-1">
          <Navigation 
            activeTab={activeTab} 
            onTabChange={(tab) => {
              console.log('🧭 Bottom navigation clicked:', tab);
              handleTabChange(tab);
            }}
          />
        </div>
      </nav>

      {/* Legacy Toast Notification System (fallback) */}
      {toastMessage && (
        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-primary text-primary-foreground px-5 py-3 rounded-lg shadow-lg max-w-sm text-center border border-primary/20 backdrop-blur-sm">
            <p className="text-brand-body" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Notification Status Indicator (Enhanced) */}
      {(notifications.length > 0 || visualNotifications.length > 0) && (
        <div className="fixed bottom-20 right-4 z-50">
          <div className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs animate-pulse shadow-lg">
            {notifications.length + visualNotifications.length}
          </div>
        </div>
      )}

      {/* Accessibility Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {toastMessage}
      </div>

      {/* System Status Display */}
      <SystemStatusDisplay
        show={showSystemStatus}
        onClose={() => setShowSystemStatus(false)}
        systemStatus={systemStatus}
        isAuthenticated={isAuthenticated}
        activeTab={activeTab}
        isDragging={isDragging}
        isScrolling={isScrolling}
        notifications={notifications}
      />
    </div>
  );
}