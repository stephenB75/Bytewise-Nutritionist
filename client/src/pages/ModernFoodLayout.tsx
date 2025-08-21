/**
 * Modern Food App Layout - Clean Version
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import CalorieCalculator from '@/components/CalorieCalculator';
import { UserSettingsManager } from '@/components/UserSettingsManager';
import { SignOnModule } from '@/components/SignOnModule';
import { useAuth } from '@/hooks/useAuth';
import { useRotatingBackground } from '@/hooks/useRotatingBackground';
import { 
  ChevronRight,
  Bell,
  Home,
  UserCircle,
  Utensils
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

// Types
interface ModernFoodLayoutProps {
  onNavigate?: (page: string) => void;
}

export default function ModernFoodLayout({ onNavigate }: ModernFoodLayoutProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const { backgroundImage } = useRotatingBackground(activeTab);

  // Simple placeholder components
  const HeroSection = ({ title, subtitle, description, buttonText, onButtonClick }: {
    title: string;
    subtitle: string; 
    description: string;
    buttonText: string;
    onButtonClick: () => void;
  }) => (
    <div className="relative h-screen overflow-hidden hero-component" data-hero="true">
      <div 
        className="absolute inset-0 z-10"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 z-15 bg-black bg-opacity-50" />
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-20 text-white">
        <div className="space-y-8 max-w-2xl">
          <div className="space-y-3">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight drop-shadow-2xl">
              {title}
            </h1>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl">
                {subtitle}
              </span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl font-light leading-relaxed max-w-xl mx-auto drop-shadow-xl opacity-95">
            {description}
          </p>
          <div className="pt-8">
            <Button 
              onClick={onButtonClick}
              size="lg"
              className="group relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-12 py-4 rounded-full text-lg shadow-2xl transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-3">
                {buttonText}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce text-white/70">
        <div className="flex flex-col items-center gap-2">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/50" />
          <ChevronRight className="w-6 h-6 rotate-90 drop-shadow-lg" />
        </div>
      </div>
    </div>
  );

  // Render function for home page
  const renderHome = () => (
    <div className="space-y-0 page-container animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out" data-page="dashboard">
      <HeroSection
        title="Welcome to"
        subtitle="ByteWise"
        description="Your AI-powered nutrition companion for a healthier lifestyle"
        buttonText="Get Started"
        onButtonClick={() => setActiveTab('nutrition')}
      />
      <div className="px-6 py-3 content-section">
        <div className="text-center text-white">
          <p className="text-lg">Track your nutrition journey with AI-powered insights</p>
        </div>
      </div>
    </div>
  );

  // Tab change handler
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Simple render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHome();
      case 'nutrition':
        return (
          <div className="space-y-0 page-container">
            <HeroSection
              title="Smart"
              subtitle="Nutrition"
              description="Track your meals with AI-powered analysis"
              buttonText="Start Tracking"
              onButtonClick={() => {}}
            />
            <div className="px-6 py-3">
              <CalorieCalculator />
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-0 page-container">
            <HeroSection
              title="Your"
              subtitle="Profile"
              description="Manage your nutrition goals and preferences"
              buttonText="Update Profile"
              onButtonClick={() => {}}
            />
            <div className="px-6 py-3">
              {user ? (
                <UserSettingsManager />
              ) : (
                <SignOnModule />
              )}
            </div>
          </div>
        );
      default:
        return renderHome();
    }
  };

  return (
    <div data-testid="app-container" className="h-screen w-screen">
      {/* Fixed Notification Header */}
      <div className="fixed top-safe right-4 z-50 safe-notification-position">
        <Button
          variant="ghost"
          size="lg"
          className="group relative bg-white/5 backdrop-blur-xl text-white rounded-2xl p-4 transition-all duration-500 hover:scale-110 hover:bg-white/10 hover:shadow-2xl border border-white/10"
          data-testid="button-notifications"
        >
          <Bell className="w-8 h-8 transition-all duration-300 group-hover:rotate-6 group-hover:text-blue-300" strokeWidth={2} />
        </Button>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
      
      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-t border-gray-700 safe-area-bottom">
        <div className="flex items-center justify-around px-4 py-2">
          <button
            onClick={() => handleTabChange('home')}
            className={`group flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
              activeTab === 'home' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            data-testid="tab-home"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium mt-1">Home</span>
          </button>

          <button
            onClick={() => handleTabChange('nutrition')}
            className={`group flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
              activeTab === 'nutrition' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            data-testid="tab-nutrition"
          >
            <Utensils className="w-6 h-6" />
            <span className="text-xs font-medium mt-1">Nutrition</span>
          </button>

          <button
            onClick={() => handleTabChange('profile')}
            className={`group flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
              activeTab === 'profile' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            data-testid="tab-profile"
          >
            <UserCircle className="w-6 h-6" />
            <span className="text-xs font-medium mt-1">Profile</span>
          </button>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}