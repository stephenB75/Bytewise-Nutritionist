/**
 * Bytewise Header Component
 * 
 * Fixed header with seamless hero integration
 * Features LogoBrand component and page navigation
 */

import React from 'react';
import { LogoBrand } from './LogoBrand';
import { Bell, Settings, Search } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  showNotifications?: boolean;
  notificationCount?: number;
}

export function Header({ 
  currentPage, 
  onNavigate, 
  showNotifications = false, 
  notificationCount = 0 
}: HeaderProps) {
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'recipe-builder':
        return 'Recipe Builder';
      case 'planner':
        return 'Meal Planner';
      case 'profile':
        return 'Profile';
      default:
        return 'Bytewise';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border safe-area-inset-top">
      <div className="w-full max-w-lg mx-auto px-3 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo - Left Side */}
          <div className="flex-shrink-0">
            <LogoBrand 
              size="sm" 
              clickable 
              onClick={() => onNavigate('dashboard')}
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
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 p-0 touch-target"
              >
                <Bell size={18} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 touch-target"
              onClick={() => onNavigate('profile')}
            >
              <Settings size={18} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}