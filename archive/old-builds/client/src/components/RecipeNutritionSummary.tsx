import { TrendingUp, Zap, Scale, Heart } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

interface RecipeNutritionSummaryProps {
  nutrition: NutritionData;
  servings: number;
}

export function RecipeNutritionSummary({ nutrition, servings }: RecipeNutritionSummaryProps) {
  // Provide default values and sanitize inputs to prevent errors
  const defaultNutrition: NutritionData = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  };

  // Merge provided nutrition with defaults and sanitize
  const safeNutrition = {
    ...defaultNutrition,
    ...nutrition,
    calories: isNaN(nutrition?.calories) ? 0 : nutrition?.calories || 0,
    protein: isNaN(nutrition?.protein) ? 0 : nutrition?.protein || 0,
    carbs: isNaN(nutrition?.carbs) ? 0 : nutrition?.carbs || 0,
    fat: isNaN(nutrition?.fat) ? 0 : nutrition?.fat || 0,
    fiber: isNaN(Number(nutrition?.fiber)) ? 0 : Number(nutrition?.fiber) || 0,
    sugar: isNaN(Number(nutrition?.sugar)) ? 0 : Number(nutrition?.sugar) || 0,
    sodium: isNaN(Number(nutrition?.sodium)) ? 0 : Number(nutrition?.sodium) || 0
  };

  const safeServings = isNaN(servings) || servings < 1 ? 1 : servings;

  // Calculate per serving values
  const perServing = {
    calories: Math.round(safeNutrition.calories / safeServings),
    protein: Math.round(safeNutrition.protein / safeServings),
    carbs: Math.round(safeNutrition.carbs / safeServings),
    fat: Math.round(safeNutrition.fat / safeServings),
    fiber: Math.round(safeNutrition.fiber / safeServings),
    sugar: Math.round(safeNutrition.sugar / safeServings),
    sodium: Math.round(safeNutrition.sodium / safeServings)
  };

  // Calculate macro percentages
  const totalMacros = safeNutrition.protein * 4 + safeNutrition.carbs * 4 + safeNutrition.fat * 9;
  const macroPercentages = {
    protein: totalMacros > 0 ? Math.round((safeNutrition.protein * 4 / totalMacros) * 100) : 0,
    carbs: totalMacros > 0 ? Math.round((safeNutrition.carbs * 4 / totalMacros) * 100) : 0,
    fat: totalMacros > 0 ? Math.round((safeNutrition.fat * 9 / totalMacros) * 100) : 0
  };

  return (
    <Card className="p-4 mb-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp size={16} className="text-primary" />
            <h3 className="font-semibold">Recipe Nutrition</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            {safeServings} serving{safeServings !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Main Macros - Total Recipe */}
        <div className="space-y-3">
          <div className="text-center p-3 bg-gradient-to-r from-primary/5 to-chart-1/5 rounded-lg border">
            <div className="text-2xl font-bold text-primary mb-1">
              {Math.round(safeNutrition.calories)}
            </div>
            <div className="text-xs text-muted-foreground">Total Calories</div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-card rounded-lg border">
              <div className="flex items-center justify-center mb-1">
                <Heart size={12} className="text-chart-2 mr-1" />
                <span className="font-semibold text-chart-2">{Math.round(safeNutrition.protein)}g</span>
              </div>
              <div className="text-xs text-muted-foreground">Protein</div>
              <div className="text-xs text-chart-2 font-medium">{macroPercentages.protein}%</div>
            </div>
            
            <div className="text-center p-2 bg-card rounded-lg border">
              <div className="flex items-center justify-center mb-1">
                <Zap size={12} className="text-chart-4 mr-1" />
                <span className="font-semibold text-chart-4">{Math.round(safeNutrition.carbs)}g</span>
              </div>
              <div className="text-xs text-muted-foreground">Carbs</div>
              <div className="text-xs text-chart-4 font-medium">{macroPercentages.carbs}%</div>
            </div>
            
            <div className="text-center p-2 bg-card rounded-lg border">
              <div className="flex items-center justify-center mb-1">
                <Scale size={12} className="text-chart-3 mr-1" />
                <span className="font-semibold text-chart-3">{Math.round(safeNutrition.fat)}g</span>
              </div>
              <div className="text-xs text-muted-foreground">Fat</div>
              <div className="text-xs text-chart-3 font-medium">{macroPercentages.fat}%</div>
            </div>
          </div>
        </div>

        {/* Per Serving Breakdown */}
        <div className="border-t pt-3">
          <div className="text-xs text-muted-foreground mb-2 text-center">
            Per Serving ({safeServings} serving{safeServings !== 1 ? 's' : ''} total)
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="font-semibold text-sm text-primary">{perServing.calories}</div>
              <div className="text-xs text-muted-foreground">cal</div>
            </div>
            <div>
              <div className="font-semibold text-sm text-chart-2">{perServing.protein}g</div>
              <div className="text-xs text-muted-foreground">protein</div>
            </div>
            <div>
              <div className="font-semibold text-sm text-chart-4">{perServing.carbs}g</div>
              <div className="text-xs text-muted-foreground">carbs</div>
            </div>
            <div>
              <div className="font-semibold text-sm text-chart-3">{perServing.fat}g</div>
              <div className="text-xs text-muted-foreground">fat</div>
            </div>
          </div>
        </div>

        {/* Additional Nutritional Info */}
        {(safeNutrition.fiber > 0 || safeNutrition.sugar > 0 || safeNutrition.sodium > 0) && (
          <div className="border-t pt-3">
            <div className="text-xs text-muted-foreground mb-2">Additional Info</div>
            <div className="flex justify-center space-x-4 text-xs">
              {safeNutrition.fiber > 0 && (
                <div className="text-center">
                  <div className="font-medium">{Math.round(safeNutrition.fiber)}g</div>
                  <div className="text-muted-foreground">Fiber</div>
                </div>
              )}
              {safeNutrition.sugar > 0 && (
                <div className="text-center">
                  <div className="font-medium">{Math.round(safeNutrition.sugar)}g</div>
                  <div className="text-muted-foreground">Sugar</div>
                </div>
              )}
              {safeNutrition.sodium > 0 && (
                <div className="text-center">
                  <div className="font-medium">{Math.round(safeNutrition.sodium)}mg</div>
                  <div className="text-muted-foreground">Sodium</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {safeNutrition.calories === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Add ingredients to see nutrition information</p>
          </div>
        )}
      </div>
    </Card>
  );
}
