// Check if there are any logged foods in localStorage
const fs = require('fs');

console.log("Checking for logged foods data...\n");

// Simulate what the component would see
const mockLocalStorage = {
  calorieEntries: {
    "2025-01-11": {
      meals: {
        breakfast: [
          { id: "1", name: "Oatmeal", calories: 150, protein: 5, carbs: 27, fat: 3, time: "08:00" },
          { id: "2", name: "Banana", calories: 105, protein: 1, carbs: 27, fat: 0, time: "08:30" }
        ],
        lunch: [
          { id: "3", name: "Chicken Salad", calories: 350, protein: 30, carbs: 15, fat: 20, time: "12:30" }
        ]
      }
    },
    "2025-01-10": {
      meals: {
        dinner: [
          { id: "4", name: "Salmon", calories: 280, protein: 35, carbs: 0, fat: 15, time: "19:00" }
        ]
      }
    }
  }
};

// Check what the component would process
const entries = mockLocalStorage.calorieEntries;
const allMeals = [];

Object.entries(entries).forEach(([date, dayData]) => {
  if (dayData?.meals) {
    Object.entries(dayData.meals).forEach(([mealType, foods]) => {
      if (Array.isArray(foods)) {
        foods.forEach(food => {
          allMeals.push({
            ...food,
            date,
            mealType,
            timestamp: new Date(date).toISOString()
          });
        });
      }
    });
  }
});

console.log(`Found ${allMeals.length} total meals in history`);
console.log("\nSample meals:", allMeals.slice(0, 3));

// Check frequency calculation
const frequency = new Map();
allMeals.forEach(meal => {
  const key = meal.name.toLowerCase().trim();
  if (frequency.has(key)) {
    frequency.get(key).count++;
  } else {
    frequency.set(key, { food: meal, count: 1 });
  }
});

console.log("\nFrequency analysis:");
Array.from(frequency.entries()).forEach(([name, data]) => {
  console.log(`  ${name}: ${data.count} times`);
});

