/**
 * Timezone Correction Utilities
 * Provides user-controlled date alignment for timezone discrepancies
 */

export interface DateOverride {
  dayOffset: number; // Number of days to adjust (-1, 0, +1, etc.)
  description: string;
  appliedDate: string;
}

/**
 * Set a date override to correct timezone misalignment
 */
export function setDateOverride(dayOffset: number, description: string = 'User timezone correction') {
  const override: DateOverride = {
    dayOffset,
    description,
    appliedDate: new Date().toISOString()
  };
  
  localStorage.setItem('user-date-override', JSON.stringify(override));
  
  // Trigger app refresh to apply changes
  window.dispatchEvent(new CustomEvent('date-override-changed', { detail: override }));
  
  console.log(`📅 Date override applied: ${dayOffset > 0 ? '+' : ''}${dayOffset} days - ${description}`);
}

/**
 * Clear any existing date override
 */
export function clearDateOverride() {
  localStorage.removeItem('user-date-override');
  window.dispatchEvent(new CustomEvent('date-override-changed', { detail: null }));
  console.log('📅 Date override cleared - using system timezone');
}

/**
 * Get current date override setting
 */
export function getDateOverride(): DateOverride | null {
  const override = localStorage.getItem('user-date-override');
  return override ? JSON.parse(override) : null;
}

/**
 * Quick fix for 1-day back alignment (most common case)
 */
export function fixDateBackOneDay() {
  setDateOverride(-1, 'Corrected 1-day forward offset');
}

/**
 * Quick fix for 1-day forward alignment
 */
export function fixDateForwardOneDay() {
  setDateOverride(1, 'Corrected 1-day backward offset');
}

/**
 * Auto-detect and suggest date correction based on user expectation
 */
export function autoDetectDateMisalignment(userExpectedDate: string, systemDate: string): DateOverride | null {
  const expectedDate = new Date(userExpectedDate + 'T12:00:00');
  const systemDateObj = new Date(systemDate + 'T12:00:00');
  
  const diffTime = expectedDate.getTime() - systemDateObj.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays !== 0) {
    return {
      dayOffset: diffDays,
      description: `Auto-detected ${Math.abs(diffDays)}-day ${diffDays > 0 ? 'forward' : 'backward'} offset`,
      appliedDate: new Date().toISOString()
    };
  }
  
  return null;
}