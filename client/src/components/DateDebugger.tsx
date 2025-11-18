import React from 'react';
import { Card } from '@/components/ui/card';
import { getWeekDates, getLocalDateKey } from '@/utils/dateUtils';

export function DateDebugger() {
  const now = new Date();
  const weekDates = getWeekDates(now);
  
  return (
    <Card className="p-4 bg-yellow-100 dark:bg-yellow-900 border-yellow-500 mb-4">
      <h3 className="font-bold text-lg mb-2">Date Debug Info</h3>
      <div className="space-y-1 text-sm">
        <p>Browser Date: {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>Browser Time: {now.toLocaleTimeString()}</p>
        <p>Date Key (YYYY-MM-DD): {getLocalDateKey(now)}</p>
        <p>Day of Week: {now.getDay()} ({['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][now.getDay()]})</p>
        <p className="mt-2 font-semibold">Current Week:</p>
        <p>Start: {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({getLocalDateKey(weekDates[0])})</p>
        <p>End: {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({getLocalDateKey(weekDates[6])})</p>
      </div>
    </Card>
  );
}