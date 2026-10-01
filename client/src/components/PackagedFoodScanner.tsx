import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import type { IScannerControls } from '@zxing/browser';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { logMeal } from '@/lib/mealsApi';
import { authFetch, queryClient } from '@/lib/queryClient';
import { getLocalDateKey } from '@/utils/dateUtils';
import { mealTypeForNow, type MealType } from '@/components/UserFoodSuggestions';
import { Keyboard, Loader2, Minus, Package, Plus, ScanBarcode, Search, X } from 'lucide-react';

type Nutrients = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
};

export type PackagedFood = {
  id: string;
  barcode: string | null;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  serving: { grams: number | null; label: string };
  per100g: Nutrients | null;
  perServing: Nutrients | null;
  source: 'usda' | 'openfoodfacts';
};

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const SOURCE_LABEL: Record<PackagedFood['source'], string> = {
  usda: 'USDA label data',
  openfoodfacts: 'Open Food Facts',
};

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    return body?.message || fallback;
  } catch {
    return fallback;
  }
}

async function fetchBarcode(code: string): Promise<PackagedFood> {
  const response = await authFetch(`/api/foods/barcode/${encodeURIComponent(code)}`);
  if (!response.ok) throw new Error(await readError(response, 'Barcode lookup failed.'));
  return (await response.json()).product;
}

