import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Activity, Dumbbell, Flame, Footprints, HeartPulse, Moon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { healthKitService, type AppleFitnessSummary, type SleepSummary } from '@/services/healthKit';
import { toast } from '@/hooks/use-toast';

type AppleFitnessCardProps = {
  onConnect?: () => void;
};

function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function sleepRating(score: number): { label: string; className: string } {
  if (score >= 80) return { label: 'Good', className: 'text-green-700' };
  if (score >= 60) return { label: 'Fair', className: 'text-amber-700' };
  return { label: 'Poor', className: 'text-rose-700' };
}

function SleepTile({ sleep }: { sleep: SleepSummary | null }) {
  return (
    <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50" data-testid="apple-fitness-sleep">
      <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
        <Moon className="h-3.5 w-3.5 text-indigo-600" />
        Sleep score
      </div>
      {sleep ? (
        <>
          <p className="text-lg font-bold text-gray-900">
            {sleep.score}
            <span className={`ml-1.5 text-xs font-semibold ${sleepRating(sleep.score).className}`}>
              {sleepRating(sleep.score).label}
            </span>
          </p>
          <p className="text-xs text-gray-700">{formatMinutes(sleep.asleepMinutes)} asleep last night</p>
          {sleep.hasStages && (
            <p className="text-xs text-gray-600">
              Deep {formatMinutes(sleep.deepMinutes)} · REM {formatMinutes(sleep.remMinutes)}
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-700">No sleep recorded last night</p>
      )}
    </div>
  );
}

function WorkoutsTile({ workouts }: { workouts: AppleFitnessSummary['workouts'] | undefined }) {
  const count = workouts?.count ?? 0;
  return (
    <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50" data-testid="apple-fitness-workouts">
      <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
        <Dumbbell className="h-3.5 w-3.5 text-emerald-600" />
        Workouts
      </div>
      {count > 0 && workouts ? (
        <>
          <p className="text-lg font-bold text-gray-900">
            {count}
            <span className="ml-1.5 text-xs font-medium text-gray-700">
              {formatMinutes(workouts.minutes)}
              {workouts.calories > 0 ? ` · ${workouts.calories} kcal` : ''}
            </span>
          </p>
          <ul className="text-xs text-gray-700 space-y-0.5">
            {workouts.items.slice(0, 3).map((item, index) => (
              <li key={`${item.name}-${index}`}>
                {item.name} · {formatMinutes(item.minutes)}
              </li>
            ))}
            {workouts.items.length > 3 && <li>+{workouts.items.length - 3} more</li>}
          </ul>
        </>
      ) : (
        <p className="text-xs text-gray-700">No workouts yet today</p>
      )}
    </div>
  );
}

export function AppleFitnessCard({ onConnect }: AppleFitnessCardProps) {
  const [summary, setSummary] = useState<AppleFitnessSummary | null>(null);
  const [connected, setConnected] = useState(false);
  const [available, setAvailable] = useState(false);
  const [needsRecoveryPermission, setNeedsRecoveryPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await healthKitService.initialize();
      const isAvailable = healthKitService.getAvailability();
      const isConnected = healthKitService.getAuthorizationStatus();
      setAvailable(isAvailable);
      setConnected(isConnected);
      setNeedsRecoveryPermission(healthKitService.needsRecoveryPermission());

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
    window.addEventListener('app-data-refresh', onHealthChange);
    return () => {
      window.removeEventListener('apple-health-changed', onHealthChange);
      window.removeEventListener('focus', onHealthChange);
      window.removeEventListener('app-data-refresh', onHealthChange);
    };
  }, [refresh]);

  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const result = await healthKitService.requestPermissions();
      if (result.ok) {
        window.dispatchEvent(new CustomEvent('apple-health-changed'));
        toast({ title: 'Apple Health Connected', duration: 3000 });
      } else {
        toast({ title: 'Apple Health not connected', description: result.reason, variant: 'destructive', duration: 6000 });
        onConnect?.();
      }
    } finally {
      setConnecting(false);
    }
  };

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

      {loading && !summary ? (
        <p className="text-sm text-gray-600">Loading activity…</p>
      ) : !isNativeIos ? (
        <p className="text-sm text-gray-700">
          Open the Bytewise iPhone app and connect Apple Health in Profile to see steps, move calories, distance, sleep, and workouts here.
        </p>
      ) : !available ? (
        <p className="text-sm text-gray-700">Apple Health is not available on this device.</p>
      ) : !connected ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            Connect Apple Health to show today's steps, move calories, distance, sleep, and workouts alongside nutrition.
          </p>
          <Button
            type="button"
            size="sm"
            className="on-color bg-rose-600 hover:bg-rose-700 disabled:opacity-75"
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting ? 'Connecting…' : 'Connect Apple Health'}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
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

          {needsRecoveryPermission ? (
            <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50 space-y-2">
              <p className="text-sm text-gray-700">
                Allow Bytewise to read sleep and workouts from Apple Health to see your sleep score and today's workouts.
              </p>
              <Button
                type="button"
                size="sm"
                className="on-color bg-rose-600 hover:bg-rose-700 disabled:opacity-75"
                onClick={handleConnect}
                disabled={connecting}
                data-testid="button-allow-sleep-workouts"
              >
                {connecting ? 'Opening Apple Health…' : 'Allow sleep & workouts'}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <SleepTile sleep={summary?.sleep ?? null} />
                <WorkoutsTile workouts={summary?.workouts} />
              </div>
              <p className="text-[11px] text-gray-600">
                Sleep score is calculated by Bytewise from your Apple Health sleep data; it is not Apple's Sleep Score.
              </p>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
