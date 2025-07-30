/**
 * Notification Dropdown Component
 * 
 * Data management card styled notification popup for header bell icon
 * Features comprehensive notification display with proper sizing
 */

import React, { useState, useEffect } from 'react';
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
  X
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
}

export function NotificationDropdown({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification
}: NotificationDropdownProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="absolute top-full right-0 mt-2 w-80 z-50">
      <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Separator className="mb-4" />

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Bell className="w-4 h-4 mx-auto text-blue-600 mb-1" />
            <p className="text-xs text-gray-600">Total</p>
            <p className="font-bold text-gray-900">{notifications.length}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-4 h-4 mx-auto text-green-600 mb-1" />
            <p className="text-xs text-gray-600">Read</p>
            <p className="font-bold text-gray-900">{notifications.filter(n => n.read).length}</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <AlertTriangle className="w-4 h-4 mx-auto text-orange-600 mb-1" />
            <p className="text-xs text-gray-600">Unread</p>
            <p className="font-bold text-gray-900">{notifications.filter(n => !n.read).length}</p>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              className="flex-1 text-xs"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Mark All Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => notifications.forEach(n => onDeleteNotification(n.id))}
              className="flex-1 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
              <p className="text-xs text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type, notification.icon);
              
              return (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent 
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getNotificationColor(notification.type)}`} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Badge variant={getBadgeVariant(notification.type)} className="text-xs">
                            {notification.type}
                          </Badge>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMarkAsRead(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteNotification(notification.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
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
        {notifications.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => {
                  // Navigate to detailed notifications view
                  const event = new CustomEvent('navigate-to-notifications');
                  window.dispatchEvent(event);
                  onClose();
                }}
              >
                View detailed notification history
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}