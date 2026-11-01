import { useMemo, useState } from 'react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDown, ArrowRight, ArrowUp, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getLocalDateKey } from '@/utils/dateUtils';

export type FastingTrendSession = {
  startTime?: string;
  endTime?: string;
  completedAt?: string;
  createdAt?: string;
  status?: string;
  targetDuration?: number;
  actualDuration?: number;
  targetHours?: number;
  actualHoursFasted?: number;
  wasCompleted?: boolean;
  planName?: string;
};

type DayPoint = {
  key: string;
  label: string;
  hours: number;
  completedHours: number;
  earlyHours: number;
  sessions: number;
  completed: number;
  endedEarly: number;
  notEnded: number;
  /** Time of day as hours (0–24) for the day's longest fast; null on days without one. */
  startClock: number | null;
  endClock: number | null;
};

const HOUR_MS = 1000 * 60 * 60;
// Same grace as the server: ending within a minute of the goal counts as reaching it.
const GOAL_GRACE_HOURS = 1 / 60;

/**
 * - completed: fasted at least the goal
 * - ended-early: the user ended it before the goal
 * - not-ended: the timer ran past the goal but no end was ever recorded, so hours are unknown
 * - active: still running
 */
export type FastingOutcome = 'completed' | 'ended-early' | 'not-ended' | 'active';

export function fastingTargetHours(session: FastingTrendSession): number {
  if (session.targetHours != null && Number(session.targetHours) > 0) return Number(session.targetHours);
  return Math.max(0, Number(session.targetDuration) || 0) / HOUR_MS;
}

/** Hours actually fasted, or null when the session never recorded an end. */
export function fastingHoursFasted(session: FastingTrendSession): number | null {
  if (session.actualHoursFasted != null && Number.isFinite(Number(session.actualHoursFasted)) && Number(session.actualHoursFasted) > 0) {
    return Number(session.actualHoursFasted);
  }
  if (session.actualDuration != null && Number.isFinite(Number(session.actualDuration)) && Number(session.actualDuration) > 0) {
    return Number(session.actualDuration) / HOUR_MS;
  }
  const end = session.endTime || session.completedAt;
  if (end && session.startTime) {
    const ms = new Date(end).getTime() - new Date(session.startTime).getTime();
    if (Number.isFinite(ms) && ms > 0) return ms / HOUR_MS;
  }
  return null;
}

export function fastingOutcome(session: FastingTrendSession, now: number = Date.now()): FastingOutcome {
  const status = String(session.status || '').toLowerCase();
  const target = fastingTargetHours(session);
  if (status === 'active' || status === 'paused') {
    const start = session.startTime ? new Date(session.startTime).getTime() : NaN;
    const goalPassed = Number.isFinite(start) && target > 0 && now > start + target * HOUR_MS;
    return goalPassed ? 'not-ended' : 'active';
  }
  const hours = fastingHoursFasted(session);
  if (hours == null) return status === 'completed' || session.wasCompleted ? 'completed' : 'not-ended';
  if (target <= 0) return status === 'completed' ? 'completed' : 'ended-early';
  return hours + GOAL_GRACE_HOURS >= target ? 'completed' : 'ended-early';
}

export const FASTING_OUTCOME_LABEL: Record<FastingOutcome, string> = {
  completed: 'Completed',
  'ended-early': 'Ended early',
  'not-ended': 'Not ended',
  active: 'In progress',
};

function sessionDateKey(session: FastingTrendSession): string {
  // A fast belongs to the day it started; overnight fasts would otherwise land on the morning after.
  const raw = session.startTime || session.createdAt || session.completedAt || session.endTime || '';
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return String(raw).includes('T') ? String(raw).split('T')[0] : String(raw);
  }
  return getLocalDateKey(date);
}

function hoursFasted(session: FastingTrendSession): number {
  return fastingHoursFasted(session) ?? 0;
}

function isCompleted(session: FastingTrendSession): boolean {
  return fastingOutcome(session) === 'completed';
}

function isPastSession(session: FastingTrendSession): boolean {
  return fastingOutcome(session) !== 'active';
}

