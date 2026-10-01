import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Droplets, GlassWater, Milk, Minus, Plus, type LucideIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getLocalDateKey } from '@/utils/dateUtils';
import { apiFetch } from '@/lib/apiUrl';

const WATER_HISTORY_KEY = 'waterHistoryByDate';
const CONTAINER_KEY = 'waterContainerOz';
const DAILY_GOAL = 8;
const HISTORY_DAYS = 30;
// Water is stored as a count of 8 oz glasses, so every container is a whole number of glasses.
const OZ_PER_GLASS = 8;
const GOAL_OZ = DAILY_GOAL * OZ_PER_GLASS;

type WaterContainer = { oz: number; label: string; name: string; Icon: LucideIcon; iconClass: string };

const WATER_CONTAINERS: WaterContainer[] = [
  { oz: 8, label: 'Glass', name: 'glass', Icon: GlassWater, iconClass: 'h-4 w-4' },
  { oz: 16, label: 'Bottle', name: 'bottle', Icon: Milk, iconClass: 'h-4 w-4' },
  { oz: 24, label: 'Large', name: 'large bottle', Icon: Milk, iconClass: 'h-5 w-5' },
  { oz: 32, label: 'XL', name: 'XL bottle', Icon: Milk, iconClass: 'h-6 w-6' },
];

function readContainerOz(): number {
  const saved = Number(localStorage.getItem(CONTAINER_KEY));
  return WATER_CONTAINERS.some((c) => c.oz === saved) ? saved : OZ_PER_GLASS;
}

/** How many of each container (keyed by ounces) were drunk on a day, e.g. { "8": 1, "16": 2 }. */
export type WaterContainers = Record<string, number>;
const WATER_CONTAINERS_KEY = 'waterContainersByDate';

/** Makes a day's breakdown add up to its glass count. */
export function reconcileWaterContainers(containers: WaterContainers | null | undefined, glasses: number): WaterContainers {
  const counts: WaterContainers = {};
  let totalOz = 0;
  for (const { oz } of WATER_CONTAINERS) {
    const count = Math.max(0, Math.floor(Number(containers?.[oz]) || 0));
    if (count > 0) {
      counts[oz] = count;
      totalOz += count * oz;
    }
  }
  const targetOz = clampWaterGlasses(glasses) * OZ_PER_GLASS;
  // Over the total (e.g. a bottle that hit the daily cap): drop the smallest containers first.
  for (const { oz } of WATER_CONTAINERS) {
    while (totalOz > targetOz && counts[oz] > 0) {
      counts[oz] -= 1;
      totalOz -= oz;
    }
    if (counts[oz] === 0) delete counts[oz];
  }
  // Water logged without a container (older entries, other screens) counts as 8 oz glasses.
  if (totalOz < targetOz) {
    counts[OZ_PER_GLASS] = (counts[OZ_PER_GLASS] || 0) + (targetOz - totalOz) / OZ_PER_GLASS;
  }
  return counts;
}

export function changeWaterContainers(
  previous: WaterContainers | null | undefined,
  glassesBefore: number,
  glassesAfter: number,
  containerOz: number,
): WaterContainers {
  const next = reconcileWaterContainers(previous, glassesBefore);
  if (glassesAfter > glassesBefore) {
    next[containerOz] = (next[containerOz] || 0) + 1;
  } else if (glassesAfter < glassesBefore && next[containerOz] > 0) {
    next[containerOz] -= 1;
  }
  return reconcileWaterContainers(next, glassesAfter);
}

