import React from 'react';
import { Card } from '@/components/ui/card';
import { getWeekDates, getLocalDateKey } from '@/utils/dateUtils';
import { Calendar } from 'lucide-react';

export function DateVerification() {
  const now = new Date(); // Use actual current date
  const weekDates = getWeekDates(); // Use actual week dates
  
  // For Monday the 11th, the week should be:
  // If it's August 11, 2025 (Monday), week is: Aug 10-16 (Sun-Sat)
  // If it's January 11, 2025 (Saturday), week is: Jan 5-11 (Sun-Sat)
  
  const expectedWeekForMonday11th = {
    august: {
      start: 'August 10, 2025',
      end: 'August 16, 2025'
    },
    january: {
      start: 'January 5, 2025', 
      end: 'January 11, 2025'
    }
  };
  
  return (
    <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-300 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-lg">Date Verification</h3>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="p-2 bg-white dark:bg-gray-900 rounded">
          <p className="font-semibold text-blue-600">Current Date in Browser:</p>
          <p>{now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-gray-500">Date Key: {getLocalDateKey(now)}</p>
        </div>
        
        <div className="p-2 bg-white dark:bg-gray-900 rounded">
          <p className="font-semibold text-green-600">This Week (Sun-Sat):</p>
          <p>Start: {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p>End: {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        
        <div className="p-2 bg-yellow-50 dark:bg-yellow-900 rounded">
          <p className="font-semibold text-yellow-700">Week Days:</p>
          {weekDates.map((date, idx) => {
            const isToday = getLocalDateKey(date) === getLocalDateKey(now);
            const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][idx];
            return (
              <p key={idx} className={isToday ? 'font-bold text-orange-600' : ''}>
                {dayName}: {date.getMonth() + 1}/{date.getDate()} {isToday ? '← Today' : ''}
              </p>
            );
          })}
        </div>
      </div>
    </Card>
  );
}