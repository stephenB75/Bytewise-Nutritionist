import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Timer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { healthKitService } from '@/services/healthKit';
import { toast } from '@/hooks/use-toast';

const DAILY_TARGET_MINUTES = 30;
// U.S. activity guideline: 150 minutes of moderate activity a week.
const WEEKLY_TARGET_MINUTES = 150;

type DayMinutes = {
  date: Date;
  ringMinutes: number;
  workoutMinutes: number;
  totalMinutes: number;
};

type CardState = 'loading' | 'web' | 'unavailable' | 'disconnected' | 'needs-permission' | 'ready';

function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function ExerciseMinutesCard({ onConnect }: { onConnect?: () => void }) {
  const [state, setState] = useState<CardState>('loading');
  const [days, setDays] = useState<DayMinutes[]>([]);
  const [allowing, setAllowing] = useState(false);

  const refresh = useCallback(async () => {
    if (!(Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios')) {
      setState('web');
      return;
    }
    await healthKitService.initialize();
    if (!healthKitService.getAvailability()) {
      setState('unavailable');
    } else if (!healthKitService.getAuthorizationStatus()) {
      setState('disconnected');
    } else if (healthKitService.needsExercisePermission()) {
      setState('needs-permission');
    } else {
      setDays((await healthKitService.readExerciseHistory(7)) || []);
      setState('ready');
    }
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('apple-health-changed', onChange);
    window.addEventListener('focus', onChange);
    window.addEventListener('app-data-refresh', onChange);
    return () => {
      window.removeEventListener('apple-health-changed', onChange);
      window.removeEventListener('focus', onChange);
      window.removeEventListener('app-data-refresh', onChange);
    };
  }, [refresh]);

  const handleAllow = async () => {
    setAllowing(true);
    try {
      const result = await healthKitService.requestPermissions();
      if (result.ok) {
        window.dispatchEvent(new CustomEvent('apple-health-changed'));
      } else {
        toast({ title: 'Apple Health not connected', description: result.reason, variant: 'destructive', duration: 6000 });
        onConnect?.();
      }
    } finally {
      setAllowing(false);
    }
  };

  const today = days[days.length - 1];
  const todayTotal = today?.totalMinutes ?? 0;
  const todayRing = today?.ringMinutes ?? 0;
  const todayWorkouts = today?.workoutMinutes ?? 0;
  const weekTotal = days.reduce((sum, day) => sum + day.totalMinutes, 0);
  const daysOnTarget = days.filter((day) => day.totalMinutes >= DAILY_TARGET_MINUTES).length;
  const scaleMax = Math.max(DAILY_TARGET_MINUTES * 1.5, ...days.map((day) => day.totalMinutes), 1);
  const todayProgress = Math.min(todayTotal / DAILY_TARGET_MINUTES, 1) * 100;

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/60 p-4 shadow-md" data-testid="exercise-minutes-card">
      <div className="flex items-center gap-2 mb-3">
        <Timer className="h-5 w-5 text-lime-600" />
        <div>
          <h3 className="text-base font-bold text-gray-900">Exercise Minutes</h3>
          <p className="text-xs text-gray-700">Green ring + completed workouts</p>
        </div>
      </div>

      {state === 'loading' ? (
        <p className="text-sm text-gray-600">Loading exercise…</p>
      ) : state === 'web' ? (
        <p className="text-sm text-gray-700">
          Open the Bytewise iPhone app and connect Apple Health to see your daily exercise minutes and the last 7 days here.
        </p>
      ) : state === 'unavailable' ? (
        <p className="text-sm text-gray-700">Apple Health is not available on this device.</p>
      ) : state === 'disconnected' || state === 'needs-permission' ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            {state === 'disconnected'
              ? 'Connect Apple Health to track your exercise minutes.'
              : 'Allow Exercise minutes in Apple Health to see your green ring here.'}
          </p>
          <Button
            type="button"
            size="sm"
            className="on-color bg-lime-600 hover:bg-lime-700 disabled:opacity-75"
            onClick={handleAllow}
            disabled={allowing}
            data-testid="button-allow-exercise-card"
          >
            {allowing ? 'Opening Apple Health…' : state === 'disconnected' ? 'Connect Apple Health' : 'Allow exercise minutes'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50" data-testid="exercise-minutes-today-tally">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold text-gray-900">
                {formatMinutes(todayTotal)}
                <span className="ml-1.5 text-sm font-medium text-gray-700">of {DAILY_TARGET_MINUTES}m today</span>
              </p>
              {todayTotal >= DAILY_TARGET_MINUTES && <span className="text-xs font-semibold text-lime-700">Goal met</span>}
            </div>
            <div className="mt-2 h-2 rounded-full bg-lime-100 overflow-hidden">
              <div className="h-full rounded-full bg-lime-500" style={{ width: `${todayProgress}%` }} />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-700">
              <p>
                Green ring{' '}
                <span className="font-semibold text-gray-900" data-testid="exercise-ring-minutes">
                  {formatMinutes(todayRing)}
                </span>
              </p>
              <p className="text-right">
                Workouts{' '}
                <span className="font-semibold text-gray-900" data-testid="exercise-workout-minutes">
                  {formatMinutes(todayWorkouts)}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50">
            <div className="flex items-end justify-between gap-1.5 h-24" aria-label="Total exercise minutes, last 7 days">
              {days.map((day, index) => {
                const isToday = index === days.length - 1;
                const height = day.totalMinutes > 0 ? Math.max((day.totalMinutes / scaleMax) * 100, 6) : 2;
                return (
                  <div key={day.date.toDateString()} className="flex flex-1 flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[10px] font-medium text-gray-700">{day.totalMinutes || ''}</span>
                    <div
                      className={`w-full max-w-[28px] rounded-t ${day.totalMinutes >= DAILY_TARGET_MINUTES ? 'bg-lime-500' : 'bg-lime-200'} ${isToday ? 'ring-2 ring-lime-700/40' : ''}`}
                      style={{ height: `${height}%` }}
                      title={`${day.date.toLocaleDateString('en-US', { weekday: 'long' })}: ${day.totalMinutes} min total (ring ${day.ringMinutes} + workouts ${day.workoutMinutes})`}
                    />
                    <span className={`text-[10px] ${isToday ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                      {isToday ? 'Today' : day.date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-gray-700">
              {formatMinutes(weekTotal)} in the last 7 days (guideline: {WEEKLY_TARGET_MINUTES}m a week) · {daysOnTarget} of 7 days hit {DAILY_TARGET_MINUTES}m
            </p>
          </div>

          <p className="text-[11px] text-gray-600">
            Today’s tally adds green-ring minutes and completed workout minutes from Apple Health. Workout sessions are listed in the Apple Fitness card above.
          </p>
        </div>
      )}
    </Card>
  );
}
