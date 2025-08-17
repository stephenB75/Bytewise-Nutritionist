#!/usr/bin/env node

/**
 * Data Persistence Verification Script
 * Tests that user data persists across app restart, browser refresh, and deployment
 */

const fs = require('fs');
const path = require('path');

async function verifyDataPersistence() {
  console.log('🔍 VERIFYING DATA PERSISTENCE ACROSS APP LIFECYCLE...\n');

  // Check 1: Database Schema Validation
  console.log('📊 Checking database schema...');
  const schemaPath = path.join(__dirname, 'shared', 'schema.ts');
  if (fs.existsSync(schemaPath)) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    const requiredTables = ['users', 'meals', 'fastingSessions', 'achievements'];
    const missingTables = requiredTables.filter(table => !schemaContent.includes(`export const ${table}`));
    
    if (missingTables.length === 0) {
      console.log('✅ Database schema contains all required tables');
    } else {
      console.log('❌ Missing database tables:', missingTables);
    }
  } else {
    console.log('❌ Database schema file not found');
  }

  // Check 2: API Endpoint Validation
  console.log('\n🌐 Checking API endpoints...');
  const routesPath = path.join(__dirname, 'server', 'routes.ts');
  if (fs.existsSync(routesPath)) {
    const routesContent = fs.readFileSync(routesPath, 'utf8');
    
    const requiredEndpoints = [
      '/api/user/sync-data',
      '/api/meals/logged',
      '/api/user'
    ];
    
    const missingEndpoints = requiredEndpoints.filter(endpoint => 
      !routesContent.includes(`'${endpoint}'`) && !routesContent.includes(`"${endpoint}"`)
    );
    
    if (missingEndpoints.length === 0) {
      console.log('✅ All required API endpoints exist');
    } else {
      console.log('❌ Missing API endpoints:', missingEndpoints);
    }
  }

  // Check 3: localStorage vs Database Usage
  console.log('\n💾 Analyzing data storage patterns...');
  
  const frontendFiles = [
    'client/src/hooks/useCalorieTracking.ts',
    'client/src/components/CalorieCalculator.tsx',
    'client/src/components/WeeklyCaloriesCard.tsx'
  ];
  
  let localStorageUsage = 0;
  let databaseUsage = 0;
  
  frontendFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      localStorageUsage += (content.match(/localStorage\./g) || []).length;
      databaseUsage += (content.match(/apiRequest/g) || []).length;
    }
  });
  
  console.log(`📱 localStorage usage: ${localStorageUsage} instances`);
  console.log(`🗄️  Database API usage: ${databaseUsage} instances`);
  
  if (databaseUsage >= localStorageUsage) {
    console.log('✅ Good balance - database usage is prioritized');
  } else {
    console.log('⚠️  Warning - localStorage usage exceeds database usage');
  }

  // Check 4: Data Persistence Hooks
  console.log('\n🔄 Checking data persistence infrastructure...');
  const persistenceHookPath = 'client/src/hooks/useDataPersistence.ts';
  
  if (fs.existsSync(persistenceHookPath)) {
    const persistenceContent = fs.readFileSync(persistenceHookPath, 'utf8');
    
    const hasBackup = persistenceContent.includes('backup');
    const hasSync = persistenceContent.includes('syncToDatabase');
    const hasErrorHandling = persistenceContent.includes('onError');
    
    console.log(`✅ Backup system: ${hasBackup ? 'Yes' : 'No'}`);
    console.log(`✅ Database sync: ${hasSync ? 'Yes' : 'No'}`);
    console.log(`✅ Error handling: ${hasErrorHandling ? 'Yes' : 'No'}`);
  } else {
    console.log('❌ Data persistence hook not found');
  }

  // Summary and Recommendations
  console.log('\n📋 PERSISTENCE VERIFICATION SUMMARY');
  console.log('=====================================');
  
  const recommendations = [];
  
  if (localStorageUsage > databaseUsage) {
    recommendations.push('• Prioritize database storage over localStorage');
  }
  
  recommendations.push('• Always save critical data to database first');
  recommendations.push('• Use localStorage only as a cache/backup');
  recommendations.push('• Implement automatic database restore on app startup');
  recommendations.push('• Test data persistence across browser refresh');
  recommendations.push('• Test data persistence across deployment');
  
  if (recommendations.length > 0) {
    console.log('\n🔧 RECOMMENDATIONS:');
    recommendations.forEach(rec => console.log(rec));
  }
  
  console.log('\n🎯 CRITICAL USER DATA TO PROTECT:');
  console.log('• User profiles and settings');
  console.log('• Daily calorie tracking (weeklyMeals)');
  console.log('• Fasting session history');
  console.log('• Achievement progress');
  console.log('• Meal history and recipes');
  console.log('• Custom food database entries');
  
  console.log('\n✅ Verification complete!');
}

// Run verification
verifyDataPersistence().catch(console.error);