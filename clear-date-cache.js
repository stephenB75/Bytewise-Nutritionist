// Clear all date-related cache and overrides
console.log('🧹 Clearing all date cache and overrides...');

if (typeof window !== 'undefined' && window.localStorage) {
  // Remove all date-related localStorage items
  localStorage.removeItem('user-date-override');
  localStorage.removeItem('date-calculation-cache');
  localStorage.removeItem('timezone-correction');
  localStorage.removeItem('weekly-date-cache');
  
  console.log('✅ All date overrides cleared');
  
  // Force refresh of weekly data calculation
  window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
  console.log('✅ Weekly data refresh triggered');
  
  // Test date calculation
  const testDate = new Date();
  console.log('📅 Current date verification:', {
    system: testDate.toDateString(),
    expected: 'Mon Aug 18 2025',
    matches: testDate.toDateString() === 'Mon Aug 18 2025'
  });
  
} else {
  console.log('Running in Node.js environment');
}