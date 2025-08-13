/**
 * Timezone debugging utility to help diagnose date issues
 * This should be removed after the date bug is fixed
 */

export function debugTimezoneInfo() {
  const now = new Date();
  
  console.log('=== TIMEZONE DEBUG INFO ===');
  console.log('Current UTC time:', now.toISOString());
  console.log('Browser timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
  console.log('Timezone offset (minutes):', now.getTimezoneOffset());
  
  // Test common US timezones
  const testTimezones = [
    'America/New_York',    // Eastern (UTC-5/-4)
    'America/Chicago',     // Central (UTC-6/-5) 
    'America/Denver',      // Mountain (UTC-7/-6)
    'America/Los_Angeles', // Pacific (UTC-8/-7)
    'UTC'                  // Server timezone
  ];
  
  console.log('\n--- Date in different timezones ---');
  testTimezones.forEach(tz => {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', { 
        timeZone: tz,
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit'
      });
      console.log(`${tz}: ${formatter.format(now)}`);
    } catch (error) {
      console.log(`${tz}: Error - ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  
  // Test what user expects
  console.log('\n--- Expected vs Actual ---');
  console.log('User expects: 2025-08-12 (Wednesday)');
  console.log('Server shows: 2025-08-13 (Thursday)');
  console.log('Difference suggests user is in UTC-5 or UTC-6 timezone');
  
  console.log('========================');
}

export function debugMealDates() {
  try {
    const storedMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
    console.log('=== MEAL DATES DEBUG ===');
    console.log(`Total meals stored: ${storedMeals.length}`);
    
    if (storedMeals.length > 0) {
      console.log('\n--- Recent meal dates ---');
      storedMeals.slice(-5).forEach((meal: any, index: number) => {
        console.log(`${index + 1}. ${meal.name}`);
        console.log(`   Stored date: ${meal.date}`);
        console.log(`   Timestamp: ${meal.timestamp}`);
        console.log(`   Time: ${meal.time || 'unknown'}`);
        
        if (meal.timestamp) {
          const mealTime = new Date(meal.timestamp);
          const correctedDate = new Intl.DateTimeFormat('en-CA', { 
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit'
          }).format(mealTime);
          console.log(`   Corrected date: ${correctedDate}`);
        }
        console.log('');
      });
    }
    console.log('========================');
  } catch (error) {
    console.log('Error reading meal data:', error instanceof Error ? error.message : String(error));
  }
}