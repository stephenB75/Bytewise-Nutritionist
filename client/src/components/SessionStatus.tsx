/**
 * Session Status Display Component
 * Shows current session information and time remaining
 */

import React, { useEffect, useState } from 'react';
import { Clock, Shield, RefreshCw } from 'lucide-react';
import { useSessionManager } from '@/hooks/useSessionManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function SessionStatus() {
  const { refreshSession, getSessionInfo } = useSessionManager();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Update session info every minute
    const updateInfo = () => {
      const info = getSessionInfo();
      setSessionInfo(info);
    };

    updateInfo();
    const interval = setInterval(updateInfo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []); // Remove getSessionInfo from dependencies to prevent infinite loop

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const success = await refreshSession();
    if (success) {
      const info = getSessionInfo();
      setSessionInfo(info);
    }
    setIsRefreshing(false);
  };

  const formatTimeRemaining = (milliseconds: number) => {
    if (milliseconds < 0) return 'Expired';
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  if (!sessionInfo) return null;

  const timeRemaining = sessionInfo.timeUntilExpiry;
  const isExpiringSoon = timeRemaining < 30 * 60 * 1000; // Less than 30 minutes

  return (
    <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm border-amber-200/40">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-medium">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-gray-900">Session Status</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="h-7 px-2"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="ml-1 text-sm">Refresh</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-gray-600">Session Started</p>
            <p className="font-medium text-gray-900">
              {formatDate(sessionInfo.sessionStart)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-gray-600">Last Refresh</p>
            <p className="font-medium text-gray-900">
              {formatDate(sessionInfo.lastRefresh)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-gray-600">Last Activity</p>
            <p className="font-medium text-gray-900">
              {formatDate(sessionInfo.lastActivity)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-gray-600">Time Remaining</p>
            <div className="flex items-center gap-1">
              <Clock className={`w-3 h-3 ${isExpiringSoon ? 'text-yellow-600' : 'text-green-600'}`} />
              <p className={`font-medium ${isExpiringSoon ? 'text-yellow-700' : 'text-green-700'}`}>
                {formatTimeRemaining(timeRemaining)}
              </p>
            </div>
          </div>
        </div>

        {isExpiringSoon && (
          <div className="pt-2 border-t border-gray-300">
            <p className="text-sm text-yellow-700 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Session expiring soon. Any activity will extend it.
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600">
            Your session stays active for 24 hours. It automatically refreshes with your activity.
          </p>
        </div>
      </div>
    </Card>
  );
}