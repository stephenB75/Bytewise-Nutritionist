/**
 * Calorie Tracking Hook
 * Manages calorie tracking state and operations
 */

import { useState, useCallback } from 'react';

export function useCalorieTracking() {
  const [calories, setCalories] = useState(0);
  const [goal, setGoal] = useState(2000);

  const addCalories = useCallback((amount: number) => {
    setCalories(prev => prev + amount);
  }, []);

  const removeCalories = useCallback((amount: number) => {
    setCalories(prev => Math.max(0, prev - amount));
  }, []);

  const resetCalories = useCallback(() => {
    setCalories(0);
  }, []);

  const setCalorieGoal = useCallback((newGoal: number) => {
    setGoal(newGoal);
  }, []);

  return {
    calories,
    goal,
    addCalories,
    removeCalories,
    resetCalories,
    setCalorieGoal,
    remaining: goal - calories,
    percentage: goal > 0 ? (calories / goal) * 100 : 0,
  };
}
