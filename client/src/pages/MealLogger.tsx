import { CalorieCalculator } from '@/components/CalorieCalculator';

interface MealLoggerProps {
  onNavigate: (tab: string) => void;
  showToast: (message: string, type?: 'default' | 'destructive') => void;
  notifications: string[];
  setNotifications: (notifications: string[]) => void;
}

export default function MealLogger({ onNavigate }: MealLoggerProps) {
  return <CalorieCalculator onNavigate={onNavigate} />;
}