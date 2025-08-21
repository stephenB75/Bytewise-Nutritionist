/**
 * Enhanced App Tour Component
 * Provides comprehensive guided tour with visual highlights and interactive features
 */

import React, { useState, useEffect, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, Step, Styles } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, ArrowRight, MapPin, Play, Sparkles, Target, Camera, Trophy, Clock, Utensils, Droplets, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TourStep extends Step {
  id: string;
  icon?: React.ReactNode;
  category: 'getting-started' | 'tracking' | 'features' | 'advanced';
  tips?: string[];
  benefits?: string;
}

interface AppTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-testid="app-container"]',
    title: '🎉 Welcome to ByteWise Nutritionist!',
    content: 'Your personal nutrition companion is ready! This interactive tour will show you everything you need to track your health and reach your goals.',
    placement: 'center',
    category: 'getting-started',
    icon: <Sparkles className="w-5 h-5 text-yellow-500" />,
    benefits: 'Track nutrition, earn achievements, and build healthy habits',
    tips: ['Complete the tour to unlock your first achievement!', 'Each feature has helpful tooltips when you need them'],
    disableBeacon: true
  },
  {
    id: 'search',
    target: '[data-testid="main-food-search"]',
    title: '🔍 Smart Food Search',
    content: 'Search our comprehensive USDA database with 300,000+ foods. Just type "chicken breast", "haagen dazs bar", or any food name!',
    placement: 'bottom',
    category: 'tracking',
    icon: <Utensils className="w-5 h-5 text-blue-500" />,
    benefits: 'Accurate nutrition data from official USDA sources',
    tips: ['Try brand names like "Snickers bar"', 'Search works with partial matches', 'Get portion warnings for realistic serving sizes']
  },
  {
    id: 'calorie-calculator',
    target: '[data-testid="calorie-calculator"]',
    title: '⚡ Instant Calorie Calculator',
    content: 'Enter any food and measurement for instant nutrition facts. Our smart system recognizes portions and provides FDA-compliant warnings.',
    placement: 'right',
    category: 'tracking',
    icon: <Target className="w-5 h-5 text-green-500" />,
    benefits: 'Get accurate calories, protein, carbs, and fat instantly',
    tips: ['Use specific measurements like "1 bar" or "2 scoops"', 'System warns about unrealistic portions', 'Supports brand-specific foods']
  },
  {
    id: 'ai-analyzer',
    target: '[data-testid="ai-food-analyzer"]',
    title: '📸 AI Food Analyzer',
    content: 'Take photos of your meals for instant AI-powered nutrition analysis. Our Google Gemini Vision AI identifies foods and estimates portions!',
    placement: 'top',
    category: 'features',
    icon: <Camera className="w-5 h-5 text-purple-500" />,
    benefits: 'Snap photos to instantly log complex meals',
    tips: ['Works best with clear, well-lit photos', 'Identifies multiple foods in one image', 'Provides detailed nutrition breakdown']
  },
  {
    id: 'daily-progress',
    target: '[data-testid="daily-progress"]',
    title: '📊 Daily Progress Tracking',
    content: 'Watch your daily calories and nutrients in beautiful visual charts. Your progress updates in real-time as you log meals!',
    placement: 'left',
    category: 'tracking',
    icon: <Target className="w-5 h-5 text-blue-600" />,
    benefits: 'Visual feedback keeps you motivated and on track',
    tips: ['Progress saves automatically', 'Data syncs across all your devices', 'Set custom daily calorie goals']
  },
  {
    id: 'fasting-tracker',
    target: '[data-testid="fasting-tracker"]',
    title: '⏰ Intermittent Fasting Timer',
    content: 'Start fasting sessions with our built-in timer. Track 16:8, 18:6, or custom fasting schedules with progress notifications!',
    placement: 'top',
    category: 'features',
    icon: <Clock className="w-5 h-5 text-orange-500" />,
    benefits: 'Build consistent fasting habits with guided support',
    tips: ['Get milestone celebrations', 'History tracks your fasting streaks', 'Works offline and in background']
  },
  {
    id: 'achievements',
    target: '[data-testid="achievements-section"]',
    title: '🏆 Achievement System',
    content: 'Unlock achievements as you hit nutrition milestones! Celebrate your progress with our comprehensive rewards system.',
    placement: 'left',
    category: 'features',
    icon: <Trophy className="w-5 h-5 text-yellow-600" />,
    benefits: 'Gamification makes healthy eating more engaging and fun',
    tips: ['New achievements unlock weekly', 'Share your progress with friends', 'Streak achievements boost motivation']
  },
  {
    id: 'water-tracking',
    target: '[data-testid="water-card"]',
    title: '💧 Water Intake Tracking',
    content: 'Stay hydrated with our beautiful water tracking card. Tap to add glasses and watch your daily hydration goal fill up!',
    placement: 'top',
    category: 'tracking',
    icon: <Droplets className="w-5 h-5 text-cyan-500" />,
    benefits: 'Proper hydration supports your nutrition goals',
    tips: ['Visual glass indicators show progress', 'Quick tap interface for easy logging', 'Syncs with your daily nutrition data']
  },
  {
    id: 'profile-setup',
    target: '[data-testid="profile-icon"]',
    title: '👤 Complete Your Profile',
    content: 'Set up your profile with goals, preferences, and personal info for customized nutrition recommendations tailored just for you!',
    placement: 'bottom',
    category: 'getting-started',
    icon: <Target className="w-5 h-5 text-indigo-500" />,
    benefits: 'Personalized recommendations improve your results',
    tips: ['Set realistic daily calorie goals', 'Choose your preferred units', 'Enable notifications for better habits']
  },
  {
    id: 'navigation',
    target: '[data-testid="bottom-navigation"]',
    title: '🧭 Easy Navigation',
    content: 'Use the bottom navigation to switch between Dashboard, Calorie Tracker, Fasting Timer, Meal Journal, and Profile sections.',
    placement: 'top',
    category: 'getting-started',
    icon: <MapPin className="w-5 h-5 text-gray-600" />,
    benefits: 'Quick access to all app features from anywhere',
    tips: ['Swipe gestures work too', 'Icons show current section', 'All data syncs between sections']
  }
];

