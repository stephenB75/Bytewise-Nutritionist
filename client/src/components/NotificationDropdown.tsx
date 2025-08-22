/**
 * Notification Dropdown Component
 * 
 * Data management card styled notification popup for header bell icon
 * Features comprehensive notification display with proper sizing
 */

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Trash2,
  Calendar,
  Target,
  Flame,
  TrendingUp,
  X,
  Settings,
  Clock
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon?: any;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onNavigate?: (page: string, section?: string) => void;
}

export function NotificationDropdown({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNavigate
}: NotificationDropdownProps) {
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation and focus management
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'Tab':
          // Let natural tab behavior work, but ensure focus stays within dropdown
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            event.preventDefault();
            const firstFocusableElement = dropdownRef.current.querySelector(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) as HTMLElement;
            firstFocusableElement?.focus();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus management - focus the close button on open
    setTimeout(() => {
      const closeButton = dropdownRef.current?.querySelector('[data-testid="button-close-notifications"]') as HTMLElement;
      closeButton?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const getNotificationIcon = (type: string, customIcon?: any) => {
    if (customIcon) return customIcon;
    
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      case 'achievement': return Target;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'achievement': return 'text-blue-600';
      default: return 'text-blue-600';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      case 'achievement': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 max-h-96 z-50"
    >
      <Card 
        className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm border-0 shadow-lg max-h-96 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-heading"
        data-testid="dropdown-notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <h3 id="notifications-heading" className="text-lg font-bold text-gray-900">Notifications</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            aria-label="Close notifications"
            data-testid="button-close-notifications"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Summary Stats - Data Management Card Style */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">Notification Summary</h4>
              <p className="text-sm text-gray-600">Stay updated with your nutrition progress</p>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Bell className="w-3 h-3 mr-1" aria-hidden="true" />
              {notifications.filter(n => !n.read).length} New
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <Bell className="w-4 h-4 mx-auto text-blue-600 mb-1" aria-hidden="true" />
              <p className="text-xs text-gray-600">Total</p>
              <p className="font-bold text-gray-900 text-sm">{notifications.length}</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 mx-auto text-green-600 mb-1" aria-hidden="true" />
              <p className="text-xs text-gray-600">Read</p>
              <p className="font-bold text-gray-900 text-sm">{notifications.filter(n => n.read).length}</p>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 mx-auto text-orange-600 mb-1" aria-hidden="true" />
              <p className="text-xs text-gray-600">Unread</p>
              <p className="font-bold text-gray-900 text-sm">{notifications.filter(n => !n.read).length}</p>
            </div>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Action Buttons - Data Management Card Style */}
        {notifications.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllAsRead}
                className="border-blue-600 text-blue-600 hover:bg-blue-50 text-xs"
                aria-label="Mark all notifications as read"
                data-testid="button-mark-all-read"
              >
                <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => notifications.forEach(n => onDeleteNotification(n.id))}
                className="border-red-600 text-red-600 hover:bg-red-50 text-xs"
                aria-label="Clear all notifications"
                data-testid="button-clear-all"
              >
                <Trash2 className="w-3 h-3 mr-1" aria-hidden="true" />
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Notifications List - Compact sizing */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
              <p className="text-sm">No notifications</p>
              <p className="text-xs text-gray-700">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type, notification.icon);
              
              return (
                <div
                  key={notification.id}
                  className={`p-2 rounded-lg border transition-all duration-200 ${
                    notification.read 
                      ? 'bg-amber-50 border-amber-200' 
                      : 'bg-blue-50 border-blue-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <IconComponent 
                      className={`w-3 h-3 mt-0.5 flex-shrink-0 ${getNotificationColor(notification.type)}`} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-xs font-medium text-gray-900 mb-0.5">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-700 mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMarkAsRead(notification.id)}
                              className="h-5 w-5 p-0"
                              aria-label={`Mark "${notification.title}" as read`}
                              data-testid={`button-mark-read-${notification.id}`}
                            >
                              <CheckCircle className="w-3 h-3" aria-hidden="true" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteNotification(notification.id)}
                            className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                            aria-label={`Delete "${notification.title}" notification`}
                            data-testid={`button-delete-${notification.id}`}
                          >
                            <X className="w-3 h-3" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <>
          <Separator className="my-4" />
          
          {/* View All Notifications Section */}
          <div className="bg-amber-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Notification Center</h4>
                <p className="text-xs text-gray-600">Manage all your notifications and preferences</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('profile', 'notifications');
                  }
                  onClose();
                }}
              >
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-xs text-gray-600 hover:text-gray-900 h-8"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('profile', 'settings');
                  }
                  onClose();
                }}
              >
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-xs text-gray-600 hover:text-gray-900 h-8"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('profile', 'history');
                  }
                  onClose();
                }}
              >
                <Clock className="w-3 h-3 mr-1" />
                History
              </Button>
            </div>
          </div>
        </>
      </Card>
    </div>
  );
}