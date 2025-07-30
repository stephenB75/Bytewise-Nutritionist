/**
 * Bytewise Header Component
 * 
 * Fixed header with seamless hero integration
 * Features LogoBrand component and page navigation
 */

import React from 'react';
import { LogoBrand } from './LogoBrand';
import { Bell, Settings, Search, LogOut } from 'lucide-react';
import { Button } from './ui/button';

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
            <Button
              variant="ghost"
              className="h-8 px-2 text-lg font-bold"
              onClick={() => onNavigate('dashboard')}
              style={{ fontFamily: "'League Spartan', sans-serif" }}
            >
              bytewise
            </Button>
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
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 p-0 touch-target hover:bg-accent/80 transition-all duration-200"
                onClick={() => {
                  // Mark notifications as seen and show dropdown
                  const event = new CustomEvent('show-notifications', {
                    detail: { markAsSeen: true }
                  });
                  window.dispatchEvent(event);
                  
                  // Update notification count to 0 after viewing
                  setTimeout(() => {
                    const updateEvent = new CustomEvent('update-notification-count', {
                      detail: { count: 0 }
                    });
                    window.dispatchEvent(updateEvent);
                  }, 1000);
                }}
              >
                <Bell size={22} className="text-gray-700" />
                {notificationCount > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  </>
                )}
              </Button>
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