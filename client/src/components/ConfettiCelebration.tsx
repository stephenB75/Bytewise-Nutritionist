/**
 * Confetti Celebration Component
 * Animated confetti and trophy effects for achievements
 */

import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Trophy, Star, Zap, Heart, Target, X } from 'lucide-react';

interface ConfettiCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    type: 'daily-goal' | 'weekly-goal' | 'milestone' | 'special';
    title: string;
    message: string;
    confetti?: boolean;
    trophy?: boolean;
    points?: number;
  };
}

export function ConfettiCelebration({ isOpen, onClose, achievement }: ConfettiCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getAchievementIcon = () => {
    switch (achievement.type) {
      case 'daily-goal':
        return <Target className="w-12 h-12 text-green-400" />;
      case 'weekly-goal':
        return <Trophy className="w-12 h-12 text-yellow-400" />;
      case 'milestone':
        return <Star className="w-12 h-12 text-purple-400" />;
      case 'special':
        return <Zap className="w-12 h-12 text-blue-400" />;
      default:
        return <Heart className="w-12 h-12 text-red-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (achievement.type) {
      case 'daily-goal':
        return 'from-green-500/30 to-emerald-500/30';
      case 'weekly-goal':
        return 'from-yellow-500/30 to-orange-500/30';
      case 'milestone':
        return 'from-purple-500/30 to-pink-500/30';
      case 'special':
        return 'from-blue-500/30 to-cyan-500/30';
      default:
        return 'from-red-500/30 to-pink-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Confetti Animation */}
      {showConfetti && achievement.confetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-red-400', 'bg-purple-400'][
                    Math.floor(Math.random() * 5)
                  ]
                }`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Main Achievement Card */}
      <Card className={`bg-gradient-to-br ${getBackgroundColor()} backdrop-blur-md border-white/30 p-8 max-w-md mx-4 text-center relative animate-bounce`}>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Trophy Animation for Weekly Goals */}
        {achievement.trophy && (
          <div className="mb-6 relative">
            <div className="animate-pulse">
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-2" />
            </div>
            <div className="absolute -top-2 -right-2 animate-spin">
              <Star className="w-8 h-8 text-yellow-300" />
            </div>
            <div className="absolute -top-2 -left-2 animate-bounce">
              <Star className="w-6 h-6 text-yellow-300" />
            </div>
          </div>
        )}

        {/* Achievement Icon */}
        {!achievement.trophy && (
          <div className="mb-6 animate-pulse">
            {getAchievementIcon()}
          </div>
        )}

        {/* Achievement Content */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 animate-fadeIn">
            {achievement.title}
          </h2>
          
          <p className="text-lg text-gray-700 animate-fadeIn animation-delay-300">
            {achievement.message}
          </p>

          {achievement.points && (
            <div className="animate-fadeIn animation-delay-500">
              <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-900 font-semibold">+{achievement.points} points</span>
              </div>
            </div>
          )}

          {/* Celebration Actions */}
          <div className="flex space-x-3 justify-center mt-6 animate-fadeIn animation-delay-700">
            <Button
              onClick={onClose}
              className="bg-gradient-to-br from-amber-100 to-amber-200 hover:bg-amber-200 text-gray-900 border-amber-300"
            >
              Awesome!
            </Button>
            <Button
              onClick={() => {
                // Share achievement functionality
                onClose();
              }}
              variant="outline"
              className="border-amber-300 text-gray-900 hover:bg-amber-100"
            >
              Share
            </Button>
          </div>
        </div>

        {/* Pulsing Ring Effect */}
        <div className="absolute inset-0 rounded-lg border-2 border-white/20 animate-pulse" />
        <div className="absolute inset-0 rounded-lg border border-white/10 animate-ping" />
      </Card>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
          opacity: 0;
        }
        
        .animation-delay-700 {
          animation-delay: 0.7s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}