/**
 * Enhanced Progress Ring Component
 * Reusable circular progress indicator with animations and customization
 */

import { Trophy, Target, CheckCircle } from 'lucide-react';

interface ProgressRingProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showAchievement?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  animated?: boolean;
  className?: string;
}

export function ProgressRing({ 
  progress, 
  size = 'md', 
  showAchievement = true,
  color = 'blue',
  animated = true,
  className = ''
}: ProgressRingProps) {
  const sizeMap = {
    sm: { ring: 'w-20 h-20', text: 'text-lg', badge: 'w-6 h-6' },
    md: { ring: 'w-32 h-32', text: 'text-2xl', badge: 'w-8 h-8' },
    lg: { ring: 'w-40 h-40', text: 'text-3xl', badge: 'w-10 h-10' }
  };

  const colorMap = {
    blue: { stroke: '#1f4aa6', bg: 'bg-[#1f4aa6]', shadow: 'rgba(31, 74, 166, 0.4)' },
    green: { stroke: '#45c73e', bg: 'bg-[#45c73e]', shadow: 'rgba(69, 199, 62, 0.4)' },
    orange: { stroke: '#faed39', bg: 'bg-[#faed39]', shadow: 'rgba(250, 237, 57, 0.4)' },
    purple: { stroke: '#8b5cf6', bg: 'bg-purple-500', shadow: 'rgba(139, 92, 246, 0.4)' }
  };

  const currentSize = sizeMap[size];
  const currentColor = colorMap[color];
  const isComplete = progress >= 100;

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-center">
        <div className={`relative ${currentSize.ring}`}>
          {/* Background circle */}
          <svg className={`${currentSize.ring} transform -rotate-90`} viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={currentColor.stroke}
              strokeWidth="3.5"
              strokeDasharray={`${Math.min(progress, 100)}, 100`}
              strokeLinecap="round"
              className={animated ? "transition-all duration-1500 ease-out" : ""}
              style={{
                filter: `drop-shadow(0 0 8px ${currentColor.shadow})`
              }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`${currentSize.text} font-bold text-gray-900 transition-all duration-500`}>
              {Math.round(progress)}%
            </div>
            <div className="text-xs text-gray-600 font-medium">Complete</div>
          </div>
        </div>
      </div>
      
      {/* Achievement Badge */}
      {showAchievement && isComplete && (
        <div className="absolute -top-2 -right-2 animate-bounce">
          <div className={`${currentSize.badge} ${currentColor.bg} rounded-full flex items-center justify-center shadow-lg`}>
            <Trophy className="w-3 h-3 text-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}