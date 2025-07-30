import { Home, Target, Calendar, Plus, User } from 'lucide-react';
import { LogoBrand } from '@/components/LogoBrand';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
      color: 'text-primary'
    },
    {
      id: 'meals',
      label: 'Meals',
      icon: Target,
      color: 'text-chart-2'
    },
    {
      id: 'recipe-builder',
      label: 'Recipe',
      icon: Plus,
      color: 'text-chart-1'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      color: 'text-chart-3'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      color: 'text-muted-foreground'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around py-1 px-2" style={{ minHeight: '4rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 touch-target min-w-[3.5rem] min-h-[3rem]
                ${isActive 
                  ? 'bg-primary/15 scale-105' 
                  : 'hover:bg-muted/30 active:scale-95'
                }
              `}
            >
              <Icon 
                className={`h-5 w-5 mb-0.5 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span 
                className={`text-[10px] font-medium transition-colors leading-tight ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}