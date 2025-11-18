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
        return 'bg-yellow-100 text-yellow-800';
      case 'lunch':
        return 'bg-green-100 text-green-800';
      case 'dinner':
        return 'bg-blue-100 text-blue-800';
      case 'snack':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gradient-to-br from-amber-50 to-amber-100 text-gray-900';
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
            <Badge className={`text-sm ${getMealTypeColor(meal.mealType)}`}>
              {meal.mealType}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock size={12} className="mr-1" />
              {formatTime(meal.date)}
            </div>
          </div>
          
          <h4 className="font-medium text-base mb-1">
            {meal.name || `${meal.mealType} Meal`}
          </h4>
          
          <p className="text-sm text-muted-foreground mb-2">
            {meal.foods.length} item{meal.foods.length !== 1 ? 's' : ''}
          </p>
          
          <div className="flex items-center space-x-4 text-sm">
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
          <div className="text-sm text-muted-foreground">calories</div>
        </div>
      </div>
    </Card>
  );
}
