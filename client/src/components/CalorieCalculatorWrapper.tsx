/**
 * Calorie Calculator Wrapper with Hero Section
 * 
 * Wraps the existing CalorieCalculator with hero section and navigation support
 * Maintains existing functionality while adding proper mobile layout
 */

import CalorieCalculator from './CalorieCalculator';
import { HeroSection } from './HeroSection';
import { Calculator, Target, Zap } from 'lucide-react';
import { useCalorieTracking } from '@/hooks/useCalorieTracking';

interface CalorieCalculatorWrapperProps {
  onNavigate?: (page: string) => void;
}

export default function CalorieCalculatorWrapper({ onNavigate }: CalorieCalculatorWrapperProps) {
  const { getDailyStats, addCalculatedCalories } = useCalorieTracking();
  const dailyStats = getDailyStats();

  const heroStats = [
    {
      label: 'Today Calculated',
      value: dailyStats.calories.toLocaleString(),
      icon: Calculator,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Items Tracked',
      value: dailyStats.count.toString(),
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Protein (g)',
      value: Math.round(dailyStats.protein).toString(),
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#a8dadc]/10 to-[#fef7cd]/10">
      {/* Hero Section */}
      <HeroSection
        title="Calorie Calculator"
        subtitle="Calculate nutrition using USDA database"
        component="calculator"
        stats={heroStats}
        showProgress={false}
        className="pb-6"
      />

      {/* Calculator Content */}
      <div className="max-w-md mx-auto w-full px-3">
        <CalorieCalculator 
          onNavigate={onNavigate} 
          onCaloriesCalculated={addCalculatedCalories}
          onLogToWeekly={(logData) => {
            // Add calculated calories to daily tracking and communicate with weekly logger
            addCalculatedCalories({
              name: logData.name,
              calories: logData.calories,
              protein: logData.protein,
              carbs: logData.carbs,
              fat: logData.fat,
              fiber: 0,
              sugar: 0,
              sodium: 0,
              ingredients: [logData.name]
            });
            
            // Trigger event for weekly logger communication with proper category
            const logEvent = new CustomEvent('calories-logged', {
              detail: { 
                ...logData,
                timestamp: new Date().toISOString(),
                source: 'calculator',
                mealType: logData.category // Use the category from the calculator
              }
            });
            window.dispatchEvent(logEvent);
            
            // Show success feedback with category
            console.log(`Successfully logged to weekly ${logData.category}:`, logData);
            
            // Show toast notification
            const toastEvent = new CustomEvent('show-toast', {
              detail: { 
                message: `Logged ${logData.name} to ${logData.category}!`,
                type: 'success'
              }
            });
            window.dispatchEvent(toastEvent);
          }}
        />
      </div>
    </div>
  );
}