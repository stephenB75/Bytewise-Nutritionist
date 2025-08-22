/**
 * Achievement Celebration Component
 * 
 * Popup with trophy icon and confetti animation for achievements
 * Features celebration effects and auto-dismissal
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, X, Star } from 'lucide-react';

interface AchievementCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    title: string;
    description: string;
    icon?: any;
  } | null;
}

export function AchievementCelebration({ isOpen, onClose, achievement }: AchievementCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  if (!isOpen || !achievement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            >
              <Star 
                className={`w-3 h-3 ${
                  Math.random() > 0.5 ? 'text-yellow-400' : 
                  Math.random() > 0.5 ? 'text-orange-400' : 'text-green-400'
                }`}
                style={{
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Achievement Card */}
      <Card className="relative max-w-sm mx-4 p-6 bg-gradient-to-br from-amber-50 to-amber-100 shadow-2xl animate-bounce">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0"
          onClick={onClose}
        >
          <X size={16} />
        </Button>

        {/* Trophy Icon */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 animate-pulse">
            <Trophy className="w-10 h-10 text-gray-900" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Achievement Unlocked!
          </h2>
        </div>

        {/* Achievement Details */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {achievement.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {achievement.description}
          </p>
          
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          >
            Awesome!
          </Button>
        </div>
      </Card>
    </div>
  );
}