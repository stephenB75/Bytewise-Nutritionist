/**
 * Bytewise Header Component
 * 
 * Fixed header with seamless hero integration
 * Features LogoBrand component and page navigation
 */

import React, { useState } from 'react';
import { NewLogoBrand } from './NewLogoBrand';
import { Bell, Settings, Search, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string, section?: string) => void;
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
  const [notifications, setNotifications] = useState<any[]>([]);

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
    // Remove page titles for cleaner header design
    return '';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border safe-area-inset-top">
      <div className="w-full max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Left Side */}
          <div className="flex-shrink-0 flex items-center">
            <NewLogoBrand 
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
          
          {/* Action Buttons - Right Side - moved 10% left with improved spacing */}
          <div className="flex items-center gap-1.5 flex-shrink-0 -mr-6">
            {showNotifications && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-16 w-16 p-0 touch-target hover:bg-accent/80 transition-all duration-200"
                  onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                >
                  <Bell size={20} className="text-gray-700" />
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
                  onNavigate={onNavigate}
                />
              </div>
            )}
            

            
            <Button
              variant="ghost"
              size="sm"
              className="h-16 w-16 p-0 touch-target hover:bg-accent/80 transition-all duration-200"
              onClick={() => onNavigate('profile')}
            >
              <Settings size={20} className="text-gray-700" />
            </Button>
            
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                className="h-16 w-16 p-0 touch-target hover:bg-accent/80 transition-all duration-200"
                onClick={onLogout}
                title="Sign Out"
              >
                <LogOut size={20} className="text-gray-700" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}