/**
 * Tour Launcher Component
 * Visual tour launcher without actual tour functionality
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLocation } from 'wouter';

import { 
  Play, 
  Sparkles, 
  MapPin, 
  Clock, 
  Trophy, 
  Target, 
  Camera, 
  Utensils,
  Droplets
} from 'lucide-react';

interface TourLauncherProps {
  onStartTour: () => void;
  isVisible?: boolean;
  onNavigateToFeature?: (tab: string) => void;
}

const TOUR_FEATURES = [
  {
    icon: <Utensils className="w-5 h-5 text-orange-500" />,
    title: 'Smart Food Search',
    description: 'Search 300,000+ USDA foods with brand recognition',
    category: 'Core Feature',
    targetTab: 'nutrition'
  },
  {
    icon: <Camera className="w-5 h-5 text-purple-500" />,
    title: 'AI Photo Analysis',
    description: 'Snap photos for instant nutrition breakdown',
    category: 'AI Feature',
    targetTab: 'nutrition'
  },
  {
    icon: <Target className="w-5 h-5 text-green-500" />,
    title: 'Calorie Calculator',
    description: 'Instant nutrition facts with portion warnings',
    category: 'Core Feature',
    targetTab: 'nutrition'
  },
  {
    icon: <Clock className="w-5 h-5 text-orange-500" />,
    title: 'Fasting Timer',
    description: 'Track intermittent fasting with celebrations',
    category: 'Wellness',
    targetTab: 'fasting'
  },
  {
    icon: <Trophy className="w-5 h-5 text-amber-700" />,
    title: 'Achievement System',
    description: 'Unlock rewards as you hit your goals',
    category: 'Motivation',
    targetTab: 'profile'
  },
  {
    icon: <Droplets className="w-5 h-5 text-cyan-500" />,
    title: 'Hydration Tracking',
    description: 'Beautiful water intake visualization',
    category: 'Wellness',
    targetTab: 'home'
  }
];

export function TourLauncher({ onStartTour, isVisible = true, onNavigateToFeature }: TourLauncherProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [, setLocation] = useLocation();

  if (!isVisible) return null;

  const handleFeatureClick = (feature: any) => {
    setIsPreviewOpen(false);
    
    // Navigate to the feature's page/tab
    if (onNavigateToFeature) {
      onNavigateToFeature(feature.targetTab);
    } else {
      // Fallback: use custom event to communicate with parent layout
      window.dispatchEvent(new CustomEvent('navigate-to-tab', {
        detail: { tab: feature.targetTab }
      }));
    }
  };

  const handleStartTour = () => {
    setIsPreviewOpen(false);
    setIsTourRunning(true);
    setTourStep(0);
    onStartTour();
    
    // Start the tour sequence
    startTourSequence();
  };

  const startTourSequence = () => {
    // Comprehensive 10-step tour covering all major features
    setTimeout(() => {
      setTourStep(1);
      showTourMessage("Welcome to ByteWise! 🎯", "Let's take a comprehensive tour of all features that will help you track nutrition and build healthy habits.");
      
      setTimeout(() => {
        setTourStep(2);
        showTourMessage("Dashboard Overview 📊", "Your central hub shows daily calories, water intake, fasting status, and progress towards your goals.");
        
        setTimeout(() => {
          setTourStep(3);
          showTourMessage("Food Search & Calculator 🔍", "Access the Calorie Tracker tab to search 300,000+ USDA foods with brand recognition and get instant nutrition facts.");
          
          setTimeout(() => {
            setTourStep(4);
            showTourMessage("AI Photo Analysis 📸", "Take photos of your meals! The AI Food Analyzer uses computer vision to identify foods and calculate nutrition automatically.");
            
            setTimeout(() => {
              setTourStep(5);
              showTourMessage("Fasting Timer ⏱️", "Track intermittent fasting with visual progress, goal celebrations, and detailed session history.");
              
              setTimeout(() => {
                setTourStep(6);
                showTourMessage("Water Tracking 💧", "Beautiful hydration visualization - track daily water intake with animated glass indicators and goal achievements.");
                
                setTimeout(() => {
                  setTourStep(7);
                  showTourMessage("Meal Journal 📝", "View your complete meal timeline, edit entries, and track nutrition trends over time in the Meal Journal.");
                  
                  setTimeout(() => {
                    setTourStep(8);
                    showTourMessage("Achievement System 🏆", "Unlock badges and rewards as you hit milestones - build streaks and celebrate your progress!");
                    
                    setTimeout(() => {
                      setTourStep(9);
                      showTourMessage("Profile & Settings ⚙️", "Customize your experience, set calorie goals, manage preferences, and sync with health apps.");
                      
                      setTimeout(() => {
                        setTourStep(10);
                        showTourMessage("Tour Complete! 🎉", "You're ready to start your nutrition journey! Each feature is designed to make healthy living easier and more rewarding.");
                        
                        // Mark tour as completed after a delay
                        setTimeout(() => {
                          setIsTourRunning(false);
                          localStorage.setItem('bytewise-tour-completed', 'true');
                        }, 4000);
                      }, 3500);
                    }, 3500);
                  }, 3500);
                }, 3500);
              }, 3500);
            }, 3500);
          }, 3500);
        }, 3500);
      }, 3500);
    }, 500);
  };

  const showTourMessage = (title: string, message: string) => {
    // Create a custom tour tooltip
    const tourTooltip = document.createElement('div');
    tourTooltip.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-amber-100 to-amber-200 text-gray-900 p-4 rounded-lg shadow-lg border border-amber-300 z-[9999] max-w-sm mx-4';
    tourTooltip.innerHTML = `
      <div class="font-bold text-lg mb-2">${title}</div>
      <div class="text-sm">${message}</div>
      <div class="mt-3 text-xs opacity-75">Tour step ${tourStep} of 10</div>
    `;
    
    document.body.appendChild(tourTooltip);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (document.body.contains(tourTooltip)) {
        document.body.removeChild(tourTooltip);
      }
    }, 2800);
  };

  return (
    <>
      {/* Tour Running Indicator */}
      {isTourRunning && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-amber-100 to-amber-200 text-gray-900 px-3 py-1 rounded-full text-xs z-[9998] border border-amber-300 shadow-lg">
          Tour in Progress... Step {tourStep}/10
        </div>
      )}
      
      {/* Tour Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-600 hover:text-amber-800 font-medium"
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
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">🎯 What You'll Learn</h3>
              <p className="text-gray-950 dark:text-gray-950 text-sm">
                This comprehensive 10-step tour covers all major features: food search, 
                AI photo analysis, fasting timer, water tracking, meal journaling, 
                achievements, and profile customization.
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-900">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  8-10 minutes
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  10 key features
                </span>
                <Badge variant="secondary" className="text-xs text-gray-900 bg-gray-100">
                  Interactive
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TOUR_FEATURES.map((feature, index) => (
                <Card 
                  key={index} 
                  className="border border-amber-300 dark:border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => handleFeatureClick(feature)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {feature.icon}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1 text-gray-900">{feature.title}</h4>
                        <p className="text-xs text-gray-700 mb-2">
                          {feature.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs text-gray-900 border-gray-400">
                            {feature.category}
                          </Badge>
                          <span className="text-xs text-orange-600 font-medium">Go to feature →</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <Sparkles className="w-4 h-4" />
                <span>Unlock your first achievement by completing the tour!</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsPreviewOpen(false)}
                  className="bg-white text-gray-900 hover:bg-gray-100 border-none"
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={handleStartTour}
                  className="text-white shadow-lg tour-button-override"
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
    <Card className="mb-6 border-2 border-amber-300 dark:border-amber-400 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-lg">Welcome to ByteWise Nutritionist! 🎉</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Ready to discover all the amazing features? Take our comprehensive 10-step tour 
              covering food tracking, AI analysis, fasting, achievements, and more!
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={onStartTour}
                size="sm"
                className="text-white shadow-lg tour-button-override"
              >
                <Play className="w-4 h-4 mr-2" />
                Take Tour (10 min)
              </Button>
              <Button
                size="sm"
                onClick={onDismiss}
                className="bg-white text-gray-900 hover:bg-gray-100 border-none"
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

// Simple hook for tour visibility (without actual tour functionality)
export function useAppTour() {
  const shouldShowTour = () => {
    return localStorage.getItem('bytewise-tour-completed') !== 'true';
  };

  const resetTour = () => {
    localStorage.removeItem('bytewise-tour-completed');
  };

  const dismissTour = () => {
    localStorage.setItem('bytewise-tour-completed', 'true');
  };

  return {
    shouldShowTour,
    resetTour,
    dismissTour
  };
}