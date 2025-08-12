// Quick date check for browser console
console.log('📅 Current Date Check:');
console.log('Browser Date:', new Date().toString());
console.log('Local Date:', new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
}));
console.log('ISO Date:', new Date().toISOString());
console.log('Day of month:', new Date().getDate());

// Week calculation
const now = new Date();
const day = now.getDay();
const diff = now.getDate() - day;
const weekStart = new Date(now);
weekStart.setDate(diff);
const weekEnd = new Date(weekStart);
weekEnd.setDate(weekStart.getDate() + 6);

console.log('Week Start (Sunday):', weekStart.toLocaleDateString());
console.log('Week End (Saturday):', weekEnd.toLocaleDateString());
