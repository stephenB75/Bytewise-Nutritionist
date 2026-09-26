import { useMemo, useState } from 'react';
import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDown, ArrowRight, ArrowUp, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getLocalDateKey } from '@/utils/dateUtils';

type TrendMeal = {
  date?: string;
  calories?: number;
  totalCalories?: number;
  iron?: number;
  calcium?: number;
  zinc?: number;
  magnesium?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminB12?: number;
  folate?: number;
};

type MicroKey = 'vitaminC' | 'vitaminD' | 'vitaminB12' | 'folate' | 'iron' | 'calcium' | 'zinc' | 'magnesium';

// Same daily values as the Essential Micronutrients cards.
const MICROS: { key: MicroKey; label: string; goal: number; unit: string }[] = [
  { key: 'vitaminC', label: 'Vitamin C', goal: 90, unit: 'mg' },
  { key: 'vitaminD', label: 'Vitamin D', goal: 20, unit: 'μg' },
  { key: 'vitaminB12', label: 'Vitamin B12', goal: 2.4, unit: 'μg' },
  { key: 'folate', label: 'Folate', goal: 400, unit: 'μg' },
  { key: 'iron', label: 'Iron', goal: 18, unit: 'mg' },
  { key: 'calcium', label: 'Calcium', goal: 1000, unit: 'mg' },
  { key: 'zinc', label: 'Zinc', goal: 11, unit: 'mg' },
  { key: 'magnesium', label: 'Magnesium', goal: 400, unit: 'mg' },
];

type DayTotals = { key: string; label: string; calories: number; logged: boolean } & Record<MicroKey, number>;

function mealDateKey(meal: TrendMeal): string {
  const date = meal.date || '';
  return date.includes('T') ? date.split('T')[0] : date;
}

function buildDays(meals: TrendMeal[], range: number): DayTotals[] {
  const byDay = new Map<string, TrendMeal[]>();
  for (const meal of meals) {
    const key = mealDateKey(meal);
    if (!key) continue;
    byDay.set(key, [...(byDay.get(key) || []), meal]);
  }

  const days: DayTotals[] = [];
  for (let offset = range - 1; offset >= 0; offset--) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const key = getLocalDateKey(date);
    const dayMeals = byDay.get(key) || [];
    const sum = (pick: (m: TrendMeal) => number | undefined) =>
      dayMeals.reduce((total, meal) => total + (Number(pick(meal)) || 0), 0);

    const day = {
      key,
      label: range <= 7
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      calories: Math.round(sum(m => m.calories ?? m.totalCalories)),
      logged: dayMeals.length > 0,
    } as DayTotals;
    for (const micro of MICROS) day[micro.key] = sum(m => m[micro.key]);
    days.push(day);
  }
  return days;
}

function average(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function TrendArrow({ change }: { change: number | null }) {
  if (change === null) return <span className="w-4" />;
  if (change > 10) return <ArrowUp className="h-4 w-4 text-green-700" aria-label="Trending up" />;
  if (change < -10) return <ArrowDown className="h-4 w-4 text-red-700" aria-label="Trending down" />;
  return <ArrowRight className="h-4 w-4 text-gray-600" aria-label="Steady" />;
}

export function NutritionTrendsCard({ meals, calorieGoal }: { meals: TrendMeal[]; calorieGoal: number }) {
  const [range, setRange] = useState<7 | 30>(7);

  const { days, loggedDays, avgCalories, daysOnTarget, micros } = useMemo(() => {
    const days = buildDays(meals, range);
    const loggedDays = days.filter(d => d.logged);
    const half = Math.floor(days.length / 2);
    const earlier = days.slice(0, half).filter(d => d.logged);
    const recent = days.slice(half).filter(d => d.logged);

    const micros = MICROS.map(micro => {
      const avg = average(loggedDays.map(d => d[micro.key]));
      const earlierAvg = average(earlier.map(d => d[micro.key]));
      const recentAvg = average(recent.map(d => d[micro.key]));
      const change = earlier.length && recent.length && earlierAvg > 0
        ? ((recentAvg - earlierAvg) / earlierAvg) * 100
        : null;
      return { ...micro, avg, percent: Math.round((avg / micro.goal) * 100), change };
    });

    return {
      days,
      loggedDays,
      avgCalories: Math.round(average(loggedDays.map(d => d.calories))),
      daysOnTarget: loggedDays.filter(d => Math.abs(d.calories - calorieGoal) <= calorieGoal * 0.1).length,
      micros,
    };
  }, [meals, range, calorieGoal]);

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/40 p-4 shadow-lg" data-testid="nutrition-trends-card">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-700" />
          Nutrition Trends
        </h3>
        <div className="flex rounded-full bg-amber-200/70 p-0.5" role="group" aria-label="Trend range">
          {([7, 30] as const).map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${range === option ? 'bg-orange-700 on-color' : 'bg-amber-100 text-gray-800'}`}
              aria-pressed={range === option}
              data-testid={`button-trends-${option}d`}
            >
              {option} days
            </button>
          ))}
        </div>
      </div>

      {loggedDays.length === 0 ? (
        <p className="text-sm text-gray-700 bg-white/60 rounded-lg p-3" data-testid="text-trends-empty">
          Log meals on a few days to see your calorie and micronutrient trends here.
        </p>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-900 mb-1">Calories per day</p>
          <div className="h-40 -ml-2" data-testid="chart-calorie-trend">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false} interval={range === 7 ? 0 : 4} />
                <YAxis tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false} width={36} />
                <Tooltip
                  cursor={{ fill: 'rgba(251, 191, 36, 0.2)' }}
                  formatter={(value: number) => [`${value} kcal`, 'Calories']}
                  labelFormatter={(label: string) => label}
                />
                <ReferenceLine y={calorieGoal} stroke="#c2410c" strokeDasharray="4 3" />
                <Bar dataKey="calories" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-600 mb-3">Dashed line is your {calorieGoal} kcal goal.</p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Avg / logged day', value: `${avgCalories}` },
              { label: 'Days logged', value: `${loggedDays.length}/${range}` },
              { label: 'Near goal (±10%)', value: `${daysOnTarget}` },
            ].map(stat => (
              <div key={stat.label} className="text-center p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
                <div className="text-sm font-bold text-gray-900">{stat.value}</div>
                <div className="text-[11px] leading-tight text-gray-800">{stat.label}</div>
              </div>
            ))}
          </div>

          <p className="text-sm font-semibold text-gray-900 mb-2">Micronutrients (daily average, % of daily value)</p>
          <ul className="space-y-2" data-testid="list-micronutrient-trends">
            {micros.map(micro => {
              const barColor = micro.percent >= 100 ? 'bg-green-600' : micro.percent >= 50 ? 'bg-amber-500' : 'bg-red-500';
              return (
                <li key={micro.key} className="flex items-center gap-2 text-sm">
                  <span className="w-24 shrink-0 text-gray-900">{micro.label}</span>
                  <div className="h-2.5 flex-1 rounded-full bg-amber-200/80 overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(micro.percent, 100)}%` }} />
                  </div>
                  <span className="w-12 shrink-0 text-right font-medium text-gray-900">{micro.percent}%</span>
                  <TrendArrow change={micro.change} />
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-gray-600 mt-2">
            Averages use only days you logged food. Arrows compare the second half of the period with the first.
          </p>
        </>
      )}
    </Card>
  );
}
