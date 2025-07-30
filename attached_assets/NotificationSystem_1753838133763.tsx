/**
 * Bytewise Enhanced Notification System - Brand Visual Redesign
 * 
 * Complete redesign with modern brand-compliant visual styling
 * Features:
 * - Brand-consistent visual design with Bytewise colors and typography
 * - Center-positioned popup notifications optimized for mobile
 * - Enhanced close functionality with improved UX
 * - Modern glassmorphism design with proper backdrop blur
 * - Mobile-first responsive design with touch-friendly interactions
 * - Performance-optimized animations and rendering
 * - Visual hierarchy following brand guidelines
 * - Accessibility compliant with proper ARIA labels
 */

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  XCircle, 
  X, 
  ChefHat, 
  Target, 
  Flame, 
  TrendingUp,
  Calendar,
  Trash2,
  Edit3,
  Search,
  Plus,
  Clock,
  Users,
  Utensils,
  Star,
  Zap,
  Bell,
  Award
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export interface NotificationData {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'meal' | 'achievement' | 'goal' | 'save' | 'edit' | 'delete';
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  metadata?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    mealType?: string;
    foodName?: string;
    goalType?: string;
    streakDays?: number;
    date?: string;
    totalMeals?: number;
    saveDuration?: number;
    previousValue?: number;
    newValue?: number;
    unit?: string;
  };
}

interface NotificationItemProps {
  notification: NotificationData;
  onDismiss: (id: string) => void;
  index: number;
  isEntering: boolean;
  isExiting: boolean;
}

// Brand-compliant notification configurations
const getNotificationConfig = (type: NotificationData['type']) => {
  const configs = {
    success: {
      icon: CheckCircle,
      colors: {
        primary: '#22c55e',
        secondary: '#16a34a',
        bg: 'from-green-50/95 to-emerald-50/90',
        border: 'border-green-200/60',
        text: 'text-green-900',
        icon: 'text-green-600',
        accent: '#10b981',
        glow: 'shadow-green-200/50'
      }
    },
    error: {
      icon: XCircle,
      colors: {
        primary: '#ef4444',
        secondary: '#dc2626',
        bg: 'from-red-50/95 to-rose-50/90',
        border: 'border-red-200/60',
        text: 'text-red-900',
        icon: 'text-red-600',
        accent: '#dc2626',
        glow: 'shadow-red-200/50'
      }
    },
    warning: {
      icon: AlertTriangle,
      colors: {
        primary: '#f59e0b',
        secondary: '#d97706',
        bg: 'from-amber-50/95 to-yellow-50/90',
        border: 'border-amber-200/60',
        text: 'text-amber-900',
        icon: 'text-amber-600',
        accent: '#f59e0b',
        glow: 'shadow-amber-200/50'
      }
    },
    meal: {
      icon: ChefHat,
      colors: {
        primary: 'var(--pastel-blue)',
        secondary: 'var(--pastel-blue-dark)',
        bg: 'from-blue-50/95 to-cyan-50/90',
        border: 'border-blue-200/60',
        text: 'text-blue-900',
        icon: 'text-blue-600',
        accent: '#3b82f6',
        glow: 'shadow-blue-200/50'
      }
    },
    save: {
      icon: CheckCircle,
      colors: {
        primary: '#10b981',
        secondary: '#059669',
        bg: 'from-emerald-50/95 to-teal-50/90',
        border: 'border-emerald-200/60',
        text: 'text-emerald-900',
        icon: 'text-emerald-600',
        accent: '#10b981',
        glow: 'shadow-emerald-200/50'
      }
    },
    edit: {
      icon: Edit3,
      colors: {
        primary: 'var(--pastel-blue)',
        secondary: 'var(--pastel-blue-dark)',
        bg: 'from-blue-50/95 to-indigo-50/90',
        border: 'border-blue-200/60',
        text: 'text-blue-900',
        icon: 'text-blue-600',
        accent: '#6366f1',
        glow: 'shadow-blue-200/50'
      }
    },
    delete: {
      icon: Trash2,
      colors: {
        primary: '#f97316',
        secondary: '#ea580c',
        bg: 'from-orange-50/95 to-red-50/90',
        border: 'border-orange-200/60',
        text: 'text-orange-900',
        icon: 'text-orange-600',
        accent: '#f97316',
        glow: 'shadow-orange-200/50'
      }
    },
    achievement: {
      icon: Award,
      colors: {
        primary: '#a855f7',
        secondary: '#9333ea',
        bg: 'from-purple-50/95 to-violet-50/90',
        border: 'border-purple-200/60',
        text: 'text-purple-900',
        icon: 'text-purple-600',
        accent: '#a855f7',
        glow: 'shadow-purple-200/50'
      }
    },
    goal: {
      icon: Target,
      colors: {
        primary: '#f97316',
        secondary: '#ea580c',
        bg: 'from-orange-50/95 to-amber-50/90',
        border: 'border-orange-200/60',
        text: 'text-orange-900',
        icon: 'text-orange-600',
        accent: '#f97316',
        glow: 'shadow-orange-200/50'
      }
    },
    info: {
      icon: Info,
      colors: {
        primary: 'var(--pastel-blue)',
        secondary: 'var(--pastel-blue-dark)',
        bg: 'from-blue-50/95 to-sky-50/90',
        border: 'border-blue-200/60',
        text: 'text-blue-900',
        icon: 'text-blue-600',
        accent: '#3b82f6',
        glow: 'shadow-blue-200/50'
      }
    }
  };
  
  return configs[type] || configs.info;
};

