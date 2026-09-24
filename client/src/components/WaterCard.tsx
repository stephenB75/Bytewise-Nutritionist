import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Droplets, Minus, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getLocalDateKey } from '@/utils/dateUtils';
import { apiFetch } from '@/lib/apiUrl';

const WATER_HISTORY_KEY = 'waterHistoryByDate';
const DAILY_GOAL = 8;
const HISTORY_DAYS = 30;

type WaterDay = { date: string; glasses: number };

function calendarDateKey(value: unknown): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const parsed = value ? new Date(String(value)) : new Date();
  if (Number.isNaN(parsed.getTime())) {
    return getLocalDateKey();
  }
  return getLocalDateKey(parsed);
}

function readLocalWaterHistory(todayGlasses: number): WaterDay[] {
  const byDate: Record<string, number> = {};
  try {
    Object.assign(byDate, JSON.parse(localStorage.getItem(WATER_HISTORY_KEY) || '{}'));
  } catch {
    // Keep an empty map if storage is corrupt.
  }
  byDate[getLocalDateKey()] = todayGlasses;
  return Object.entries(byDate).map(([date, glasses]) => ({
    date,
    glasses: Number(glasses) || 0,
  }));
}

export function clampWaterGlasses(glasses: number): number {
  return Math.max(0, Math.min(DAILY_GOAL, Math.round(Number(glasses) || 0)));
}

/** Today's glasses from the date-keyed local log, so the count resets at local midnight. */
export function readLocalWaterGlasses(): number {
  try {
    const byDate = JSON.parse(localStorage.getItem(WATER_HISTORY_KEY) || '{}');
    return clampWaterGlasses(byDate[getLocalDateKey()] ?? 0);
  } catch {
    return 0;
  }
}

export function writeLocalWaterGlasses(glasses: number): void {
  const today = getLocalDateKey();
  const value = clampWaterGlasses(glasses);
  try {
    const byDate = JSON.parse(localStorage.getItem(WATER_HISTORY_KEY) || '{}');
    byDate[today] = value;
    // Keep the log bounded to the calendar window.
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - HISTORY_DAYS * 2);
    const cutoffKey = getLocalDateKey(cutoff);
    for (const key of Object.keys(byDate)) {
      if (key < cutoffKey) delete byDate[key];
    }
    localStorage.setItem(WATER_HISTORY_KEY, JSON.stringify(byDate));

    const daily = JSON.parse(localStorage.getItem('dailyStats') || '{}');
    localStorage.setItem('dailyStats', JSON.stringify({ ...daily, waterGlasses: value, date: today }));
  } catch {
    // localStorage may be unavailable.
  }
}

function mergeHistory(rows: WaterDay[], todayGlasses: number): WaterDay[] {
  const byDate = new Map<string, number>();
  for (const row of rows) {
    if (!row.date) continue;
    byDate.set(row.date, Number(row.glasses) || 0);
  }
  byDate.set(getLocalDateKey(), todayGlasses);
  return Array.from(byDate.entries()).map(([date, glasses]) => ({ date, glasses }));
}

function buildCalendarCells(days: number) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - (days - 1));

  const cells: Array<{ key: string; dateStr: string; day: number; isToday: boolean; empty: boolean }> = [];
  for (let i = 0; i < start.getDay(); i++) {
    cells.push({ key: `pad-start-${i}`, dateStr: '', day: 0, isToday: false, empty: true });
  }

  const todayKey = getLocalDateKey(today);
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateStr = getLocalDateKey(date);
    cells.push({
      key: dateStr,
      dateStr,
      day: date.getDate(),
      isToday: dateStr === todayKey,
      empty: false,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `pad-end-${cells.length}`, dateStr: '', day: 0, isToday: false, empty: true });
  }

  return cells;
}

const FETCH_TIMEOUT_MS = 5000;

async function fetchWaterHistoryFromApi(token: string): Promise<WaterDay[]> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await apiFetch(`/api/water-history?days=${HISTORY_DAYS}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Water history request failed: ${response.status}`);
    }

    const result = await response.json();
    return (result.data || []).map((item: { date?: string; glasses?: number }) => ({
      date: calendarDateKey(item.date),
      glasses: Number(item.glasses) || 0,
    }));
  } finally {
    window.clearTimeout(timeout);
  }
}

