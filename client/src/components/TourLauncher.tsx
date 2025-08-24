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
  isVisible?: boolean;
  onNavigateToFeature?: (tab: string) => void;
  onCardInteraction?: () => void;
}

const TOUR_FEATURES = [
  {
    icon: <Utensils className="w-5 h-5 text-orange-500" />,
    title: 'Smart Food Search',
    description: 'Search 300,000+ USDA foods with brand recognition',
    category: 'Core Feature',
    targetTab: 'nutrition',
    nutritionMode: 'calculator'
  },
  {
    icon: <Camera className="w-5 h-5 text-purple-500" />,
    title: 'AI Photo Analysis',
    description: 'Snap photos for instant nutrition breakdown',
    category: 'AI Feature',
    targetTab: 'nutrition',
    nutritionMode: 'ai'
  },
  {
    icon: <Target className="w-5 h-5 text-green-500" />,
    title: 'Calorie Calculator',
    description: 'Instant nutrition facts with portion warnings',
    category: 'Core Feature',
    targetTab: 'nutrition',
    nutritionMode: 'calculator'
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
    targetTab: 'profile',
    accordionTarget: 'achievements'
  },
  {
    icon: <Droplets className="w-5 h-5 text-cyan-500" />,
    title: 'Hydration Tracking',
    description: 'Beautiful water intake visualization',
    category: 'Wellness',
    targetTab: 'home'
  }
];

export function TourLauncher({ isVisible = true, onNavigateToFeature, onCardInteraction }: TourLauncherProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [clickedCards, setClickedCards] = useState(() => {
    const saved = localStorage.getItem('tour-cards-clicked');
    return saved ? JSON.parse(saved) : [];
  });
  
  const hasClickedAllCards = clickedCards.length >= TOUR_FEATURES.length;

  if (!isVisible || hasClickedAllCards) return null;

  const handleFeatureClick = (feature: any) => {
    setIsPreviewOpen(false);
    
    // Track this specific card click
    const cardId = feature.title;
    if (!clickedCards.includes(cardId)) {
      const newClickedCards = [...clickedCards, cardId];
      setClickedCards(newClickedCards);
      localStorage.setItem('tour-cards-clicked', JSON.stringify(newClickedCards));
      
      // Only notify parent when ALL cards have been clicked
      if (newClickedCards.length >= TOUR_FEATURES.length && onCardInteraction) {
        onCardInteraction();
      }
    }
    
    // Navigate to the feature's page/tab with mode information
    if (onNavigateToFeature) {
      onNavigateToFeature(feature.targetTab);
    }
    
    // Always send custom event with tab, mode, and accordion info
    window.dispatchEvent(new CustomEvent('navigate-to-tab', {
      detail: { 
        tab: feature.targetTab,
        nutritionMode: feature.nutritionMode,
        accordionTarget: feature.accordionTarget
      }
    }));
  };


  return (
    <>
      {/* Feature Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-600 hover:text-amber-800 font-medium"
            data-testid="tour-preview-button"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Explore Features
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              ByteWise Features
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">🎯 App Features</h3>
              <p className="text-gray-950 dark:text-gray-950 text-sm">
                Explore all the powerful features available in ByteWise Nutritionist. 
                Click any card below to navigate directly to that feature.
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-900">
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  6 key features
                </span>
                <Badge variant="secondary" className="text-xs text-white bg-orange-600">
                  Click to explore
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
                          <Badge variant="outline" className="text-xs text-blue-600 border-blue-400 bg-white/80">
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
                <span>Click any feature card above to explore that section!</span>
              </div>
              <Button
                onClick={() => setIsPreviewOpen(false)}
                className="bg-amber-50 text-gray-900 hover:bg-amber-100 border-none"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Welcome Banner Component
export function WelcomeBanner({ onDismiss }: { onDismiss: () => void }) {
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
              Explore all the powerful features available to track your nutrition, 
              analyze foods with AI, manage fasting, and achieve your health goals!
            </p>
            <div className="flex flex-wrap gap-2">
              <TourLauncher isVisible={true} />
              <Button
                size="sm"
                onClick={onDismiss}
                className="bg-amber-50 text-gray-900 hover:bg-amber-100 border-none"
              >
                Dismiss
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
    const tourNotCompleted = localStorage.getItem('bytewise-tour-completed') !== 'true';
    const savedCards = localStorage.getItem('tour-cards-clicked');
    const clickedCardsList = savedCards ? JSON.parse(savedCards) : [];
    const notAllCardsClicked = clickedCardsList.length < TOUR_FEATURES.length;
    return tourNotCompleted && notAllCardsClicked;
  };

  const resetTour = () => {
    localStorage.removeItem('bytewise-tour-completed');
    localStorage.removeItem('tour-cards-clicked');
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