// Enhanced notification item with brand styling
const NotificationItem = memo<NotificationItemProps>(({ 
  notification, 
  onDismiss, 
  index, 
  isEntering, 
  isExiting 
}) => {
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const config = getNotificationConfig(notification.type);
  const IconComponent = notification.icon || config.icon;
  const duration = notification.duration || 5000;
  
  // Performance optimized refs
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const mountedRef = useRef(true);
  
  // Enhanced dismiss handler
  const handleDismiss = useCallback(() => {
    if (!mountedRef.current || !isVisible) return;
    
    setIsVisible(false);
    
    const dismissTimer = requestAnimationFrame(() => {
      if (mountedRef.current) {
        onDismiss(notification.id);
      }
    });
    
    return () => cancelAnimationFrame(dismissTimer);
  }, [notification.id, onDismiss, isVisible]);

  // Progress animation
  useEffect(() => {
    if (!mountedRef.current || notification.persistent || isHovered || isExiting || !isVisible) {
      return;
    }

    startTimeRef.current = Date.now();
    
    const animate = () => {
      if (!mountedRef.current || !isVisible) return;
      
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);
      
      setProgress(newProgress);
      
      if (newProgress > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          if (mountedRef.current) {
            handleDismiss();
          }
        }, 100);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [notification.persistent, duration, isHovered, isExiting, isVisible, handleDismiss]);

  // Enhanced metadata rendering
  const renderMetadata = useCallback(() => {
    const { metadata } = notification;
    if (!metadata) return null;

    const metadataItems = [];
    
    if (metadata.calories) {
      metadataItems.push({
        icon: Flame,
        label: `${Math.round(metadata.calories)} cal`,
        color: 'text-orange-600'
      });
    }
    
    if (metadata.protein) {
      metadataItems.push({
        icon: TrendingUp,
        label: `${Math.round(metadata.protein * 10) / 10}g protein`,
        color: 'text-green-600'
      });
    }
    
    if (metadata.mealType) {
      metadataItems.push({
        icon: Calendar,
        label: metadata.mealType,
        color: 'text-blue-600'
      });
    }
    
    if (metadata.totalMeals) {
      metadataItems.push({
        icon: Utensils,
        label: `${metadata.totalMeals} meals`,
        color: 'text-purple-600'
      });
    }
    
    if (metadata.streakDays) {
      metadataItems.push({
        icon: Star,
        label: `${metadata.streakDays} day streak`,
        color: 'text-yellow-600'
      });
    }

    if (metadataItems.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-3 mt-3 pt-2 border-t border-current/10">
        {metadataItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <item.icon size={12} className={`${item.color} flex-shrink-0`} />
            <span 
              className="text-xs font-medium opacity-80"
              style={{ 
                fontFamily: "'Quicksand', sans-serif", 
                fontSize: "0.6875rem", 
                fontWeight: 500,
                lineHeight: 1.2
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  }, [notification.metadata]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <Card 
      className={`
        relative overflow-hidden transition-all duration-300 ease-out
        bg-gradient-to-br ${config.colors.bg}
        ${config.colors.border} border-2
        backdrop-blur-xl 
        ${config.colors.glow} shadow-xl
        ${isEntering ? 'animate-notification-bounce-in' : ''}
        ${isExiting ? 'animate-notification-slide-out' : ''}
        ${isHovered ? 'scale-105 shadow-2xl' : ''}
        mobile:mx-2 mobile:max-w-[calc(100vw-2rem)]
        hover:shadow-2xl hover:scale-105
      `}
      style={{
        marginBottom: '1rem',
        zIndex: 1000 - index,
        minWidth: '320px',
        maxWidth: '420px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Progress indicator */}
      {!notification.persistent && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/10 overflow-hidden">
          <div
            className="h-full transition-all duration-100 ease-linear"
            style={{ 
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${config.colors.primary}, ${config.colors.secondary})`,
            }}
          />
        </div>
      )}

      <div className="p-6 relative">
        <div className="flex items-start gap-4">
          {/* Enhanced icon with brand styling */}
          <div 
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${config.colors.primary}20, ${config.colors.secondary}10)`,
              border: `2px solid ${config.colors.primary}30`
            }}
          >
            <IconComponent size={20} className={`${config.colors.icon} relative z-10`} />
            <div 
              className="absolute inset-0 animate-pulse opacity-30"
              style={{ background: `radial-gradient(circle, ${config.colors.primary}40, transparent)` }}
            />
          </div>

          {/* Content with brand typography */}
          <div className="flex-1 min-w-0">
            {notification.title && (
              <h3 
                className={`font-semibold ${config.colors.text} mb-2 leading-tight`}
                style={{ 
                  fontFamily: "'Work Sans', sans-serif", 
                  fontSize: "1rem", 
                  fontWeight: 600,
                  lineHeight: 1.3
                }}
              >
                {notification.title}
              </h3>
            )}
            <p 
              className={`${config.colors.text} leading-relaxed`}
              style={{ 
                fontFamily: "'Quicksand', sans-serif", 
                fontSize: "0.875rem", 
                fontWeight: 400,
                lineHeight: 1.5
              }}
            >
              {notification.message}
            </p>
            
            {renderMetadata()}

            {/* Action button */}
            {notification.actionLabel && notification.onAction && (
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={notification.onAction}
                  className={`
                    btn-compact-sm ${config.colors.text} 
                    border-current hover:bg-current/10 
                    transition-all duration-200
                    mobile-safe-input
                  `}
                  style={{ 
                    fontFamily: "'Work Sans', sans-serif", 
                    fontSize: "0.875rem", 
                    fontWeight: 500,
                    minHeight: '36px'
                  }}
                >
                  {notification.actionLabel}
                </Button>
              </div>
            )}
          </div>

          {/* Enhanced close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className={`
              flex-shrink-0 h-8 w-8 p-0 
              ${config.colors.text} hover:bg-current/20 
              rounded-full transition-all duration-200
              mobile-safe-input
            `}
            aria-label="Close notification"
            style={{ minHeight: '32px' }}
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Decorative elements */}
      <div 
        className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse opacity-60"
        style={{ backgroundColor: config.colors.primary }}
      />
      <div 
        className="absolute bottom-2 left-2 w-1 h-1 rounded-full animate-pulse opacity-40"
        style={{ backgroundColor: config.colors.secondary, animationDelay: '1s' }}
      />
    </Card>
  );
});

NotificationItem.displayName = 'NotificationItem';

// Main notification system with center positioning
interface NotificationSystemProps {
  notifications: NotificationData[];
  onDismiss: (id: string) => void;
  maxNotifications?: number;
  position?: 'center' | 'top-center' | 'bottom-center';
}

export function NotificationSystem({ 
  notifications, 
  onDismiss, 
  maxNotifications = 3,
  position = 'center'
}: NotificationSystemProps) {
  const [exitingNotifications, setExitingNotifications] = useState<Set<string>>(new Set());
  
  // Sort and limit notifications
  const visibleNotifications = React.useMemo(() => {
    return notifications
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
        const aPriority = priorityOrder[a.priority || 'normal'];
        const bPriority = priorityOrder[b.priority || 'normal'];
        return aPriority - bPriority;
      })
      .slice(0, maxNotifications);
  }, [notifications, maxNotifications]);

  // Center positioning classes with mobile optimization
  const getPositionClasses = useCallback(() => {
    const baseClasses = 'fixed z-[60] pointer-events-none';
    
    switch (position) {
      case 'top-center':
        return `${baseClasses} top-20 left-1/2 transform -translate-x-1/2`;
      case 'bottom-center':
        return `${baseClasses} bottom-32 left-1/2 transform -translate-x-1/2`;
      case 'center':
      default:
        return `${baseClasses} top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
    }
  }, [position]);

  // Enhanced dismiss handler
  const handleDismiss = useCallback((id: string) => {
    setExitingNotifications(prev => new Set(prev).add(id));
    
    const cleanupTimer = setTimeout(() => {
      onDismiss(id);
      setExitingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300);
    
    return () => clearTimeout(cleanupTimer);
  }, [onDismiss]);

  // Render backdrop overlay for center positioning
  const renderBackdrop = () => {
    if (visibleNotifications.length === 0) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[59] pointer-events-auto"
        onClick={() => visibleNotifications.forEach(n => handleDismiss(n.id))}
        aria-label="Close all notifications"
      />
    );
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <>
      {position === 'center' && renderBackdrop()}
      
      <div className={getPositionClasses()}>
        <div className="flex flex-col items-center gap-0 pointer-events-auto">
          {visibleNotifications.map((notification, index) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDismiss={handleDismiss}
              index={index}
              isEntering={true}
              isExiting={exitingNotifications.has(notification.id)}
            />
          ))}
        </div>

        {/* Overflow indicator */}
        {notifications.length > maxNotifications && (
          <div className="text-center mt-4 animate-fade-in pointer-events-auto">
            <div 
              className="
                bg-black/70 backdrop-blur-lg rounded-full px-4 py-2 
                text-white text-sm shadow-lg border border-white/20
              "
              style={{ 
                fontFamily: "'Quicksand', sans-serif", 
                fontSize: "0.75rem", 
                fontWeight: 500 
              }}
            >
              <div className="flex items-center gap-2">
                <Bell size={14} />
                <span>+{notifications.length - maxNotifications} more notifications</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Enhanced hook with performance optimizations
export function useNotificationSystem() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const mountedRef = useRef(true);
  const throttleRef = useRef<Map<string, number>>(new Map());

  // Throttled add notification
  const addNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    if (!mountedRef.current) return '';

    // Throttle similar notifications
    const throttleKey = `${notification.type}-${notification.message}`;
    const now = Date.now();
    const lastTime = throttleRef.current.get(throttleKey) || 0;
    
    if (now - lastTime < 1000) {
      console.log('🔕 Notification throttled:', throttleKey);
      return '';
    }
    
    throttleRef.current.set(throttleKey, now);

    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newNotification: NotificationData = {
      ...notification,
      id,
      duration: notification.duration || 5000,
      priority: notification.priority || 'normal'
    };

    setNotifications(prev => {
      if (!mountedRef.current) return prev;
      
      // Prevent duplicates
      const isDuplicate = prev.some(n => 
        n.type === newNotification.type && 
        n.message === newNotification.message &&
        (Date.now() - parseInt(n.id.split('-')[1]) < 2000)
      );
      
      if (isDuplicate) {
        console.log('🔕 Duplicate notification prevented:', newNotification.message);
        return prev;
      }
      
      return [newNotification, ...prev].slice(0, 10);
    });
    
    console.log('🔔 Added notification:', newNotification.type, newNotification.message);
    return id;
  }, []);

  const dismissNotification = useCallback((id: string) => {
    if (!mountedRef.current) return;

    setNotifications(prev => {
      if (!mountedRef.current) return prev;
      return prev.filter(n => n.id !== id);
    });
    
    console.log('🔕 Dismissed notification:', id);
  }, []);

  const clearAllNotifications = useCallback(() => {
    if (!mountedRef.current) return;

    setNotifications([]);
    throttleRef.current.clear();
    console.log('🧹 Cleared all notifications');
  }, []);

  // Cleanup
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (mountedRef.current) {
        const now = Date.now();
        for (const [key, time] of throttleRef.current.entries()) {
          if (now - time > 60000) {
            throttleRef.current.delete(key);
          }
        }
        setNotifications(prev => prev.slice(0, 8));
      }
    }, 30000);

    return () => clearInterval(cleanup);
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications
  };
}

// Enhanced utility functions for creating notifications
export const createMealLogNotification = (
  mealType: string,
  foodName: string,
  calories: number,
  protein?: number,
  action: 'added' | 'updated' | 'removed' = 'added'
): Omit<NotificationData, 'id'> => {
  const actionConfig = {
    added: { type: 'meal' as const, verb: 'added to', icon: Plus },
    updated: { type: 'edit' as const, verb: 'updated in', icon: Edit3 },
    removed: { type: 'delete' as const, verb: 'removed from', icon: Trash2 }
  };
  
  const config = actionConfig[action];
  
  return {
    type: config.type,
    title: action === 'added' ? '🍽️ Meal Logged' : action === 'updated' ? '✏️ Meal Updated' : '🗑️ Meal Removed',
    message: `${foodName} ${config.verb} ${mealType}`,
    icon: config.icon,
    duration: 4000,
    priority: action === 'removed' ? 'high' : 'normal',
    metadata: {
      mealType,
      foodName,
      calories,
      protein
    }
  };
};

export const createDailySummaryNotification = (
  date: string,
  totalCalories: number,
  totalProtein: number,
  totalMeals: number,
  saveDuration?: number
): Omit<NotificationData, 'id'> => ({
  type: 'save',
  title: '💾 Daily Log Saved',
  message: `${totalMeals} meals logged for ${new Date(date).toLocaleDateString()}`,
  icon: CheckCircle,
  duration: 5000,
  priority: 'normal',
  metadata: {
    date,
    calories: totalCalories,
    protein: totalProtein,
    totalMeals,
    saveDuration
  }
});

export const createGoalAchievementNotification = (
  goalType: string,
  currentValue: number,
  targetValue: number
): Omit<NotificationData, 'id'> => ({
  type: 'achievement',
  title: '🎯 Goal Achieved!',
  message: `Daily ${goalType} goal reached (${Math.round(currentValue)}/${targetValue})`,
  icon: Target,
  duration: 6000,
  priority: 'high',
  persistent: true,
  metadata: {
    goalType
  }
});

// Legacy compatibility functions
export const createMealNotification = (
  mealType: string,
  foodName: string,
  calories: number,
  protein?: number
): Omit<NotificationData, 'id'> => ({
  type: 'meal',
  title: '🍽️ Meal Logged',
  message: `${foodName} added to ${mealType}`,
  icon: ChefHat,
  duration: 4000,
  metadata: {
    mealType,
    foodName,
    calories,
    protein
  }
});

export const createGoalNotification = (
  goalType: string,
  currentValue: number,
  targetValue: number
): Omit<NotificationData, 'id'> => ({
  type: 'goal',
  title: '🎯 Goal Achieved!',
  message: `Daily ${goalType} goal reached (${Math.round(currentValue)}/${targetValue})`,
  icon: Target,
  duration: 6000,
  metadata: {
    goalType
  }
});

export const createStreakNotification = (
  streakDays: number,
  streakType: string
): Omit<NotificationData, 'id'> => ({
  type: 'achievement',
  title: '🔥 Streak Milestone!',
  message: `${streakDays} day ${streakType} streak`,
  icon: Flame,
  duration: 5000,
  persistent: true,
  metadata: {
    streakDays
  }
});

export const createDeleteNotification = (
  foodName: string,
  mealType: string,
  calories: number
): Omit<NotificationData, 'id'> => ({
  type: 'warning',
  title: '🗑️ Item Removed',
  message: `${foodName} removed from ${mealType}`,
  icon: Trash2,
  duration: 3000,
  metadata: {
    mealType,
    foodName,
    calories
  }
});

export const createSearchResultNotification = (
  query: string,
  resultCount: number
): Omit<NotificationData, 'id'> => ({
  type: 'info',
  title: '🔍 Search Results',
  message: `Found ${resultCount} foods for "${query}". Drag to log meals!`,
  icon: Search,
  duration: 3000,
  priority: 'low'
});

export const createEditNotification = (
  foodName: string,
  previousValue: number,
  newValue: number,
  unit: string
): Omit<NotificationData, 'id'> => ({
  type: 'edit',
  title: '✏️ Value Updated',
  message: `${foodName}: ${previousValue} → ${newValue} ${unit}`,
  icon: Edit3,
  duration: 3000,
  priority: 'normal',
  metadata: {
    foodName,
    previousValue,
    newValue,
    unit
  }
});