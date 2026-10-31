import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Area, AreaChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Dumbbell, Timer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { healthKitService, type ExerciseDay, type WorkoutSummary } from '@/services/healthKit';
import { toast } from '@/hooks/use-toast';

// Daily exercise goal shown on the card (minutes). Matches a common Apple Watch
// Exercise ring goal; Capgo Health cannot read the Watch goal from HealthKit yet.
const DAILY_TARGET_MINUTES = 45;
// U.S. activity guideline: 150 minutes of moderate activity a week.
const WEEKLY_TARGET_MINUTES = 150;
/** Re-read HealthKit often enough that the green ring feels live while the app is open. */
const LIVE_POLL_MS = 15_000;
/** The 30-day chart is a month-scale view; re-reading it every minute adds HealthKit load for no visible change. */
const MONTH_REFRESH_MS = 5 * 60_000;
const MONTH_DAYS = 30;

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

function MonthlyActivityChart({ days }: { days: ExerciseDay[] }) {
  const data = days.map((day) => ({
    label: day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    minutes: day.totalMinutes,
  }));
  const total = data.reduce((sum, day) => sum + day.minutes, 0);
  if (total === 0) {
    return (
      <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50" data-testid="exercise-monthly-chart">
        <p className="text-xs font-medium text-gray-600 mb-1">Last 30 days</p>
        <p className="text-sm text-gray-700">No exercise recorded in the last 30 days yet.</p>
      </div>
    );
  }

  const peak = data.reduce((best, day) => (day.minutes > best.minutes ? day : best), data[0]);
  // Today is still in progress, so it can't be the month's low.
  const finishedDays = data.slice(0, -1);
  const low = finishedDays.reduce((least, day) => (day.minutes < least.minutes ? day : least), finishedDays[0] ?? data[0]);
  const activeDays = data.filter((day) => day.minutes > 0).length;
  const average = Math.round(total / data.length);

  return (
    <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50" data-testid="exercise-monthly-chart">
      <p className="text-xs font-medium text-gray-600 mb-2">Last 30 days (ring + workouts)</p>
      <div className="h-36" aria-label="Exercise minutes per day, last 30 days">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 14, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="exerciseMonthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#65a30d" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#65a30d" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#374151' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
            <Tooltip
              formatter={(value: number) => [formatMinutes(value), 'Exercise']}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <ReferenceLine
              y={DAILY_TARGET_MINUTES}
              stroke="#4d7c0f"
              strokeDasharray="4 4"
              label={{ value: `${DAILY_TARGET_MINUTES} min goal`, position: 'insideTopRight', fontSize: 10, fill: '#3f6212' }}
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#65a30d"
              strokeWidth={2}
              fill="url(#exerciseMonthFill)"
              isAnimationActive={false}
            />
            <ReferenceDot x={peak.label} y={peak.minutes} r={4} fill="#3f6212" stroke="#fff" strokeWidth={1.5} />
            <ReferenceDot x={low.label} y={low.minutes} r={4} fill="#f97316" stroke="#fff" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center" data-testid="exercise-monthly-summary">
        <div className="rounded-md bg-lime-50 px-1.5 py-1.5">
          <p className="text-[10px] font-medium text-lime-800">Peak · {peak.label}</p>
          <p className="text-sm font-bold text-gray-900">{formatMinutesShort(peak.minutes)}</p>
        </div>
        <div className="rounded-md bg-orange-50 px-1.5 py-1.5">
          <p className="text-[10px] font-medium text-orange-800">Low · {low.label}</p>
          <p className="text-sm font-bold text-gray-900">{formatMinutesShort(low.minutes)}</p>
        </div>
        <div className="rounded-md bg-amber-50 px-1.5 py-1.5">
          <p className="text-[10px] font-medium text-gray-700">Daily average</p>
          <p className="text-sm font-bold text-gray-900">{formatMinutesShort(average)}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-700">
        Active on {activeDays} of {data.length} days. The low ignores today, since it isn't over yet.
      </p>
    </div>
  );
}

