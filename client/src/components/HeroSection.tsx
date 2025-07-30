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
  caloriesConsumed?: number;
  caloriesGoal?: number;
  currentStreak?: number;
  showProgress?: boolean;
  className?: string;
  stats?: Array<{
    label: string;
    value: string;
    icon: any;
    color: string;
    bgColor: string;
  }>;
}

export function HeroSection({ 
  title, 
  subtitle, 
  caloriesConsumed = 0, 
  caloriesGoal = 2000, 
  currentStreak = 0,
  showProgress = true,
  className = '',
  stats = []
}: HeroSectionProps) {
  const progressPercentage = Math.min((caloriesConsumed / caloriesGoal) * 100, 100);
  
  return (
    <div className={`relative bg-gradient-to-br from-blue-600 to-purple-700 text-white px-4 py-8 overflow-hidden ${className}`} style={{ marginTop: '88px' }}>
      {/* Food Background Image */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3Cpattern id='foodPattern' patternUnits='userSpaceOnUse' width='40' height='40'%3E%3Ccircle cx='8' cy='8' r='3' fill='%23ffffff' opacity='0.15'/%3E%3Ccircle cx='25' cy='15' r='2' fill='%23ffffff' opacity='0.12'/%3E%3Crect x='15' y='25' width='6' height='6' rx='2' fill='%23ffffff' opacity='0.1'/%3E%3Cpath d='M30 5c0-2 2-4 4-4s4 2 4 4-2 4-4 4-4-2-4-4z' fill='%23ffffff' opacity='0.08'/%3E%3Cpath d='M5 30l3-2 3 2-3 5z' fill='%23ffffff' opacity='0.1'/%3E%3Cellipse cx='35' cy='35' rx='4' ry='2' fill='%23ffffff' opacity='0.12'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23foodPattern)'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />
      <div className="relative z-10">
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

        {/* Stats Grid */}
        {stats.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`p-2 ${stat.bgColor} rounded-lg mb-2 mx-auto w-fit`}>
                    <IconComponent className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-xs text-blue-100">{stat.label}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}