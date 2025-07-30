/**
 * Bytewise Main Application Component
 * 
 * Complete mobile-first PWA with four main screens
 * Features brand-compliant design and seamless navigation
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import Dashboard from './pages/Dashboard';
import RecipeBuilder from './pages/RecipeBuilder';
import MealPlanner from './pages/MealPlanner';
import Profile from './pages/Profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate app initialization
  useEffect(() => {
    // In a real app, this would handle authentication, data loading, etc.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleNavigate = (page: string) => {
    setActiveTab(page);
  };

  const handleLogout = () => {
    // In a real app, this would handle user logout
    console.log('User logout');
    setActiveTab('dashboard');
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="bytewise-logo bytewise-logo-lg mb-4">
            <div className="bytewise-logo-main">bytewise</div>
            <div className="bytewise-logo-tagline">Nutritionist</div>
          </div>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Render current page component
  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'recipe-builder':
        return <RecipeBuilder onNavigate={handleNavigate} />;
      case 'planner':
        return <MealPlanner onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} onLogout={handleLogout} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <Header 
        currentPage={activeTab}
        onNavigate={handleNavigate}
        showNotifications={true}
        notificationCount={0}
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
    </div>
  );
}