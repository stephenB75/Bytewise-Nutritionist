/**
 * Interactive Progress Ring Component
 * Visual, tactile progress indicator with food imagery
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FoodImageClipping } from './FoodImageClipping';

interface InteractiveProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  showPercentage?: boolean;
  label?: string;
  unit?: string;
  foodImage?: string;
  foodAlt?: string;
  onClick?: () => void;
  className?: string;
}

export function InteractiveProgressRing({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  color = '#10b981',
  backgroundColor = '#e5e7eb',
  showValue = true,
  showPercentage = false,
  label,
  unit = '',
  foodImage,
  foodAlt = 'Food item',
  onClick,
  className = ''
}: InteractiveProgressRingProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const center = size / 2;
  
  // Dynamic colors based on progress
  const getProgressColor = () => {
    if (percentage >= 100) return '#22c55e'; // Green
    if (percentage >= 80) return '#eab308'; // Yellow
    if (percentage >= 60) return '#f97316'; // Orange
    return color; // Default
  };

  return (
    <motion.div
      className={`relative inline-block ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={() => setIsPressed(true)}
      onTap={() => {
        setIsPressed(false);
        onClick?.();
      }}
      onTapCancel={() => setIsPressed(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* SVG Progress Ring */}
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress Circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={getProgressColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        
        {/* Glow effect when hovered */}
        <AnimatePresence>
          {isHovered && (
            <motion.circle
              cx={center}
              cy={center}
              r={radius}
              stroke={getProgressColor()}
              strokeWidth={strokeWidth + 2}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              filter="blur(2px)"
            />
          )}
        </AnimatePresence>
      </svg>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Food Image */}
        {foodImage && (
          <motion.div
            animate={{ 
              scale: isPressed ? 0.9 : isHovered ? 1.1 : 1,
              rotate: isPressed ? -5 : 0
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <FoodImageClipping
              src={foodImage}
              alt={foodAlt}
              size="sm"
              clipPath="circle"
            />
          </motion.div>
        )}
        
        {/* Value Display */}
        {showValue && (
          <motion.div
            className="text-center mt-1"
            animate={{ 
              scale: isPressed ? 0.9 : 1,
              y: isPressed ? 2 : 0
            }}
          >
            <div className="text-lg font-bold text-gray-900">
              {Math.round(value)}{unit}
            </div>
            {showPercentage && (
              <div className="text-xs text-gray-600">
                {Math.round(percentage)}%
              </div>
            )}
          </motion.div>
        )}
        
        {/* Label */}
        {label && (
          <motion.div
            className="text-xs text-gray-600 text-center mt-1 max-w-full px-2"
            animate={{ opacity: isPressed ? 0.7 : 1 }}
          >
            {label}
          </motion.div>
        )}
      </div>
      
      {/* Completion Celebration */}
      <AnimatePresence>
        {percentage >= 100 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <motion.div
              className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 0.8,
                repeat: Infinity,
                repeatDelay: 2
              }}
            >
              <span className="text-white text-lg">✓</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}