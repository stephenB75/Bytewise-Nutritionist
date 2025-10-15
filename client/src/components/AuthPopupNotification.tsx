/**
 * Authentication Popup Notification Component
 * Displays sign in/sign up notifications in the center of the screen
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AuthNotification {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description: string;
  duration?: number;
  onAction?: () => void;
  actionText?: string;
}

interface AuthPopupNotificationProps {
  notification: AuthNotification | null;
  onClose: () => void;
}

export function AuthPopupNotification({ notification, onClose }: AuthPopupNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      
      // Auto-close after duration if specified
      if (notification.duration) {
        const timer = setTimeout(() => {
          handleClose();
        }, notification.duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [notification]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle2 className="w-8 h-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-8 h-8 text-yellow-500" />;
      case 'info':
        return <Mail className="w-8 h-8 text-blue-500" />;
      default:
        return <AlertCircle className="w-8 h-8 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-amber-50 border-amber-200';
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative mx-4 max-w-md w-full bg-amber-50 rounded-xl shadow-2xl border-2 transform transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        } ${getBackgroundColor()}`}
        onClick={(e) => e.stopPropagation()}
        data-testid="auth-popup-notification"
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 w-8 h-8 p-0 rounded-full hover:bg-amber-200/50"
          onClick={handleClose}
          data-testid="button-close-notification"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Content */}
        <div className="p-6 pt-8">
          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              {getIcon()}
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid="notification-title">
                {notification.title}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4" data-testid="notification-description">
                {notification.description}
              </p>

              {/* Action button if provided */}
              {notification.onAction && notification.actionText && (
                <Button
                  onClick={() => {
                    notification.onAction!();
                    handleClose();
                  }}
                  className="mt-2"
                  variant={notification.type === 'error' ? 'destructive' : 'default'}
                  data-testid="button-notification-action"
                >
                  {notification.actionText}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to use the authentication popup notification system
export function useAuthPopupNotification() {
  const [notification, setNotification] = useState<AuthNotification | null>(null);

  const showNotification = (notif: AuthNotification) => {
    setNotification(notif);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return {
    notification,
    showNotification,
    closeNotification,
  };
}