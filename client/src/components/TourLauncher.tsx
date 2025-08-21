/**
 * Tour Launcher Component
 * Provides multiple ways to start the app tour with visual preview
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

export function TourLauncher({ onStartTour, isVisible = true }: TourLauncherProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!isVisible) return null;

  const handleStartTour = () => {
    setIsPreviewOpen(false);
    onStartTour();
  };

  return (
    <>
      {/* Floating Tour Button */}
      <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
        <Button
          onClick={onStartTour}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg rounded-full h-12 w-12 p-0 transition-all duration-200 hover:scale-105"
          data-testid="floating-tour-button"
        >
          <Play className="w-5 h-5" />
        </Button>
        <div className="absolute -top-8 -left-16 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
          Start App Tour
        </div>
      </div>

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