export const WaterCard = React.memo(function WaterCard({
  glasses,
  onIncrement,
  onDecrement,
}: {
  glasses: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const [waterHistory, setWaterHistory] = useState<WaterDay[]>(() => readLocalWaterHistory(glasses));
  const [isSyncingHistory, setIsSyncingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const handleRefresh = () => setRefreshTick((tick) => tick + 1);
    window.addEventListener('app-data-refresh', handleRefresh);
    return () => window.removeEventListener('app-data-refresh', handleRefresh);
  }, []);

  const toggleHistory = () => {
    setShowHistory((open) => !open);
  };

  const percentage = Math.min((glasses / DAILY_GOAL) * 100, 100);
  const isGoalReached = glasses >= DAILY_GOAL;
  const calendarCells = useMemo(() => buildCalendarCells(HISTORY_DAYS), [showHistory]);

  const historyByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of waterHistory) {
      map.set(row.date, row.glasses);
    }
    map.set(getLocalDateKey(), glasses);
    return map;
  }, [waterHistory, glasses]);

  useEffect(() => {
    setWaterHistory(readLocalWaterHistory(glasses));
  }, [glasses]);

  useEffect(() => {
    if (!showHistory) return;

    let cancelled = false;
    const localHistory = readLocalWaterHistory(glasses);
    setWaterHistory(localHistory);

    const syncHistory = async () => {
      setIsSyncingHistory(true);
      try {
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise<undefined>((resolve) => window.setTimeout(() => resolve(undefined), 3000)),
        ]);

        const token = sessionResult?.data?.session?.access_token;
        if (!token || token.split('.').length !== 3) {
          return;
        }

        const remoteHistory = await fetchWaterHistoryFromApi(token);
        if (!cancelled) {
          setWaterHistory(mergeHistory(remoteHistory, glasses));
        }
      } catch {
        if (!cancelled) {
          setWaterHistory(localHistory);
        }
      } finally {
        if (!cancelled) {
          setIsSyncingHistory(false);
        }
      }
    };

    void syncHistory();

    return () => {
      cancelled = true;
    };
  }, [showHistory, glasses, refreshTick]);

  const filledDays = calendarCells.filter((cell) => !cell.empty);
  const totalGlasses = filledDays.reduce((sum, cell) => sum + (historyByDate.get(cell.dateStr) || 0), 0);
  const goalDays = filledDays.filter((cell) => (historyByDate.get(cell.dateStr) || 0) >= DAILY_GOAL).length;
  const averageGlasses = Math.round(totalGlasses / Math.max(filledDays.length, 1));

  return (
    <Card className="bg-gradient-to-br from-amber-100 to-cyan-100 border-none p-6 transition-all duration-300 hover:from-amber-100 hover:to-cyan-200 shadow-lg hover:shadow-xl" data-testid="water-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl transition-all duration-300 ${isGoalReached ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-cyan-500/30'}`}>
            <Droplets className={`w-6 h-6 transition-colors duration-300 ${isGoalReached ? 'text-gray-900' : 'text-cyan-700'}`} />
          </div>
          <div>
            <h3 className="text-gray-900 font-medium text-lg">Water Intake</h3>
            <p className="text-gray-900 text-sm font-medium">{glasses}/{DAILY_GOAL} glasses today</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-medium text-gray-900">{Math.round(percentage)}%</div>
          <div className="text-xs text-gray-900 font-normal">of goal</div>
        </div>
      </div>

      <div className="relative h-3 bg-gray-300/60 rounded-full overflow-hidden mb-4 shadow-inner border border-gray-400/20">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-600 to-blue-700 rounded-full transition-all duration-1000 shadow-sm"
          style={{ width: `${percentage}%` }}
        />
        {percentage >= 100 && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-sm" />
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {Array.from({ length: DAILY_GOAL }, (_, i) => (
            <div
              key={i}
              className={`w-4 h-6 rounded-sm transition-all duration-300 ${
                i < glasses ? 'bg-cyan-400' : 'bg-gray-300'
              }`}
              style={{
                background: i < glasses
                  ? 'linear-gradient(to top, #06b6d4 0%, #0891b2 100%)'
                  : '#d1d5db',
              }}
            />
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={onDecrement}
            disabled={glasses <= 0}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-cyan-600 hover:text-cyan-500 hover:bg-cyan-500/10 disabled:opacity-50 shadow-lg hover:shadow-xl transition-shadow duration-200"
            data-testid="button-decrement-water"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            onClick={onIncrement}
            disabled={glasses >= DAILY_GOAL}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-cyan-600 hover:text-cyan-500 hover:bg-cyan-500/10 disabled:opacity-50 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-cyan-500/50 hover:border-cyan-500/70 disabled:hover:bg-transparent"
            data-testid="button-increment-water"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-400/20">
        <Button
          onClick={toggleHistory}
          variant="ghost"
          size="sm"
          className="w-full text-gray-700 hover:text-cyan-600 hover:bg-cyan-500/10 font-medium"
          data-testid="button-toggle-water-history"
        >
          {showHistory ? 'Hide' : 'Show'} 30-Day Log
          {showHistory ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>

        {showHistory && (
          <div className="mt-4 space-y-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-sm font-semibold text-gray-800">Last 30 Days Water Intake</h4>
                {isSyncingHistory && (
                  <span className="text-xs text-gray-500">Syncing…</span>
                )}
              </div>

              <div className="grid grid-cols-7 gap-1 text-xs">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-gray-500 font-medium py-1">
                      {day}
                    </div>
                  ))}

                  {calendarCells.map((cell) => {
                    if (cell.empty) {
                      return <div key={cell.key} className="aspect-square min-h-[40px]" />;
                    }

                    const glassesOnDay = historyByDate.get(cell.dateStr) || 0;
                    return (
                      <div
                        key={cell.key}
                        className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 min-h-[40px] ${
                          cell.isToday
                            ? 'ring-2 ring-cyan-500 bg-cyan-50 text-cyan-900'
                            : glassesOnDay >= DAILY_GOAL
                              ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white'
                              : glassesOnDay > 0
                                ? 'bg-cyan-200 text-gray-800'
                                : 'bg-gray-100 text-gray-400'
                        }`}
                        title={`${cell.dateStr}: ${glassesOnDay} glasses`}
                      >
                        <div className="text-xs">{cell.day}</div>
                        <div className="text-xs font-bold">{glassesOnDay}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 bg-cyan-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-cyan-700">{goalDays}</div>
                      <div className="text-xs text-gray-600">Goal Days</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-cyan-700">{averageGlasses}</div>
                      <div className="text-xs text-gray-600">Avg/Day</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-cyan-700">{totalGlasses}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        )}
      </div>
    </Card>
  );
});
