import { getUsdaApiKey } from '../env';

export interface PackagedNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number; // mg
}

export interface PackagedFood {
  id: string;
  barcode: string | null;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  serving: { grams: number | null; label: string };
  per100g: PackagedNutrients | null;
  perServing: PackagedNutrients | null;
  source: 'usda' | 'openfoodfacts';
}

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const OFF_BASE = 'https://world.openfoodfacts.org';
// Open Food Facts asks every client to identify itself.
const OFF_USER_AGENT = 'BytewiseNutritionist/1.0 (+https://www.bytewisenutritionist.com)';
const REQUEST_TIMEOUT_MS = 12000;

// ---------- Barcode normalization ----------

function hasValidCheckDigit(code: string): boolean {
  const digits = code.split('').map(Number);
  const check = digits.pop()!;
  const sum = digits.reverse().reduce((total, digit, i) => total + digit * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

function expandUpcE(code: string): string | null {
  if (code.length !== 8 || !/^[01]/.test(code)) return null;
  const [n, d1, d2, d3, d4, d5, d6, c] = code.split('');
  let body: string;
  if ('012'.includes(d6)) body = `${d1}${d2}${d6}0000${d3}${d4}${d5}`;
  else if (d6 === '3') body = `${d1}${d2}${d3}00000${d4}${d5}`;
  else if (d6 === '4') body = `${d1}${d2}${d3}${d4}00000${d5}`;
  else body = `${d1}${d2}${d3}${d4}${d5}0000${d6}`;
  return `${n}${body}${c}`;
}

/**
 * Returns the code forms the databases may store a product under (UPC-A, EAN-13, ...),
 * or null when the input is not a valid retail barcode.
 */
export function barcodeCandidates(raw: string): string[] | null {
  const code = String(raw || '').replace(/\D/g, '');
  if (![8, 12, 13, 14].includes(code.length)) return null;

  const forms = new Set<string>();
  const addGtin = (gtin: string) => {
    const trimmed = gtin.replace(/^0+(?=\d{12,})/, '');
    forms.add(trimmed);
    if (trimmed.length === 12) forms.add(`0${trimmed}`);
    if (trimmed.length === 13 && trimmed.startsWith('0')) forms.add(trimmed.slice(1));
  };

  if (hasValidCheckDigit(code)) addGtin(code);
  const upcA = expandUpcE(code);
  if (upcA && hasValidCheckDigit(upcA)) addGtin(upcA);
  // Scanners sometimes drop or flip the check digit; still try the typed digits.
  if (forms.size === 0) addGtin(code);

  return forms.size > 0 ? Array.from(forms) : null;
}

const sameGtin = (a: string, b: string) => a.replace(/^0+/, '') === b.replace(/^0+/, '');

// ---------- Helpers ----------

const round1 = (n: number) => Math.round(n * 10) / 10;

function scaleNutrients(per100g: PackagedNutrients, grams: number): PackagedNutrients {
  const f = grams / 100;
  return {
    calories: Math.round(per100g.calories * f),
    protein: round1(per100g.protein * f),
    carbs: round1(per100g.carbs * f),
    fat: round1(per100g.fat * f),
    fiber: round1(per100g.fiber * f),
    sugar: round1(per100g.sugar * f),
    sodium: Math.round(per100g.sodium * f),
  };
}

function titleCase(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (!trimmed) return trimmed;
  if (trimmed !== trimmed.toUpperCase() && /[a-z]/.test(trimmed) && trimmed.split(' ').length <= 8) {
    return trimmed.replace(/\b([A-Z]{2,})\b/g, (word) => word[0] + word.slice(1).toLowerCase());
  }
  return trimmed.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

async function fetchJson(url: string, init: RequestInit = {}): Promise<any | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: { 'User-Agent': OFF_USER_AGENT, ...(init.headers as Record<string, string> | undefined) },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (response.status === 429 || response.status === 503) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
        continue;
      }
      if (!response.ok) return null;
      return await response.json();
    } catch {
      if (attempt === 2) return null;
    }
  }
  return null;
}

