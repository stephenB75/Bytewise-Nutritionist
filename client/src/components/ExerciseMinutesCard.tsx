import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Dumbbell, RefreshCw, Timer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { healthKitService, type WorkoutSummary } from '@/services/healthKit';
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

type CardState =
  | 'loading'
  | 'web'
  | 'unavailable'
  | 'disconnected'
  | 'needs-permission'
  | 'ready';

/** Plain language for users — avoid "3m" / "20m". */
function formatMinutes(total: number): string {
  const safe = Math.max(0, Math.round(total));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours} hr ${minutes} min`;
  }
  if (hours > 0) {
    return hours === 1 ? '1 hr' : `${hours} hr`;
  }
  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}

function formatMinutesShort(total: number): string {
  const safe = Math.max(0, Math.round(total));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
  if (hours > 0) return `${hours}h`;
  return `${minutes} min`;
}

export function ExerciseMinutesCard({ onConnect }: { onConnect?: () => void }) {
  const [state, setState] = useState<CardState>('loading');
  const [days, setDays] = useState<DayMinutes[]>([]);
  const [todayWorkouts, setTodayWorkouts] = useState<WorkoutSummary | null>(null);
  const [allowing, setAllowing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const refresh = useCallback(async () => {
    if (!(Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios')) {
      setState('web');
      return;
    }
    await healthKitService.initialize();
    await healthKitService.refreshAuthorization();
    if (!healthKitService.getAvailability()) {
      setState('unavailable');
      return;
    }
    if (!healthKitService.getAuthorizationStatus()) {
      setState('disconnected');
      return;
    }

    // Always load when connected. Show the Allow prompt only if Health still
    // hasn't been asked for Exercise minutes (legacy connects).
    if (healthKitService.needsExercisePermission()) {
      setState('needs-permission');
    }

    const [history, summary] = await Promise.all([
      healthKitService.readExerciseHistory(7),
      healthKitService.readTodayFitnessSummary(),
    ]);
    setDays(history || []);
    setTodayWorkouts(summary?.workouts ?? { count: 0, minutes: 0, calories: 0, items: [] });
    // Prefer ready once we have any readable data, even if a follow-up Allow is offered.
    const hasData = (history || []).some((day) => day.totalMinutes > 0)
      || (summary?.workouts?.count ?? 0) > 0
      || (summary?.exerciseMinutes ?? 0) > 0;
    if (hasData || !healthKitService.needsExercisePermission()) {
      setState('ready');
    } else {
      setState('needs-permission');
    }
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('apple-health-changed', onChange);
    window.addEventListener('focus', onChange);
    window.addEventListener('app-data-refresh', onChange);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('apple-health-changed', onChange);
      window.removeEventListener('focus', onChange);
      window.removeEventListener('app-data-refresh', onChange);
      document.removeEventListener('visibilitychange', onVisibility);
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
  const todayWorkoutMinutes = today?.workoutMinutes ?? todayWorkouts?.minutes ?? 0;
  const weekTotal = days.reduce((sum, day) => sum + day.totalMinutes, 0);
  const daysOnTarget = days.filter((day) => day.totalMinutes >= DAILY_TARGET_MINUTES).length;
  const scaleMax = Math.max(DAILY_TARGET_MINUTES * 1.5, ...days.map((day) => day.totalMinutes), 1);
  const todayProgress = Math.min(todayTotal / DAILY_TARGET_MINUTES, 1) * 100;
  const workoutItems = todayWorkouts?.items ?? [];

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await refresh();
      toast({ title: 'Exercise updated', description: 'Pulled the latest minutes from Apple Health.', duration: 2500 });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/60 p-4 shadow-md" data-testid="exercise-minutes-card">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Timer className="h-5 w-5 shrink-0 text-lime-600" />
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900">Exercise</h3>
            <p className="text-xs text-gray-700">All-day activity and workouts in one place</p>
          </div>
        </div>
        {(state === 'ready' || state === 'needs-permission') && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border-amber-300 bg-white/80 text-gray-800"
            onClick={handleUpdate}
            disabled={updating}
            data-testid="button-update-exercise"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${updating ? 'animate-spin' : ''}`} />
            Update
          </Button>
        )}
      </div>

      {state === 'loading' ? (
        <p className="text-sm text-gray-600">Loading exercise…</p>
      ) : state === 'web' ? (
        <p className="text-sm text-gray-700">
          Open the Bytewise iPhone app and connect Apple Health to see today’s exercise total, workouts, and the last 7 days here.
        </p>
      ) : state === 'unavailable' ? (
        <p className="text-sm text-gray-700">Apple Health is not available on this device.</p>
      ) : state === 'disconnected' ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            Connect Apple Health to track your exercise minutes and workouts.
          </p>
          <Button
            type="button"
            size="sm"
            className="on-color bg-lime-600 hover:bg-lime-700 disabled:opacity-75"
            onClick={handleAllow}
            disabled={allowing}
            data-testid="button-allow-exercise-card"
          >
            {allowing ? 'Opening Apple Health…' : 'Connect Apple Health'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {state === 'needs-permission' && (
            <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50 space-y-2">
              <p className="text-sm text-gray-700">
                Allow Exercise minutes in Apple Health to keep this card updating with your green ring.
              </p>
              <Button
                type="button"
                size="sm"
                className="on-color bg-lime-600 hover:bg-lime-700 disabled:opacity-75"
                onClick={handleAllow}
                disabled={allowing}
                data-testid="button-allow-exercise-card"
              >
                {allowing ? 'Opening Apple Health…' : 'Allow exercise minutes'}
              </Button>
            </div>
          )}
          <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50" data-testid="exercise-minutes-today-tally">
            <p className="text-xs font-medium text-gray-600 mb-1">Today’s total</p>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-2xl font-bold text-gray-900">
                {formatMinutes(todayTotal)}
                <span className="ml-1.5 text-sm font-medium text-gray-700">
                  of {DAILY_TARGET_MINUTES} minutes
                </span>
              </p>
              {todayTotal >= DAILY_TARGET_MINUTES && (
                <span className="shrink-0 text-xs font-semibold text-lime-700">Goal met</span>
              )}
            </div>
            <div className="mt-2 h-2 rounded-full bg-lime-100 overflow-hidden">
              <div className="h-full rounded-full bg-lime-500" style={{ width: `${todayProgress}%` }} />
            </div>

            <div className="mt-3 space-y-2 text-sm text-gray-800">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-700">All-day activity (green ring)</span>
                <span className="font-semibold text-gray-900" data-testid="exercise-ring-minutes">
                  {formatMinutes(todayRing)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-700">Completed workouts</span>
                <span className="font-semibold text-gray-900" data-testid="exercise-workout-minutes">
                  {formatMinutes(todayWorkoutMinutes)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50" data-testid="exercise-workout-list">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
              <Dumbbell className="h-3.5 w-3.5 text-emerald-600" />
              Today’s workouts
            </div>
            {workoutItems.length > 0 ? (
              <ul className="space-y-1.5">
                {workoutItems.map((item, index) => (
                  <li
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between gap-2 text-sm text-gray-800"
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="shrink-0 font-medium text-gray-900">
                      {formatMinutes(item.minutes)}
                      {item.calories > 0 ? ` · ${item.calories} cal` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-700">No completed workouts yet today</p>
            )}
          </div>

          <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50">
            <p className="text-xs font-medium text-gray-600 mb-2">Last 7 days (combined total)</p>
            <div className="flex items-end justify-between gap-1.5 h-24" aria-label="Total exercise minutes, last 7 days">
              {days.map((day, index) => {
                const isToday = index === days.length - 1;
                const height = day.totalMinutes > 0 ? Math.max((day.totalMinutes / scaleMax) * 100, 6) : 2;
                return (
                  <div key={day.date.toDateString()} className="flex flex-1 flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[10px] font-medium text-gray-700">
                      {day.totalMinutes > 0 ? formatMinutesShort(day.totalMinutes) : ''}
                    </span>
                    <div
                      className={`w-full max-w-[28px] rounded-t ${day.totalMinutes >= DAILY_TARGET_MINUTES ? 'bg-lime-500' : 'bg-lime-200'} ${isToday ? 'ring-2 ring-lime-700/40' : ''}`}
                      style={{ height: `${height}%` }}
                      title={`${day.date.toLocaleDateString('en-US', { weekday: 'long' })}: ${formatMinutes(day.totalMinutes)} total`}
                    />
                    <span className={`text-[10px] ${isToday ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                      {isToday ? 'Today' : day.date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-gray-700">
              {formatMinutes(weekTotal)} over the last 7 days (guideline: {WEEKLY_TARGET_MINUTES} minutes a week)
              {' · '}
              {daysOnTarget} of 7 days hit {DAILY_TARGET_MINUTES} minutes
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
