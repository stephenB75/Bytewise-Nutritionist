/**
 * Test utility to validate calorie calculator integration with redesigned logger
 * Simulates the data flow between components
 */

export interface TestMealEntry {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  time: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export function testCalorieCalculatorIntegration() {
  console.log('🧪 Testing Calorie Calculator Integration with Redesigned Logger');
  
  // Test data similar to what calculator would generate
  const testMeals: TestMealEntry[] = [
    {
      name: 'Grilled Chicken Breast with Rice',
      calories: 450,
      protein: 35,
      carbs: 40,
      fat: 8,
      fiber: 2,
      sugar: 1,
      sodium: 320,
      time: '08:30',
      mealType: 'breakfast'
    },
    {
      name: 'Caesar Salad with Croutons',
      calories: 320,
      protein: 12,
      carbs: 25,
      fat: 22,
      fiber: 4,
      sugar: 6,
      sodium: 580,
      time: '12:45',
      mealType: 'lunch'
    },
    {
      name: 'Salmon with Vegetables',
      calories: 520,
      protein: 42,
      carbs: 18,
      fat: 28,
      fiber: 6,
      sugar: 10,
      sodium: 420,
      time: '19:15',
      mealType: 'dinner'
    },
    {
      name: 'Greek Yogurt with Berries',
      calories: 180,
      protein: 15,
      carbs: 20,
      fat: 5,
      fiber: 3,
      sugar: 18,
      sodium: 85,
      time: '15:30',
      mealType: 'snack'
    }
  ];

  // Simulate calculator logging to localStorage (what useCalorieTracking does)
  const simulateCalculatorLog = (meal: TestMealEntry) => {
    const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
    const mealEntry = {
      id: `test-${Date.now()}-${Math.random()}`,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      fiber: meal.fiber,
      sugar: meal.sugar,
      sodium: meal.sodium,
      date: new Date().toISOString().split('T')[0],
      time: meal.time,
      category: meal.mealType,
      timestamp: new Date().toISOString(),
      source: 'calculator',
      mealType: meal.mealType
    };
    
    weeklyMeals.push(mealEntry);
    localStorage.setItem('weeklyMeals', JSON.stringify(weeklyMeals));
    
    console.log(`✅ Logged ${meal.mealType}:`, {
      name: meal.name,
      calories: meal.calories,
      time: meal.time
    });
    
    // Trigger event that logger listens for
    window.dispatchEvent(new CustomEvent('calories-logged', {
      detail: mealEntry
    }));
    
    return mealEntry;
  };

  // Test the integration
  console.log('📊 Adding test meals to validate logger integration...');
  
  testMeals.forEach((meal, index) => {
    setTimeout(() => {
      simulateCalculatorLog(meal);
      
      if (index === testMeals.length - 1) {
        // All meals added, trigger final refresh
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
          console.log('🎉 Integration test complete! Check the logger components.');
          
          // Calculate totals for validation
          const totalCalories = testMeals.reduce((sum, m) => sum + m.calories, 0);
          const totalProtein = testMeals.reduce((sum, m) => sum + m.protein, 0);
          const totalMeals = testMeals.length;
          
          console.log('📈 Test Results:', {
            totalCalories,
            totalProtein: Math.round(totalProtein),
            totalMeals,
            mealTypes: {
              breakfast: testMeals.filter(m => m.mealType === 'breakfast').length,
              lunch: testMeals.filter(m => m.mealType === 'lunch').length,
              dinner: testMeals.filter(m => m.mealType === 'dinner').length,
              snack: testMeals.filter(m => m.mealType === 'snack').length,
            }
          });
        }, 500);
      }
    }, index * 200); // Stagger the additions
  });
  
  return {
    testMeals,
    expectedTotals: {
      calories: testMeals.reduce((sum, m) => sum + m.calories, 0),
      protein: testMeals.reduce((sum, m) => sum + m.protein, 0),
      carbs: testMeals.reduce((sum, m) => sum + m.carbs, 0),
      fat: testMeals.reduce((sum, m) => sum + m.fat, 0),
      meals: testMeals.length
    }
  };
}

// Clear test data
export function clearTestData() {
  localStorage.removeItem('weeklyMeals');
  localStorage.removeItem('calculatedCalories');
  window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
  console.log('🗑️ Test data cleared');
}

// Check current data
export function checkCurrentData() {
  const weeklyMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
  const calculatedCalories = JSON.parse(localStorage.getItem('calculatedCalories') || '[]');
  
  console.log('📊 Current Data:', {
    weeklyMeals: weeklyMeals.length,
    calculatedCalories: calculatedCalories.length,
    todaysMeals: weeklyMeals.filter((m: any) => 
      m.date === new Date().toISOString().split('T')[0]
    ).length
  });
  
  return { weeklyMeals, calculatedCalories };
}

// Add to window for easy testing
declare global {
  interface Window {
    testCalorieIntegration: typeof testCalorieCalculatorIntegration;
    clearTestData: typeof clearTestData;
    checkCurrentData: typeof checkCurrentData;
  }
}

if (typeof window !== 'undefined') {
  window.testCalorieIntegration = testCalorieCalculatorIntegration;
  window.clearTestData = clearTestData;
  window.checkCurrentData = checkCurrentData;
}