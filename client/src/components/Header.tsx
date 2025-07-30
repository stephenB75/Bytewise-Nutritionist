import { LogoBrand } from '@/components/LogoBrand';
import { Button } from '@/components/ui/button';
import { Settings, Bell } from 'lucide-react';

interface HeaderProps {
  onNavigate?: (tab: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center justify-between px-4 py-2 min-h-[3rem]">
        <LogoBrand size="sm" clickable />
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0 touch-target">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-primary rounded-full" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 touch-target"
            onClick={() => onNavigate?.('profile')}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}