/**
 * Notification Dropdown Component
 * 
 * Displays user notifications with badge animations and clear/mark as read functionality
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Check, 
  X, 
  Trophy, 
  Target, 
  Calendar, 
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'achievement' | 'goal' | 'reminder' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon?: any;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'achievement',
      title: 'New Achievement!',
      message: 'You earned the "Calorie Counter" badge for logging meals 7 days in a row!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      icon: Trophy
    },
    {
      id: '2',
      type: 'goal',
      title: 'Daily Goal Reached!',
      message: 'Congratulations! You met your daily calorie goal of 2000 calories.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: false,
      icon: Target
    },
    {
      id: '3',
      type: 'reminder',
      title: 'Meal Reminder',
      message: 'Don\'t forget to log your dinner! Keep your streak going.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      read: true,
      icon: Calendar
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string, IconComponent?: any) => {
    if (IconComponent) return IconComponent;
    
    switch (type) {
      case 'achievement':
        return Trophy;
      case 'goal':
        return Target;
      case 'reminder':
        return Calendar;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'text-yellow-600 bg-yellow-100';
      case 'goal':
        return 'text-green-600 bg-green-100';
      case 'reminder':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return 'Just now';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <Card className="absolute top-20 right-4 w-80 max-h-96 overflow-hidden shadow-xl border border-border/50" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-border/50 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-blue-600" />
              <h3 className="font-semibold text-blue-900">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600 hover:text-blue-800"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onClose}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell size={32} className="mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type, notification.icon);
              const colorClass = getNotificationColor(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-border/30 hover:bg-accent/50 transition-colors ${
                    !notification.read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <IconComponent size={16} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                              onClick={() => markAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <CheckCircle size={12} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                            onClick={() => clearNotification(notification.id)}
                            title="Clear notification"
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-border/50 bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                // Mark all as read and navigate to notifications page
                markAllAsRead();
                const event = new CustomEvent('navigate-to-notifications', {
                  detail: { page: 'profile', section: 'notifications' }
                });
                window.dispatchEvent(event);
                onClose();
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}