/**
 * Date Utilities
 * Helper functions for date manipulation
 */

export function getWeekDates(date: Date = new Date()) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day;
  start.setDate(diff);
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  
  return dates;
}

export function getLocalDateKey(date: Date = new Date()) {
  return date.toISOString().split('T')[0];
}

export function getMealTypeByTime(date: Date = new Date()) {
  const hour = date.getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 19) return 'dinner';
  return 'snack';
}

export function formatLocalTime(date: Date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
