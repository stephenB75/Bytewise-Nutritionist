import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Florida / Caribbean favorites that were still missing from the catalog.
 * Juici Patties uses UK retail nutrition labels scaled to one 135 g patty.
 * Doubles use the Trinidad street-food study (~300 kcal per double).
 * Charlie's Pastries, Kingston 5, and Singh's Roti Shop do not publish nutrition;
 * those items are calibrated to Golden Krust bakery/plate values and published
 * Trinidad roti/doubles references so users can still log typical orders.
 */
const item = (
  id: string,
  name: string,
  restaurant: string,
  category: FastFoodCategory,
  serving: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  sodium: number,
  keywords?: string[],
): FastFoodItem => ({ id, name, restaurant, category, serving, calories, protein, carbs, fat, sodium, ...(keywords ? { keywords } : {}) });

export const CARIBBEAN_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // Juici Patties — retail label per 100 g scaled to 135 g patty
  item('juici-beef-patty', 'Beef Patty', 'Juici Patties', 'lunch', '1 patty', 410, 10, 41, 24, 540, ['jamaican', 'caribbean', 'juicy']),
  item('juici-chicken-patty', 'Chicken Patty', 'Juici Patties', 'lunch', '1 patty', 380, 10, 42, 20, 540, ['jamaican', 'caribbean', 'juicy']),
  item('juici-veggie-patty', 'Vegetable Patty', 'Juici Patties', 'lunch', '1 patty', 320, 7, 38, 16, 480, ['jamaican', 'vegetarian', 'juicy']),
  item('juici-shrimp-patty', 'Shrimp Patty', 'Juici Patties', 'lunch', '1 patty', 360, 11, 40, 18, 620, ['jamaican', 'seafood', 'juicy']),
  item('juici-coco-bread', 'Coco Bread', 'Juici Patties', 'snacks', '1 piece', 400, 8, 58, 15, 470, ['jamaican', 'caribbean']),
  item('juici-patty-coco', 'Beef Patty in Coco Bread', 'Juici Patties', 'lunch', '1 sandwich', 810, 18, 99, 39, 1010, ['jamaican', 'caribbean']),
  item('juici-breakfast-patty', 'Breakfast Patty', 'Juici Patties', 'breakfast', '1 patty', 390, 12, 38, 20, 580, ['jamaican', 'egg']),

  // Charlie's Pastries (Lauderhill / South Florida) — bakery analogs to Golden Krust published items
  item('charlies-beef-patty', 'Spicy Beef Patty', "Charlie's Pastries", 'lunch', '1 patty', 490, 12, 50, 24, 690, ['jamaican', 'caribbean', 'charlie']),
  item('charlies-mild-beef', 'Mild Beef Patty', "Charlie's Pastries", 'lunch', '1 patty', 470, 12, 49, 23, 660, ['jamaican', 'caribbean']),
  item('charlies-chicken-patty', 'Curry Chicken Patty', "Charlie's Pastries", 'lunch', '1 patty', 380, 12, 42, 18, 700, ['jamaican', 'caribbean']),
  item('charlies-jerk-chicken-patty', 'Jerk Chicken Patty', "Charlie's Pastries", 'lunch', '1 patty', 400, 14, 40, 20, 720, ['jamaican', 'jerk']),
  item('charlies-veggie-patty', 'Vegetable Patty', "Charlie's Pastries", 'lunch', '1 patty', 260, 6, 30, 12, 540, ['jamaican', 'vegetarian']),
  item('charlies-callaloo-patty', 'Callaloo & Saltfish Patty', "Charlie's Pastries", 'lunch', '1 patty', 340, 12, 36, 16, 780, ['jamaican', 'caribbean']),
  item('charlies-coco-bread', 'Coco Bread', "Charlie's Pastries", 'snacks', '1 piece', 400, 8, 58, 15, 470, ['jamaican']),
  item('charlies-patty-coco', 'Beef Patty in Coco Bread', "Charlie's Pastries", 'lunch', '1 sandwich', 870, 20, 108, 39, 1160, ['jamaican', 'caribbean']),
  item('charlies-hard-dough', 'Hard Dough Bread (slice)', "Charlie's Pastries", 'snacks', '1 slice', 140, 4, 28, 2, 220, ['jamaican', 'bread']),
  item('charlies-bulla', 'Bulla Cake', "Charlie's Pastries", 'snacks', '1 cake', 220, 4, 42, 5, 180, ['jamaican', 'dessert']),

  // Kingston 5 (Lake Nona / Orlando) — patties + fusion baos/tacos/platters
  item('kingston5-beef-patty', 'Beef Patty', 'Kingston 5', 'lunch', '1 patty', 490, 12, 50, 24, 690, ['jamaican', 'orlando', 'lake nona']),
  item('kingston5-jerk-chicken-patty', 'Jerk Chicken Patty', 'Kingston 5', 'lunch', '1 patty', 400, 14, 40, 20, 720, ['jamaican', 'jerk']),
  item('kingston5-veggie-patty', 'Veggie Patty', 'Kingston 5', 'lunch', '1 patty', 260, 6, 30, 12, 540, ['jamaican', 'vegetarian']),
  item('kingston5-oxtail-bao', 'Oxtail Bao', 'Kingston 5', 'lunch', '1 bao', 520, 22, 48, 26, 980, ['jamaican', 'bao', 'oxtail']),
  item('kingston5-brown-stew-bao', 'Brown Stew Chicken Bao', 'Kingston 5', 'lunch', '1 bao', 430, 20, 44, 18, 900, ['jamaican', 'bao']),
  item('kingston5-curry-bao', 'Curry Chicken Bao', 'Kingston 5', 'lunch', '1 bao', 420, 20, 44, 17, 880, ['jamaican', 'bao', 'curry']),
  item('kingston5-oxtail-taco', 'Oxtail Street Taco', 'Kingston 5', 'lunch', '1 taco', 500, 22, 42, 26, 960, ['jamaican', 'taco', 'oxtail']),
  item('kingston5-brown-stew-taco', 'Brown Stew Chicken Taco', 'Kingston 5', 'lunch', '1 taco', 420, 20, 38, 18, 880, ['jamaican', 'taco']),
  item('kingston5-curry-taco', 'Curry Chicken Taco', 'Kingston 5', 'lunch', '1 taco', 410, 20, 38, 17, 860, ['jamaican', 'taco', 'curry']),
  item('kingston5-oxtail-platter', 'Sweet Oxtail Platter (rice & peas)', 'Kingston 5', 'dinner', '1 platter', 1050, 52, 92, 52, 1600, ['jamaican', 'oxtail']),
  item('kingston5-brown-stew-platter', 'Brown Stew Chicken Platter', 'Kingston 5', 'dinner', '1 platter', 680, 36, 62, 28, 1540, ['jamaican']),
  item('kingston5-curry-platter', 'Curry Chicken Platter', 'Kingston 5', 'dinner', '1 platter', 640, 34, 62, 24, 1480, ['jamaican', 'curry']),
  item('kingston5-plantains', 'Sweet Plantains', 'Kingston 5', 'snacks', '1 side', 220, 1, 38, 8, 10, ['jamaican', 'maduros']),

  // Singh's Roti Shop (Orlando / South Florida Indo-Caribbean)
  item('singhs-doubles', 'Doubles', "Singh's Roti Shop", 'snacks', '1 doubles', 300, 10, 36, 12, 350, ['trinidad', 'caribbean', 'channa']),
  item('singhs-aloo-pie', 'Aloo Pie', "Singh's Roti Shop", 'snacks', '1 pie', 270, 5, 36, 12, 420, ['trinidad', 'potato']),
  item('singhs-pholourie', 'Pholourie (order)', "Singh's Roti Shop", 'snacks', '1 order', 220, 6, 28, 10, 380, ['trinidad']),
  item('singhs-chicken-roti', 'Curry Chicken Roti', "Singh's Roti Shop", 'lunch', '1 roti', 520, 36, 60, 18, 900, ['trinidad', 'roti', 'curry']),
  item('singhs-boneless-chicken-roti', 'Boneless Curry Chicken Roti', "Singh's Roti Shop", 'lunch', '1 roti', 540, 38, 58, 20, 920, ['trinidad', 'roti']),
  item('singhs-goat-roti', 'Curry Goat Roti', "Singh's Roti Shop", 'dinner', '1 roti', 580, 34, 58, 24, 980, ['trinidad', 'roti', 'goat']),
  item('singhs-beef-roti', 'Curry Beef Roti', "Singh's Roti Shop", 'dinner', '1 roti', 560, 32, 58, 22, 960, ['trinidad', 'roti']),
  item('singhs-shrimp-roti', 'Curry Shrimp Roti', "Singh's Roti Shop", 'dinner', '1 roti', 500, 28, 56, 18, 1100, ['trinidad', 'roti', 'shrimp']),
  item('singhs-oxtail', 'Oxtail with Rice or Roti', "Singh's Roti Shop", 'dinner', '1 plate', 920, 48, 70, 46, 1400, ['trinidad', 'oxtail']),
  item('singhs-curry-chicken-plate', 'Curry Chicken with Rice', "Singh's Roti Shop", 'dinner', '1 plate', 640, 34, 62, 24, 1480, ['trinidad', 'curry']),
  item('singhs-dhal-puri', 'Dhal Puri (roti shell)', "Singh's Roti Shop", 'snacks', '1 roti', 280, 8, 48, 6, 420, ['trinidad', 'roti']),
  item('singhs-bake-shark', 'Bake and Shark', "Singh's Roti Shop", 'sandwiches', '1 sandwich', 620, 28, 58, 30, 980, ['trinidad', 'fish']),
];
