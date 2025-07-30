/**
 * Bytewise Header Component
 * 
 * Fixed header with seamless hero integration
 * Features LogoBrand component and page navigation
 */

import React, { useState } from 'react';
import { LogoBrand } from './LogoBrand';
import { Bell, Settings, Search, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  showNotifications?: boolean;
  notificationCount?: number;
  onLogout?: () => void;
}

export function Header({ 
  currentPage, 
  onNavigate, 
  showNotifications = false, 
  notificationCount = 0,
  onLogout
}: HeaderProps) {
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'success' as const,
      title: 'Calorie Goal Achieved',
      message: 'You have reached your daily calorie target of 2000 calories!',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'Weekly Summary Ready',
      message: 'Your weekly nutrition report is now available for download.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'achievement' as const,
      title: 'Streak Milestone',
      message: 'Congratulations! You have logged meals for 7 consecutive days.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true
    }
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'calculator':
        return 'Calculator';
      case 'logger':
        return 'Weekly Logger';
      case 'profile':
        return 'Profile';
      default:
        return 'Nutrition App';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border safe-area-inset-top">
      <div className="w-full max-w-lg mx-auto px-3 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Left Side */}
          <div className="flex-shrink-0 flex items-center">
            <LogoBrand 
              size="sm" 
              clickable={true}
              onClick={() => onNavigate('dashboard')}
              className="hover:opacity-80 transition-opacity duration-200"
            />
          </div>
          
          {/* Page Title - Center */}
          <div className="flex-1 text-center">
            <h2 style={{ 
              fontFamily: "'League Spartan', sans-serif", 
              fontSize: "1.125rem", 
              fontWeight: 600 
            }}>
              {getPageTitle()}
            </h2>
          </div>
          
          {/* Action Buttons - Right Side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {showNotifications && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-9 w-9 p-0 touch-target hover:bg-accent/80 transition-all duration-200"
                  onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                >
                  <Bell size={22} className="text-gray-700" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                      {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </Button>
                
                <NotificationDropdown
                  isOpen={isNotificationDropdownOpen}
                  onClose={() => setIsNotificationDropdownOpen(false)}
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDeleteNotification={handleDeleteNotification}
                />
              </div>
            )}
            

            
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 touch-target"
              onClick={() => onNavigate('profile')}
            >
              <Settings size={20} />
            </Button>
            
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 touch-target"
                onClick={onLogout}
                title="Sign Out"
              >
                <LogOut size={20} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}