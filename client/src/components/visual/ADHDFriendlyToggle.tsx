/**
 * ADHD-Friendly Toggle Component
 * Large, clear visual feedback with haptic-like animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface ADHDFriendlyToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  showIcons?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    track: 'w-12 h-6',
    thumb: 'w-4 h-4',
    text: 'text-sm'
  },
  md: {
    track: 'w-16 h-8',
    thumb: 'w-6 h-6',
    text: 'text-base'
  },
  lg: {
    track: 'w-20 h-10',
    thumb: 'w-8 h-8',
    text: 'text-lg'
  }
};

const variantColors = {
  default: {
    on: 'bg-[#1f4aa6]',
    off: 'bg-gray-300',
    thumb: 'bg-white'
  },
  success: {
    on: 'bg-[#45c73e]',
    off: 'bg-gray-300',
    thumb: 'bg-white'
  },
  warning: {
    on: 'bg-[#faed39]',
    off: 'bg-gray-300',
    thumb: 'bg-white'
  },
  danger: {
    on: 'bg-red-500',
    off: 'bg-gray-300',
    thumb: 'bg-white'
  }
};

export function ADHDFriendlyToggle({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  variant = 'default',
  disabled = false,
  showIcons = true,
  className = ''
}: ADHDFriendlyToggleProps) {
  const sizeConfig = sizeClasses[size];
  const colors = variantColors[variant];

  const handleToggle = () => {
    if (disabled) return;
    onChange(!checked);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Toggle Switch */}
      <motion.button
        onClick={handleToggle}
        disabled={disabled}
        className={`relative ${sizeConfig.track} rounded-full transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 ${
          checked ? colors.on : colors.off
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        whileTap={disabled ? {} : { scale: 0.95 }}
        aria-checked={checked}
        role="switch"
        aria-label={label}
      >
        {/* Track Background */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            backgroundColor: checked ? colors.on : colors.off
          }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Thumb */}
        <motion.div
          className={`absolute top-1 ${sizeConfig.thumb} ${colors.thumb} rounded-full shadow-lg flex items-center justify-center`}
          animate={{
            x: checked ? `calc(100% + 0.25rem)` : '0.25rem'
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          {showIcons && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                color: checked ? colors.on : '#6b7280'
              }}
              transition={{ duration: 0.2 }}
            >
              {checked ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
            </motion.div>
          )}
        </motion.div>
        
        {/* Visual Feedback Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          animate={{
            borderColor: checked ? colors.on : 'transparent',
            scale: checked ? 1.1 : 1
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.button>
      
      {/* Label and Description */}
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label 
              className={`block font-medium ${sizeConfig.text} ${disabled ? 'text-gray-400' : 'text-gray-900 cursor-pointer'}`}
              onClick={handleToggle}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={`text-gray-600 ${disabled ? 'text-gray-400' : ''} ${
              size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
            }`}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}