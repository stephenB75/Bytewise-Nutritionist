import { Home, Calculator, Calendar, User } from 'lucide-react';

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
      color: 'text-chart-1'
    },
    { 
      id: 'meals', 
      label: 'Meals', 
      icon: Calculator,
      color: 'text-chart-2'
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
      color: 'text-chart-4'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-40 safe-area-bottom">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 touch-target ${
                  isActive 
                    ? 'bg-primary/10 text-primary scale-105' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 bg-primary rounded-full mt-1 animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
