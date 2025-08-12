/**
 * Timezone Information Component
 * Displays user's current timezone and ensures all dates are shown in local time
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Globe, Calendar } from 'lucide-react';
import { getUserTimezone, formatLocalDateTime } from '@/utils/dateUtils';

export function TimezoneInfo() {
  const timezone = getUserTimezone();
  const currentTime = formatLocalDateTime(new Date());
  
  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Your Timezone</p>
            <p className="text-xs text-gray-600">{timezone}</p>
          </div>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="bg-white">
            <Clock className="w-3 h-3 mr-1" />
            {currentTime}
          </Badge>
        </div>
      </div>
      <div className="mt-3 p-2 bg-white/70 rounded text-xs text-gray-600">
        <Calendar className="w-3 h-3 inline mr-1" />
        All meal times and dates are displayed in your local timezone
      </div>
    </Card>
  );
}