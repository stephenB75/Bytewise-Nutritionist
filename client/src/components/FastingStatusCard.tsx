import { Clock, Target, Coffee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FastingStatusProps {
  fastingStatus?: {
    isActive: boolean;
    timeRemaining?: number;
    planName?: string;
    startTime?: string;
    targetDuration?: number;
  };
}

export function FastingStatusCard({ fastingStatus }: FastingStatusProps) {
  if (!fastingStatus || !fastingStatus.isActive) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-none shadow-none" data-testid="fasting-status-inactive">
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Coffee className="w-8 h-8 text-gray-700 mb-2" />
          <p className="text-sm text-gray-700 text-center">
            No active fasting session
          </p>
          <p className="text-xs text-gray-700">
            Start a fast to see progress here
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getProgressPercentage = () => {
    if (!fastingStatus.timeRemaining) return 0;
    
    // Use the actual target duration if available, otherwise fall back to plan-based estimation
    let totalDuration = fastingStatus.targetDuration;
    
    if (!totalDuration) {
      // Estimate based on plan name
      if (fastingStatus.planName?.includes('14:10')) {
        totalDuration = 14 * 60 * 60 * 1000;
      } else if (fastingStatus.planName?.includes('16:8')) {
        totalDuration = 16 * 60 * 60 * 1000;
      } else if (fastingStatus.planName?.includes('18:6')) {
        totalDuration = 18 * 60 * 60 * 1000;
      } else if (fastingStatus.planName?.includes('20:4')) {
        totalDuration = 20 * 60 * 60 * 1000;
      } else if (fastingStatus.planName?.includes('24')) {
        totalDuration = 24 * 60 * 60 * 1000;
      } else {
        // Default to 16 hours
        totalDuration = 16 * 60 * 60 * 1000;
      }
    }
    
    const elapsed = totalDuration - fastingStatus.timeRemaining;
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-none shadow-none" data-testid="fasting-status-active">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-gray-900">
          <Clock className="w-4 h-4 text-blue-500" />
          Active Fast
          <Badge variant="secondary" className="ml-auto bg-blue-600 text-white">
            {fastingStatus.planName || 'Custom'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <div className="text-2xl font-mono font-black text-gray-900">
            {formatTime(fastingStatus.timeRemaining || 0)}
          </div>
          <p className="text-xs text-gray-700">remaining</p>
        </div>
        
        <Progress 
          value={getProgressPercentage()} 
          className="h-2 bg-gray-300 [&>div]:bg-gradient-to-r [&>div]:from-blue-600 [&>div]:to-blue-700"
          data-testid="fasting-progress-mini"
        />
        
        <div className="flex items-center justify-between text-xs text-gray-700">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            In progress
          </span>
          <span>{Math.round(getProgressPercentage())}% complete</span>
        </div>
      </CardContent>
    </Card>
  );
}