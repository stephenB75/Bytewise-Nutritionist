/**
 * App Tour Component
 * Provides guided tour for new users to learn key features
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Optional action text
}

interface AppTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ByteWise Nutritionist!',
    description: 'Let me show you around the app. This quick tour will help you get started with tracking your nutrition and reaching your health goals.',
    target: '[data-testid="app-container"]',
    position: 'bottom'
  },
  {
    id: 'search',
    title: 'Food Search',
    description: 'Search for foods using our comprehensive database. Type any food name to get detailed nutrition information.',
    target: '[data-testid="main-food-search"]',
    position: 'bottom',
    action: 'Try searching for "apple" or "chicken breast"'
  },
  {
    id: 'navigation',
    title: 'Navigation Tabs',
    description: 'Use these tabs to navigate between different sections: Home, Tracking, Profile, and more.',
    target: '[data-testid="navigation-tabs"]',
    position: 'top'
  },
  {
    id: 'profile',
    title: 'Your Profile',
    description: 'Tap here to complete your profile, set your goals, and personalize your nutrition tracking experience.',
    target: '[data-testid="profile-icon"]',
    position: 'bottom',
    action: 'Complete your profile for better recommendations'
  },
  {
    id: 'daily-tracking',
    title: 'Daily Progress',
    description: 'Track your daily calories and see your progress towards your goals. Your achievements unlock as you hit milestones!',
    target: '[data-testid="daily-progress"]',
    position: 'top'
  },
  {
    id: 'fasting',
    title: 'Fasting Tracker',
    description: 'Start and track intermittent fasting sessions. Get celebration notifications when you hit major milestones!',
    target: '[data-testid="fasting-tracker"]',
    position: 'top'
  },
  {
    id: 'achievements',
    title: 'Achievements',
    description: 'Earn achievements as you meet your nutrition goals. Check your progress and celebrate your success!',
    target: '[data-testid="achievements-section"]',
    position: 'left'
  }
];

export function AppTour({ isOpen, onClose, onComplete }: AppTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const getCurrentStepData = () => TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  // Find and highlight target element
  const updateHighlight = useCallback(() => {
    const step = getCurrentStepData();
    if (!step) return;

    const element = document.querySelector(step.target) as HTMLElement;
    setTargetElement(element);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top + window.scrollY - 8,
        left: rect.left + window.scrollX - 8,
        width: rect.width + 16,
        height: rect.height + 16
      });
    }
  }, [currentStep]);

  useEffect(() => {
    if (isOpen) {
      updateHighlight();
      // Update highlight on scroll/resize
      const handleResize = () => updateHighlight();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
      };
    }
  }, [isOpen, currentStep, updateHighlight]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('bytewise-tour-completed', 'true');
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('bytewise-tour-completed', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const step = getCurrentStepData();
  if (!step) return null;

  // Calculate tooltip position - mobile responsive
  const getTooltipPosition = () => {
    const isMobile = window.innerWidth < 768;
    const isSmallMobile = window.innerWidth < 400;
    
    // Dynamic sizing based on screen size
    const tooltipWidth = isSmallMobile ? Math.min(280, window.innerWidth - 32) : 
                       isMobile ? Math.min(320, window.innerWidth - 40) : 320;
    const tooltipHeight = isMobile ? 180 : 200;
    const padding = isMobile ? 12 : 20;
    
    let top = 0;
    let left = 0;
    
    // On mobile, prefer bottom or top positioning for better visibility
    let preferredPosition = step.position;
    if (isMobile && (step.position === 'left' || step.position === 'right')) {
      // Check if there's more space above or below
      const spaceAbove = highlightPosition.top;
      const spaceBelow = window.innerHeight - (highlightPosition.top + highlightPosition.height);
      preferredPosition = spaceBelow > spaceAbove ? 'bottom' : 'top';
    }
    
    switch (preferredPosition) {
      case 'top':
        top = highlightPosition.top - tooltipHeight - padding;
        left = highlightPosition.left + (highlightPosition.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = highlightPosition.top + highlightPosition.height + padding;
        left = highlightPosition.left + (highlightPosition.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = highlightPosition.top + (highlightPosition.height / 2) - (tooltipHeight / 2);
        left = highlightPosition.left - tooltipWidth - padding;
        break;
      case 'right':
        top = highlightPosition.top + (highlightPosition.height / 2) - (tooltipHeight / 2);
        left = highlightPosition.left + highlightPosition.width + padding;
        break;
    }

    // Enhanced viewport constraints for mobile
    const margin = isMobile ? 16 : 20;
    const maxTop = window.innerHeight - tooltipHeight - margin;
    const maxLeft = window.innerWidth - tooltipWidth - margin;
    
    top = Math.max(margin, Math.min(top, maxTop));
    left = Math.max(margin, Math.min(left, maxLeft));

    // On very small screens, center horizontally if needed
    if (isSmallMobile && tooltipWidth > window.innerWidth - 32) {
      left = 16;
    }

    return { top, left, width: tooltipWidth };
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <div className="fixed inset-0 z-[9999] touch-none" data-testid="app-tour-overlay">
      {/* Dark overlay - prevents interaction with underlying elements */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Highlight circle/rectangle */}
      {targetElement && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: highlightPosition.top,
            left: highlightPosition.left,
            width: highlightPosition.width,
            height: highlightPosition.height,
          }}
        >
          <div className="w-full h-full rounded-lg border-4 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] animate-pulse bg-white/10" />
          {/* Pulsing highlight effect */}
          <div className="absolute inset-0 rounded-lg border-2 border-blue-400 animate-ping opacity-75" />
        </div>
      )}

      {/* Tour tooltip - mobile responsive */}
      <Card
        className="absolute bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 shadow-2xl max-w-sm sm:max-w-md md:max-w-lg"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: tooltipPosition.width,
          maxHeight: 'calc(100vh - 40px)',
          overflow: 'auto'
        }}
        data-testid="tour-tooltip"
      >
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0 touch-manipulation"
              data-testid="tour-skip-button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white leading-snug">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-3">
              {step.description}
            </p>
            {step.action && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 sm:p-3 border border-blue-200 dark:border-blue-700">
                <p className="text-blue-700 dark:text-blue-300 text-xs font-medium">
                  💡 {step.action}
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep 
                      ? 'bg-blue-500' 
                      : index < currentStep 
                      ? 'bg-green-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="h-9 px-2 sm:px-3 text-xs sm:text-sm touch-manipulation"
                data-testid="tour-previous-button"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <Button
                onClick={handleNext}
                size="sm"
                className="h-9 px-3 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm touch-manipulation"
                data-testid="tour-next-button"
              >
                <span className="truncate">
                  {isLastStep ? 'Complete' : 'Next'}
                </span>
                {!isLastStep && <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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