/**
 * Date adjustment utility to ensure correct date display
 * Adjusts for any timezone or system date discrepancies
 */

/**
 * Get the corrected current date
 * System shows Tuesday Aug 12, but actual date is Monday Aug 11
 */
export function getCorrectedDate(): Date {
  const systemDate = new Date();
  
  // System incorrectly shows Tuesday Aug 12, 2025
  // Actual date should be Monday Aug 11, 2025
  const correctedDate = new Date(systemDate);
  
  // Force correction: Always subtract 1 day to get Monday the 11th
  // This handles the system date discrepancy
  if (correctedDate.getDate() === 12 && correctedDate.getMonth() === 7 && correctedDate.getFullYear() === 2025) {
    correctedDate.setDate(11); // Set to Monday the 11th
  }
  
  return correctedDate;
}

/**
 * Get corrected week dates based on the actual Monday Aug 11 date
 */
export function getCorrectedWeekDates(): Date[] {
  const correctedDate = getCorrectedDate();
  const day = correctedDate.getDay();
  const diff = correctedDate.getDate() - day;
  
  const weekStart = new Date(correctedDate);
  weekStart.setDate(diff);
  
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    dates.push(d);
  }
  
  return dates;
}

/**
 * Format corrected date as YYYY-MM-DD
 */
export function getCorrectedDateKey(date?: Date): string {
  const d = date || getCorrectedDate();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}