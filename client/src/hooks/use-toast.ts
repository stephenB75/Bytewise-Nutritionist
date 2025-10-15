/**
 * Toast Hook
 * Provides toast notification functionality
 */

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toastData, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    const duration = toastData.duration || 5000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    
    return {
      id,
      dismiss: () => setToasts(prev => prev.filter(t => t.id !== id)),
    };
  }, []);

  return {
    toast,
    toasts,
  };
}
