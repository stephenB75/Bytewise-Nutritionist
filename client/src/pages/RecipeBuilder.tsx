import { CalorieCalculator } from '@/components/CalorieCalculator';

interface RecipeBuilderProps {
  onNavigate: (tab: string) => void;
  showToast: (message: string, type?: 'default' | 'destructive') => void;
  notifications: string[];
  setNotifications: (notifications: string[]) => void;
}

export default function RecipeBuilder({ onNavigate }: RecipeBuilderProps) {
  return <CalorieCalculator onNavigate={onNavigate} />;
}