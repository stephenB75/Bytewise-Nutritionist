// Clear date override utility
console.log('🔧 Clearing date override...');
localStorage.removeItem('user-date-override');
console.log('✅ Date override cleared');

// Test current date calculation
const getLocalDateKey = (date = new Date()) => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit'
  });
  return formatter.format(date);
};

const today = new Date();
console.log('📅 Current date test:', {
  systemDate: today.toDateString(),
  localDateKey: getLocalDateKey(today),
  expected: '2025-08-18'
});

// Trigger app refresh
window.location.reload();