function average(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function clockHours(raw: string | undefined): number | null {
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.getHours() + date.getMinutes() / 60;
}

/** Average time of day on a 24-hour circle, so 11 PM and 1 AM average to midnight, not noon. */
function averageClock(values: number[]): number | null {
  if (!values.length) return null;
  const angles = values.map((hours) => (hours / 24) * 2 * Math.PI);
  const x = average(angles.map(Math.cos));
  const y = average(angles.map(Math.sin));
  if (Math.hypot(x, y) < 1e-6) return null;
  const hours = ((Math.atan2(y, x) / (2 * Math.PI)) * 24 + 24) % 24;
  return Math.round(hours * 60) / 60;
}

function formatClock(hours: number | null, short = false): string {
  if (hours == null) return '—';
  const totalMinutes = Math.round(hours * 60) % (24 * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const suffix = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  if (short) return `${h12}${suffix === 'AM' ? 'a' : 'p'}`;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function longestSession(sessions: FastingTrendSession[]): FastingTrendSession | null {
  return sessions.reduce<FastingTrendSession | null>(
    (best, s) => (!best || hoursFasted(s) > hoursFasted(best) ? s : best),
    null,
  );
}

function buildDays(sessions: FastingTrendSession[], range: number): DayPoint[] {
  const past = sessions.filter(isPastSession);
  const byDay = new Map<string, FastingTrendSession[]>();
  for (const session of past) {
    const key = sessionDateKey(session);
    if (!key) continue;
    byDay.set(key, [...(byDay.get(key) || []), session]);
  }

  const days: DayPoint[] = [];
  for (let offset = range - 1; offset >= 0; offset--) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const key = getLocalDateKey(date);
    const daySessions = byDay.get(key) || [];
    const round = (value: number) => Math.round(value * 10) / 10;
    const completedHours = daySessions
      .filter((s) => fastingOutcome(s) === 'completed')
      .reduce((sum, s) => sum + hoursFasted(s), 0);
    const earlyHours = daySessions
      .filter((s) => fastingOutcome(s) === 'ended-early')
      .reduce((sum, s) => sum + hoursFasted(s), 0);
    const main = longestSession(daySessions);
    const round2 = (value: number | null) => (value == null ? null : Math.round(value * 100) / 100);
    days.push({
      key,
      label: range <= 7
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      hours: round(completedHours + earlyHours),
      completedHours: round(completedHours),
      earlyHours: round(earlyHours),
      sessions: daySessions.length,
      completed: daySessions.filter(isCompleted).length,
      endedEarly: daySessions.filter((s) => fastingOutcome(s) === 'ended-early').length,
      notEnded: daySessions.filter((s) => fastingOutcome(s) === 'not-ended').length,
      startClock: round2(clockHours(main?.startTime)),
      endClock: main && fastingOutcome(main) !== 'not-ended'
        ? round2(clockHours(main.endTime || main.completedAt))
        : null,
    });
  }
  return days;
}

/** Consecutive calendar days (ending today or most recent fast day) with at least one session. */
function streakDays(days: DayPoint[]): number {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].sessions === 0) {
      if (streak === 0) continue; // skip trailing empty days at the end of the window
      break;
    }
    streak += 1;
  }
  return streak;
}

function TrendArrow({ change }: { change: number | null }) {
  if (change === null) return <span className="w-4" />;
  if (change > 10) return <ArrowUp className="h-4 w-4 text-green-700" aria-label="Trending up" />;
  if (change < -10) return <ArrowDown className="h-4 w-4 text-red-700" aria-label="Trending down" />;
  return <ArrowRight className="h-4 w-4 text-gray-600" aria-label="Steady" />;
}

const COMPLETED_COLOR = '#16a34a';
const EARLY_COLOR = '#f97316';
const START_COLOR = '#7c3aed';
const END_COLOR = '#0f766e';

