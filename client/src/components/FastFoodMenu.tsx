import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { logMeal } from '@/lib/mealsApi';
import { queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { getLocalDateKey, getMealTypeByTime } from '@/utils/dateUtils';
import {
  availableCuisines,
  CUISINE_LABELS,
  FAST_FOOD_CATEGORIES,
  FAST_FOOD_ITEMS,
  FAST_FOOD_RESTAURANTS,
  featuredNearbyRestaurants,
  matchFastFoodRestaurants,
  regionFromCoords,
  REGION_LABELS,
  restaurantsForCuisine,
  searchFastFood,
  suggestFastFoodRestaurants,
  type FastFoodCategory,
  type FastFoodItem,
  type FoodCuisine,
  type UsFoodRegion,
} from '@/data/fastFoodMenu';
import { Check, Loader2, MapPin, Search, Store, X } from 'lucide-react';

/** Culture / style chips — order is browse priority in the Places row. */
const PLACE_CUISINE_ORDER: FoodCuisine[] = [
  'caribbean',
  'asian',
  'mexican',
  'italian',
  'spanish',
  'chicken',
  'burgers',
  'bbq',
  'mediterranean',
  'seafood',
  'cafe',
];

const ADDED_CONFIRMATION_MS = 2500;

function calorieTone(calories: number) {
  if (calories < 400) return { color: '#059669', wash: 'bg-emerald-100' };
  if (calories < 800) return { color: '#d97706', wash: 'bg-amber-100' };
  return { color: '#ea580c', wash: 'bg-orange-100' };
}

/** Short Caribbean spotlight in the compact All row (full list is under the Caribbean chip). */
const NATIONWIDE_CARIBBEAN_SPOTLIGHT = [
  'Golden Krust',
  'Pollo Tropical',
  'Bahama Breeze',
  'Negril Jamaican Eatery',
];

const PINNED_POPULAR = [
  'Olive Garden',
  "McDonald's",
  'Chick-fil-A',
  'Taco Bell',
  "Wendy's",
  'Chipotle',
  'Starbucks',
  'Subway',
  'Burger King',
  'Popeyes',
  'Panda Express',
  "Dunkin'",
  'KFC',
  'IHOP',
  "Chili's",
  'Pizza Hut',
  "Domino's",
];

function requestUserRegion(): Promise<UsFoodRegion | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(regionFromCoords(position.coords.latitude, position.coords.longitude)),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 30 * 60 * 1000 }
    );
  });
}

