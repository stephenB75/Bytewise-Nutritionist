import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Activity, Flame, Footprints, HeartPulse } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { healthKitService, type AppleFitnessSummary } from '@/services/healthKit';

type AppleFitnessCardProps = {
  onConnect?: () => void;
};

export function AppleFitnessCard({ onConnect }: AppleFitnessCardProps) {
  const [summary, setSummary] = useState<AppleFitnessSummary | null>(null);
  const [connected, setConnected] = useState(false);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await healthKitService.initialize();
      const isAvailable = healthKitService.getAvailability();
      const isConnected = healthKitService.getAuthorizationStatus();
      setAvailable(isAvailable);
      setConnected(isConnected);

      if (isAvailable && isConnected) {
        const data = await healthKitService.readTodayFitnessSummary();
        setSummary(data);
      } else {
        setSummary(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onHealthChange = () => refresh();
    window.addEventListener('apple-health-changed', onHealthChange);
    window.addEventListener('focus', onHealthChange);
    return () => {
      window.removeEventListener('apple-health-changed', onHealthChange);
      window.removeEventListener('focus', onHealthChange);
    };
  }, [refresh]);

  const isNativeIos =
    Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/60 p-4 shadow-md" data-testid="apple-fitness-card">
      <div className="flex items-center gap-2 mb-3">
        <HeartPulse className="h-5 w-5 text-rose-600" />
        <div>
          <h3 className="text-base font-bold text-gray-900">Apple Fitness</h3>
          <p className="text-xs text-gray-700">Today from Apple Health</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600">Loading activity…</p>
      ) : !isNativeIos ? (
        <p className="text-sm text-gray-700">
          Open the Bytewise iPhone app and connect Apple Health in Profile to see steps, move calories, and distance here.
        </p>
      ) : !available ? (
        <p className="text-sm text-gray-700">Apple Health is not available on this device.</p>
      ) : !connected ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            Connect Apple Health to show today's steps, move calories, and distance alongside nutrition.
          </p>
          {onConnect && (
            <Button
              type="button"
              size="sm"
              className="on-color bg-rose-600 hover:bg-rose-700"
              onClick={onConnect}
            >
              Connect Apple Health
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
              <Footprints className="h-3.5 w-3.5 text-blue-600" />
              Steps
            </div>
            <p className="text-lg font-bold text-gray-900">{summary?.steps ?? 0}</p>
          </div>
          <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
              <Flame className="h-3.5 w-3.5 text-orange-600" />
              Move (kcal)
            </div>
            <p className="text-lg font-bold text-gray-900">{summary?.activeCalories ?? 0}</p>
          </div>
          <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
              <Activity className="h-3.5 w-3.5 text-purple-600" />
              Distance
            </div>
            <p className="text-lg font-bold text-gray-900">{summary?.distanceMiles ?? 0} mi</p>
          </div>
        </div>
      )}
    </Card>
  );
}
