/**
 * Minimalist Meal Card with Visual Food Elements
 * Clean, ADHD-friendly meal display with food imagery
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FoodImageClipping } from './FoodImageClipping';
import { InteractiveProgressRing } from './InteractiveProgressRing';
import { Clock, Flame, Beef, Wheat, Droplets } from 'lucide-react';

interface MealCardProps {
  name: string;
  time: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  foodImage?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

const mealTypeColors = {
  breakfast: 'from-yellow-100 to-orange-100',
  lunch: 'from-green-100 to-emerald-100',
  dinner: 'from-blue-100 to-indigo-100',
  snack: 'from-purple-100 to-pink-100'
};

const mealTypeIcons = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎'
};

export function MinimalistMealCard({
  name,
  time,
  calories,
  protein,
  carbs,
  fat,
  foodImage,
  mealType = 'snack',
  onClick,
  onEdit,
  onDelete,
  className = ''
}: MealCardProps) {
  
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Card 
        className={`p-4 bg-gradient-to-r ${mealTypeColors[mealType]} border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer`}
        onClick={onClick}
      >
        <div className="flex items-center space-x-4">
          {/* Food Image */}
          <div className="flex-shrink-0">
            {foodImage ? (
              <FoodImageClipping
                src={foodImage}
                alt={name}
                size="md"
                clipPath="organic"
              />
            ) : (
              <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center text-2xl">
                {mealTypeIcons[mealType]}
              </div>
            )}
          </div>
          
          {/* Meal Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {name}
              </h3>
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {time}
              </Badge>
            </div>
            
            {/* Nutrition Summary */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-gray-700">
                <Flame className="w-4 h-4 mr-1 text-orange-500" />
                <span className="font-medium">{calories}</span>
                <span className="text-gray-500 ml-1">cal</span>
              </div>
              
              {protein !== undefined && (
                <div className="flex items-center text-sm text-gray-700">
                  <Beef className="w-4 h-4 mr-1 text-red-500" />
                  <span>{Math.round(protein)}g</span>
                </div>
              )}
              
              {carbs !== undefined && (
                <div className="flex items-center text-sm text-gray-700">
                  <Wheat className="w-4 h-4 mr-1 text-yellow-500" />
                  <span>{Math.round(carbs)}g</span>
                </div>
              )}
              
              {fat !== undefined && (
                <div className="flex items-center text-sm text-gray-700">
                  <Droplets className="w-4 h-4 mr-1 text-blue-500" />
                  <span>{Math.round(fat)}g</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Calorie Progress Ring */}
          <div className="flex-shrink-0">
            <InteractiveProgressRing
              value={calories}
              max={600} // Typical meal calories
              size={60}
              strokeWidth={4}
              showValue={false}
              showPercentage={true}
              color="#10b981"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}