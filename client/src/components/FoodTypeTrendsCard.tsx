import { useMemo } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Coffee, Moon, PieChart, Sun, Sunrise, Utensils } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getLocalDateKey, getMealDateKey, getWeekDates } from '@/utils/dateUtils';

type TrendMeal = {
  date?: string;
  mealType?: string;
  calories?: number;
  totalCalories?: number;
};

type MealBucket = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

const BUCKETS: Array<{
  key: MealBucket;
  label: string;
  color: string;
  fill: string;
  Icon: typeof Sunrise;
}> = [
  { key: 'breakfast', label: 'Breakfast', color: 'text-amber-700', fill: '#f59e0b', Icon: Sunrise },
  { key: 'lunch', label: 'Lunch', color: 'text-orange-700', fill: '#ea580c', Icon: Sun },
  { key: 'dinner', label: 'Dinner', color: 'text-rose-700', fill: '#e11d48', Icon: Moon },
  { key: 'snack', label: 'Snack', color: 'text-emerald-700', fill: '#059669', Icon: Coffee },
  { key: 'other', label: 'Other', color: 'text-gray-700', fill: '#78716c', Icon: Utensils },
];

function normalizeMealType(raw: unknown): MealBucket {
  const type = String(raw || '').toLowerCase().trim();
  if (type.includes('breakfast') || type === 'brunch') return 'breakfast';
  if (type.includes('lunch')) return 'lunch';
  if (type.includes('dinner') || type.includes('supper')) return 'dinner';
  if (type.includes('snack') || type.includes('dessert')) return 'snack';
  if (!type || type === 'meal') return 'other';
  return 'other';
}

function mealCalories(meal: TrendMeal): number {
  return Number(meal.totalCalories ?? meal.calories) || 0;
}

function isInCurrentWeek(meal: TrendMeal, weekKeys: Set<string>): boolean {
  const key = getMealDateKey(meal.date) || (meal.date?.includes('T') ? meal.date.split('T')[0] : meal.date) || '';
  return !!key && weekKeys.has(key);
}

export function FoodTypeTrendsCard({ meals = [] }: { meals?: TrendMeal[] }) {
  const { chartData, totals, topType, observations } = useMemo(() => {
    const weekKeys = new Set(getWeekDates().map((date) => getLocalDateKey(date)));
    const weekMeals = meals.filter((meal) => isInCurrentWeek(meal, weekKeys));

    const byType = Object.fromEntries(
      BUCKETS.map((bucket) => [bucket.key, { count: 0, calories: 0 }]),
    ) as Record<MealBucket, { count: number; calories: number }>;

    for (const meal of weekMeals) {
      const bucket = normalizeMealType(meal.mealType);
      byType[bucket].count += 1;
      byType[bucket].calories += mealCalories(meal);
    }

    const totalCalories = Object.values(byType).reduce((sum, row) => sum + row.calories, 0);
    const totalCount = Object.values(byType).reduce((sum, row) => sum + row.count, 0);

    const chartData = BUCKETS
      .filter((bucket) => bucket.key !== 'other' || byType.other.count > 0)
      .map((bucket) => {
        const row = byType[bucket.key];
        return {
          key: bucket.key,
          label: bucket.label,
          calories: Math.round(row.calories),
          count: row.count,
          percent: totalCalories > 0 ? Math.round((row.calories / totalCalories) * 100) : 0,
          fill: bucket.fill,
        };
      });

    const ranked = [...chartData].sort((a, b) => b.calories - a.calories);
    const topType = ranked.find((row) => row.calories > 0) || null;

    const observations: string[] = [];
    if (totalCount === 0) {
      // empty state
    } else {
      if (topType) {
        observations.push(
          `${topType.label} makes up ${topType.percent}% of this week's calories (${topType.count} ${topType.count === 1 ? 'entry' : 'entries'}).`,
        );
      }
      const snackShare = chartData.find((row) => row.key === 'snack')?.percent ?? 0;
      if (snackShare >= 30) {
        observations.push('Snacks are a large share of calories — useful if intentional, worth watching if not.');
      }
      const breakfastCount = byType.breakfast.count;
      const daysElapsed = Math.min(7, weekKeys.size);
      if (daysElapsed >= 3 && breakfastCount === 0) {
        observations.push('No breakfast logged this week yet.');
      } else if (breakfastCount > 0 && breakfastCount < Math.ceil(daysElapsed / 2)) {
        observations.push('Breakfast is logged less often than other meal types this week.');
      }
      const dinnerShare = chartData.find((row) => row.key === 'dinner')?.percent ?? 0;
      if (dinnerShare >= 45) {
        observations.push('Dinner carries most of the weekly calories.');
      }
    }

    return {
      chartData,
      totals: { calories: Math.round(totalCalories), count: totalCount },
      topType,
      observations: observations.slice(0, 2),
    };
  }, [meals]);

  return (
    <Card
      className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/40 p-4 shadow-lg"
      data-testid="food-type-trends-card"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-orange-700" />
          Food Type Trends
        </h3>
        {totals.count > 0 && (
          <span className="text-xs font-medium text-gray-700">
            {totals.count} {totals.count === 1 ? 'entry' : 'entries'} · {totals.calories} cal
          </span>
        )}
      </div>

      {totals.count === 0 ? (
        <p className="text-sm text-gray-700 bg-white/60 rounded-lg p-3" data-testid="text-food-type-trends-empty">
          Log breakfast, lunch, dinner, or snacks this week to see how your calories split by meal type.
        </p>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-900 mb-1">Calories by meal type</p>
          <div className="h-40 -ml-2" data-testid="chart-food-type-trend">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false} width={36} />
                <Tooltip
                  cursor={{ fill: 'rgba(251, 191, 36, 0.2)' }}
                  formatter={(value: number, _name, item) => {
                    const count = item?.payload?.count ?? 0;
                    return [`${value} cal · ${count} ${count === 1 ? 'entry' : 'entries'}`, 'This week'];
                  }}
                />
                <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-3 space-y-2" data-testid="list-food-type-breakdown">
            {chartData.map((row) => {
              const meta = BUCKETS.find((bucket) => bucket.key === row.key)!;
              const Icon = meta.Icon;
              return (
                <li key={row.key} className="flex items-center gap-2 text-sm">
                  <Icon className={`h-4 w-4 shrink-0 ${meta.color}`} />
                  <span className="w-20 shrink-0 text-gray-900">{row.label}</span>
                  <div className="h-2.5 flex-1 rounded-full bg-amber-200/80 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(row.percent, 100)}%`, backgroundColor: row.fill }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right font-medium text-gray-900">{row.percent}%</span>
                  <span className="w-10 shrink-0 text-right text-xs text-gray-600">{row.count}×</span>
                </li>
              );
            })}
          </ul>

          {observations.length > 0 && (
            <ul className="mt-3 space-y-1.5" data-testid="list-food-type-observations">
              {observations.map((note, index) => (
                <li key={index} className="text-sm text-gray-800 bg-white/60 rounded-lg px-3 py-2">
                  {note}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-gray-600 mt-2">
            Based on meals logged this calendar week (Sun–Sat), grouped by meal type.
          </p>
        </>
      )}
    </Card>
  );
}
