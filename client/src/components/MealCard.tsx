import { MealWithFoods } from '@shared/schema';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, Utensils } from 'lucide-react';
import { formatLocalTime } from '@/utils/dateUtils';

interface MealCardProps {
  meal: MealWithFoods;
  onClick?: () => void;
}

export function MealCard({ meal, onClick }: MealCardProps) {
  const getMealTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast':
        return 'bg-orange-500 text-white border-0';
      case 'lunch':
        return 'bg-blue-500 text-white border-0';
      case 'dinner':
        return 'bg-purple-500 text-white border-0';
      case 'snack':
        return 'bg-gray-500 text-white border-0';
      default:
        return 'bg-gray-500 text-white border-0';
    }
  };

  const formatTime = (date: Date) => {
    return formatLocalTime(new Date(date));
  };

  return (
    <Card 
      className="p-4 touch-target transition-all hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Utensils size={20} className="text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Badge className={`text-xs ${getMealTypeColor(meal.mealType)}`}>
              {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
            </Badge>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock size={12} className="mr-1" />
              {formatTime(meal.date)}
            </div>
          </div>
          
          <h4 className="font-medium text-sm mb-1">
            {meal.name || `${meal.mealType} Meal`}
          </h4>
          
          <p className="text-xs text-muted-foreground mb-2">
            {meal.foods.length} item{meal.foods.length !== 1 ? 's' : ''}
          </p>
          
          <div className="flex items-center space-x-4 text-xs">
            <span className="font-medium">
              {Math.round(Number(meal.totalCalories))} cal
            </span>
            <span className="text-muted-foreground">
              {Math.round(Number(meal.totalProtein))}g protein
            </span>
            <span className="text-muted-foreground">
              {Math.round(Number(meal.totalCarbs))}g carbs
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-primary">
            +{Math.round(Number(meal.totalCalories))}
          </div>
          <div className="text-xs text-muted-foreground">calories</div>
        </div>
      </div>
    </Card>
  );
}
