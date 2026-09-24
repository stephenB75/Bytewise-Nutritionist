import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { logMeal } from '@/lib/mealsApi';
import { queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { getLocalDateKey, getMealTypeByTime } from '@/utils/dateUtils';
import {
  FAST_FOOD_CATEGORIES,
  FAST_FOOD_ITEMS,
  FAST_FOOD_RESTAURANTS,
  searchFastFood,
  type FastFoodCategory,
  type FastFoodItem,
} from '@/data/fastFoodMenu';
import { Check, Loader2, Plus, Search, Store, X } from 'lucide-react';

const chipRow = 'flex flex-wrap gap-2';

const POPULAR_RESTAURANTS = [
  "McDonald's",
  'Chick-fil-A',
  'Taco Bell',
  "Wendy's",
  'Burger King',
  'Subway',
  'Chipotle',
  'Starbucks',
  'Popeyes',
  'Panda Express',
  "Dunkin'",
  'KFC',
];

function Chip({ active, label, onClick, testId }: { active: boolean; label: string; onClick: () => void; testId: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap min-h-[36px] px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset transition-colors ${
        active ? 'bg-[#1f4aa6] text-[#ffffff] ring-[#1f4aa6]' : 'bg-white text-gray-800 ring-amber-300 hover:bg-amber-50'
      }`}
      data-testid={testId}
    >
      {label}
    </button>
  );
}

function PlaceLink({ active, label, onClick, testId }: { active: boolean; label: string; onClick: () => void; testId: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`bg-[transparent] whitespace-nowrap min-h-[32px] px-0 py-1 text-sm underline-offset-4 ${
        active ? 'font-bold text-[#0f2f75] underline decoration-2' : 'font-medium text-[#1f4aa6] hover:underline'
      }`}
      data-testid={testId}
    >
      {label}
    </button>
  );
}

export function FastFoodMenu() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FastFoodCategory | 'all'>('all');
  const [restaurant, setRestaurant] = useState<string | 'all'>('all');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [showAllPlaces, setShowAllPlaces] = useState(false);

  const visiblePlaces = useMemo(() => {
    if (showAllPlaces) return FAST_FOOD_RESTAURANTS;
    const places = POPULAR_RESTAURANTS.filter((name) => FAST_FOOD_RESTAURANTS.includes(name));
    return restaurant !== 'all' && !places.includes(restaurant) ? [...places, restaurant] : places;
  }, [showAllPlaces, restaurant]);
  const hiddenPlaceCount = FAST_FOOD_RESTAURANTS.length - visiblePlaces.length;
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => searchFastFood(query, category, restaurant), [query, category, restaurant]);
  const filtered = query.trim() !== '' || category !== 'all' || restaurant !== 'all';

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [query, category, restaurant]);

  const addItem = async (item: FastFoodItem) => {
    setSavingId(item.id);
    const mealType = getMealTypeByTime(new Date());
    try {
      await logMeal({
        name: `${item.restaurant} ${item.name} (${item.serving})`,
        date: getLocalDateKey(new Date()),
        mealType,
        totalCalories: item.calories,
        totalProtein: item.protein,
        totalCarbs: item.carbs,
        totalFat: item.fat,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/meals/logged'] });
      window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
      setAddedIds((prev) => new Set(prev).add(item.id));
      window.setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }, 2000);
      toast({ title: 'Added to your log', description: `${item.name} · ${item.calories} kcal → ${mealType}` });
    } catch (error) {
      toast({
        title: 'Could not add food',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  const resetFilters = () => {
    setQuery('');
    setCategory('all');
    setRestaurant('all');
  };

  return (
    <Card className="mt-4 p-4 bg-white/95 border-amber-200 shadow-md" data-testid="fastfood-menu">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Store className="w-5 h-5 text-[#1f4aa6] shrink-0" />
          <h3 className="text-lg font-bold text-gray-900 truncate">Popular Fast Food</h3>
        </div>
        <span className="text-[11px] text-gray-700 shrink-0">
          {FAST_FOOD_ITEMS.length} items · {FAST_FOOD_RESTAURANTS.length} places
        </span>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Big Mac, burrito, pizza…"
          className="pl-9 pr-9 bg-white text-gray-900"
          data-testid="fastfood-search"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-800"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mb-3" data-testid="fastfood-restaurants">
        <PlaceLink active={restaurant === 'all'} label="All places" onClick={() => setRestaurant('all')} testId="fastfood-restaurant-all" />
        {visiblePlaces.map((name) => (
          <PlaceLink
            key={name}
            active={restaurant === name}
            label={name}
            onClick={() => setRestaurant(restaurant === name ? 'all' : name)}
            testId={`fastfood-restaurant-${name}`}
          />
        ))}
        {(showAllPlaces || hiddenPlaceCount > 0) && (
          <button
            type="button"
            onClick={() => setShowAllPlaces((v) => !v)}
            className="bg-[transparent] whitespace-nowrap min-h-[32px] px-0 py-1 text-sm font-semibold text-gray-700 hover:underline underline-offset-4"
            data-testid="fastfood-more-places"
          >
            {showAllPlaces ? 'Show fewer' : `+ ${hiddenPlaceCount} more`}
          </button>
        )}
      </div>

      <div className={`${chipRow} mb-3`}>
        <Chip active={category === 'all'} label="All meals" onClick={() => setCategory('all')} testId="fastfood-category-all" />
        {FAST_FOOD_CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            active={category === c.id}
            label={c.label}
            onClick={() => setCategory(category === c.id ? 'all' : c.id)}
            testId={`fastfood-category-${c.id}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-700 mb-1.5">
        <span>
          {results.length} {results.length === 1 ? 'match' : 'matches'}
          {results.length > 5 && ' · scroll the list'}
        </span>
        {filtered && (
          <button type="button" onClick={resetFilters} className="bg-[transparent] p-0 text-xs font-semibold text-[#1f4aa6] underline" data-testid="fastfood-reset">
            Reset
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-gray-700 py-6 text-center rounded-lg border border-amber-200 bg-amber-50/60">
          No matches. Try the calculator above for anything not listed here.
        </p>
      ) : (
        <ul
          ref={listRef}
          className="max-h-[340px] overflow-y-auto overscroll-contain rounded-lg border border-amber-200 bg-amber-50/40 divide-y divide-amber-200"
          data-testid="fastfood-results"
        >
          {results.map((item) => {
            const saving = savingId === item.id;
            const added = addedIds.has(item.id);
            return (
              <li key={item.id} className="flex items-center gap-3 px-3 py-2" data-testid={`fastfood-item-${item.id}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-[11px] text-gray-700 truncate">
                    {item.restaurant} · {item.serving}
                  </p>
                  <p className="text-[11px] text-gray-700">
                    P {item.protein}g · C {item.carbs}g · F {item.fat}g
                  </p>
                </div>
                <span className="text-sm font-bold text-gray-900 shrink-0 tabular-nums">
                  {item.calories}
                  <span className="text-[10px] font-normal text-gray-700"> kcal</span>
                </span>
                <button
                  type="button"
                  onClick={() => addItem(item)}
                  disabled={saving}
                  aria-label={added ? `${item.name} added` : `Add ${item.name}`}
                  className={`shrink-0 h-9 w-9 min-h-[36px] min-w-[36px] p-0 rounded-full flex items-center justify-center text-[#ffffff] transition-colors disabled:opacity-60 ${
                    added ? 'bg-green-500' : 'bg-green-700 hover:bg-green-800'
                  }`}
                  data-testid={`fastfood-add-${item.id}`}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" color="#ffffff" />
                  ) : added ? (
                    <Check className="w-4 h-4" color="#ffffff" />
                  ) : (
                    <Plus className="w-4 h-4" color="#ffffff" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-[10px] text-gray-600 mt-2">
        Calories per item from each chain's published nutrition; tap + to log it to your current meal.
      </p>
    </Card>
  );
}
