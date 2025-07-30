/**
 * Bytewise Achievement Notification System
 * 
 * Trophy display with confetti celebration
 * Features:
 * - Brand-consistent trophy notification
 * - Confetti celebration integration
 * - Achievement progress tracking
 * - Smooth animations and transitions
 * - Mobile-optimized display
 */

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trophy, Star, Award, Zap, Crown, Medal, Sparkles, X, ChevronRight } from 'lucide-react';
import { useConfetti } from './utils/ConfettiUtils';
import { Achievement, useUser } from './user/UserManager';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  isVisible: boolean;
  onClose: () => void;
  onViewProfile?: () => void;
}

// Achievement rarity to icon mapping
const getRarityIcon = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common':
      return Medal;
    case 'rare':
      return Award;
    case 'epic':
      return Trophy;
    case 'legendary':
      return Crown;
    default:
      return Trophy;
  }
};

// Achievement rarity to color mapping
const getRarityColors = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common':
      return {
        bg: 'from-gray-50 to-gray-100',
        border: 'border-gray-200',
        icon: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-700 border-gray-300'
      };
    case 'rare':
      return {
        bg: 'from-blue-50 to-blue-100',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700 border-blue-300'
      };
    case 'epic':
      return {
        bg: 'from-purple-50 to-purple-100',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        badge: 'bg-purple-100 text-purple-700 border-purple-300'
      };
    case 'legendary':
      return {
        bg: 'from-yellow-50 to-orange-100',
        border: 'border-yellow-200',
        icon: 'text-yellow-600',
        badge: 'bg-yellow-100 text-yellow-700 border-yellow-300'
      };
    default:
      return {
        bg: 'from-gray-50 to-gray-100',
        border: 'border-gray-200',
        icon: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-700 border-gray-300'
      };
  }
};

export function AchievementNotification({ 
  achievement, 
  isVisible, 
  onClose, 
  onViewProfile 
}: AchievementNotificationProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [playConfetti, setPlayConfetti] = useState(false);
  const { startConfetti, stopConfetti, ConfettiComponent } = useConfetti();

  useEffect(() => {
    if (isVisible && achievement) {
      // Start the trophy animation
      setShowAnimation(true);
      
      // Start confetti after a brief delay for trophy animation
      const confettiTimer = setTimeout(() => {
        setPlayConfetti(true);
        startConfetti();
      }, 300);

      // Auto-hide after 5 seconds if user doesn't interact
      const autoHideTimer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => {
        clearTimeout(confettiTimer);
        clearTimeout(autoHideTimer);
      };
    }
  }, [isVisible, achievement, startConfetti]);

  const handleClose = () => {
    setShowAnimation(false);
    setPlayConfetti(false);
    stopConfetti();
    onClose();
  };

  const handleViewProfile = () => {
    handleClose();
    onViewProfile?.();
  };

  if (!isVisible || !achievement) {
    return null;
  }

  const RarityIcon = getRarityIcon(achievement.rarity);
  const colors = getRarityColors(achievement.rarity);

  return (
    <>
      {/* Confetti Canvas */}
      <ConfettiComponent onComplete={() => setPlayConfetti(false)} />
      
      {/* Achievement Notification */}
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div 
          className={`max-w-sm w-full transform transition-all duration-500 ${
            showAnimation 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
          <Card className={`p-6 bg-gradient-to-br ${colors.bg} border-2 ${colors.border} relative overflow-hidden`}>
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-black/10"
            >
              <X size={16} />
            </Button>

            {/* Achievement Header */}
            <div className="text-center mb-4">
              <div 
                className={`w-16 h-16 mx-auto mb-3 rounded-full bg-white/80 flex items-center justify-center border-2 ${colors.border} transform transition-all duration-700 ${
                  showAnimation ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                }`}
              >
                <RarityIcon className={`w-8 h-8 ${colors.icon}`} />
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-pastel-blue animate-pulse" />
                <h2 
                  className="text-brand-subheading" 
                  style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.25rem", fontWeight: 600 }}
                >
                  Achievement Unlocked!
                </h2>
                <Sparkles className="w-4 h-4 text-pastel-blue animate-pulse" />
              </div>
              
              <Badge 
                variant="outline" 
                className={`${colors.badge} text-brand-body`}
                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 500 }}
              >
                {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
              </Badge>
            </div>

            {/* Achievement Content */}
            <div className="text-center space-y-3">
              <div className="text-4xl mb-2">{achievement.icon}</div>
              
              <h3 
                className="text-brand-subheading" 
                style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}
              >
                {achievement.title}
              </h3>
              
              <p 
                className="text-muted-foreground text-brand-body" 
                style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}
              >
                {achievement.description}
              </p>
              
              {/* Progress Bar (if applicable) */}
              {achievement.progress < achievement.maxProgress && (
                <div className="space-y-2">
                  <div className="w-full bg-white/50 rounded-full h-2">
                    <div 
                      className="bg-pastel-blue h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    />
                  </div>
                  <p 
                    className="text-xs text-muted-foreground text-brand-body" 
                    style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
                  >
                    Progress: {achievement.progress} / {achievement.maxProgress}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 text-brand-button border-pastel-blue/50 hover:bg-pastel-blue/10"
                style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
              >
                Awesome!
              </Button>
              
              {onViewProfile && (
                <Button
                  onClick={handleViewProfile}
                  className="flex-1 text-brand-button bg-pastel-blue hover:bg-pastel-blue-dark text-black"
                  style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
                >
                  View Profile
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              )}
            </div>

            {/* Floating Sparkles Animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 bg-pastel-blue rounded-full opacity-60 animate-ping`}
                  style={{
                    left: `${10 + (i * 15)}%`,
                    top: `${20 + (i % 3) * 20}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

// Hook for managing achievement notifications
export function useAchievementNotification() {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useUser();

  const showAchievement = (achievement: Achievement) => {
    setCurrentAchievement(achievement);
    setIsVisible(true);
  };

  const hideAchievement = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentAchievement(null);
    }, 300);
  };

  // Listen for achievement events
  useEffect(() => {
    const handleAchievementUnlocked = (event: CustomEvent) => {
      const achievement = event.detail?.achievement;
      if (achievement) {
        showAchievement(achievement);
      }
    };

    window.addEventListener('bytewise-achievement-unlocked', handleAchievementUnlocked as EventListener);
    
    return () => {
      window.removeEventListener('bytewise-achievement-unlocked', handleAchievementUnlocked as EventListener);
    };
  }, []);

  return {
    currentAchievement,
    isVisible,
    showAchievement,
    hideAchievement
  };
}

// Utility function to trigger achievement notification
export function triggerAchievementNotification(achievement: Achievement) {
  window.dispatchEvent(new CustomEvent('bytewise-achievement-unlocked', {
    detail: { achievement }
  }));
}