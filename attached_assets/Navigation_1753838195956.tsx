import { Home, Calculator, Calendar, User } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home,
      color: 'text-chart-1'
    },
    { 
      id: 'calculator', 
      label: 'Recipe Builder', 
      icon: Calculator,
      color: 'text-chart-2'
    },
    { 
      id: 'planner', 
      label: 'Planner', 
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
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-40">
      <div className="w-full max-w-lg mx-auto">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-h-[44px] flex-1 max-w-[80px] ${
                  isActive 
                    ? 'bg-primary/10 text-primary scale-105' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <Icon size={18} />
                <span 
                  className="text-compact-xs mt-0.5 truncate-mobile max-w-full" 
                  style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.625rem", fontWeight: 500 }}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 bg-primary rounded-full mt-0.5 animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}