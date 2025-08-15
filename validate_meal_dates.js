/**
 * Meal Date Validation Script
 * Tests that meal entries are being recorded with correct dates and times
 */

const { getLocalDateKey, formatLocalDateTime, getMealTypeByTime } = require('./client/src/utils/dateUtils.ts');

console.log('=== MEAL DATE VALIDATION ===\n');

// Test 1: Current date handling
console.log('📅 Test 1: Current Date Handling');
const now = new Date();
const localDateKey = getLocalDateKey(now);
const formattedDateTime = formatLocalDateTime(now);
const detectedMealType = getMealTypeByTime(now);

console.log(`Current UTC time: ${now.toISOString()}`);
console.log(`Local date key: ${localDateKey}`);
console.log(`Formatted local time: ${formattedDateTime}`);
console.log(`Detected meal type: ${detectedMealType}`);
console.log(`Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}\n`);

// Test 2: Specific date scenarios
console.log('📅 Test 2: Specific Date Scenarios');

const testDates = [
  { name: 'Today at breakfast time', date: new Date('2025-08-15T08:30:00Z') },
  { name: 'Today at lunch time', date: new Date('2025-08-15T13:00:00Z') },
  { name: 'Today at dinner time', date: new Date('2025-08-15T19:30:00Z') },
  { name: 'Yesterday', date: new Date('2025-08-14T15:00:00Z') },
  { name: 'Tomorrow', date: new Date('2025-08-16T12:00:00Z') }
];

testDates.forEach(test => {
  const dateKey = getLocalDateKey(test.date);
  const mealType = getMealTypeByTime(test.date);
  const formatted = formatLocalDateTime(test.date);
  
  console.log(`${test.name}:`);
  console.log(`  Input: ${test.date.toISOString()}`);
  console.log(`  Date key: ${dateKey}`);
  console.log(`  Meal type: ${mealType}`);
  console.log(`  Formatted: ${formatted}`);
  console.log('');
});

// Test 3: Date consistency validation
console.log('📅 Test 3: Date Consistency Validation');

function validateMealDateEntry(inputDate, expectedDateKey, expectedMealType) {
  const actualDateKey = getLocalDateKey(inputDate);
  const actualMealType = getMealTypeByTime(inputDate);
  
  const dateKeyMatch = actualDateKey === expectedDateKey;
  const mealTypeMatch = actualMealType === expectedMealType;
  
  console.log(`Input date: ${inputDate.toISOString()}`);
  console.log(`Expected date key: ${expectedDateKey}, Actual: ${actualDateKey} ${dateKeyMatch ? '✅' : '❌'}`);
  console.log(`Expected meal type: ${expectedMealType}, Actual: ${actualMealType} ${mealTypeMatch ? '✅' : '❌'}`);
  console.log('');
  
  return dateKeyMatch && mealTypeMatch;
}

// Validation tests
const validationTests = [
  {
    input: new Date('2025-08-15T10:30:00.000Z'),
    expectedDateKey: '2025-08-15',
    expectedMealType: 'breakfast'
  },
  {
    input: new Date('2025-08-15T14:45:00.000Z'),
    expectedDateKey: '2025-08-15',
    expectedMealType: 'lunch'
  },
  {
    input: new Date('2025-08-15T20:15:00.000Z'),
    expectedDateKey: '2025-08-15',
    expectedMealType: 'dinner'
  }
];

let allTestsPassed = true;
validationTests.forEach((test, index) => {
  console.log(`Validation Test ${index + 1}:`);
  const passed = validateMealDateEntry(test.input, test.expectedDateKey, test.expectedMealType);
  if (!passed) allTestsPassed = false;
});

// Test 4: Edge cases
console.log('📅 Test 4: Edge Cases');

const edgeCases = [
  { name: 'Midnight (start of day)', date: new Date('2025-08-15T00:00:00Z') },
  { name: 'End of day', date: new Date('2025-08-15T23:59:59Z') },
  { name: 'Leap year day', date: new Date('2024-02-29T12:00:00Z') },
  { name: 'New Year\'s Day', date: new Date('2025-01-01T12:00:00Z') }
];

edgeCases.forEach(edgeCase => {
  console.log(`${edgeCase.name}:`);
  console.log(`  Date key: ${getLocalDateKey(edgeCase.date)}`);
  console.log(`  Meal type: ${getMealTypeByTime(edgeCase.date)}`);
  console.log('');
});

// Summary
console.log('=== VALIDATION SUMMARY ===');
console.log(`All validation tests passed: ${allTestsPassed ? '✅ YES' : '❌ NO'}`);
console.log(`Current system time: ${new Date().toISOString()}`);
console.log(`Local timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

if (allTestsPassed) {
  console.log('\n🎉 MEAL DATE VALIDATION SUCCESSFUL!');
  console.log('✅ Date keys are being generated correctly');
  console.log('✅ Meal types are being detected properly');
  console.log('✅ Timezone handling is working as expected');
} else {
  console.log('\n⚠️  MEAL DATE VALIDATION FAILED!');
  console.log('❌ Some date handling issues were detected');
  console.log('🔧 Please review the date utility functions');
}