export function FastFoodMenu() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FastFoodCategory | 'all'>('all');
  const [restaurant, setRestaurant] = useState<string | 'all'>('all');
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [region, setRegion] = useState<UsFoodRegion | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'asking' | 'ready' | 'denied'>('idle');
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  const [placeCuisine, setPlaceCuisine] = useState<FoodCuisine | 'all'>('all');
  const menuSectionRef = useRef<HTMLDivElement>(null);
  const prevActivePlaceRef = useRef<string | null>(null);

  const placeCuisines = useMemo(() => {
    const available = new Set(availableCuisines(FAST_FOOD_RESTAURANTS));
    return PLACE_CUISINE_ORDER.filter((id) => available.has(id)).map((id) => ({
      id,
      label: CUISINE_LABELS[id],
    }));
  }, []);

  const visiblePlaces = useMemo(() => {
    if (placeCuisine !== 'all') {
      return restaurantsForCuisine(placeCuisine, FAST_FOOD_RESTAURANTS);
    }
    const caribbeanSpot = NATIONWIDE_CARIBBEAN_SPOTLIGHT.filter((name) =>
      FAST_FOOD_RESTAURANTS.includes(name)
    );
    const pinned = PINNED_POPULAR.filter((name) => FAST_FOOD_RESTAURANTS.includes(name));
    const extras = FAST_FOOD_RESTAURANTS.filter(
      (name) => !pinned.includes(name) && !caribbeanSpot.includes(name)
    ).sort((a, b) => a.localeCompare(b));
    if (showAllPlaces) {
      if (!region) return [...pinned, ...caribbeanSpot.filter((n) => !pinned.includes(n)), ...extras];
      const nearby = featuredNearbyRestaurants(region, FAST_FOOD_RESTAURANTS, 8).filter(
        (name) => !pinned.includes(name) && !caribbeanSpot.includes(name)
      );
      const rest = extras.filter((name) => !nearby.includes(name));
      return [...nearby, ...pinned, ...caribbeanSpot.filter((n) => !pinned.includes(n)), ...rest];
    }
    // Compact row: national pins (incl. Olive Garden) + short Caribbean spotlight + nearby
    if (!region) {
      const spot = caribbeanSpot.filter((n) => !pinned.includes(n));
      return [...pinned.slice(0, 12), ...spot].slice(0, 18);
    }
    const nearby = featuredNearbyRestaurants(region, FAST_FOOD_RESTAURANTS, 3).filter(
      (name) => !pinned.includes(name) && !caribbeanSpot.includes(name)
    );
    const spot = caribbeanSpot.filter((n) => !pinned.includes(n) && !nearby.includes(n));
    return [...nearby, ...pinned.slice(0, 12), ...spot].slice(0, 20);
  }, [region, showAllPlaces, placeCuisine]);

  const queryPlaces = useMemo(() => matchFastFoodRestaurants(query), [query]);
  const placeSuggestions = useMemo(() => suggestFastFoodRestaurants(query, 24), [query]);
  const activePlace = restaurant !== 'all' ? restaurant : queryPlaces.length === 1 ? queryPlaces[0] : null;
  const searchingPlaces = query.trim() && restaurant === 'all' && placeSuggestions.length > 0;
  const gridPlaces = searchingPlaces ? placeSuggestions : visiblePlaces;
  const morePlacesCount =
    placeCuisine !== 'all' ? 0 : Math.max(0, FAST_FOOD_RESTAURANTS.length - visiblePlaces.length);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!activePlace && !trimmed) return [];
    // Without a selected place, only search once the query looks like a meal name
    // (avoid dumping the whole catalog for 1–2 character keystrokes).
    if (!activePlace && trimmed.length < 3) return [];
    const hits = searchFastFood(query, category, restaurant);
    if (activePlace) return hits;
    const qNorm = trimmed.toLowerCase();
    // Prefer items whose name matches the typed meal; keep restaurant on each card.
    return [...hits]
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aExact = aName === qNorm || aName.startsWith(qNorm) ? 0 : aName.includes(qNorm) ? 1 : 2;
        const bExact = bName === qNorm || bName.startsWith(qNorm) ? 0 : bName.includes(qNorm) ? 1 : 2;
        if (aExact !== bExact) return aExact - bExact;
        return a.name.localeCompare(b.name) || a.restaurant.localeCompare(b.restaurant);
      })
      .slice(0, 60);
  }, [query, category, restaurant, activePlace]);

  const showItemResults = Boolean(activePlace) || (query.trim().length >= 3 && results.length > 0);

  const selectPlace = (name: string) => {
    setRestaurant((current) => (current === name ? 'all' : name));
    setQuery('');
    setCategory('all');
  };

  // When a place is newly selected, scroll the menu into view under the bottom nav.
  useEffect(() => {
    const prev = prevActivePlaceRef.current;
    prevActivePlaceRef.current = activePlace;
    if (!activePlace || activePlace === prev) return;
    const frame = window.requestAnimationFrame(() => {
      menuSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activePlace]);

  const useMyLocation = async () => {
    setLocationStatus('asking');
    const next = await requestUserRegion();
    if (next) {
      setRegion(next);
      setLocationStatus('ready');
    } else {
      setLocationStatus('denied');
    }
  };

  const addItem = async (item: FastFoodItem) => {
    if (savingIds.has(item.id) || addedIds.has(item.id)) return;
    setSavingIds((prev) => new Set(prev).add(item.id));
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
      }, ADDED_CONFIRMATION_MS);
      toast({ title: 'Added to Journal', description: `${item.name} · ${item.calories} cal is on Journal under Logged Today.` });
    } catch (error) {
      toast({
        title: 'Could not add food',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  return (
    <Card className="mt-4 p-4 bg-white/95 border-amber-200 shadow-md" data-testid="fastfood-menu">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Store className="w-5 h-5 text-[#1f4aa6] shrink-0" />
          <h3 className="text-lg font-bold text-gray-900 truncate">Popular Fast Food</h3>
        </div>
        <span className="text-[11px] text-gray-700 shrink-0">
          {FAST_FOOD_ITEMS.length} items · {FAST_FOOD_RESTAURANTS.length} places
        </span>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={activePlace ? `Search the ${activePlace} menu…` : 'Search a restaurant or item…'}
          className="pl-9 pr-9 bg-white text-gray-900"
          data-testid="fastfood-search"
          autoComplete="off"
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

      <div className="mb-4" data-testid="fastfood-restaurants">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">
            {searchingPlaces
              ? 'Matching places'
              : placeCuisine !== 'all'
                ? `${CUISINE_LABELS[placeCuisine]} · USA`
                : showAllPlaces
                  ? region
                    ? `All places · ${REGION_LABELS[region]}`
                    : 'All places'
                  : region
                    ? `Places · ${REGION_LABELS[region]}`
                    : 'Places'}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            {!searchingPlaces && placeCuisine === 'all' && (
              <button
                type="button"
                onClick={() => setShowAllPlaces((open) => !open)}
                className="bg-[transparent] min-h-[28px] px-0 text-xs font-semibold text-[#1f4aa6]"
                data-testid="fastfood-more-places"
              >
                {showAllPlaces ? 'Show less' : `More${morePlacesCount > 0 ? ` · ${morePlacesCount}` : ''}`}
              </button>
            )}
            {locationStatus !== 'ready' && (
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locationStatus === 'asking'}
                className="inline-flex items-center gap-1 bg-[transparent] min-h-[28px] px-0 text-xs font-semibold text-[#1f4aa6]"
                data-testid="fastfood-use-location"
              >
                {locationStatus === 'asking' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                {locationStatus === 'denied' ? 'Location off' : 'Near you'}
              </button>
            )}
          </div>
        </div>

        <div className="mb-2" data-testid="fastfood-cuisine-filters">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Food style
          </p>
          {/* Horizontal scroll keeps chips pill-shaped on narrow screens (avoids wrap + global 44px button min-height). */}
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => {
                setPlaceCuisine('all');
                setRestaurant('all');
              }}
              className={`fastfood-style-pill shrink-0 ${
                placeCuisine === 'all' ? 'fastfood-style-pill--active' : ''
              }`}
              style={{ borderRadius: 999 }}
              data-testid="fastfood-cuisine-all"
            >
              All
            </button>
            {placeCuisines.map((cuisine) => {
              const active = placeCuisine === cuisine.id;
              return (
                <button
                  key={cuisine.id}
                  type="button"
                  onClick={() => {
                    setPlaceCuisine(active ? 'all' : cuisine.id);
                    setRestaurant('all');
                    setQuery('');
                    setShowAllPlaces(false);
                  }}
                  className={`fastfood-style-pill shrink-0 ${active ? 'fastfood-style-pill--active' : ''}`}
                  style={{ borderRadius: 999 }}
                  data-testid={`fastfood-cuisine-${cuisine.id}`}
                >
                  {cuisine.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className={`overflow-y-auto py-1 pr-1 [scrollbar-width:thin] ${showAllPlaces ? 'max-h-[420px]' : 'max-h-[280px]'}`}>
          <div className="grid grid-cols-3 gap-x-2 gap-y-1.5">
            {gridPlaces.map((name) => {
              const selected = activePlace === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => selectPlace(name)}
                  aria-pressed={selected}
                  className={`fastfood-place-chip min-h-[28px] rounded-md px-1.5 py-1 text-left text-[12px] leading-snug transition-colors ${
                    selected
                      ? 'border border-[#1f4aa6]/45 bg-[#1f4aa6]/12 font-bold text-[#0f2f75]'
                      : 'border border-transparent font-medium text-[#1f4aa6] hover:text-[#0f2f75]'
                  }`}
                  data-testid={`fastfood-restaurant-${name}`}
                >
                  {selected ? (
                    <span className="inline-flex items-center gap-1 min-w-0">
                      <Check className="w-3 h-3 shrink-0 text-[#1f4aa6]" aria-hidden />
                      <span className="truncate">{name}</span>
                    </span>
                  ) : (
                    <span className="truncate block">{name}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {!searchingPlaces && placeCuisine === 'all' && !showAllPlaces && morePlacesCount > 0 && (
          <button
            type="button"
            onClick={() => setShowAllPlaces(true)}
            className="mt-2 w-full bg-[transparent] py-1.5 text-center text-xs font-semibold text-[#1f4aa6]"
            data-testid="fastfood-more-places-footer"
          >
            More places · browse all {FAST_FOOD_RESTAURANTS.length} without sharing location
          </button>
        )}
        {placeCuisine !== 'all' && (
          <p className="mt-2 text-[11px] text-gray-600">
            {placeCuisine === 'caribbean'
              ? 'Full Caribbean & West Indian catalog across the USA — tap a place for its menu.'
              : `${CUISINE_LABELS[placeCuisine]} places in the catalog — tap one for its menu.`}
          </p>
        )}
      </div>

      {showItemResults && (
        <div
          ref={menuSectionRef}
          className={`mb-3 scroll-mt-20 rounded-xl px-3 py-3 ${
            activePlace
              ? 'border border-[#1f4aa6]/25 bg-gradient-to-r from-[#1f4aa6]/10 to-[#faed39]/15'
              : 'border border-amber-200/60 bg-amber-50/40'
          }`}
          data-testid="fastfood-selected-place"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex items-start gap-2.5">
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  activePlace ? 'bg-[#1f4aa6] text-white' : 'bg-amber-200 text-amber-900'
                }`}
                aria-hidden
              >
                <Store className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                {activePlace && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#1f4aa6]">
                    Selected menu
                  </p>
                )}
                <p
                  className={`truncate font-bold text-gray-950 ${
                    activePlace ? 'text-xl leading-tight sm:text-2xl' : 'text-base'
                  }`}
                  style={{ fontFamily: "'League Spartan', sans-serif" }}
                >
                  {activePlace || 'Matching meals'}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-600">
                  {results.length} items · tap a meal to add
                </p>
              </div>
            </div>
            {(activePlace || query.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setRestaurant('all');
                  setQuery('');
                  setCategory('all');
                }}
                className="shrink-0 bg-[transparent] p-0 pt-1 text-xs font-semibold text-[#1f4aa6]"
                data-testid="fastfood-change-place"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {activePlace && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`bg-[transparent] px-0 py-1 text-xs ${category === 'all' ? 'font-bold text-[#0f2f75]' : 'font-medium text-gray-600'}`}
            data-testid="fastfood-category-all"
          >
            All
          </button>
          {FAST_FOOD_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(category === c.id ? 'all' : c.id)}
              className={`bg-[transparent] px-0 py-1 text-xs ${category === c.id ? 'font-bold text-[#0f2f75]' : 'font-medium text-gray-600'}`}
              data-testid={`fastfood-category-${c.id}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {!showItemResults ? (
        <p className="text-sm text-gray-600 py-4">
          {query.trim().length >= 3
            ? 'No matching meals. Try another name, or tap a place to browse its menu.'
            : 'Tap a place or type a meal name (Big Mac, Whopper…). Tap a meal to add it to Journal.'}
        </p>
      ) : results.length === 0 ? (
        <p className="text-sm text-gray-600 py-4">No matches in this menu. Try another search.</p>
      ) : (
        <div className="-mx-1 overflow-x-auto pb-1 [scrollbar-width:thin]" data-testid="fastfood-results">
          <div
            key={`${activePlace || 'all'}-${category}-${query}`}
            className="grid w-max grid-flow-col grid-rows-5 gap-1.5 auto-cols-[136px] sm:auto-cols-[148px] sm:grid-rows-4"
          >
            {results.map((item, index) => {
              const saving = savingIds.has(item.id);
              const added = addedIds.has(item.id);
              const tone = calorieTone(item.calories);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addItem(item)}
                  disabled={saving || added}
                  aria-label={saving ? `Adding ${item.name}` : added ? `${item.name} added` : `Add ${item.name}`}
                  aria-live="polite"
                  style={{ animationDelay: `${Math.min(index, 20) * 20}ms`, animationFillMode: 'both' }}
                  className={`animate-in fade-in duration-300 h-[72px] rounded-lg px-2 py-1.5 text-left transition-colors ${
                    added ? 'bg-green-50' : saving ? 'bg-gray-50' : tone.wash
                  }`}
                  data-testid={`fastfood-item-${item.id}`}
                >
                  <p className="truncate text-[11px] font-semibold leading-tight text-gray-900">{item.name}</p>
                  {!activePlace && (
                    <p className="truncate text-[9px] font-medium leading-tight text-[#1f4aa6]">{item.restaurant}</p>
                  )}
                  <p
                    className="mt-0.5 bg-inherit text-[16px] font-bold leading-none tabular-nums"
                    style={{ color: added ? '#15803d' : tone.color }}
                  >
                    {item.calories}
                    <span className="ml-0.5 text-[9px] font-semibold uppercase tracking-wide">cal</span>
                  </p>
                  <p className="mt-0.5 truncate text-[9px] leading-tight text-gray-600">
                    {added ? (
                      <span className="inline-flex items-center gap-0.5 font-semibold text-green-700">
                        <Check className="w-2.5 h-2.5" /> Added
                      </span>
                    ) : saving ? (
                      <span className="inline-flex items-center gap-0.5">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> Adding…
                      </span>
                    ) : (
                      <>
                        {item.serving}
                        <span className="text-gray-500"> · P{item.protein} C{item.carbs} F{item.fat}</span>
                      </>
                    )}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <p className="text-[10px] text-gray-600 mt-3">
        Calories from each chain's published nutrition. Logged items appear on Journal under Logged Today.
      </p>
    </Card>
  );
}
