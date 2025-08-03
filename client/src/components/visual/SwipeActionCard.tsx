/**
 * Swipe Action Card Component
 * ADHD-friendly card with swipe gestures for quick actions
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Check, X, Edit, Trash2 } from 'lucide-react';

interface SwipeAction {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  action: () => void;
  label: string;
}

interface SwipeActionCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export function SwipeActionCard({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className = '',
  disabled = false
}: SwipeActionCardProps) {
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const scale = useTransform(x, [-threshold, 0, threshold], [0.95, 1, 0.95]);
  const opacity = useTransform(x, [-threshold * 2, 0, threshold * 2], [0.8, 1, 0.8]);

  const handlePanStart = () => {
    if (disabled) return;
    setIsSwipeActive(true);
  };

  const handlePan = (event: any, info: PanInfo) => {
    if (disabled) return;
    const offset = info.offset.x;
    
    if (Math.abs(offset) > 10) {
      setSwipeDirection(offset > 0 ? 'right' : 'left');
    }
  };

  const handlePanEnd = (event: any, info: PanInfo) => {
    if (disabled) return;
    setIsSwipeActive(false);
    
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      if (offset > 0 && rightActions.length > 0) {
        // Swipe right - trigger first right action
        rightActions[0].action();
      } else if (offset < 0 && leftActions.length > 0) {
        // Swipe left - trigger first left action
        leftActions[0].action();
      }
    }
    
    setSwipeDirection(null);
    x.set(0);
  };

  const getActionIndicator = () => {
    if (!isSwipeActive || !swipeDirection) return null;
    
    const actions = swipeDirection === 'left' ? leftActions : rightActions;
    if (actions.length === 0) return null;
    
    const action = actions[0];
    const IconComponent = action.icon;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`absolute ${swipeDirection === 'left' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 
                   w-12 h-12 rounded-full ${action.bgColor} flex items-center justify-center z-10 shadow-lg`}
      >
        <IconComponent className={`w-6 h-6 ${action.color}`} />
      </motion.div>
    );
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Actions */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center">
          {React.createElement(leftActions[0].icon, { className: "w-6 h-6 text-white" })}
        </div>
      )}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-green-500 flex items-center justify-center">
          {React.createElement(rightActions[0].icon, { className: "w-6 h-6 text-white" })}
        </div>
      )}
      
      {/* Main Card */}
      <motion.div
        ref={cardRef}
        drag={disabled ? false : "x"}
        dragConstraints={{ left: -threshold * 1.5, right: threshold * 1.5 }}
        dragElastic={0.2}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        style={{ x, scale, opacity }}
        className="relative z-10"
      >
        <Card className={`${className} ${isSwipeActive ? 'shadow-xl' : 'shadow-md'} transition-shadow duration-200`}>
          {getActionIndicator()}
          {children}
        </Card>
      </motion.div>
    </div>
  );
}

// Pre-defined common actions
export const commonSwipeActions = {
  complete: {
    icon: Check,
    color: 'text-white',
    bgColor: 'bg-green-500',
    label: 'Complete'
  },
  delete: {
    icon: Trash2,
    color: 'text-white',
    bgColor: 'bg-red-500',
    label: 'Delete'
  },
  edit: {
    icon: Edit,
    color: 'text-white',
    bgColor: 'bg-blue-500',
    label: 'Edit'
  },
  cancel: {
    icon: X,
    color: 'text-white',
    bgColor: 'bg-gray-500',
    label: 'Cancel'
  }
};