// Simplified approach - use default Joyride tooltip with enhanced styling
const CustomTooltip = null; // Use default Joyride tooltip for better navigation

// Enhanced Tour Styles with better visibility
const tourStyles: Partial<Styles> = {
  options: {
    primaryColor: '#3b82f6',
    width: 380,
    zIndex: 10000,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Lighter overlay for better visibility
  },
  spotlight: {
    borderRadius: '12px',
    border: '3px solid #3b82f6', // Add blue border to spotlight
  },
  beacon: {
    background: '#3b82f6',
    border: '4px solid rgba(59, 130, 246, 0.3)',
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
  },
  beaconInner: {
    background: '#1e40af',
  },
  tooltip: {
    padding: 0,
    backgroundColor: 'white',
    borderRadius: '16px',
    border: '2px solid #e5e7eb',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)',
    maxWidth: '380px',
    filter: 'none', // Ensure no blur or opacity issues
  },
  tooltipContainer: {
    textAlign: 'left' as const,
    color: '#111827',
    lineHeight: '1.5',
  },
  tooltipContent: {
    padding: '24px',
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#374151',
  },
  tooltipTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '12px',
  },
  tooltipFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonNext: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    padding: '10px 20px',
    fontWeight: '600',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  buttonBack: {
    backgroundColor: 'transparent',
    color: '#6b7280',
    borderRadius: '8px',
    padding: '10px 16px',
    fontWeight: '500',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
  },
  buttonSkip: {
    backgroundColor: 'transparent',
    color: '#9ca3af',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
  },
};

export function AppTour({ isOpen, onClose, onComplete }: AppTourProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setRun(true);
      setStepIndex(0);
    } else {
      setRun(false);
    }
  }, [isOpen]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    console.log('Tour callback:', { status, type, index, action });

    if (finishedStatuses.includes(status)) {
      localStorage.setItem('bytewise-tour-completed', 'true');
      setRun(false);
      if (status === STATUS.FINISHED) {
        onComplete();
      }
      onClose();
    } else if (type === 'step:after') {
      // Update step index based on action
      const newIndex = action === 'next' ? index + 1 : index - 1;
      setStepIndex(Math.max(0, Math.min(newIndex, TOUR_STEPS.length - 1)));
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={TOUR_STEPS}
      styles={tourStyles}
      disableOverlayClose={true}
      hideCloseButton={true}
      spotlightClicks={true}
      stepIndex={stepIndex}
      locale={{
        back: 'Previous',
        close: 'Close',
        last: 'Complete Tour',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}

// Hook to manage tour state
export function useAppTour() {
  const [isTourOpen, setIsTourOpen] = useState(false);

  const startTour = () => {
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
  };

  const completeTour = () => {
    localStorage.setItem('bytewise-tour-completed', 'true');
    setIsTourOpen(false);
  };

  const shouldShowTour = () => {
    return localStorage.getItem('bytewise-tour-completed') !== 'true';
  };

  const resetTour = () => {
    localStorage.removeItem('bytewise-tour-completed');
  };

  return {
    isTourOpen,
    startTour,
    closeTour,
    completeTour,
    shouldShowTour,
    resetTour
  };
}