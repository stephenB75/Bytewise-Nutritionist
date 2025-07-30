/**
 * Bytewise Hero Section Component
 * 
 * Reusable hero component following brand guidelines
 * Seamless header integration with contextual content
 */

import React from 'react';
import { ImageWithFallback } from './ImageWithFallback';
import { LucideIcon } from 'lucide-react';

interface ProgressRingProps {
  percentage: number;
  color: string;
  label: string;
  size?: number;
}

function ProgressRing({ percentage, color, label, size = 80 }: ProgressRingProps) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg 
        className="transform -rotate-90" 
        viewBox="0 0 100 100"
        style={{ width: size, height: size }}
      >
        <circle 
          cx="50" 
          cy="50" 
          r={radius} 
          stroke="rgba(255,255,255,0.3)" 
          strokeWidth="6" 
          fill="transparent" 
        />
        <circle 
          cx="50" 
          cy="50" 
          r={radius} 
          stroke={color} 
          strokeWidth="6" 
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <div 
            className="font-bold"
            style={{ 
              fontFamily: "'League Spartan', sans-serif", 
              fontSize: "1.125rem", 
              fontWeight: 700 
            }}
          >
            {Math.round(percentage)}%
          </div>
          <div 
            className="text-xs opacity-75"
            style={{ 
              fontFamily: "'Quicksand', sans-serif", 
              fontSize: "0.75rem", 
              fontWeight: 400 
            }}
          >
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconColor?: string;
}

function StatCard({ icon: Icon, value, label, iconColor = "white" }: StatCardProps) {
  return (
    <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
      <div className="flex items-center space-x-2 mb-1 justify-center">
        <Icon className={`text-${iconColor}`} size={16} />
        <span 
          className="text-2xl font-bold text-white"
          style={{ 
            fontFamily: "'League Spartan', sans-serif", 
            fontSize: "1.5rem", 
            fontWeight: 700 
          }}
        >
          {value}
        </span>
      </div>
      <p 
        className="text-xs opacity-90 text-white"
        style={{ 
          fontFamily: "'Quicksand', sans-serif", 
          fontSize: "0.75rem", 
          fontWeight: 400 
        }}
      >
        {label}
      </p>
    </div>
  );
}

interface HeroSectionProps {
  backgroundImage: string;
  backgroundAlt: string;
  title: string;
  subtitle?: string;
  description?: string;
  statCard?: {
    icon: LucideIcon;
    value: string | number;
    label: string;
    iconColor?: string;
  };
  progressRing?: {
    percentage: number;
    color: string;
    label: string;
  };
  containerClass?: string;
}

export function HeroSection({
  backgroundImage,
  backgroundAlt,
  title,
  subtitle,
  description,
  statCard,
  progressRing,
  containerClass = "-mx-3"
}: HeroSectionProps) {
  return (
    <div className={`relative ${containerClass} mb-6`}>
      <div className="h-64 relative overflow-hidden">
        <ImageWithFallback
          src={backgroundImage}
          alt={backgroundAlt}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute inset-x-4 bottom-6 top-16 flex flex-col justify-end text-white">
          <div className="flex items-center justify-between mb-4">
            {/* Left Column - Title & Description */}
            <div className="flex-1 pr-4">
              {subtitle && (
                <p 
                  className="text-sm opacity-90 mb-1"
                  style={{ 
                    fontFamily: "'Quicksand', sans-serif", 
                    fontSize: "0.875rem", 
                    fontWeight: 400 
                  }}
                >
                  {subtitle}
                </p>
              )}
              <h1 
                style={{ 
                  fontFamily: "'League Spartan', sans-serif", 
                  fontSize: "1.875rem", 
                  fontWeight: 700, 
                  lineHeight: 1.2 
                }}
              >
                {title}
              </h1>
              {description && (
                <p 
                  className="text-sm opacity-90 mt-1"
                  style={{ 
                    fontFamily: "'Quicksand', sans-serif", 
                    fontSize: "0.875rem", 
                    fontWeight: 400 
                  }}
                >
                  {description}
                </p>
              )}
            </div>
            
            {/* Right Column - Stat Card */}
            {statCard && (
              <div className="flex-shrink-0">
                <StatCard {...statCard} />
              </div>
            )}
          </div>
          
          {/* Center - Progress Ring */}
          {progressRing && (
            <div className="flex justify-center">
              <ProgressRing {...progressRing} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}