async function fetchSearch(query: string): Promise<PackagedFood[]> {
  const response = await authFetch(`/api/foods/packaged/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error(await readError(response, 'Search failed.'));
  return (await response.json()).results || [];
}

function scale(n: Nutrients, factor: number): Nutrients {
  const r1 = (v: number) => Math.round(v * factor * 10) / 10;
  return {
    calories: Math.round(n.calories * factor),
    protein: r1(n.protein),
    carbs: r1(n.carbs),
    fat: r1(n.fat),
    fiber: r1(n.fiber),
    sugar: r1(n.sugar),
    sodium: Math.round(n.sodium * factor),
  };
}

function displayName(food: PackagedFood): string {
  if (!food.brand || food.name.toLowerCase().includes(food.brand.toLowerCase())) return food.name;
  return `${food.brand} ${food.name}`;
}

function servingCalories(food: PackagedFood): string {
  if (food.perServing) return `${food.perServing.calories} cal · ${food.serving.label}`;
  if (food.per100g) return `${food.per100g.calories} cal · 100 g`;
  return '';
}

function tapFeedback() {
  if (!Capacitor.isNativePlatform()) return;
  import('@capacitor/haptics')
    .then(({ Haptics, ImpactStyle }) => Haptics.impact({ style: ImpactStyle.Medium }))
    .catch(() => {});
}

function BarcodeCamera({ onDetected, onClose }: { onDetected: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    let controls: IScannerControls | null = null;
    let cancelled = false;
    let detected = false;

    (async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const { Camera } = await import('@capacitor/camera');
          const current = await Camera.checkPermissions();
          const camera = current.camera === 'granted'
            ? current.camera
            : (await Camera.requestPermissions({ permissions: ['camera'] })).camera;
          if (camera !== 'granted') {
            const err = new Error('camera-denied');
            (err as { name: string }).name = 'NotAllowedError';
            throw err;
          }
        }
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
        const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
          import('@zxing/browser'),
          import('@zxing/library'),
        ]);
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
        ]);
        const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 120 });
        if (cancelled || !videoRef.current) return;
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
          videoRef.current,
          (result, _error, scanControls) => {
            if (!result || detected) return;
            detected = true;
            scanControls.stop();
            tapFeedback();
            onDetected(result.getText());
          },
        );
        if (cancelled) controls.stop();
      } catch (error) {
        if (cancelled) return;
        const name = (error as { name?: string })?.name;
        setCameraError(
          name === 'NotAllowedError'
            ? 'Camera access is turned off. Allow camera access for ByteWise in Settings, or type the barcode below.'
            : 'The camera is not available on this device. Type the numbers under the barcode below.',
        );
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [onDetected]);

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = manualCode.replace(/\D/g, '');
    if (digits.length >= 8) onDetected(digits);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label="Scan a barcode" data-testid="barcode-scanner">
      <div className="flex items-center justify-between px-4 pb-3 pt-[max(env(safe-area-inset-top),16px)]">
        <p className="on-color text-base font-semibold">Scan a barcode</p>
        <button
          type="button"
          onClick={onClose}
          className="on-color flex h-10 w-10 items-center justify-center rounded-full bg-white/15"
          aria-label="Close scanner"
          data-testid="button-close-scanner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline muted autoPlay />
        {!cameraError && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-[78%] max-w-sm rounded-2xl ring-4 ring-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
          </div>
        )}
        {starting && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p className="on-color text-center text-sm leading-relaxed">{cameraError}</p>
          </div>
        )}
      </div>

      <form onSubmit={submitManual} className="space-y-2 bg-black px-4 pt-3 pb-[max(env(safe-area-inset-bottom),16px)]">
        {!cameraError && <p className="on-color text-center text-xs opacity-80">Line up the barcode inside the box. It scans automatically.</p>}
        <div className="flex gap-2">
          <Input
            inputMode="numeric"
            placeholder="Or type the barcode numbers"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="bg-white text-base text-gray-950"
            data-testid="input-manual-barcode"
          />
          <Button type="submit" disabled={manualCode.replace(/\D/g, '').length < 8} className="on-color bg-[#1f4aa6] hover:bg-[#173a85]">
            Look up
          </Button>
        </div>
      </form>
    </div>
  );
}

function ProductPanel({ food, onClose }: { food: PackagedFood; onClose: () => void }) {
  const { user } = useAuth();
  const hasServing = !!food.perServing;
  const [mode, setMode] = useState<'servings' | 'grams'>(hasServing ? 'servings' : 'grams');
  const [servings, setServings] = useState(1);
  const [grams, setGrams] = useState(String(food.serving.grams ? Math.round(food.serving.grams) : 100));
  const [mealType, setMealType] = useState<MealType>(mealTypeForNow());
  const [saving, setSaving] = useState(false);

  const gramsValue = Math.max(0, Number(grams) || 0);
  const nutrients =
    mode === 'servings' && food.perServing
      ? scale(food.perServing, servings)
      : food.per100g
        ? scale(food.per100g, gramsValue / 100)
        : null;
  const amountLabel =
    mode === 'servings'
      ? servings === 1 ? food.serving.label : `${servings} × ${food.serving.label}`
      : `${gramsValue} g`;

  const add = async () => {
    if (!nutrients) return;
    if (!user) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Create an account on Profile to save meals from the tracker.', type: 'info' },
      }));
      window.dispatchEvent(new CustomEvent('guest-save-prompt'));
      return;
    }
    setSaving(true);
    try {
      await logMeal({
        name: `${displayName(food)} (${amountLabel})`,
        date: getLocalDateKey(new Date()),
        mealType,
        totalCalories: nutrients.calories,
        totalProtein: nutrients.protein,
        totalCarbs: nutrients.carbs,
        totalFat: nutrients.fat,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/meals/logged'] });
      window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
      window.dispatchEvent(new CustomEvent('meals-updated'));
      toast({ title: 'Added to your log', description: `${displayName(food)} · ${nutrients.calories} cal → ${mealType}` });
      onClose();
    } catch (error) {
      toast({
        title: 'Could not add food',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl bg-white p-4 ring-1 ring-amber-200" data-testid="packaged-product">
      <div className="flex items-start gap-3">
        {food.imageUrl ? (
          <img src={food.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg object-contain bg-gray-50 ring-1 ring-gray-100" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-100">
            <Package className="h-7 w-7 text-amber-600" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-950 leading-snug">{food.name}</p>
          {food.brand && <p className="text-sm text-gray-700">{food.brand}</p>}
          <p className="mt-0.5 text-xs text-gray-600">
            {SOURCE_LABEL[food.source]}
            {food.barcode ? ` · ${food.barcode}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700"
          aria-label="Close product"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {hasServing && food.per100g && (
        <div className="mt-4 flex gap-1.5" role="radiogroup" aria-label="Amount type">
          {(['servings', 'grams'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ring-1 ${
                mode === m ? 'on-color bg-[#1f4aa6] ring-[#1f4aa6]' : 'bg-white text-gray-800 ring-gray-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3">
        {mode === 'servings' ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setServings((s) => Math.max(0.5, s - 0.5))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-900"
              aria-label="Fewer servings"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="text-lg font-bold text-gray-950">{servings} {servings === 1 ? 'serving' : 'servings'}</p>
              <p className="truncate text-xs text-gray-600">1 serving = {food.serving.label}</p>
            </div>
            <button
              type="button"
              onClick={() => setServings((s) => Math.min(20, s + 0.5))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-900"
              aria-label="More servings"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 text-sm text-gray-800">
            Amount
            <Input
              inputMode="decimal"
              value={grams}
              onChange={(e) => setGrams(e.target.value.replace(/[^\d.]/g, ''))}
              className="w-24 bg-white text-base text-gray-950"
              aria-label="Grams"
            />
            grams
          </label>
        )}
      </div>

      {nutrients ? (
        <>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[
              ['Calories', `${nutrients.calories}`],
              ['Protein', `${nutrients.protein}g`],
              ['Carbs', `${nutrients.carbs}g`],
              ['Fat', `${nutrients.fat}g`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-amber-50 py-2">
                <p className="text-base font-bold text-gray-950">{value}</p>
                <p className="text-[11px] text-gray-600">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Fiber {nutrients.fiber}g · Sugar {nutrients.sugar}g · Sodium {nutrients.sodium}mg
          </p>

          <p className="mt-4 mb-2 text-xs font-medium text-gray-700">Add to today as</p>
          <div className="mb-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Meal type">
            {MEAL_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={mealType === type}
                onClick={() => setMealType(type)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ring-1 transition-colors ${
                  mealType === type ? 'on-color bg-orange-600 ring-orange-600' : 'bg-white text-gray-800 ring-gray-300 hover:bg-orange-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <Button
            type="button"
            onClick={add}
            disabled={saving}
            className="on-color w-full bg-orange-700 hover:bg-orange-800 disabled:opacity-75"
            data-testid="button-add-packaged"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Add {nutrients.calories} cal to today
          </Button>
        </>
      ) : (
        <p className="mt-4 text-sm text-gray-700">This product has no nutrition facts listed yet.</p>
      )}
    </div>
  );
}

export function PackagedFoodScanner() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<PackagedFood[] | null>(null);
  const [selected, setSelected] = useState<PackagedFood | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const handleDetected = useRef(async (code: string) => {
    setScannerOpen(false);
    setLookingUp(true);
    setMessage(null);
    setSelected(null);
    try {
      setSelected(await fetchBarcode(code));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Barcode lookup failed.');
    } finally {
      setLookingUp(false);
    }
  }).current;

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setSearching(true);
    setMessage(null);
    setSelected(null);
    try {
      const found = await fetchSearch(q);
      setResults(found);
      if (found.length === 0) setMessage(`No packaged foods found for "${q}". Try the brand and product name.`);
    } catch (error) {
      setResults(null);
      setMessage(error instanceof Error ? error.message : 'Search failed.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <Card className="p-4 bg-white/95 border-amber-200 shadow-md" data-testid="packaged-food-scanner">
      <div className="mb-3 flex items-center gap-2">
        <ScanBarcode className="h-5 w-5 shrink-0 text-[#1f4aa6]" />
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-950">Packaged foods &amp; barcodes</h3>
          <p className="text-xs text-gray-600">Snacks, drinks and groceries from millions of products worldwide</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          onClick={() => setScannerOpen(true)}
          className="on-color bg-[#1f4aa6] hover:bg-[#173a85]"
          data-testid="button-scan-barcode"
        >
          <ScanBarcode className="mr-2 h-4 w-4" />
          Scan barcode
        </Button>
        <Button
          type="button"
          onClick={() => setShowManual((v) => !v)}
          aria-expanded={showManual}
          className="bg-amber-100 text-amber-950 hover:bg-amber-200"
          data-testid="button-enter-barcode"
        >
          <Keyboard className="mr-2 h-4 w-4" />
          Type barcode
        </Button>
      </div>

      {showManual && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const digits = manualCode.replace(/\D/g, '');
            if (digits.length >= 8) handleDetected(digits);
          }}
          className="mt-3 flex gap-2"
        >
          <Input
            inputMode="numeric"
            autoFocus
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Numbers under the barcode"
            className="bg-amber-50/90 text-base text-gray-950"
            data-testid="input-barcode-number"
          />
          <Button
            type="submit"
            disabled={lookingUp || manualCode.replace(/\D/g, '').length < 8}
            className="on-color shrink-0 bg-[#1f4aa6] hover:bg-[#173a85]"
          >
            Look up
          </Button>
        </form>
      )}

      <form onSubmit={runSearch} className="mt-3 flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, e.g. Doritos Cool Ranch"
          className="bg-amber-50/90 text-base text-gray-950"
          data-testid="input-packaged-search"
        />
        <Button type="submit" disabled={searching || query.trim().length < 2} className="on-color shrink-0 bg-orange-700 hover:bg-orange-800" aria-label="Search packaged foods">
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </form>

      {lookingUp && (
        <p className="mt-3 flex items-center gap-2 text-sm text-gray-700">
          <Loader2 className="h-4 w-4 animate-spin" /> Looking up product…
        </p>
      )}
      {message && <p className="mt-3 text-sm text-gray-800" role="status">{message}</p>}

      {selected ? (
        <ProductPanel key={selected.id} food={selected} onClose={() => setSelected(null)} />
      ) : (
        results && results.length > 0 && (
          <ul className="mt-3 max-h-80 divide-y divide-gray-100 overflow-y-auto rounded-lg ring-1 ring-gray-100" data-testid="packaged-results">
            {results.map((food) => (
              <li key={food.id}>
                <button
                  type="button"
                  onClick={() => setSelected(food)}
                  className="flex w-full items-center gap-3 bg-white px-3 py-2.5 text-left hover:bg-amber-50"
                >
                  {food.imageUrl ? (
                    <img src={food.imageUrl} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded object-contain bg-gray-50" />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-amber-50">
                      <Package className="h-5 w-5 text-amber-600" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-950">{food.name}</p>
                    <p className="truncate text-xs text-gray-600">
                      {[food.brand, servingCalories(food)].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )
      )}

      {scannerOpen && <BarcodeCamera onDetected={handleDetected} onClose={() => setScannerOpen(false)} />}
    </Card>
  );
}