function readContainerLog(): Record<string, WaterContainers> {
  try {
    return JSON.parse(localStorage.getItem(WATER_CONTAINERS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function readLocalWaterContainers(dateKey: string = getLocalDateKey()): WaterContainers | null {
  return readContainerLog()[dateKey] ?? null;
}

export function writeLocalWaterContainers(containers: WaterContainers, dateKey: string = getLocalDateKey()): void {
  try {
    const log = readContainerLog();
    log[dateKey] = containers;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - HISTORY_DAYS * 2);
    const cutoffKey = getLocalDateKey(cutoff);
    for (const key of Object.keys(log)) {
      if (key < cutoffKey) delete log[key];
    }
    localStorage.setItem(WATER_CONTAINERS_KEY, JSON.stringify(log));
  } catch {
    // localStorage may be unavailable.
  }
}

function describeContainers(containers: WaterContainers) {
  return WATER_CONTAINERS.filter(({ oz }) => containers[oz] > 0).map((container) => ({
    ...container,
    count: containers[container.oz],
  }));
}

type WaterDay = { date: string; glasses: number; containers?: WaterContainers | null };

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
  const containerLog = readContainerLog();
  return Object.entries(byDate).map(([date, glasses]) => ({
    date,
    glasses: Number(glasses) || 0,
    containers: containerLog[date] ?? null,
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

function mergeHistory(rows: WaterDay[], localRows: WaterDay[], todayGlasses: number): WaterDay[] {
  const byDate = new Map<string, WaterDay>();
  for (const row of rows) {
    if (!row.date) continue;
    byDate.set(row.date, { date: row.date, glasses: Number(row.glasses) || 0, containers: row.containers ?? null });
  }
  // Days saved before the server kept a breakdown can still use this device's record of it.
  for (const local of localRows) {
    const remote = byDate.get(local.date);
    if (remote && !remote.containers && local.containers) remote.containers = local.containers;
  }
  const today = getLocalDateKey();
  byDate.set(today, {
    date: today,
    glasses: todayGlasses,
    containers: readLocalWaterContainers(today) ?? byDate.get(today)?.containers ?? null,
  });
  return Array.from(byDate.values());
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
    return (result.data || []).map((item: { date?: string; glasses?: number; containers?: WaterContainers | null }) => ({
      date: calendarDateKey(item.date),
      glasses: Number(item.glasses) || 0,
      containers: item.containers ?? null,
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
  onIncrement: (glasses: number, containerOz: number) => void;
  onDecrement: (glasses: number, containerOz: number) => void;
}) {
  const [containerOz, setContainerOz] = useState(readContainerOz);
  const container = WATER_CONTAINERS.find((c) => c.oz === containerOz) ?? WATER_CONTAINERS[0];
  const containerGlasses = container.oz / OZ_PER_GLASS;
  // Local write lands before parent state; use the higher count so + fills a bar immediately.
  const displayGlasses = Math.max(clampWaterGlasses(glasses), readLocalWaterGlasses());
  const barCount = Math.max(1, Math.ceil(GOAL_OZ / container.oz));
  const filledBars = (displayGlasses * OZ_PER_GLASS) / container.oz;
  const selectContainer = (oz: number) => {
    setContainerOz(oz);
    try {
      localStorage.setItem(CONTAINER_KEY, String(oz));
    } catch {
      // localStorage may be unavailable.
    }
  };
  const [waterHistory, setWaterHistory] = useState<WaterDay[]>(() => readLocalWaterHistory(glasses));
  const [isSyncingHistory, setIsSyncingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [fillTick, setFillTick] = useState(0);
  const bumpFill = () => setFillTick((tick) => tick + 1);

  useEffect(() => {
    const handleRefresh = () => setRefreshTick((tick) => tick + 1);
    window.addEventListener('app-data-refresh', handleRefresh);
    return () => window.removeEventListener('app-data-refresh', handleRefresh);
  }, []);

  const toggleHistory = () => {
    setShowHistory((open) => !open);
  };

  const percentage = Math.min((displayGlasses / DAILY_GOAL) * 100, 100);
  const isGoalReached = displayGlasses >= DAILY_GOAL;
  const calendarCells = useMemo(() => buildCalendarCells(HISTORY_DAYS), [showHistory]);

  const historyByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of waterHistory) {
      map.set(row.date, row.glasses);
    }
    map.set(getLocalDateKey(), displayGlasses);
    return map;
  }, [waterHistory, glasses, displayGlasses, fillTick]);

  const [selectedDate, setSelectedDate] = useState(getLocalDateKey);
  const selectedGlasses = historyByDate.get(selectedDate) || 0;
  const selectedContainers = useMemo(() => {
    const row = waterHistory.find((day) => day.date === selectedDate);
    const logged = selectedDate === getLocalDateKey() ? readLocalWaterContainers(selectedDate) ?? row?.containers : row?.containers;
    return describeContainers(reconcileWaterContainers(logged, selectedGlasses));
  }, [waterHistory, selectedDate, selectedGlasses]);

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
          setWaterHistory(mergeHistory(remoteHistory, localHistory, glasses));
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
            <p className="text-gray-900 text-sm font-medium">
              {displayGlasses * OZ_PER_GLASS}/{GOAL_OZ} oz today
            </p>
            <p className="text-gray-700 text-xs">1 bar = {container.oz} oz ({container.label})</p>
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

      <div className="grid grid-cols-4 gap-2 mb-4" role="radiogroup" aria-label="Container size">
        {WATER_CONTAINERS.map((option) => {
          const selected = option.oz === container.oz;
          return (
            <button
              key={option.oz}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => selectContainer(option.oz)}
              className={`flex flex-col items-center justify-end gap-0.5 rounded-lg ring-1 px-1 py-1.5 text-[11px] font-medium transition-colors ${
                selected
                  ? 'bg-cyan-600 ring-cyan-700 on-color shadow-sm'
                  : 'bg-white/70 ring-cyan-200 text-gray-800 hover:bg-cyan-50'
              }`}
              data-testid={`water-container-${option.oz}`}
            >
              <option.Icon className={`${option.iconClass} ${selected ? '' : 'text-cyan-700'}`} />
              <span>{option.label}</span>
              <span className={selected ? '' : 'text-gray-600'}>{option.oz} oz</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-end gap-1.5" data-testid="water-bars" aria-label={`${barCount} bars, 1 bar is ${container.oz} ounces`}>
            {Array.from({ length: barCount }, (_, i) => {
              const fill = Math.min(1, Math.max(0, filledBars - i));
              const fillPercent = Math.round(fill * 100);
              return (
                <div
                  key={`${container.oz}-${i}`}
                  className="rounded-sm shadow-inner transition-all duration-300"
                  style={{
                    width: barCount <= 2 ? 22 : barCount <= 4 ? 18 : 16,
                    height: barCount <= 4 ? 36 : 24,
                    background: fill <= 0
                      ? '#d1d5db'
                      : fill >= 1
                        ? 'linear-gradient(to top, #06b6d4 0%, #0891b2 100%)'
                        : `linear-gradient(to top, #06b6d4 0%, #0891b2 ${fillPercent}%, #d1d5db ${fillPercent}%)`,
                  }}
                  title={`${container.oz} oz`}
                  data-testid={`water-bar-${i}`}
                  data-fill={fillPercent}
                />
              );
            })}
          </div>
          <p className="mt-1 text-[11px] font-medium text-gray-700">
            1 bar = {container.oz} oz
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
              onDecrement(containerGlasses, container.oz);
              bumpFill();
            }}
            disabled={displayGlasses <= 0}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-cyan-600 hover:text-cyan-500 hover:bg-cyan-500/10 disabled:opacity-50 shadow-lg hover:shadow-xl transition-shadow duration-200"
            aria-label={`Remove ${container.oz} oz`}
            data-testid="button-decrement-water"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => {
              onIncrement(containerGlasses, container.oz);
              bumpFill();
            }}
            disabled={displayGlasses >= DAILY_GOAL}
            size="sm"
            variant="ghost"
            className="h-8 px-2 gap-1 text-cyan-700 hover:text-cyan-600 hover:bg-cyan-500/10 disabled:opacity-50 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-cyan-500/50 hover:border-cyan-500/70 disabled:hover:bg-[transparent]"
            aria-label={`Add ${container.oz} oz`}
            data-testid="button-increment-water"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-semibold">{container.oz} oz</span>
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
                    const isSelected = cell.dateStr === selectedDate;
                    return (
                      <button
                        key={cell.key}
                        type="button"
                        onClick={() => setSelectedDate(cell.dateStr)}
                        aria-pressed={isSelected}
                        className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 min-h-[40px] p-0 ${
                          isSelected
                            ? 'ring-2 ring-orange-500 ring-offset-1'
                            : cell.isToday
                              ? 'ring-2 ring-cyan-500'
                              : ''
                        } ${
                          glassesOnDay >= DAILY_GOAL
                            ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white'
                            : glassesOnDay > 0
                              ? 'bg-cyan-200 text-gray-800'
                              : cell.isToday
                                ? 'bg-cyan-50 text-cyan-900'
                                : 'bg-gray-100 text-gray-400'
                        }`}
                        title={`${cell.dateStr}: ${glassesOnDay * OZ_PER_GLASS} oz`}
                        data-testid={`water-day-${cell.dateStr}`}
                      >
                        <span className="text-xs">{cell.day}</span>
                        <span className="text-[11px] font-bold leading-none">
                          {glassesOnDay > 0 ? `${glassesOnDay * OZ_PER_GLASS}oz` : '–'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 rounded-lg bg-white/80 p-3 ring-1 ring-cyan-200" data-testid="water-day-detail">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedDate === getLocalDateKey()
                        ? 'Today'
                        : new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm font-bold text-cyan-700">{selectedGlasses * OZ_PER_GLASS} oz</p>
                  </div>
                  {selectedContainers.length > 0 ? (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {selectedContainers.map(({ oz, name, Icon, count }) => (
                        <li
                          key={oz}
                          className="flex items-center gap-1.5 rounded-md bg-cyan-50 px-2.5 py-1 text-xs font-medium text-gray-800 ring-1 ring-cyan-200 whitespace-nowrap"
                        >
                          <Icon className="h-3.5 w-3.5 text-cyan-700" />
                          {count} × {name} ({oz} oz)
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-xs text-gray-600">No water logged. Tap a day to see what you drank.</p>
                  )}
                </div>

                <div className="mt-4 p-3 bg-cyan-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-cyan-700">{goalDays}</div>
                      <div className="text-xs text-gray-600">Goal Days</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-cyan-700">{averageGlasses * OZ_PER_GLASS} oz</div>
                      <div className="text-xs text-gray-600">Avg/Day</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-cyan-700">{totalGlasses * OZ_PER_GLASS} oz</div>
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
