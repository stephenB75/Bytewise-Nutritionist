/**
 * Hero Section Component for Mobile PWA
 * 
 * Provides contextual header with progress rings and user stats
 * Consistent across all main app screens with food image backgrounds
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, 
  Target, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';
import { getComponentFoodImage, createFoodBackgroundStyle } from '@/utils/foodImageRotation';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  caloriesConsumed?: number;
  caloriesGoal?: number;
  currentStreak?: number;
  showProgress?: boolean;
  className?: string;
  component?: 'calculator' | 'logger' | 'dashboard' | 'profile' | 'login' | 'meals' | 'recipes' | 'planning';
  stats?: Array<{
    label: string;
    value: string;
    icon: any;
    color: string;
    bgColor: string;
  }>;
  statCard?: {
    icon: any;
    value: number;
    label: string;
    iconColor: string;
  };
  progressRing?: {
    percentage: number;
    color: string;
    label: string;
  };
}

export function HeroSection({ 
  title, 
  subtitle,
  description,
  caloriesConsumed = 0, 
  caloriesGoal = 2000, 
  currentStreak = 0,
  showProgress = true,
  className = '',
  component = 'dashboard',
  stats = [],
  statCard,
  progressRing
}: HeroSectionProps) {
  // Use progressRing percentage if provided, otherwise calculate from calories
  const progressPercentage = progressRing 
    ? Math.min(progressRing.percentage, 100)
    : Math.min((caloriesConsumed / caloriesGoal) * 100, 100);
  
  // Get food background image for this component
  const foodImage = getComponentFoodImage(component);
  
  return (
    <div className={`relative bg-gradient-to-br from-[var(--pastel-blue)] to-[var(--pastel-blue-dark)] text-white px-4 py-8 overflow-hidden ${className}`} style={{ minHeight: '280px', paddingTop: '1.5rem' }}>
      {/* Food Background Image */}
      <div 
        className="absolute inset-0 opacity-30"
        style={createFoodBackgroundStyle(foodImage, 0.15)}
      />
      <div className="relative z-10">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-3">{title}</h1>
          {subtitle && (
            <p className="text-blue-100 text-base font-semibold opacity-95">{subtitle}</p>
          )}
          {description && !subtitle && (
            <p className="text-blue-100 text-base font-semibold opacity-95">{description}</p>
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
                    <p className="text-3xl font-bold">{Math.round(progressPercentage)}%</p>
                    <p className="text-sm text-blue-100 font-medium">
                      {progressRing ? progressRing.label : "Daily Goal"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards - Profile version with statCard */}
            {statCard ? (
              <div className="flex justify-center">
                <Card className="p-6 bg-white/10 backdrop-blur-sm border-0 text-center">
                  <statCard.icon className={`w-8 h-8 mx-auto text-${statCard.iconColor} mb-3`} />
                  <p className="text-2xl font-bold">{statCard.value}</p>
                  <p className="text-sm text-blue-100 font-medium">{statCard.label}</p>
                </Card>
              </div>
            ) : (
              /* Default Stats Cards */
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-4 bg-white/10 backdrop-blur-sm border-0 text-center">
                  <Flame className="w-6 h-6 mx-auto text-orange-300 mb-2" />
                  <p className="text-xl font-bold">{caloriesConsumed}</p>
                  <p className="text-sm text-blue-100 font-medium">Consumed</p>
                </Card>
                
                <Card className="p-4 bg-white/10 backdrop-blur-sm border-0 text-center">
                  <Target className="w-6 h-6 mx-auto text-green-300 mb-2" />
                  <p className="text-xl font-bold">{caloriesGoal}</p>
                  <p className="text-sm text-blue-100 font-medium">Goal</p>
                </Card>
                
                <Card className="p-4 bg-white/10 backdrop-blur-sm border-0 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto text-yellow-300 mb-2" />
                  <p className="text-xl font-bold">{currentStreak}</p>
                  <p className="text-sm text-blue-100 font-medium">Day Streak</p>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Stats Grid */}
        {stats.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`p-3 ${stat.bgColor} rounded-lg mb-3 mx-auto w-fit`}>
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-sm text-blue-100 font-medium">{stat.label}</div>
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