/**
 * Sample Data Generator for Testing Extended Food Search
 * Creates realistic meal entries spanning past weeks for testing search functionality
 */

import { getLocalDateKey } from './dateUtils';

interface SampleMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  time: string;
  mealType: string;
  timestamp: string;
  iron?: number;
  calcium?: number;
  vitaminC?: number;
  zinc?: number;
  magnesium?: number;
  vitaminD?: number;
}

export const generateSampleMealData = (): SampleMeal[] => {
  const sampleMeals: SampleMeal[] = [];
  const today = new Date();
  
  // Generate meals for the past 3 weeks to test month-long search
  for (let daysBack = 0; daysBack < 21; daysBack++) {
    const mealDate = new Date(today);
    mealDate.setDate(today.getDate() - daysBack);
    const dateKey = getLocalDateKey(mealDate);
    
    // Add 2-4 meals per day with realistic variety
    const mealsPerDay = Math.floor(Math.random() * 3) + 2;
    
    const mealNames = [
      // Breakfast options
      'Greek yogurt with berries', 'Oatmeal with banana', 'Scrambled eggs with toast',
      'Avocado toast', 'Protein smoothie', 'Pancakes with syrup',
      
      // Lunch options  
      'Chicken caesar salad', 'Turkey sandwich', 'Quinoa bowl with vegetables',
      'Beef stir fry with rice', 'Salmon with sweet potato', 'Pasta with marinara',
      
      // Dinner options
      'Grilled chicken breast', 'Beef tacos with beans', 'Baked salmon with broccoli',
      'Spaghetti and meatballs', 'Chicken curry with rice', 'Pork chops with mashed potatoes',
      
      // Snacks
      'Apple with peanut butter', 'Trail mix', 'Protein bar', 'Greek yogurt',
      'Almonds', 'Banana with almond butter'
    ];
    
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    const times = ['7:30 AM', '12:15 PM', '6:45 PM', '3:20 PM'];
    
    for (let mealIndex = 0; mealIndex < mealsPerDay; mealIndex++) {
      const randomMeal = mealNames[Math.floor(Math.random() * mealNames.length)];
      const mealType = mealTypes[mealIndex % mealTypes.length];
      const time = times[mealIndex % times.length];
      
      // Generate realistic nutrition values based on meal type
      const baseCalories = mealType === 'Snack' ? 150 : mealType === 'Breakfast' ? 300 : 450;
      const calories = baseCalories + Math.floor(Math.random() * 200);
      
      const meal: SampleMeal = {
        id: `sample-${dateKey}-${mealIndex}`,
        name: randomMeal,
        calories,
        protein: Math.floor((calories * 0.2) / 4) + Math.floor(Math.random() * 15),
        carbs: Math.floor((calories * 0.5) / 4) + Math.floor(Math.random() * 20),
        fat: Math.floor((calories * 0.3) / 9) + Math.floor(Math.random() * 10),
        date: dateKey,
        time,
        mealType,
        timestamp: mealDate.toISOString(),
        iron: Math.random() * 5 + 1,
        calcium: Math.random() * 200 + 100,
        vitaminC: Math.random() * 30 + 10,
        zinc: Math.random() * 3 + 1,
        magnesium: Math.random() * 100 + 50,
        vitaminD: Math.random() * 5 + 1
      };
      
      sampleMeals.push(meal);
    }
  }
  
  return sampleMeals;
};

export const addSampleDataToStorage = () => {
  const existingMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
  const sampleMeals = generateSampleMealData();
  
  // Merge with existing data (avoid duplicates by ID)
  const existingIds = new Set(existingMeals.map((meal: any) => meal.id));
  const newMeals = sampleMeals.filter(meal => !existingIds.has(meal.id));
  
  const combinedMeals = [...existingMeals, ...newMeals];
  localStorage.setItem('weeklyMeals', JSON.stringify(combinedMeals));
  
  console.log(`Added ${newMeals.length} sample meals for testing search functionality`);
  
  // Trigger refresh of the meal data
  window.dispatchEvent(new CustomEvent('calories-logged'));
  
  return newMeals.length;
};

export const removeSampleData = () => {
  const existingMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
  const filteredMeals = existingMeals.filter((meal: any) => !meal.id.startsWith('sample-'));
  
  localStorage.setItem('weeklyMeals', JSON.stringify(filteredMeals));
  
  // Trigger refresh of the meal data
  window.dispatchEvent(new CustomEvent('calories-logged'));
  
  return existingMeals.length - filteredMeals.length;
};