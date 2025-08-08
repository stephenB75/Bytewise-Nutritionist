import { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface NotificationContextType {
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const addNotification = useCallback((notification: Notification) => {
    const id = notification.id || Date.now().toString();
    
    switch (notification.type) {
      case 'success':
        toast.success(notification.message, { duration: notification.duration });
        break;
      case 'error':
        toast.error(notification.message, { duration: notification.duration });
        break;
      case 'warning':
        toast.warning(notification.message, { duration: notification.duration });
        break;
      default:
        toast(notification.message, { duration: notification.duration });
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    // Sonner handles removal automatically
  }, []);

  const value: NotificationContextType = {
    addNotification,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationSystem() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationSystem must be used within a NotificationProvider');
  }
  return context;
}

// Helper functions for creating specific notification types
export function createMealLogNotification(foodName: string, mealType: string, calories: number, protein: number): Notification {
  return {
    type: 'success',
    message: `Added ${foodName} to ${mealType} (${calories} cal, ${protein}g protein)`,
    duration: 3000
  };
}

export function createSearchResultNotification(query: string, resultCount: number): Notification {
  return {
    type: 'info',
    message: `Found ${resultCount} results for "${query}"`,
    duration: 2000
  };
}

export function createDailySummaryNotification(totalCalories: number, goalCalories: number): Notification {
  const progress = Math.round((totalCalories / goalCalories) * 100);
  return {
    type: 'info',
    message: `Daily progress: ${totalCalories}/${goalCalories} calories (${progress}%)`,
    duration: 4000
  };
}

export function createEditNotification(action: string, item: string): Notification {
  return {
    type: 'success',
    message: `${action} ${item} successfully`,
    duration: 2000
  };
}