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

  // Calculate tooltip position
  const getTooltipPosition = () => {
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const padding = 20;
    
    let top = 0;
    let left = 0;
    
    switch (step.position) {
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

    // Keep tooltip within viewport
    const maxTop = window.innerHeight - tooltipHeight - 20;
    const maxLeft = window.innerWidth - tooltipWidth - 20;
    
    top = Math.max(20, Math.min(top, maxTop));
    left = Math.max(20, Math.min(left, maxLeft));

    return { top, left };
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <div className="fixed inset-0 z-[9999]" data-testid="app-tour-overlay">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
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
          <div className="w-full h-full rounded-lg border-4 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] animate-pulse bg-white/10" />
          {/* Pulsing highlight effect */}
          <div className="absolute inset-0 rounded-lg border-2 border-blue-400 animate-ping opacity-75" />
        </div>
      )}

      {/* Tour tooltip */}
      <Card
        className="absolute w-80 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 shadow-2xl"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
        data-testid="tour-tooltip"
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 p-0"
              data-testid="tour-skip-button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
              {step.description}
            </p>
            {step.action && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                <p className="text-blue-700 dark:text-blue-300 text-xs font-medium">
                  💡 {step.action}
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
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

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="h-9 px-3"
                data-testid="tour-previous-button"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                size="sm"
                className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white"
                data-testid="tour-next-button"
              >
                {isLastStep ? 'Complete Tour' : 'Next'}
                {!isLastStep && <ArrowRight className="w-4 h-4 ml-1" />}
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