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
  'Kingston 5': ['florida'],
  "Singh's Roti Shop": ['florida'],
  'Juici Patties': ['florida', 'southeast', 'northeast'],
  "Charlie's Pastries": ['florida'],
  // National Darden chain — surface in every region’s “near you” row
  'Bahama Breeze': ['florida', 'southeast', 'midwest', 'northeast', 'southwest', 'texas', 'west', 'hawaii'],
  "Peppa's Jerk Chicken": ['florida'],
  'Chef Creole': ['florida'],
  'Zaza Cuban Comfort': ['florida'],
  'True Island Grille': ['florida'],
  'Caribbean Sunshine Bakery': ['florida'],
  // Common independent Jamaican restaurant name used in many cities
  'Taste of Jamaica': ['florida', 'southeast', 'texas', 'northeast', 'midwest'],
  "Miss Lily's": ['northeast'],
  // Multi-city Caribbean brands filling Midwest / DMV / Texas / Atlanta gaps
  'Jerk at Nite': ['northeast', 'southeast', 'midwest', 'texas'],
  'Jerk King': ['midwest'],
  "Ja' Grill": ['midwest'],
  'The Jerk Shack': ['texas', 'southwest'],
  'Jamaican Jerk Biz': ['southeast'],
  "Mark's Jamaican Bar & Grill": ['florida'],
  'Negril Jamaican Restaurant': ['florida'],
  'Negril Jamaican Eatery': ['northeast', 'southeast'],
  'Scotch Bonnet Kitchen': ['northeast'],
  'Reggae Pot': ['southwest', 'west'],
  'Island Spice': ['northeast', 'southeast'],
  'Peppers Jamaican': ['west'],
  "Bouka's Jamaican Restaurant": ['west'],
  'Potwah Jamaican Cuisine': ['west'],
  'Fresh Kitchen': ['florida'],
  "Tomasino's Pizza": ['florida'],
  'Pizzeria Valdiano': ['florida'],
  "Sonny's BBQ": ['florida', 'southeast'],
  PDQ: ['florida', 'southeast'],
  "Miller's Ale House": ['florida', 'southeast', 'northeast'],
  'Bonefish Grill': ['florida', 'southeast', 'northeast', 'midwest', 'southwest'],
  Bibibop: ['midwest', 'southeast', 'texas'],
  "Nando's PERi-PERi": ['northeast', 'midwest', 'west', 'florida'],
  "Lee's Sandwiches": ['west', 'southwest', 'texas', 'florida'],
  'Nothing Bundt Cakes': ['florida', 'southeast', 'midwest', 'southwest', 'west', 'northeast', 'texas'],
  'Insomnia Cookies': ['northeast', 'midwest', 'southeast', 'west', 'florida'],
  Yogurtland: ['west', 'southwest', 'hawaii', 'florida'],
  "Menchie's": ['west', 'southwest', 'florida', 'southeast'],
  "Andy's Frozen Custard": ['midwest', 'southeast', 'texas', 'southwest', 'florida'],
  'Duck Donuts': ['southeast', 'northeast', 'florida', 'midwest'],
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
  // Largest Caribbean QSR footprint in the US — keep visible beyond the Northeast/FL core
  'Golden Krust': ['northeast', 'florida', 'southeast', 'texas', 'midwest'],
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

/**
 * Caribbean / West Indian places with menus in the catalog.
 * Shown via the Caribbean cuisine filter and cuisine-keyword search nationwide.
 */
export const CARIBBEAN_RESTAURANTS = [
  'Golden Krust',
  'Pollo Tropical',
  'Bahama Breeze',
  'Juici Patties',
  "Charlie's Pastries",
  'Kingston 5',
  "Singh's Roti Shop",
  "Peppa's Jerk Chicken",
  'Chef Creole',
  'Zaza Cuban Comfort',
  'True Island Grille',
  'Taste of Jamaica',
  'Caribbean Sunshine Bakery',
  "Miss Lily's",
  'Jerk at Nite',
  'Jerk King',
  "Ja' Grill",
  'The Jerk Shack',
  'Jamaican Jerk Biz',
  "Mark's Jamaican Bar & Grill",
  'Negril Jamaican Restaurant',
  'Negril Jamaican Eatery',
  'Scotch Bonnet Kitchen',
  'Reggae Pot',
  'Island Spice',
  'Peppers Jamaican',
  "Bouka's Jamaican Restaurant",
  'Potwah Jamaican Cuisine',
] as const;

/**
 * Food culture / style filters for the Places picker.
 * A restaurant should appear in the one primary style that best matches how users search.
 */
export type FoodCuisine =
  | 'caribbean'
  | 'asian'
  | 'mexican'
  | 'italian'
  | 'chicken'
  | 'burgers'
  | 'bbq'
  | 'mediterranean'
  | 'seafood'
  | 'cafe';

export const CUISINE_LABELS: Record<FoodCuisine, string> = {
  caribbean: 'Caribbean',
  asian: 'Asian',
  mexican: 'Mexican',
  italian: 'Italian',
  chicken: 'Chicken',
  burgers: 'Burgers',
  bbq: 'BBQ',
  mediterranean: 'Mediterranean',
  seafood: 'Seafood',
  cafe: 'Cafe',
};

