// COMPLETE MEAL SYNC FIX - Clears both localStorage and database
console.log('=== COMPLETE MEAL SYNC FIX ===');

async function clearAllMealData() {
  // 1. Clear localStorage first
  console.log('1. Clearing localStorage...');
  const mealKeys = [
    'weeklyMeals',
    'calculatedCalories', 
    'dailyStats',
    'mealCache',
    'foodCache',
    'dailyMealCache',
    'todaysMeals',
    'dailyTotal',
    'weeklyTotal',
    'monthlyTotal'
  ];

  let clearedKeys = 0;
  mealKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      clearedKeys++;
      console.log(`✅ Cleared localStorage: ${key}`);
    }
  });

  // Clear date-specific keys
  const allKeys = Object.keys(localStorage);
  const dateKeys = allKeys.filter(key => 
    key.includes('2025-08') || 
    key.includes('dailyStats_') ||
    key.includes('meal_') ||
    key.includes('calorie_')
  );

  dateKeys.forEach(key => {
    localStorage.removeItem(key);
    clearedKeys++;
    console.log(`✅ Cleared date key: ${key}`);
  });

  localStorage.removeItem('lastDataBackup');
  localStorage.removeItem('itemsBackedUp');

  console.log(`📱 LocalStorage cleared: ${clearedKeys} keys`);

  // 2. Clear database meals
  console.log('2. Clearing database...');
  try {
    const response = await fetch('/api/meals/logged', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`🗄️ Database cleared: ${result.deletedCount} meals`);
    } else {
      console.warn('⚠️ Database clear failed, but localStorage is clean');
    }
  } catch (error) {
    console.warn('⚠️ Could not connect to database, but localStorage is clean');
  }

  console.log('=== SYNC FIX COMPLETE ===');
  console.log('Refreshing to verify clean state...');
  window.location.reload();
}

// Execute the fix
clearAllMealData();
