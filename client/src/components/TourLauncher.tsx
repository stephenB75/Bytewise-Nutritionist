/**
 * Tour Launcher Component
 * Provides multiple ways to start the app tour with visual preview
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Joyride, { CallBackProps, STATUS, Step, Styles } from 'react-joyride';


import { 
  Play, 
  Sparkles, 
  MapPin, 
  Clock, 
  Trophy, 
  Target, 
  Camera, 
  Utensils,
  User,
  BarChart3,
  Droplets
} from 'lucide-react';

interface TourLauncherProps {
  onStartTour: () => void;
  isVisible?: boolean;
}

interface AppTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onNavigate?: (tab: string) => void;
}

const TOUR_FEATURES = [
  {
    icon: <Utensils className="w-5 h-5 text-blue-500" />,
    title: 'Smart Food Search',
    description: 'Search 300,000+ USDA foods with brand recognition',
    category: 'Core Feature'
  },
  {
    icon: <Camera className="w-5 h-5 text-purple-500" />,
    title: 'AI Photo Analysis',
    description: 'Snap photos for instant nutrition breakdown',
    category: 'AI Feature'
  },
  {
    icon: <Target className="w-5 h-5 text-green-500" />,
    title: 'Calorie Calculator',
    description: 'Instant nutrition facts with portion warnings',
    category: 'Core Feature'
  },
  {
    icon: <Clock className="w-5 h-5 text-orange-500" />,
    title: 'Fasting Timer',
    description: 'Track intermittent fasting with celebrations',
    category: 'Wellness'
  },
  {
    icon: <Trophy className="w-5 h-5 text-yellow-500" />,
    title: 'Achievement System',
    description: 'Unlock rewards as you hit your goals',
    category: 'Motivation'
  },
  {
    icon: <Droplets className="w-5 h-5 text-cyan-500" />,
    title: 'Hydration Tracking',
    description: 'Beautiful water intake visualization',
    category: 'Wellness'
  }
];

// Tour Steps Configuration - Interactive App Walkthrough with Navigation
const createTourSteps = (handleTabChange: (tab: string) => void): Step[] => [
  {
    target: 'body',
    title: '🎉 Welcome to ByteWise Nutritionist!',
    content: 'Let\'s take an interactive tour of your nutrition tracking companion. I\'ll guide you through each section and show you the key features.',
    placement: 'center',
  },
  {
    target: '[data-testid="daily-progress"]',
    title: '📊 Daily Progress Dashboard',
    content: 'Your home base shows daily calorie intake, meals logged, remaining calories, and completion percentage. This updates in real-time as you track food.',
    placement: 'bottom',
  },
  {
    target: '[data-testid="water-consumption-card"]',
    title: '💧 Hydration Tracking',
    content: 'Click any water glass to log your hydration. Watch the visual indicator fill up as you reach your daily 8-glass goal.',
    placement: 'top',
  },
  {
    target: '[data-testid="navigation-tabs"]',
    title: '🧭 Navigation Menu',
    content: 'The bottom navigation gives you access to all app sections. Let\'s explore each one starting with the Calorie Tracker.',
    placement: 'top',
  },
  {
    target: '[data-testid="nav-calculator"]',
    title: '🍎 Food Tracking - Step 1',
    content: 'Click here to access the Calorie Tracker where you can search 300,000+ USDA foods, scan photos with AI, and calculate precise nutrition.',
    placement: 'top',
    data: { action: 'navigate', tab: 'nutrition' }
  },
  {
    target: '[data-testid="main-food-search"]',
    title: '🔍 Smart Food Search',
    content: 'Search for any food here. The system recognizes brand names, provides autocomplete suggestions, and shows FDA-compliant serving sizes.',
    placement: 'bottom',
  },
  {
    target: '[data-testid="nav-fasting"]',
    title: '⏰ Fasting Timer - Step 1',
    content: 'Click here to access the Fasting Timer for tracking intermittent fasting sessions.',
    placement: 'top',
    data: { action: 'navigate', tab: 'fasting' }
  },
  {
    target: '[data-testid="fasting-controls"]',
    title: '⏰ Fasting Controls',
    content: 'Start, pause, or stop fasting sessions here. Track your fasting history and celebrate achievements when you reach your goals.',
    placement: 'bottom',
  },
  {
    target: '[data-testid="nav-journal"]',
    title: '📔 Meal Journal - Step 1',
    content: 'Click here to access your Meal Journal where you can review your complete food history.',
    placement: 'top',
    data: { action: 'navigate', tab: 'daily' }
  },
  {
    target: '[data-testid="meal-history"]',
    title: '📔 Meal History',
    content: 'Browse your complete meal history, search past entries, filter by date, and review your nutrition patterns over time.',
    placement: 'top',
  },
  {
    target: '[data-testid="nav-profile"]',
    title: '⚙️ Profile Settings - Step 1',
    content: 'Click here to access your Profile where you can customize goals and view achievements.',
    placement: 'top',
    data: { action: 'navigate', tab: 'profile' }
  },
  {
    target: '[data-testid="profile-goals"]',
    title: '🎯 Goal Customization',
    content: 'Set your daily calorie goals, update personal information, and track your progress with detailed analytics.',
    placement: 'bottom',
  },
  {
    target: '[data-testid="nav-dashboard"]',
    title: '🏠 Return to Dashboard',
    content: 'Let\'s return to your main dashboard to complete the tour.',
    placement: 'top',
    data: { action: 'navigate', tab: 'home' }
  },
  {
    target: 'body',
    title: '🎯 Tour Complete!',
    content: 'You\'ve explored all the major features! Start tracking your nutrition journey by searching for foods, logging water, or setting up fasting sessions.',
    placement: 'center',
  }
];

// Enhanced Tour Styles with better visibility
const tourStyles: Partial<Styles> = {
  options: {
    primaryColor: '#3b82f6',
    width: 380,
    zIndex: 10000,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  spotlight: {
    borderRadius: '12px',
    border: '3px solid #3b82f6',
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
    filter: 'none',
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

// Integrated App Tour Component - Export for main layout
export function AppTour({ isOpen, onClose, onComplete, onNavigate }: AppTourProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [tourSteps, setTourSteps] = useState<Step[]>([]);

  useEffect(() => {
    if (isOpen && onNavigate) {
      const steps = createTourSteps(onNavigate);
      setTourSteps(steps);
      setRun(true);
      setStepIndex(0);
    } else {
      setRun(false);
    }
  }, [isOpen, onNavigate]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index, action, step } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      localStorage.setItem('bytewise-tour-completed', 'true');
      setRun(false);
      if (status === STATUS.FINISHED) {
        onComplete();
      }
      onClose();
    } else if (type === 'step:after' && action === 'next') {
      // Handle navigation before moving to next step
      const currentStep = tourSteps[index];
      if (currentStep?.data?.action === 'navigate' && onNavigate) {
        onNavigate(currentStep.data.tab);
        // Small delay to allow navigation to complete
        setTimeout(() => {
          setStepIndex(index + 1);
        }, 500);
      } else {
        setStepIndex(index + 1);
      }
    } else if (type === 'step:after' && action === 'prev') {
      setStepIndex(Math.max(0, index - 1));
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
      steps={tourSteps}
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

export function TourLauncher({ onStartTour, isVisible = true }: TourLauncherProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!isVisible) return null;

  const handleStartTour = () => {
    setIsPreviewOpen(false);
    onStartTour();
  };

  return (
    <>

      {/* Tour Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 font-medium"
            data-testid="tour-preview-button"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Take App Tour
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Discover ByteWise Features
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">🎯 What You'll Learn</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                This interactive tour will guide you through all major features, 
                showing you how to track nutrition, use AI analysis, earn achievements, 
                and build healthy habits.
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  5-7 minutes
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  10 key features
                </span>
                <Badge variant="secondary" className="text-xs">
                  Interactive
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TOUR_FEATURES.map((feature, index) => (
                <Card key={index} className="border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {feature.icon}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {feature.description}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {feature.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Sparkles className="w-4 h-4" />
                <span>Unlock your first achievement by completing the tour!</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={handleStartTour}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Tour
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Welcome Banner Component
export function WelcomeBanner({ onStartTour, onDismiss }: { onStartTour: () => void; onDismiss: () => void }) {
  return (
    <Card className="mb-6 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-lg">Welcome to ByteWise Nutritionist! 🎉</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              Ready to discover all the amazing features? Take our interactive tour to learn 
              how to track nutrition, use AI analysis, and build healthy habits.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={onStartTour}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Take Tour (5 min)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDismiss}
              >
                Skip for now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Unified Tour Component
export function UnifiedTourSystem() {
  const { isTourOpen, startTour, closeTour, completeTour, shouldShowTour } = useAppTour();

  return (
    <>
      <TourLauncher
        onStartTour={startTour}
        isVisible={shouldShowTour()}
      />
      <AppTour
        isOpen={isTourOpen}
        onClose={closeTour}
        onComplete={completeTour}
      />
    </>
  );
}