export const ASIAN_RESTAURANTS = [
  'Panda Express',
  "P.F. Chang's",
  'Pei Wei',
  'Manchu Wok',
  'Sarku Japan',
  'Teriyaki Madness',
  "Tokyo Joe's",
  'Yoshinoya',
  'Wow Bao',
  'Bonchon',
  'Bibibop',
  'Hawkers',
  'HuHot',
  'Jollibee',
  'Leeann Chin',
  "Lee's Sandwiches",
  "L&L Hawaiian Barbecue",
  'WaBa Grill',
  'Noodles & Company',
] as const;

export const MEXICAN_RESTAURANTS = [
  'Taco Bell',
  'Chipotle',
  'Qdoba',
  "Moe's Southwest Grill",
  'Del Taco',
  'El Pollo Loco',
  'Cafe Rio',
  "Rubio's",
  'Taco Cabana',
  'Taco Bueno',
  "Taco John's",
  "Torchy's Tacos",
  'Pollo Campero',
  'La Granja',
] as const;

export const ITALIAN_RESTAURANTS = [
  'Olive Garden',
  "Carrabba's Italian Grill",
  "Domino's",
  'Pizza Hut',
  "Papa John's",
  'Little Caesars',
  'Blaze Pizza',
  'MOD Pizza',
  "Marco's Pizza",
  'Sbarro',
  'California Pizza Kitchen',
  "Fazoli's",
  "Hungry Howie's",
  "Papa Murphy's",
  "Tomasino's Pizza",
  'Pizzeria Valdiano',
] as const;

export const CHICKEN_RESTAURANTS = [
  'Chick-fil-A',
  'Popeyes',
  'KFC',
  "Raising Cane's",
  'Wingstop',
  "Zaxby's",
  'Bojangles',
  "Church's Texas Chicken",
  'Golden Chick',
  'Slim Chickens',
  "Dave's Hot Chicken",
  'Buffalo Wild Wings',
  'PDQ',
  'Boston Market',
  "Nando's PERi-PERi",
] as const;

export const BURGER_RESTAURANTS = [
  "McDonald's",
  'Burger King',
  "Wendy's",
  'Five Guys',
  'Shake Shack',
  'In-N-Out',
  'Whataburger',
  "Culver's",
  "Carl's Jr.",
  "Hardee's",
  'Sonic',
  'Jack in the Box',
  'White Castle',
  'Smashburger',
  'The Habit Burger Grill',
  'Fatburger',
  "Freddy's",
  "Checkers & Rally's",
  'Krystal',
  "Steak 'n Shake",
  "A&W",
  "Red Robin",
] as const;

export const BBQ_RESTAURANTS = [
  "Sonny's BBQ",
  "Famous Dave's",
  "Dickey's Barbecue Pit",
  'Texas Roadhouse',
  'Bill Miller Bar-B-Q',
  'LongHorn Steakhouse',
  'Outback Steakhouse',
  'Cracker Barrel',
  "Logan's Roadhouse",
] as const;

export const MEDITERRANEAN_RESTAURANTS = [
  'Cava',
  'The Halal Guys',
  'Sweetgreen',
  'Bolay',
  'Fresh Kitchen',
] as const;

export const SEAFOOD_RESTAURANTS = [
  'Red Lobster',
  "Long John Silver's",
  "Captain D's",
  'Bonefish Grill',
] as const;

export const CAFE_RESTAURANTS = [
  'Starbucks',
  "Dunkin'",
  "Peet's Coffee",
  'Dutch Bros',
  'Caribou Coffee',
  'The Coffee Bean & Tea Leaf',
  "Scooter's Coffee",
  '7 Brew',
  'Tim Hortons',
  'Panera Bread',
  'First Watch',
  "Einstein Bros. Bagels",
  'Krispy Kreme',
  'Duck Donuts',
  'Cinnabon',
  "Auntie Anne's",
  "Wetzel's Pretzels",
  'Baskin-Robbins',
  "Ben & Jerry's",
  'Cold Stone Creamery',
  "Menchie's",
  'Yogurtland',
  'Crumbl',
  'Insomnia Cookies',
  'Nothing Bundt Cakes',
  "Rita's Italian Ice",
  "Andy's Frozen Custard",
  'Jamba',
  'Smoothie King',
  'Tropical Smoothie Cafe',
] as const;

/** Prefer these in the compact popular row when we know the user's region. */
const FEATURED_NEARBY: Record<UsFoodRegion, string[]> = {
  florida: ['Negril Jamaican Restaurant', "Mark's Jamaican Bar & Grill", 'Caribbean Sunshine Bakery', 'Pollo Tropical'],
  southeast: ['Jamaican Jerk Biz', 'Negril Jamaican Eatery', 'Island Spice', 'Golden Krust'],
  texas: ['The Jerk Shack', 'Jerk at Nite', 'Taste of Jamaica', 'Golden Krust'],
  southwest: ['Reggae Pot', 'The Jerk Shack', 'Bahama Breeze', 'Whataburger'],
  west: ['Peppers Jamaican', "Bouka's Jamaican Restaurant", 'Potwah Jamaican Cuisine', 'Reggae Pot'],
  midwest: ["Ja' Grill", 'Jerk King', 'Jerk at Nite', 'Bahama Breeze'],
  northeast: ['Negril Jamaican Eatery', 'Scotch Bonnet Kitchen', 'Jerk at Nite', 'Golden Krust'],
  hawaii: ['Bahama Breeze', "L&L Hawaiian Barbecue", 'Yoshinoya'],
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
