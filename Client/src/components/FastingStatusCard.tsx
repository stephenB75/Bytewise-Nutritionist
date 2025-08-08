import { Clock, Target, Coffee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FastingStatusProps {
  fastingStatus?: {
    isActive: boolean;
    timeRemaining?: number;
    planName?: string;
  };
}

export function FastingStatusCard({ fastingStatus }: FastingStatusProps) {
  if (!fastingStatus || !fastingStatus.isActive) {
    return (
      <Card className="border-dashed" data-testid="fasting-status-inactive">
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Coffee className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            No active fasting session
          </p>
          <p className="text-xs text-muted-foreground">
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
    // Assuming a typical 16-hour fast for progress calculation
    const assumedTotalDuration = 16 * 60 * 60 * 1000; // 16 hours in milliseconds
    const elapsed = assumedTotalDuration - fastingStatus.timeRemaining;
    return Math.max(0, (elapsed / assumedTotalDuration) * 100);
  };

  return (
    <Card data-testid="fasting-status-active">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          Active Fast
          <Badge variant="secondary" className="ml-auto">
            {fastingStatus.planName || 'Custom'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-primary">
            {formatTime(fastingStatus.timeRemaining || 0)}
          </div>
          <p className="text-xs text-muted-foreground">remaining</p>
        </div>
        
        <Progress 
          value={getProgressPercentage()} 
          className="h-2"
          data-testid="fasting-progress-mini"
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
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