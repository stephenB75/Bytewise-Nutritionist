/**
 * Regional footprint for catalog chains. Used to surface places that are
 * common where the user is, without needing a store-locator API.
 */

export type UsFoodRegion =
  | 'florida'
  | 'southeast'
  | 'texas'
  | 'southwest'
  | 'west'
  | 'midwest'
  | 'northeast'
  | 'hawaii';

export const REGION_LABELS: Record<UsFoodRegion, string> = {
  florida: 'Florida',
  southeast: 'the Southeast',
  texas: 'Texas',
  southwest: 'the Southwest',
  west: 'the West Coast',
  midwest: 'the Midwest',
  northeast: 'the Northeast',
  hawaii: 'Hawaii',
};

/** Nearby regions that should also appear in "Near you". */
const REGION_GROUP: Record<UsFoodRegion, UsFoodRegion[]> = {
  florida: ['florida', 'southeast'],
  southeast: ['southeast', 'florida'],
  texas: ['texas', 'southwest'],
  southwest: ['southwest', 'texas', 'west'],
  west: ['west', 'southwest', 'hawaii'],
  midwest: ['midwest'],
  northeast: ['northeast'],
  hawaii: ['hawaii', 'west'],
};

/**
 * Chains that are meaningfully regional. Names must match FAST_FOOD_RESTAURANTS.
 * Anything omitted is treated as national and stays in the A–Z sheet list.
 */
export const REGIONAL_RESTAURANTS: Record<string, UsFoodRegion[]> = {
  'Pollo Tropical': ['florida', 'southeast'],
  'La Granja': ['florida'],
  Hawkers: ['florida', 'southeast'],
  Bolay: ['florida'],
  'First Watch': ['florida', 'southeast', 'midwest', 'southwest'],
  Bojangles: ['southeast'],
  'Waffle House': ['southeast'],
  'Cook Out': ['southeast'],
  "Zaxby's": ['southeast'],
  Krystal: ['southeast'],
  'Chicken Salad Chick': ['southeast'],
  "Church's Texas Chicken": ['southeast', 'texas'],
  "Captain D's": ['southeast'],
  'Golden Chick': ['texas', 'southeast'],
  "Raising Cane's": ['southeast', 'texas', 'southwest'],
  Whataburger: ['texas', 'southwest'],
  "Buc-ee's": ['texas', 'southeast'],
  'Taco Cabana': ['texas'],
  "Schlotzsky's": ['texas', 'southwest'],
  "Torchy's Tacos": ['texas'],
  'Taco Bueno': ['texas'],
  'Bill Miller Bar-B-Q': ['texas'],
  'In-N-Out': ['west', 'southwest'],
  "Carl's Jr.": ['west', 'southwest'],
  'Jack in the Box': ['west', 'southwest'],
  'Del Taco': ['west', 'southwest'],
  'El Pollo Loco': ['west', 'southwest'],
  "Rubio's": ['west'],
  'Cafe Rio': ['west', 'southwest'],
  'The Habit Burger Grill': ['west'],
  'WaBa Grill': ['west'],
  Yoshinoya: ['west', 'hawaii'],
  Wienerschnitzel: ['west', 'southwest'],
  'Dutch Bros': ['west', 'midwest'],
  "Peet's Coffee": ['west'],
  'The Coffee Bean & Tea Leaf': ['west'],
  "L&L Hawaiian Barbecue": ['hawaii', 'west'],
  "Culver's": ['midwest'],
  'Skyline Chili': ['midwest'],
  Runza: ['midwest'],
  'White Castle': ['midwest', 'northeast'],
  'Bob Evans': ['midwest', 'southeast'],
  "Steak 'n Shake": ['midwest'],
  "Fazoli's": ['midwest', 'southeast'],
  "Portillo's": ['midwest'],
  "Leeann Chin": ['midwest'],
  "Taco John's": ['midwest'],
  "Scooter's Coffee": ['midwest'],
  "Casey's": ['midwest'],
  Wawa: ['northeast', 'southeast'],
  Sheetz: ['northeast'],
  'Primanti Bros': ['northeast'],
  'Tim Hortons': ['northeast', 'midwest'],
  "Rita's Italian Ice": ['northeast'],
  'Golden Krust': ['northeast', 'florida'],
  Jollibee: ['west', 'northeast', 'florida'],
  "Checkers & Rally's": ['southeast', 'midwest', 'northeast'],
  "Hardee's": ['southeast', 'midwest'],
  'Tropical Smoothie Cafe': ['southeast', 'florida'],
  '7 Brew': ['midwest', 'southeast', 'texas'],
};

export function regionFromCoords(lat: number, lng: number): UsFoodRegion | null {
  if (lat >= 18.8 && lat <= 22.4 && lng >= -160.4 && lng <= -154.7) return 'hawaii';
  if (lat >= 24.4 && lat <= 31.05 && lng >= -87.7 && lng <= -79.9) return 'florida';
  if (lat >= 25.8 && lat <= 36.55 && lng >= -106.7 && lng <= -93.45) return 'texas';
  if (lat >= 31.2 && lat <= 37.05 && lng >= -115.05 && lng <= -102.9) return 'southwest';
  if (lat >= 32.4 && lat <= 49.05 && lng >= -124.85 && lng <= -114.0) return 'west';
  if (lat >= 30.0 && lat <= 37.35 && lng >= -91.7 && lng <= -75.3) return 'southeast';
  if (lat >= 38.7 && lat <= 47.5 && lng >= -80.6 && lng <= -66.8) return 'northeast';
  if (lat >= 36.0 && lat <= 49.4 && lng >= -104.1 && lng <= -80.4) return 'midwest';
  return null;
}

/** Prefer these in the compact popular row when we know the user's region. */
const FEATURED_NEARBY: Record<UsFoodRegion, string[]> = {
  florida: ['Bolay', 'Pollo Tropical', 'Hawkers', 'La Granja'],
  southeast: ['Bojangles', 'Waffle House', "Zaxby's", 'Cook Out'],
  texas: ['Whataburger', "Buc-ee's", 'Taco Cabana', "Torchy's Tacos"],
  southwest: ['Whataburger', 'El Pollo Loco', 'In-N-Out', 'Cafe Rio'],
  west: ['In-N-Out', "Carl's Jr.", 'Dutch Bros', "Peet's Coffee"],
  midwest: ["Culver's", 'Skyline Chili', "Portillo's", 'White Castle'],
  northeast: ['Wawa', 'Sheetz', 'Tim Hortons', 'Primanti Bros'],
  hawaii: ["L&L Hawaiian Barbecue", 'Yoshinoya'],
};

export function regionalRestaurantsFor(region: UsFoodRegion, catalog: string[]): string[] {
  const wanted = new Set(REGION_GROUP[region]);
  return catalog.filter((name) => (REGIONAL_RESTAURANTS[name] || []).some((tag) => wanted.has(tag)));
}

export function featuredNearbyRestaurants(region: UsFoodRegion, catalog: string[], limit = 4): string[] {
  const nearby = regionalRestaurantsFor(region, catalog);
  const featured = (FEATURED_NEARBY[region] || []).filter((name) => nearby.includes(name));
  const rest = nearby.filter((name) => !featured.includes(name));
  return [...featured, ...rest].slice(0, limit);
}
