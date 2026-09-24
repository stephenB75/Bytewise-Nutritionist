import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { logMeal } from '@/lib/mealsApi';
import { queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { getLocalDateKey, getMealTypeByTime } from '@/utils/dateUtils';
import {
  FAST_FOOD_CATEGORIES,
  searchFastFood,
  type FastFoodCategory,
  type FastFoodItem,
} from '@/data/fastFoodMenu';
import { Check, Loader2, Plus, Search, Store } from 'lucide-react';

const PAGE_SIZE = 12;

export function FastFoodMenu() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FastFoodCategory | 'all'>('all');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const results = useMemo(() => searchFastFood(query, category), [query, category]);

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

  const chip = (id: FastFoodCategory | 'all', label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => {
        setCategory(id);
        setVisible(PAGE_SIZE);
      }}
      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
        category === id
          ? 'bg-[#1f4aa6] text-white border-[#1f4aa6]'
          : 'bg-white text-gray-800 border-amber-300 hover:bg-amber-50'
      }`}
      data-testid={`fastfood-category-${id}`}
    >
      {label}
    </button>
  );

  return (
    <Card className="mt-4 p-4 bg-white/95 border-amber-200 shadow-md" data-testid="fastfood-menu">
      <div className="flex items-center gap-2 mb-1">
        <Store className="w-5 h-5 text-[#1f4aa6]" />
        <h3 className="text-lg font-bold text-gray-900">Popular Fast Food</h3>
      </div>
      <p className="text-xs text-gray-700 mb-3">
        Search by item or restaurant and tap Add to log it. Nutrition is from each chain's published menu data.
      </p>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE);
          }}
          placeholder="Big Mac, Chick-fil-A, burrito, pizza…"
          className="pl-9 bg-white text-gray-900"
          data-testid="fastfood-search"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {chip('all', 'All')}
        {FAST_FOOD_CATEGORIES.map((c) => chip(c.id, c.label))}
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-gray-700 py-4 text-center">
          No matches. Try the calculator above for anything not listed here.
        </p>
      ) : (
        <ul className="space-y-2">
          {results.slice(0, visible).map((item) => {
            const saving = savingId === item.id;
            const added = addedIds.has(item.id);
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3"
                data-testid={`fastfood-item-${item.id}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-700">
                    {item.restaurant} · {item.serving}
                  </p>
                  <p className="text-xs text-gray-800 mt-1">
                    <span className="font-bold">{item.calories} kcal</span> · P {item.protein}g · C {item.carbs}g · F {item.fat}g
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => addItem(item)}
                  disabled={saving}
                  className="shrink-0 bg-green-700 hover:bg-green-800 text-white"
                  data-testid={`fastfood-add-${item.id}`}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : added ? (
                    <>
                      <Check className="w-4 h-4 mr-1" /> Again
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {results.length > visible && (
        <Button
          variant="outline"
          className="w-full mt-3 bg-white text-gray-900"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          data-testid="fastfood-show-more"
        >
          Show more ({results.length - visible} left)
        </Button>
      )}
    </Card>
  );
}