function formatHours(hours: number): string {
  if (hours <= 0) return '0h';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function FastingTrendsCard({ sessions }: { sessions: FastingTrendSession[] }) {
  const [range, setRange] = useState<7 | 30>(7);

  const { days, activeDays, avgHours, completionRate, streak, longestFast, hoursChange, completionChange, observations, outcomeCounts, avgStart, avgEnd } = useMemo(() => {
    const days = buildDays(sessions, range);
    const avgStart = averageClock(days.flatMap((d) => (d.startClock == null ? [] : [d.startClock])));
    const avgEnd = averageClock(days.flatMap((d) => (d.endClock == null ? [] : [d.endClock])));
    const activeDays = days.filter(d => d.sessions > 0);
    const outcomeCounts = days.reduce(
      (acc, d) => ({
        completed: acc.completed + d.completed,
        endedEarly: acc.endedEarly + d.endedEarly,
        notEnded: acc.notEnded + d.notEnded,
      }),
      { completed: 0, endedEarly: 0, notEnded: 0 },
    );
    const pastInRange = sessions.filter(s => {
      if (!isPastSession(s)) return false;
      const key = sessionDateKey(s);
      return key && days.some(d => d.key === key);
    });

    const half = Math.floor(days.length / 2);
    const earlier = days.slice(0, half).filter(d => d.hours > 0);
    const recent = days.slice(half).filter(d => d.hours > 0);
    const earlierAvg = average(earlier.map(d => d.hours));
    const recentAvg = average(recent.map(d => d.hours));
    const hoursChange = earlier.length && recent.length && earlierAvg > 0
      ? ((recentAvg - earlierAvg) / earlierAvg) * 100
      : null;

    const earlierSessions = pastInRange.filter(s => {
      const key = sessionDateKey(s);
      return days.slice(0, half).some(d => d.key === key);
    });
    const recentSessions = pastInRange.filter(s => {
      const key = sessionDateKey(s);
      return days.slice(half).some(d => d.key === key);
    });
    const earlierRate = earlierSessions.length
      ? (earlierSessions.filter(isCompleted).length / earlierSessions.length) * 100
      : null;
    const recentRate = recentSessions.length
      ? (recentSessions.filter(isCompleted).length / recentSessions.length) * 100
      : null;
    const completionChange = earlierRate != null && recentRate != null
      ? recentRate - earlierRate
      : null;

    const avgHours = average(activeDays.filter(d => d.hours > 0).map(d => d.hours));
    const completedCount = pastInRange.filter(isCompleted).length;
    const completionRate = pastInRange.length
      ? Math.round((completedCount / pastInRange.length) * 100)
      : 0;
    const longestFast = pastInRange.reduce((max, s) => Math.max(max, hoursFasted(s)), 0);
    const streak = streakDays(days);

    const observations: string[] = [];
    if (pastInRange.length === 0) {
      // empty state handles this
    } else {
      if (hoursChange != null && hoursChange > 10) {
        observations.push('Your daily fasting hours are rising versus the start of this period.');
      } else if (hoursChange != null && hoursChange < -10) {
        observations.push('Your daily fasting hours are lower than earlier in this period.');
      } else if (activeDays.length >= 2) {
        observations.push('Your daily fasting hours are holding steady across this period.');
      }

      if (completionRate >= 70) {
        observations.push(`You finished ${completionRate}% of your goals — strong follow-through.`);
      } else if (outcomeCounts.endedEarly > outcomeCounts.completed) {
        observations.push('Most fasts ended before the goal — a shorter plan may fit your rhythm better.');
      }

      if (outcomeCounts.notEnded > 0) {
        observations.push(
          `${outcomeCounts.notEnded} fast${outcomeCounts.notEnded === 1 ? ' was' : 's were'} never ended in the app, so ${outcomeCounts.notEnded === 1 ? 'its' : 'their'} hours aren’t counted.`,
        );
      }

      if (streak >= 3) {
        observations.push(`${streak}-day streak of logging a fast — consistency is building.`);
      }

      if (longestFast >= 16) {
        observations.push(`Longest fast in this window: ${formatHours(longestFast)}.`);
      } else if (longestFast > 0 && longestFast < 12) {
        observations.push('Most fasts stayed under 12 hours — try stretching one window when you feel ready.');
      }
    }

    return {
      days,
      activeDays,
      avgHours,
      completionRate,
      streak,
      longestFast,
      hoursChange,
      completionChange,
      observations: observations.slice(0, 3),
      outcomeCounts,
      avgStart,
      avgEnd,
    };
  }, [sessions, range]);

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/40 p-4 shadow-lg" data-testid="fasting-trends-card">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-700" />
          Fasting Trends Observed
        </h3>
        <div className="flex shrink-0 rounded-md bg-amber-200/70 p-0.5" role="group" aria-label="Trend range">
          {([7, 30] as const).map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`shrink-0 whitespace-nowrap rounded-md px-3 py-1 text-xs font-semibold ${range === option ? 'bg-orange-700 on-color' : 'bg-amber-100 text-gray-800'}`}
              aria-pressed={range === option}
              data-testid={`button-fasting-trends-${option}d`}
            >
              {option} days
            </button>
          ))}
        </div>
      </div>

      {activeDays.length === 0 ? (
        <p className="text-sm text-gray-700 bg-white/60 rounded-lg p-3" data-testid="text-fasting-trends-empty">
          Complete a few fasting sessions to see duration trends and patterns here.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-gray-900">Hours fasted per day</p>
            <div className="flex items-center gap-3 text-[11px] text-gray-700" aria-hidden>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COMPLETED_COLOR }} />
                Completed
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: EARLY_COLOR }} />
                Ended early
              </span>
            </div>
          </div>
          <div className="h-40 -ml-2" data-testid="chart-fasting-trend">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false} interval={range === 7 ? 0 : 4} />
                <YAxis tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false} width={32} />
                <Tooltip
                  cursor={{ fill: 'rgba(251, 191, 36, 0.2)' }}
                  formatter={(value: number, name: string) => [`${value}h`, name]}
                  labelFormatter={(label: string) => label}
                />
                <Bar dataKey="completedHours" name="Completed" stackId="fast" fill={COMPLETED_COLOR} />
                <Bar dataKey="earlyHours" name="Ended early" stackId="fast" fill={EARLY_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3" data-testid="fasting-outcome-counts">
            {[
              { label: 'Completed', hint: 'Reached the goal', value: outcomeCounts.completed, className: 'bg-green-100 text-green-900' },
              { label: 'Ended early', hint: 'Stopped before goal', value: outcomeCounts.endedEarly, className: 'bg-orange-100 text-orange-900' },
              { label: 'Not ended', hint: 'No end recorded', value: outcomeCounts.notEnded, className: 'bg-gray-100 text-gray-800' },
            ].map(item => (
              <div key={item.label} className={`rounded-lg p-2 text-center ${item.className}`}>
                <div className="text-base font-bold tabular-nums">{item.value}</div>
                <div className="text-[11px] font-semibold leading-tight">{item.label}</div>
                <div className="text-[10px] leading-tight opacity-80">{item.hint}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-gray-900">Start and end times</p>
            <div className="flex items-center gap-3 text-[11px] text-gray-700" aria-hidden>
              <span className="inline-flex items-center gap-1">
                <span className="h-0.5 w-3 rounded" style={{ background: START_COLOR }} />
                Started
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-0.5 w-3 rounded" style={{ background: END_COLOR }} />
                Ended
              </span>
            </div>
          </div>
          <div className="h-44 -ml-2" data-testid="chart-fasting-times">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false} interval={range === 7 ? 0 : 4} />
                <YAxis
                  domain={[0, 24]}
                  ticks={[0, 6, 12, 18, 24]}
                  tickFormatter={(value: number) => formatClock(value, true)}
                  tick={{ fontSize: 10, fill: '#374151' }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip
                  cursor={{ stroke: 'rgba(251, 191, 36, 0.6)' }}
                  formatter={(value: number, name: string) => [formatClock(value), name]}
                  labelFormatter={(label: string) => label}
                />
                <Line type="monotone" dataKey="startClock" name="Started" stroke={START_COLOR} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="endClock" name="Ended" stroke={END_COLOR} strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2" data-testid="fasting-average-times">
            <div className="rounded-lg bg-violet-100 p-2 text-center text-violet-900">
              <div className="text-base font-bold tabular-nums">{formatClock(avgStart)}</div>
              <div className="text-[11px] font-semibold leading-tight">Usual start</div>
            </div>
            <div className="rounded-lg bg-teal-100 p-2 text-center text-teal-900">
              <div className="text-base font-bold tabular-nums">{formatClock(avgEnd)}</div>
              <div className="text-[11px] font-semibold leading-tight">Usual end</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-4 mt-2">
            {[
              { label: 'Avg / fasting day', value: formatHours(avgHours) },
              { label: 'Days with a fast', value: `${activeDays.length}/${range}` },
              { label: 'Goals completed', value: `${completionRate}%` },
              { label: 'Current streak', value: streak ? `${streak}d` : '—' },
            ].map(stat => (
              <div key={stat.label} className="text-center p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
                <div className="text-sm font-bold text-gray-900">{stat.value}</div>
                <div className="text-[11px] leading-tight text-gray-800">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-3 text-sm text-gray-800">
            <span className="inline-flex items-center gap-1">
              Hours trend <TrendArrow change={hoursChange} />
            </span>
            <span className="inline-flex items-center gap-1">
              Completion <TrendArrow change={completionChange} />
            </span>
            {longestFast > 0 && (
              <span className="text-xs text-gray-700">Longest: {formatHours(longestFast)}</span>
            )}
          </div>

          {observations.length > 0 && (
            <ul className="space-y-2" data-testid="list-fasting-observations">
              {observations.map((note, index) => (
                <li key={index} className="text-sm text-gray-800 bg-white/60 rounded-lg px-3 py-2">
                  {note}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-gray-600 mt-2">
            Bars show hours fasted on the day each fast started; the time lines show that day’s longest fast. A fast is completed when it reaches the plan’s goal. Arrows compare the second half of the period with the first.
          </p>
        </>
      )}
    </Card>
  );
}