class TtlCache<T> {
  private entries = new Map<string, { value: T; expires: number }>();
  constructor(private maxEntries: number) {}
  get(key: string): T | undefined {
    const hit = this.entries.get(key);
    if (!hit) return undefined;
    if (hit.expires < Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return hit.value;
  }
  set(key: string, value: T, ttlMs: number) {
    if (this.entries.size >= this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(key, { value, expires: Date.now() + ttlMs });
  }
}

const HOUR = 60 * 60 * 1000;
const barcodeCache = new TtlCache<PackagedFood | null>(5000);
const searchCache = new TtlCache<PackagedFood[]>(1000);

// ---------- USDA FoodData Central (Branded) ----------

const USDA_NUTRIENTS: Record<number, keyof PackagedNutrients> = {
  1008: 'calories',
  1003: 'protein',
  1005: 'carbs',
  1004: 'fat',
  1079: 'fiber',
  2000: 'sugar',
  1093: 'sodium',
};

function fromUsda(food: any): PackagedFood | null {
  const per100g: PackagedNutrients = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };
  let hasCalories = false;
  for (const nutrient of food.foodNutrients || []) {
    const key = USDA_NUTRIENTS[nutrient.nutrientId];
    if (!key || typeof nutrient.value !== 'number') continue;
    per100g[key] = key === 'calories' || key === 'sodium' ? Math.round(nutrient.value) : round1(nutrient.value);
    if (key === 'calories') hasCalories = true;
  }
  if (!hasCalories || !food.description) return null;

  const unit = String(food.servingSizeUnit || '').toLowerCase();
  const grams = typeof food.servingSize === 'number' && ['g', 'grm', 'ml', 'mlt'].includes(unit) ? food.servingSize : null;
  const household = String(food.householdServingFullText || '').trim();
  const label = grams
    ? household ? `${household} (${round1(grams)} ${unit.startsWith('m') ? 'ml' : 'g'})` : `${round1(grams)} ${unit.startsWith('m') ? 'ml' : 'g'}`
    : household || '100 g';

  return {
    id: `usda:${food.fdcId}`,
    barcode: food.gtinUpc || null,
    name: titleCase(String(food.description).trim()),
    brand: food.brandName || food.brandOwner ? titleCase(String(food.brandName || food.brandOwner)) : null,
    imageUrl: null,
    serving: { grams, label },
    per100g,
    perServing: grams ? scaleNutrients(per100g, grams) : null,
    source: 'usda',
  };
}

async function searchUsdaBranded(query: string, pageSize: number): Promise<any[]> {
  const data = await fetchJson(`${USDA_BASE}/foods/search?api_key=${getUsdaApiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, dataType: ['Branded'], pageSize }),
  });
  return Array.isArray(data?.foods) ? data.foods : [];
}

async function lookupUsdaBarcode(candidates: string[]): Promise<PackagedFood | null> {
  const queries = candidates.filter((c) => c.length === 12 || c.length === 13).slice(0, 2);
  for (const query of queries) {
    const foods = await searchUsdaBranded(`gtinUpc:${query}`, 10);
    const match = foods.find((food) => food.gtinUpc && candidates.some((c) => sameGtin(c, String(food.gtinUpc))))
      || foods[0];
    const product = match ? fromUsda(match) : null;
    if (product && (!match.gtinUpc || candidates.some((c) => sameGtin(c, String(match.gtinUpc))))) return product;
  }
  return null;
}

// ---------- Open Food Facts ----------

function offNumber(nutriments: any, key: string): number | null {
  const value = Number(nutriments?.[key]);
  return Number.isFinite(value) ? value : null;
}

function fromOpenFoodFacts(product: any, fallbackCode?: string): PackagedFood | null {
  const name = String(product?.product_name_en || product?.product_name || product?.generic_name || '').trim();
  if (!name) return null;
  const n = product.nutriments || {};

  const kcal100 = offNumber(n, 'energy-kcal_100g') ?? (offNumber(n, 'energy_100g') !== null ? offNumber(n, 'energy_100g')! / 4.184 : null);
  const per100g: PackagedNutrients | null = kcal100 === null ? null : {
    calories: Math.round(kcal100),
    protein: round1(offNumber(n, 'proteins_100g') ?? 0),
    carbs: round1(offNumber(n, 'carbohydrates_100g') ?? 0),
    fat: round1(offNumber(n, 'fat_100g') ?? 0),
    fiber: round1(offNumber(n, 'fiber_100g') ?? 0),
    sugar: round1(offNumber(n, 'sugars_100g') ?? 0),
    sodium: Math.round((offNumber(n, 'sodium_100g') ?? 0) * 1000),
  };

  const servingGrams = Number(product.serving_quantity);
  const grams = Number.isFinite(servingGrams) && servingGrams > 0 ? servingGrams : null;
  let perServing: PackagedNutrients | null = null;
  if (per100g && grams) {
    perServing = scaleNutrients(per100g, grams);
  } else {
    const kcalServing = offNumber(n, 'energy-kcal_serving');
    if (kcalServing !== null) {
      perServing = {
        calories: Math.round(kcalServing),
        protein: round1(offNumber(n, 'proteins_serving') ?? 0),
        carbs: round1(offNumber(n, 'carbohydrates_serving') ?? 0),
        fat: round1(offNumber(n, 'fat_serving') ?? 0),
        fiber: round1(offNumber(n, 'fiber_serving') ?? 0),
        sugar: round1(offNumber(n, 'sugars_serving') ?? 0),
        sodium: Math.round((offNumber(n, 'sodium_serving') ?? 0) * 1000),
      };
    }
  }
  if (!per100g && !perServing) return null;

  const code = String(product.code || fallbackCode || '') || null;
  const brand = String(product.brands || '').split(',')[0]?.trim() || null;
  return {
    id: `off:${code || name}`,
    barcode: code,
    name,
    brand,
    imageUrl: product.image_front_small_url || null,
    serving: {
      grams,
      label: String(product.serving_size || '').trim() || (per100g ? '100 g' : '1 serving'),
    },
    per100g,
    perServing,
    source: 'openfoodfacts',
  };
}

async function lookupOpenFoodFactsBarcode(candidates: string[]): Promise<PackagedFood | null> {
  for (const code of candidates.slice(0, 3)) {
    const data = await fetchJson(`${OFF_BASE}/api/v2/product/${code}.json`);
    if (data?.status === 1 && data.product) {
      const product = fromOpenFoodFacts(data.product, code);
      if (product) return product;
    }
  }
  return null;
}

async function searchOpenFoodFacts(query: string, pageSize: number): Promise<PackagedFood[]> {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: String(pageSize),
  });
    const data = await fetchJson(`${OFF_BASE}/cgi/search.pl?${params}`);
  const products = Array.isArray(data?.products) ? data.products : [];
  return products.map((p: any) => fromOpenFoodFacts(p)).filter(Boolean) as PackagedFood[];
}

// ---------- Public API ----------

/** USDA label data is preferred; Open Food Facts covers products USDA lacks and adds a photo. */
export async function lookupBarcode(candidates: string[]): Promise<PackagedFood | null> {
  if (!candidates.length) return null;
  const cacheKey = candidates[0];
  const cached = barcodeCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const [usda, off] = await Promise.all([lookupUsdaBarcode(candidates), lookupOpenFoodFactsBarcode(candidates)]);
  let product = usda || off;
  if (usda && off) {
    product = { ...usda, imageUrl: off.imageUrl, brand: usda.brand || off.brand };
  }

  barcodeCache.set(cacheKey, product, product ? 24 * HOUR : HOUR);
  return product;
}

export async function searchPackagedFoods(rawQuery: string, limit = 20): Promise<PackagedFood[]> {
  const query = rawQuery.trim().replace(/\s+/g, ' ').slice(0, 80);
  if (query.length < 2) return [];
  const cacheKey = query.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  const run = async (term: string) => {
    const [usdaFoods, offFoods] = await Promise.all([
      searchUsdaBranded(term, limit).then((foods) => foods.map(fromUsda).filter(Boolean) as PackagedFood[]),
      searchOpenFoodFacts(term, limit),
    ]);
    const seen = new Set<string>();
    const results: PackagedFood[] = [];
    const keyFor = (food: PackagedFood) =>
      food.barcode ? `gtin:${food.barcode.replace(/^0+/, '')}` : `name:${(food.brand || '').toLowerCase()}|${food.name.toLowerCase()}`;
    // Interleave so both well-known US brands and international products show up near the top.
    for (let i = 0; i < Math.max(usdaFoods.length, offFoods.length) && results.length < limit; i++) {
      for (const food of [usdaFoods[i], offFoods[i]]) {
        if (!food) continue;
        const key = keyFor(food);
        if (seen.has(key)) continue;
        seen.add(key);
        results.push(food);
      }
    }
    return results.slice(0, limit);
  };

  let final = await run(query);
  if (final.length === 0) {
    const shorter = query.split(' ').slice(0, 2).join(' ');
    if (shorter !== query) final = await run(shorter);
  }

  searchCache.set(cacheKey, final, final.length > 0 ? 6 * HOUR : 10 * 60 * 1000);
  return final;
}
