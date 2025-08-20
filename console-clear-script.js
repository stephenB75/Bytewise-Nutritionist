// ByteWise Nutritionist - Quick LocalStorage Clear Script
// Copy and paste this into your browser console while on the ByteWise app

console.log('🧹 ByteWise LocalStorage Cleaner');
console.log('================================');

// All ByteWise related localStorage keys
const bytewiseKeys = [
    'weeklyMeals',
    'calculatedCalories', 
    'savedRecipes',
    'waterIntake',
    'userAchievements',
    'userProfile',
    'dailyCalorieGoal',
    'dailyProteinGoal', 
    'dailyCarbGoal',
    'dailyFatGoal',
    'dailyWaterGoal',
    'weeklyTrackerData',
    'bytewise-weekly-tracker',
    'mealHistory',
    'recipeData',
    'achievements',
    'fastingData',
    'weeklyProgress',
    'bytewise_data_backup',
    'bytewise_backup_timestamp',
    'lastDataBackup',
    'bytewise-last-refresh',
    'bytewise-session-start',
    'fresh-auth-session'
];

// Scan current localStorage
console.log('🔍 Scanning current localStorage...');
const allKeys = Object.keys(localStorage);
const bytewiseFound = allKeys.filter(key => 
    bytewiseKeys.includes(key) || 
    key.includes('bytewise') ||
    key.includes('_timestamp') ||
    key.includes('_backup') ||
    key.includes('_lastSync')
);

console.log(`📊 Found ${allKeys.length} total keys, ${bytewiseFound.length} ByteWise related`);

if (bytewiseFound.length > 0) {
    console.log('📝 ByteWise keys found:', bytewiseFound);
    
    // Clear ByteWise data
    console.log('🗑️ Clearing ByteWise localStorage...');
    let clearedCount = 0;
    
    bytewiseFound.forEach(key => {
        const size = localStorage.getItem(key)?.length || 0;
        localStorage.removeItem(key);
        console.log(`   ❌ Removed: ${key} (${size} chars)`);
        clearedCount++;
    });
    
    console.log(`✅ Successfully cleared ${clearedCount} ByteWise localStorage keys`);
} else {
    console.log('✅ No ByteWise data found in localStorage');
}

// Verify clean
console.log('🔍 Verifying clean state...');
const remainingBytewise = Object.keys(localStorage).filter(key => 
    bytewiseKeys.includes(key) || 
    key.includes('bytewise') ||
    key.includes('_timestamp') ||
    key.includes('_backup') ||
    key.includes('_lastSync')
);

if (remainingBytewise.length === 0) {
    console.log('🎉 SUCCESS: LocalStorage is clean of ByteWise data');
} else {
    console.log('⚠️ WARNING: Some ByteWise data may still remain:', remainingBytewise);
}

console.log('✨ LocalStorage clearing complete!');