/**
 * Bytewise Bottom Navigation Component
 * 
 * Mobile-first bottom tab navigation for the four main screens
 * Following iOS design patterns for native app feel
 */

import React from 'react';
import { 
  Home, 
  ChefHat, 
  Calendar, 
  User,
  HomeIcon,
  CalendarIcon,
  UserIcon
} from 'lucide-react';
import { Button } from './ui/button';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  activeIcon?: any;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    activeIcon: HomeIcon
  },
  {
    id: 'calculator',
    label: 'Calculator',
    icon: ChefHat
  },
  {
    id: 'logger',
    label: 'Logger',
    icon: Calendar,
    activeIcon: CalendarIcon
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    activeIcon: UserIcon
  }
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border safe-area-inset-bottom">
      <div className="w-full max-w-lg mx-auto px-2 py-2">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const IconComponent = isActive && item.activeIcon ? item.activeIcon : item.icon;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`
                  flex flex-col items-center justify-center h-16 touch-target relative
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
                onClick={() => onTabChange(item.id)}
              >
                <IconComponent 
                  size={20} 
                  className={`mb-1 ${isActive ? 'text-primary-foreground' : ''}`} 
                />
                <span 
                  className={`text-xs leading-none ${isActive ? 'text-primary-foreground' : ''}`}
                  style={{ 
                    fontFamily: "'Work Sans', sans-serif", 
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "0.6875rem"
                  }}
                >
                  {item.label}
                </span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-primary-foreground rounded-full opacity-75" />
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}