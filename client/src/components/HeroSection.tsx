/**
 * Hero Section Component for Mobile PWA
 * 
 * Provides contextual header with progress rings and user stats
 * Consistent across all main app screens
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, 
  Target, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  caloriesConsumed: number;
  caloriesGoal: number;
  currentStreak: number;
  showProgress?: boolean;
}

export function HeroSection({ 
  title, 
  subtitle, 
  caloriesConsumed, 
  caloriesGoal, 
  currentStreak,
  showProgress = true 
}: HeroSectionProps) {
  const progressPercentage = Math.min((caloriesConsumed / caloriesGoal) * 100, 100);
  
  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          {subtitle && (
            <p className="text-blue-100 text-sm">{subtitle}</p>
          )}
        </div>

        {showProgress && (
          <>
            {/* Progress Ring */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="white"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${progressPercentage * 2.51} 251`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
                    <p className="text-xs text-blue-100">Daily Goal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3 bg-white/10 backdrop-blur-sm border-0 text-center">
                <Flame className="w-5 h-5 mx-auto text-orange-300 mb-1" />
                <p className="text-lg font-bold">{caloriesConsumed}</p>
                <p className="text-xs text-blue-100">Consumed</p>
              </Card>
              
              <Card className="p-3 bg-white/10 backdrop-blur-sm border-0 text-center">
                <Target className="w-5 h-5 mx-auto text-green-300 mb-1" />
                <p className="text-lg font-bold">{caloriesGoal}</p>
                <p className="text-xs text-blue-100">Goal</p>
              </Card>
              
              <Card className="p-3 bg-white/10 backdrop-blur-sm border-0 text-center">
                <TrendingUp className="w-5 h-5 mx-auto text-yellow-300 mb-1" />
                <p className="text-lg font-bold">{currentStreak}</p>
                <p className="text-xs text-blue-100">Day Streak</p>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}