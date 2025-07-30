/**
 * Bytewise Today's Nutrients Module
 * 
 * Visual nutrition tracking component with comprehensive data visualization
 * Features:
 * - Animated vertical progress bars for key nutrients
 * - Interactive donut chart for macronutrient distribution
 * - Visual goal indicators with color-coded progress
 * - Real-time data from meal logging system
 * - Brand-consistent design following Bytewise guidelines
 * - Mobile-optimized responsive layouts
 * - Enhanced visual appeal with contextual background images
 * - FIXED: Key Nutrients Progress in proper 4-column layout
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { 
  Flame, 
  Zap, 
  Apple, 
  Wheat, 
  Droplets,
  Target,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface NutrientData {
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface MacroData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface TodaysNutrientsProps {
  // Real-time data from meal logging system
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
  // Optional custom targets
  calorieTarget?: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
}

// Bytewise brand colors for charts
const CHART_COLORS = {
  primary: '#a8dadc',     // Pastel Blue
  secondary: '#fef7cd',   // Pastel Yellow
  success: '#22c55e',     // Green for achieved goals
  warning: '#f59e0b',     // Amber for approaching goals
  danger: '#ef4444',      // Red for exceeded goals
  protein: '#8b5cf6',     // Purple for protein
  carbs: '#06b6d4',       // Cyan for carbs
  fat: '#f97316',         // Orange for fat
  fiber: '#84cc16',       // Lime for fiber
  sodium: '#6366f1',      // Indigo for sodium
  muted: '#94a3b8'        // Slate for background
};

export function TodaysNutrients({
  calories = 0,
  protein = 0,
  carbs = 0,
  fat = 0,
  fiber = 0,
  sodium = 0,
  sugar = 0,
  calorieTarget = 2200,
  proteinTarget = 150,
  carbsTarget = 275,
  fatTarget = 73
}: TodaysNutrientsProps) {
  const [animationProgress, setAnimationProgress] = useState(0);

  // Animate progress bars on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(100);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Calculate nutrient data with goals and progress
  const nutrientData: Record<string, NutrientData> = useMemo(() => ({
    calories: {
      current: calories,
      target: calorieTarget,
      unit: 'cal',
      color: CHART_COLORS.primary,
      icon: Flame
    },
    protein: {
      current: protein,
      target: proteinTarget,
      unit: 'g',
      color: CHART_COLORS.protein,
      icon: Zap
    },
    carbs: {
      current: carbs,
      target: carbsTarget,
      unit: 'g',
      color: CHART_COLORS.carbs,
      icon: Apple
    },
    fat: {
      current: fat,
      target: fatTarget,
      unit: 'g',
      color: CHART_COLORS.fat,
      icon: Droplets
    }
  }), [calories, protein, carbs, fat, calorieTarget, proteinTarget, carbsTarget, fatTarget]);

  // Prepare macronutrient data for pie chart
  const macroData: MacroData[] = useMemo(() => {
    const totalMacros = protein + carbs + fat;
    if (totalMacros === 0) {
      return [
        { name: 'No data', value: 100, color: CHART_COLORS.muted, percentage: 100 }
      ];
    }

    return [
      {
        name: 'Protein',
        value: protein,
        color: CHART_COLORS.protein,
        percentage: Math.round((protein / totalMacros) * 100)
      },
      {
        name: 'Carbs',
        value: carbs,
        color: CHART_COLORS.carbs,
        percentage: Math.round((carbs / totalMacros) * 100)
      },
      {
        name: 'Fat',
        value: fat,
        color: CHART_COLORS.fat,
        percentage: Math.round((fat / totalMacros) * 100)
      }
    ].filter(item => item.value > 0);
  }, [protein, carbs, fat]);

  // Prepare bar chart data for secondary nutrients
  const secondaryNutrients = useMemo(() => [
    {
      name: 'Fiber',
      current: fiber,
      target: 25,
      color: CHART_COLORS.fiber,
      icon: Wheat
    },
    {
      name: 'Sodium',
      current: sodium / 1000, // Convert mg to g for display
      target: 2.3,
      color: CHART_COLORS.sodium,
      icon: AlertCircle
    }
  ], [fiber, sodium]);

  // Calculate progress percentage
  const getProgressPercentage = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  // Get progress status color
  const getProgressColor = (current: number, target: number): string => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return CHART_COLORS.success;
    if (percentage >= 70) return CHART_COLORS.warning;
    return CHART_COLORS.primary;
  };

  // Get goal achievement status
  const getGoalStatus = (current: number, target: number): { icon: any; color: string; text: string } => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) {
      return { icon: CheckCircle, color: CHART_COLORS.success, text: 'Goal achieved!' };
    }
    if (percentage >= 90) {
      return { icon: Target, color: CHART_COLORS.warning, text: 'Almost there!' };
    }
    return { icon: TrendingUp, color: CHART_COLORS.primary, text: 'Keep going!' };
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-border">
          <p 
            className="font-medium text-foreground mb-1"
            style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
          >
            {payload[0].name}: {payload[0].value}g
          </p>
          <p 
            className="text-sm text-muted-foreground"
            style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
          >
            {payload[0].payload.percentage}% of total macros
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 
            className="text-foreground"
            style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.3 }}
          >
            Today's Nutrients
          </h2>
          <p 
            className="text-muted-foreground mt-1"
            style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5 }}
          >
            Visual breakdown of your daily intake
          </p>
        </div>
        <Badge 
          variant="outline" 
          className="bg-primary/10 text-primary border-primary/20"
          style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.75rem", fontWeight: 500 }}
        >
          Live Data
        </Badge>
      </div>

      {/* Key Nutrients Progress with Background Image - FIXED 4-Column Layout */}
      <Card className="relative p-6 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-8">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
            alt="Healthy nutritious foods with vitamins and minerals"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <h3 
            className="text-foreground mb-4"
            style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.4 }}
          >
            Key Nutrients Progress
          </h3>
          
          {/* FIXED: Proper 4-column layout with mobile-first responsive design */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {Object.entries(nutrientData).map(([key, data]) => {
              const IconComponent = data.icon;
              const progressPercentage = getProgressPercentage(data.current, data.target);
              const progressColor = getProgressColor(data.current, data.target);
              const goalStatus = getGoalStatus(data.current, data.target);
              const StatusIcon = goalStatus.icon;

              return (
                <div key={key} className="text-center">
                  {/* Icon and Label - Mobile optimized */}
                  <div className="flex flex-col items-center mb-2 sm:mb-3">
                    <div 
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2 transition-colors bg-white/90 backdrop-blur-sm"
                      style={{ backgroundColor: `${data.color}20` }}
                    >
                      <IconComponent 
                        size={16} 
                        className="sm:w-5 sm:h-5 md:w-6 md:h-6" 
                        style={{ color: data.color }} 
                      />
                    </div>
                    <p 
                      className="text-foreground capitalize truncate w-full text-center"
                      style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.625rem", fontWeight: 500 }}
                    >
                      {key}
                    </p>
                  </div>

                  {/* Vertical Progress Bar - Mobile responsive */}
                  <div className="relative mx-auto mb-2 sm:mb-3" style={{ width: '16px', height: '80px' }}>
                    {/* Background bar */}
                    <div 
                      className="absolute inset-0 rounded-full bg-white/60 backdrop-blur-sm"
                      style={{ width: '16px' }}
                    />
                    {/* Progress fill with animation */}
                    <div
                      className="absolute bottom-0 left-0 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: '16px',
                        height: `${(progressPercentage * animationProgress / 100)}%`,
                        backgroundColor: progressColor,
                        maxHeight: '80px'
                      }}
                    />
                    {/* Goal indicator line */}
                    <div
                      className="absolute left-0 w-5 h-0.5 bg-foreground/40"
                      style={{ 
                        bottom: '100%',
                        transform: 'translateX(-2px)'
                      }}
                    />
                  </div>

                  {/* Values - Mobile optimized */}
                  <div className="space-y-0.5 sm:space-y-1">
                    <p 
                      className="font-bold text-foreground"
                      style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "0.875rem", fontWeight: 700 }}
                    >
                      {Math.round(data.current)}
                      <span 
                        className="text-muted-foreground ml-0.5"
                        style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.625rem", fontWeight: 400 }}
                      >
                        {data.unit}
                      </span>
                    </p>
                    <p 
                      className="text-muted-foreground"
                      style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.625rem", fontWeight: 400 }}
                    >
                      of {data.target}{data.unit}
                    </p>
                    
                    {/* Goal status - Mobile compact */}
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <StatusIcon size={10} style={{ color: goalStatus.color }} />
                      <span 
                        className="text-xs"
                        style={{ 
                          fontFamily: "'Quicksand', sans-serif", 
                          fontSize: "0.5rem", 
                          fontWeight: 400,
                          color: goalStatus.color
                        }}
                      >
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Macronutrient Distribution and Additional Nutrients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Macro Distribution with Background Image */}
        <Card className="relative p-6 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-8">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
              alt="Balanced meal showing protein, carbs, and healthy fats"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <h3 
              className="text-foreground mb-4"
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.4 }}
            >
              Macro Distribution
            </h3>
            
            <div className="relative flex justify-center">
              {/* Fixed container for pie chart */}
              <div style={{ width: '180px', height: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Center text overlay - Optimized sizing for smaller chart */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-white/90 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center">
                  <div>
                    <p 
                      className="font-bold text-foreground"
                      style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.125rem", fontWeight: 700, lineHeight: 1.2 }}
                    >
                      {protein + carbs + fat}g
                    </p>
                    <p 
                      className="text-muted-foreground"
                      style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.625rem", fontWeight: 400, lineHeight: 1.3, marginTop: "0.125rem" }}
                    >
                      total macros
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend with improved text sizing */}
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-4">
              {macroData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span 
                    className="text-foreground whitespace-nowrap"
                    style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.8125rem", fontWeight: 400, lineHeight: 1.4 }}
                  >
                    {item.name} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Additional Nutrients with Background Image */}
        <Card className="relative p-6 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-8">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
              alt="Whole grains, fruits and vegetables rich in fiber and nutrients"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <h3 
              className="text-foreground mb-4"
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.4 }}
            >
              Additional Nutrients
            </h3>
            
            <div className="space-y-6">
              {secondaryNutrients.map((nutrient) => {
                const IconComponent = nutrient.icon;
                const progressPercentage = getProgressPercentage(nutrient.current, nutrient.target);
                const progressColor = getProgressColor(nutrient.current, nutrient.target);

                return (
                  <div key={nutrient.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent size={16} style={{ color: nutrient.color }} />
                        <span 
                          className="text-foreground"
                          style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
                        >
                          {nutrient.name}
                        </span>
                      </div>
                      <span 
                        className="text-sm text-muted-foreground"
                        style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
                      >
                        {nutrient.current.toFixed(1)} / {nutrient.target}g
                      </span>
                    </div>
                    
                    <div className="relative">
                      <Progress 
                        value={progressPercentage * animationProgress / 100} 
                        className="h-2"
                        style={{ backgroundColor: `${nutrient.color}20` }}
                      />
                      <div 
                        className="absolute inset-0 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${progressPercentage * animationProgress / 100}%`,
                          backgroundColor: progressColor
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span 
                        className="text-xs"
                        style={{ 
                          fontFamily: "'Quicksand', sans-serif", 
                          fontSize: "0.65rem", 
                          fontWeight: 400,
                          color: progressColor
                        }}
                      >
                        {Math.round(progressPercentage)}% of daily goal
                      </span>
                      {progressPercentage >= 100 && (
                        <Award size={12} style={{ color: CHART_COLORS.success }} />
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Sugar tracking (no goal, just display) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Apple size={16} style={{ color: CHART_COLORS.warning }} />
                    <span 
                      className="text-foreground"
                      style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
                    >
                      Sugar
                    </span>
                  </div>
                  <span 
                    className="text-sm text-muted-foreground"
                    style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
                  >
                    {Math.round(sugar)}g
                  </span>
                </div>
                <div className="h-2 bg-white/60 backdrop-blur-sm rounded-full">
                  <div 
                    className="h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min((sugar / 50) * 100, 100) * animationProgress / 100}%`,
                      backgroundColor: sugar > 50 ? CHART_COLORS.danger : CHART_COLORS.warning
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p 
              className="text-2xl font-bold text-primary"
              style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}
            >
              {Math.round((calories / calorieTarget) * 100)}%
            </p>
            <p 
              className="text-xs text-muted-foreground"
              style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
            >
              daily calories
            </p>
          </div>
          <div>
            <p 
              className="text-2xl font-bold text-primary"
              style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}
            >
              {Math.round((protein / proteinTarget) * 100)}%
            </p>
            <p 
              className="text-xs text-muted-foreground"
              style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
            >
              protein goal
            </p>
          </div>
          <div>
            <p 
              className="text-2xl font-bold text-primary"
              style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}
            >
              {protein + carbs + fat}g
            </p>
            <p 
              className="text-xs text-muted-foreground"
              style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
            >
              total macros
            </p>
          </div>
          <div>
            <p 
              className="text-2xl font-bold text-primary"
              style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}
            >
              {Math.round(fiber)}g
            </p>
            <p 
              className="text-xs text-muted-foreground"
              style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}
            >
              fiber intake
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}