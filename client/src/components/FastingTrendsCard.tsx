import { useMemo, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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
  sessions: number;
  completed: number;
};

function sessionDateKey(session: FastingTrendSession): string {
  const raw = session.completedAt || session.endTime || session.startTime || session.createdAt || '';
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return String(raw).includes('T') ? String(raw).split('T')[0] : String(raw);
  }
  return getLocalDateKey(date);
}

function hoursFasted(session: FastingTrendSession): number {
  if (session.actualHoursFasted != null && Number.isFinite(session.actualHoursFasted)) {
    return Math.max(0, Number(session.actualHoursFasted));
  }
  if (session.actualDuration != null && Number.isFinite(session.actualDuration)) {
    return Math.max(0, Number(session.actualDuration) / (1000 * 60 * 60));
  }
  return 0;
}

function isCompleted(session: FastingTrendSession): boolean {
  return session.wasCompleted === true || String(session.status || '').toLowerCase() === 'completed';
}

function isPastSession(session: FastingTrendSession): boolean {
  return String(session.status || '').toLowerCase() !== 'active';
}

function average(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
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
    days.push({
      key,
      label: range <= 7
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      hours: Math.round(daySessions.reduce((sum, s) => sum + hoursFasted(s), 0) * 10) / 10,
      sessions: daySessions.length,
      completed: daySessions.filter(isCompleted).length,
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

  const { days, activeDays, avgHours, completionRate, streak, longestFast, hoursChange, completionChange, observations } = useMemo(() => {
    const days = buildDays(sessions, range);
    const activeDays = days.filter(d => d.sessions > 0);
    const pastInRange = sessions.filter(s => {
      if (!isPastSession(s)) return false;
      const key = sessionDateKey(s);
      return key && days.some(d => d.key === key);
    });

    const half = Math.floor(days.length / 2);
    const earlier = days.slice(0, half).filter(d => d.sessions > 0);
    const recent = days.slice(half).filter(d => d.sessions > 0);
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

    const avgHours = average(activeDays.map(d => d.hours));
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
      } else if (completionRate > 0 && completionRate < 50) {
        observations.push('Many sessions ended early — shorter plans may fit your rhythm better.');
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
          <p className="text-sm font-semibold text-gray-900 mb-1">Hours fasted per day</p>
          <div className="h-40 -ml-2" data-testid="chart-fasting-trend">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false} interval={range === 7 ? 0 : 4} />
                <YAxis tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false} width={32} />
                <Tooltip
                  cursor={{ fill: 'rgba(251, 191, 36, 0.2)' }}
                  formatter={(value: number) => [`${value}h`, 'Hours fasted']}
                  labelFormatter={(label: string) => label}
                />
                <Bar dataKey="hours" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-4 mt-3">
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
            Bars total hours ended that day. Arrows compare the second half of the period with the first.
          </p>
        </>
      )}
    </Card>
  );
}
