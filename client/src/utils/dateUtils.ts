/**
 * Date utilities for timezone-aware calendar day handling
 * Ensures all dates are handled in user's local timezone
 */

/**
 * Get the start of day in user's local timezone
 */
export function getLocalStartOfDay(date: Date = new Date()): Date {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
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
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

/**
 * Get the week end date (Saturday) for a given date
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + 6;
  return new Date(d.setDate(diff));
}

/**
 * Get an array of dates for the current week
 */
export function getWeekDates(date: Date = new Date()): Date[] {
  const weekStart = getWeekStart(date);
  const dates: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    dates.push(d);
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
 */
export function isToday(date: Date): boolean {
  return isSameLocalDay(date, new Date());
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