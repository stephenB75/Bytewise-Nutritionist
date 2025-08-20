/**
 * Date utilities for timezone-aware calendar day handling
 * Ensures all dates are handled in user's local timezone
 */

/**
 * Get the start of day in user's local timezone
 * Fixed to properly handle timezone conversion
 */
export function getLocalStartOfDay(date: Date = new Date()): Date {
  // Create a new date from the local date string to ensure proper timezone handling
  const localDateKey = getLocalDateKey(date);
  const [year, month, day] = localDateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Get the end of day in user's local timezone
 */
export function getLocalEndOfDay(date: Date = new Date()): Date {
  const localDate = new Date(date);
  localDate.setHours(23, 59, 59, 999);
  return localDate;
}

/**
 * Format date as YYYY-MM-DD in local timezone
 * This is used as the key for storing daily data
 * Enhanced with user preference override for timezone alignment
 */
export function getLocalDateKey(date: Date = new Date()): string {
  try {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formatter = new Intl.DateTimeFormat('en-CA', { 
      timeZone: userTimezone,
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit'
    });
    
    const calculatedDate = formatter.format(date); // Returns YYYY-MM-DD format
    
    // Removed date override logic to fix date display issues
    // The system now uses actual calendar dates without any offset
    
    return calculatedDate;
  } catch (error) {
    // Fallback to offset-based calculation if Intl API fails
    const offsetMinutes = date.getTimezoneOffset();
    const localTime = new Date(date.getTime() - (offsetMinutes * 60 * 1000));
    
    const year = localTime.getUTCFullYear();
    const month = String(localTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(localTime.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}

/**
 * Parse a date key (YYYY-MM-DD) to a Date object at start of day in local timezone
 */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
  return date;
}

/**
 * Check if two dates are the same calendar day in local timezone
 */
export function isSameLocalDay(date1: Date, date2: Date): boolean {
  return getLocalDateKey(date1) === getLocalDateKey(date2);
}

/**
 * Get user's timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Format time in user's local timezone
 */
export function formatLocalTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: getUserTimezone()
  });
}

/**
 * Format date and time in user's local timezone
 */
export function formatLocalDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: getUserTimezone()
  });
}

/**
 * Get meal type based on local time
 */
export function getMealTypeByTime(date: Date = new Date()): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 21) return 'dinner';
  return 'snack';
}

/**
 * Get the week start date (Sunday) for a given date
 * Fixed to use proper local date calculation without timezone shifts
 */
export function getWeekStart(date: Date = new Date()): Date {
  // Get local date components properly using timezone-aware method
  const localDateKey = getLocalDateKey(date);
  const [year, month, day] = localDateKey.split('-').map(Number);
  
  // Create date object in local timezone
  const localDate = new Date(year, month - 1, day, 12, 0, 0, 0); // Use noon to avoid timezone edge cases
  
  const dayOfWeek = localDate.getDay();
  const diff = -dayOfWeek; // Calculate days to subtract to get to Sunday
  
  // Create a new date for the week start to avoid mutations
  const weekStart = new Date(year, month - 1, day + diff, 12, 0, 0, 0);
  return weekStart;
}

/**
 * Get the week end date (Saturday) for a given date
 * Fixed to use proper local date calculation
 */
export function getWeekEnd(date: Date = new Date()): Date {
  // Get local date components properly
  const localDateKey = getLocalDateKey(date);
  const [year, month, day] = localDateKey.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  
  const dayOfWeek = localDate.getDay();
  const diff = localDate.getDate() - dayOfWeek + 6;
  return new Date(localDate.setDate(diff));
}

/**
 * Get an array of dates for the current week
 * Fixed to ensure proper timezone handling for all week days
 */
export function getWeekDates(date: Date = new Date()): Date[] {
  // Get the week start date in user's timezone
  const weekStart = getWeekStart(date);
  const dates: Date[] = [];
  
  // Get base date components from week start
  const startYear = weekStart.getFullYear();
  const startMonth = weekStart.getMonth();
  const startDay = weekStart.getDate();
  
  // Generate each day of the week without timezone drift
  for (let i = 0; i < 7; i++) {
    const weekDay = new Date(startYear, startMonth, startDay + i, 12, 0, 0, 0);
    dates.push(weekDay);
  }
  
  return dates;
}

/**
 * Convert UTC date string to local date
 */
export function utcToLocal(utcDateString: string): Date {
  return new Date(utcDateString);
}

/**
 * Get calendar month dates (including padding days from prev/next month)
 */
export function getCalendarMonthDates(date: Date = new Date()): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  // Start from the Sunday of the week containing the first day
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  // End on the Saturday of the week containing the last day
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  
  const dates: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Check if date is today in local timezone
 * Fixed to properly handle timezone conversion
 */
export function isToday(date: Date): boolean {
  const todayKey = getLocalDateKey(new Date());
  const dateKey = getLocalDateKey(date);
  return todayKey === dateKey;
}

/**
 * Get a display label for a date
 */
export function getDateLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameLocalDay(date, yesterday)) return 'Yesterday';
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameLocalDay(date, tomorrow)) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}