export function ExerciseMinutesCard({ onConnect }: { onConnect?: () => void }) {
  const [state, setState] = useState<CardState>('loading');
  const [days, setDays] = useState<DayMinutes[]>([]);
  const [todayWorkouts, setTodayWorkouts] = useState<WorkoutSummary | null>(null);
  const [todayRingFromSummary, setTodayRingFromSummary] = useState(0);
  const [allowing, setAllowing] = useState(false);
  const [monthDays, setMonthDays] = useState<ExerciseDay[]>([]);
  const refreshGenRef = useRef(0);
  const monthReadAtRef = useRef(0);

  const loadMonth = useCallback(async (force = false) => {
    if (!force && Date.now() - monthReadAtRef.current < MONTH_REFRESH_MS) return;
    monthReadAtRef.current = Date.now();
    const month = await healthKitService.readExerciseRange(MONTH_DAYS);
    if (month) setMonthDays(month);
  }, []);

  const applyToday = useCallback((ringMinutes: number, workouts: WorkoutSummary) => {
    setTodayRingFromSummary(ringMinutes);
    setTodayWorkouts(workouts);
    setDays((prev) => {
      if (prev.length === 0) {
        const today = new Date();
        today.setHours(12, 0, 0, 0);
        return [{
          date: today,
          ringMinutes,
          workoutMinutes: workouts.minutes,
          totalMinutes: ringMinutes + workouts.minutes,
        }];
      }
      const next = [...prev];
      const last = next[next.length - 1];
      next[next.length - 1] = {
        ...last,
        ringMinutes,
        workoutMinutes: workouts.minutes,
        totalMinutes: ringMinutes + workouts.minutes,
      };
      return next;
    });
  }, []);

  const refresh = useCallback(async (opts?: { todayOnly?: boolean; forceMonth?: boolean }) => {
    const gen = ++refreshGenRef.current;

    try {
      if (!(Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios')) {
        if (gen === refreshGenRef.current) setState('web');
        return;
      }

      await healthKitService.initialize();
      await healthKitService.refreshAuthorization();
      if (gen !== refreshGenRef.current) return;

      if (!healthKitService.getAvailability()) {
        setState('unavailable');
        return;
      }
      if (!healthKitService.getAuthorizationStatus()) {
        setState('disconnected');
        return;
      }

      // Fast path first so the ring/workouts update without waiting on a 7-day history pull.
      const today = await healthKitService.readTodayExercise();
      if (gen !== refreshGenRef.current) return;

      if (today) {
        applyToday(today.ringMinutes, today.workouts);
      }

      const hasToday =
        (today?.ringMinutes ?? 0) > 0 || (today?.workouts.count ?? 0) > 0;
      if (hasToday || !healthKitService.needsExercisePermission()) {
        setState('ready');
      } else {
        setState('needs-permission');
      }

      if (opts?.todayOnly) return;

      const [history] = await Promise.all([
        healthKitService.readExerciseHistory(7),
        loadMonth(opts?.forceMonth),
      ]);
      if (gen !== refreshGenRef.current) return;

      if (history && history.length > 0) {
        // Keep the freshest today totals if history lag slightly behind.
        const last = history[history.length - 1];
        const ring = Math.max(last.ringMinutes, today?.ringMinutes ?? 0);
        const workoutMinutes = Math.max(last.workoutMinutes, today?.workouts.minutes ?? 0);
        history[history.length - 1] = {
          ...last,
          ringMinutes: ring,
          workoutMinutes,
          totalMinutes: ring + workoutMinutes,
        };
        setDays(history);
        if (today?.workouts) {
          setTodayWorkouts(today.workouts);
        }
        setTodayRingFromSummary(ring);
      }

      const hasData =
        (history || []).some((day) => day.totalMinutes > 0)
        || hasToday;
      if (hasData || !healthKitService.needsExercisePermission()) {
        setState('ready');
      } else {
        setState('needs-permission');
      }
    } catch (error) {
      console.warn('Exercise card refresh failed:', error);
      // Keep last good numbers on screen; only flip out of loading on first failure.
      if (gen === refreshGenRef.current) {
        setState((prev) => (prev === 'loading' ? 'disconnected' : prev));
      }
    }
  }, [applyToday, loadMonth]);

  useEffect(() => {
    void refresh({ forceMonth: true });

    const onFullRefresh = () => void refresh({ forceMonth: true });
    const onLiveRefresh = () => void refresh({ todayOnly: true });
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    const onPageShow = () => void refresh();

    const pollId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refresh({ todayOnly: true });
      }
    }, LIVE_POLL_MS);

    // Periodic full week rebuild so bars stay honest without hammering HealthKit.
    const weekPollId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    }, 60_000);

    window.addEventListener('apple-health-changed', onFullRefresh);
    window.addEventListener('focus', onLiveRefresh);
    window.addEventListener('pageshow', onPageShow);
    // Pull-to-refresh / app-wide sync should rebuild today + 7-day history.
    window.addEventListener('app-data-refresh', onFullRefresh);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(pollId);
      window.clearInterval(weekPollId);
      window.removeEventListener('apple-health-changed', onFullRefresh);
      window.removeEventListener('focus', onLiveRefresh);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('app-data-refresh', onFullRefresh);
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
  // Always derive the headline from the two breakdown lines so it can't drift
  // from "green ring" + "completed workouts".
  const todayRing = Math.max(today?.ringMinutes ?? 0, todayRingFromSummary);
  const todayWorkoutMinutes = Math.max(
    today?.workoutMinutes ?? 0,
    todayWorkouts?.minutes ?? 0,
  );
  const todayTotal = todayRing + todayWorkoutMinutes;
  // Always ring + workouts so bars/week match the Today breakdown.
  const dayTotals = days.map((day) => day.ringMinutes + day.workoutMinutes);
  const weekTotal = dayTotals.reduce((sum, n) => sum + n, 0);
  const daysOnTarget = dayTotals.filter((n) => n >= DAILY_TARGET_MINUTES).length;
  const scaleMax = Math.max(DAILY_TARGET_MINUTES * 1.5, ...dayTotals, 1);
  const todayProgress = Math.min(todayTotal / DAILY_TARGET_MINUTES, 1) * 100;
  const workoutItems = todayWorkouts?.items ?? [];

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/60 p-4 shadow-md" data-testid="exercise-minutes-card">
      <div className="flex items-center gap-2 mb-3">
        <Timer className="h-5 w-5 shrink-0 text-lime-600" />
        <div className="min-w-0">
          <h3 className="text-base font-bold text-gray-900">Exercise</h3>
          <p className="text-xs text-gray-700">All-day activity and workouts in one place</p>
        </div>
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
            <p className="text-xs font-medium text-gray-600 mb-1">Today’s total (ring + workouts)</p>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-2xl font-bold text-gray-900" data-testid="exercise-today-total">
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
                <span className="text-gray-700">+ Completed workouts</span>
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
                const combined = dayTotals[index] ?? 0;
                const height = combined > 0 ? Math.max((combined / scaleMax) * 100, 6) : 2;
                return (
                  <div key={day.date.toDateString()} className="flex flex-1 flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[10px] font-medium text-gray-700">
                      {combined > 0 ? formatMinutesShort(combined) : ''}
                    </span>
                    <div
                      className={`w-full max-w-[28px] rounded-t ${combined >= DAILY_TARGET_MINUTES ? 'bg-lime-500' : 'bg-lime-200'} ${isToday ? 'ring-2 ring-lime-700/40' : ''}`}
                      style={{ height: `${height}%` }}
                      title={`${day.date.toLocaleDateString('en-US', { weekday: 'long' })}: ${formatMinutes(combined)} total`}
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

          {monthDays.length > 0 && <MonthlyActivityChart days={monthDays} />}
        </div>
      )}
    </Card>
  );
}
