import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DragDropProvider } from '@/components/DragDropProvider';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/useToast';
import { FoodDatabaseProvider } from '@/components/FoodDatabaseManager';
import { NotificationProvider } from '@/components/NotificationSystem';

// Pages
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import MealLogger from '@/pages/MealLogger';
import RecipeBuilder from '@/pages/RecipeBuilder';
import Calendar from '@/pages/Calendar';
import Profile from '@/pages/Profile';
import ForgotPassword from '@/pages/ForgotPassword';

// PWA Install prompt
function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('PWA installed');
      }
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };

  const handleDismiss = () => {
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-white p-4 transform transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold">📱</span>
          </div>
          <div>
            <p className="font-semibold text-sm">Install Bytewise</p>
            <p className="text-xs opacity-90">Add to home screen for quick access</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1 bg-white/20 rounded-lg text-xs font-medium touch-target"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="px-3 py-1 bg-white text-primary rounded-lg text-xs font-medium touch-target"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}

// Main App Router
function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentPage, setCurrentPage] = useState('landing'); // landing, forgot-password, app
  const [notifications, setNotifications] = useState<string[]>([]);
  const { toast } = useToast();

  // Enhanced notification system
  const showToast = useCallback((message: string, type: 'default' | 'destructive' = 'default') => {
    toast({
      description: message,
      variant: type,
      duration: 3000
    });
  }, [toast]);

  // Development keyboard shortcuts
  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (!isDevelopment) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + D = Go to Dashboard
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setActiveTab('dashboard');
        showToast('Navigated to Dashboard');
      }
      
      // Ctrl/Cmd + Shift + M = Go to Meals
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        setActiveTab('meals');
        showToast('Navigated to Meal Logger');
      }
      
      // Ctrl/Cmd + Shift + R = Go to Recipe Builder
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        setActiveTab('recipe-builder');
        showToast('Navigated to Recipe Builder');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showToast]);

  // Handle URL shortcuts from PWA manifest
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'log-meal') {
      setActiveTab('meals');
    } else if (action === 'create-recipe') {
      setActiveTab('recipe-builder');
    }
  }, []);

  // Show loading state with LogoBrand
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="bytewise-logo bytewise-logo-lg">
            <div className="bytewise-logo-main">bytewise</div>
            <div className="bytewise-logo-tagline">Nutritionist</div>
          </div>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    if (currentPage === 'forgot-password') {
      return (
        <ForgotPassword 
          onNavigateToLogin={() => setCurrentPage('landing')}
          showToast={showToast}
        />
      );
    }
    return (
      <Landing onNavigateToForgotPassword={() => setCurrentPage('forgot-password')} />
    );
  }

  // Main app interface
  const renderCurrentPage = () => {
    const commonProps = {
      onNavigate: setActiveTab,
      showToast,
      notifications,
      setNotifications
    };

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard {...commonProps} />;
      case 'meals':
        return <MealLogger {...commonProps} />;
      case 'recipe-builder':
        return <RecipeBuilder {...commonProps} />;
      case 'calendar':
        return <Calendar {...commonProps} />;
      case 'profile':
        return <Profile {...commonProps} />;
      default:
        return <Dashboard {...commonProps} />;
    }
  };

  return (
    <DragDropProvider>
      <div className="min-h-screen min-h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden">
        <PWAInstallPrompt />
        
        {/* Mobile-optimized Header */}
        <Header onNavigate={setActiveTab} />
        
        {/* Mobile Main Content - Full viewport usage */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
          <div className="w-full max-w-full">
            {renderCurrentPage()}
          </div>
        </main>

        {/* Mobile Bottom Navigation - Fixed with safe area */}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Mobile-optimized Floating Action Button */}
        <button
          onClick={() => setActiveTab('recipe-builder')}
          className="fixed bottom-20 right-4 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center z-30 touch-target transition-all active:scale-95"
          style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom) + 0.5rem)' }}
        >
          <span className="text-xl font-bold">+</span>
        </button>
      </div>
    </DragDropProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FoodDatabaseProvider>
          <NotificationProvider>
            <Toaster />
            <AppRouter />
          </NotificationProvider>
        </FoodDatabaseProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
