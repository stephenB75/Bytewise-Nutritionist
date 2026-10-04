import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Central Florida chains still missing from the national catalog.
 * Fresh Kitchen proteins/bowls use community-logged macros (the chain does not
 * publish a nutrition PDF). Pizza slices are calibrated to Papa John's New York
 * Style large-slice values, scaled up for Tomasino's 18" pies. Zaza Cuban and
 * Valdiano do not publish nutrition; those entries follow published Cuban /
 * NY-pizza analogs so typical orders can still be logged.
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

export const FLORIDA_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // Zaza Cuban Comfort — Central Florida
  item('zaza-cubano', 'Cubano Sandwich', 'Zaza Cuban Comfort', 'sandwiches', '1 sandwich', 620, 34, 52, 28, 1480, ['cuban', 'pork', 'zara']),
  item('zaza-mojo-chicken', 'Mojo Chicken Sandwich', 'Zaza Cuban Comfort', 'sandwiches', '1 sandwich', 520, 36, 48, 18, 1320, ['cuban', 'chicken']),
  item('zaza-pan-lechon', 'Pan Con Lechon', 'Zaza Cuban Comfort', 'sandwiches', '1 sandwich', 580, 32, 50, 26, 1400, ['cuban', 'pork']),
  item('zaza-philly-cuban', 'Philly Cuban (beef)', 'Zaza Cuban Comfort', 'sandwiches', '1 sandwich', 680, 38, 52, 32, 1560, ['cuban', 'beef']),
  item('zaza-bowl-chicken', 'Cuban Bowl (chicken)', 'Zaza Cuban Comfort', 'lunch', '1 bowl', 720, 38, 78, 26, 1280, ['cuban', 'bowl', 'rice']),
  item('zaza-bowl-pork', 'Cuban Bowl (pork)', 'Zaza Cuban Comfort', 'lunch', '1 bowl', 760, 36, 78, 30, 1340, ['cuban', 'bowl']),
  item('zaza-bowl-beef', 'Cuban Bowl (beef)', 'Zaza Cuban Comfort', 'dinner', '1 bowl', 800, 40, 78, 32, 1400, ['cuban', 'bowl']),
  item('zaza-bowl-veg', 'Cuban Bowl (vegetarian)', 'Zaza Cuban Comfort', 'lunch', '1 bowl', 580, 16, 88, 18, 980, ['cuban', 'vegetarian']),
  item('zaza-empanada-beef', 'Beef Empanada', 'Zaza Cuban Comfort', 'snacks', '1 empanada', 300, 10, 28, 16, 480, ['cuban', 'empanada']),
  item('zaza-empanada-chicken', 'Chicken Empanada', 'Zaza Cuban Comfort', 'snacks', '1 empanada', 280, 11, 28, 14, 460, ['cuban', 'empanada']),
  item('zaza-empanada-ham', 'Ham & Cheese Empanada', 'Zaza Cuban Comfort', 'snacks', '1 empanada', 310, 12, 28, 16, 520, ['cuban', 'empanada']),
  item('zaza-cuban-toast', 'Cuban Toast with Butter', 'Zaza Cuban Comfort', 'breakfast', '1 order', 220, 6, 32, 8, 380, ['cuban', 'toast']),
  item('zaza-egg-cuban', 'Cuban Ham Egg & Cheese', 'Zaza Cuban Comfort', 'breakfast', '1 sandwich', 480, 24, 42, 22, 1100, ['cuban', 'egg']),
  item('zaza-frijoles', 'Frijoles Negro Soup with Rice', 'Zaza Cuban Comfort', 'lunch', '1 bowl', 420, 16, 62, 12, 980, ['cuban', 'soup', 'beans']),
  item('zaza-maduros', 'Maduros (sweet plantains)', 'Zaza Cuban Comfort', 'snacks', '1 side', 220, 1, 38, 8, 10, ['cuban', 'plantains']),

  // Fresh Kitchen — Florida bowl chain (community-logged macros; no official PDF)
  item('fk-rosemary-chicken', 'Grilled Rosemary Chicken (protein)', 'Fresh Kitchen', 'lunch', '1 protein', 280, 52, 1, 7, 620, ['bowl', 'chicken', 'florida']),
  item('fk-almond-chicken', 'Almond Baked Chicken (protein)', 'Fresh Kitchen', 'lunch', '1 protein', 350, 45, 6, 15, 680, ['bowl', 'chicken']),
  item('fk-bbq-chicken', 'BBQ Chicken (protein)', 'Fresh Kitchen', 'lunch', '1 protein', 320, 42, 12, 10, 780, ['bowl', 'chicken', 'bbq']),
  item('fk-blackened-chicken', 'Blackened Chicken (protein)', 'Fresh Kitchen', 'lunch', '1 protein', 300, 50, 2, 9, 740, ['bowl', 'chicken']),
  item('fk-steak', 'Herb Grilled Steak (protein)', 'Fresh Kitchen', 'lunch', '1 protein', 330, 42, 1, 17, 720, ['bowl', 'steak']),
  item('fk-salmon', 'Roasted Salmon (protein)', 'Fresh Kitchen', 'lunch', '1 protein', 350, 34, 0, 23, 520, ['bowl', 'fish']),
  item('fk-teriyaki-salmon', 'Teriyaki Salmon (protein)', 'Fresh Kitchen', 'lunch', '1 protein', 420, 35, 14, 23, 880, ['bowl', 'fish']),
  item('fk-bowl-turkey', 'Turkey Meatball Bowl', 'Fresh Kitchen', 'lunch', '1 bowl', 490, 42, 22, 22, 980, ['bowl']),
  item('fk-bowl-steak', 'Steak Bowl (typical)', 'Fresh Kitchen', 'dinner', '1 bowl', 650, 52, 34, 30, 1200, ['bowl', 'steak']),
  item('fk-bowl-salmon', 'Salmon Bowl (typical)', 'Fresh Kitchen', 'dinner', '1 bowl', 610, 44, 28, 32, 980, ['bowl', 'fish']),
  item('fk-bowl-bbq', 'BBQ Chicken Bowl (typical)', 'Fresh Kitchen', 'dinner', '1 bowl', 720, 46, 68, 24, 1400, ['bowl', 'bbq']),
  item('fk-basic-bowl', 'The Basic Chef Bowl', 'Fresh Kitchen', 'lunch', '1 bowl', 540, 48, 36, 22, 1100, ['bowl']),
  item('fk-3-bowl', '3 Bowl (typical build)', 'Fresh Kitchen', 'lunch', '1 bowl', 520, 44, 38, 20, 1050, ['bowl']),
  item('fk-4-bowl', '4 Bowl (typical build)', 'Fresh Kitchen', 'lunch', '1 bowl', 640, 48, 52, 24, 1200, ['bowl']),
  item('fk-6-bowl', '6 Bowl (typical build)', 'Fresh Kitchen', 'dinner', '1 bowl', 820, 62, 64, 32, 1480, ['bowl']),

  // Tomasino's Pizza — Orlando / Lake Nona NY-style (18" pies)
  item('tomasino-cheese-slice', 'Cheese Pizza (slice)', "Tomasino's Pizza", 'dinner', '1 slice', 380, 14, 42, 18, 820, ['pizza', 'orlando', 'tommasino']),
  item('tomasino-pepperoni-slice', 'Pepperoni Pizza (slice)', "Tomasino's Pizza", 'dinner', '1 slice', 420, 16, 42, 20, 980, ['pizza']),
  item('tomasino-margherita-slice', 'Margherita (slice)', "Tomasino's Pizza", 'dinner', '1 slice', 360, 14, 40, 16, 760, ['pizza']),
  item('tomasino-mechanic-slice', 'The Mechanic (slice)', "Tomasino's Pizza", 'dinner', '1 slice', 460, 18, 42, 24, 1120, ['pizza', 'deluxe']),
  item('tomasino-butcher-slice', "The Butcher's Pizza (slice)", "Tomasino's Pizza", 'dinner', '1 slice', 480, 20, 40, 26, 1240, ['pizza', 'meat']),
  item('tomasino-cheese-calzone', 'Cheese Calzone', "Tomasino's Pizza", 'dinner', '1 calzone', 780, 36, 72, 36, 1680, ['calzone']),
  item('tomasino-chicken-parm-sub', 'Chicken Parmigiana Sub', "Tomasino's Pizza", 'sandwiches', '1 sub', 920, 48, 78, 42, 2100, ['sub', 'chicken']),
  item('tomasino-meatball-sub', 'Meatball Parmigiana Sub', "Tomasino's Pizza", 'sandwiches', '1 sub', 880, 42, 76, 40, 1980, ['sub']),
  item('tomasino-italian-sub', 'Italian Combo Sub', "Tomasino's Pizza", 'sandwiches', '1 sub', 820, 38, 68, 40, 2200, ['sub']),
  item('tomasino-cheesesteak', 'Cheesesteak Sub', "Tomasino's Pizza", 'sandwiches', '1 sub', 860, 44, 66, 42, 1860, ['sub', 'philly']),
  item('tomasino-chicken-parm', 'Chicken Parmigiana with Pasta', "Tomasino's Pizza", 'dinner', '1 entrée', 1180, 62, 98, 54, 2480, ['pasta', 'chicken']),
  item('tomasino-baked-ziti', 'Baked Ziti', "Tomasino's Pizza", 'dinner', '1 entrée', 920, 38, 92, 42, 1980, ['pasta']),
  item('tomasino-garlic-knots', 'Garlicky Cheesy Knots', "Tomasino's Pizza", 'snacks', '1 order', 640, 18, 68, 32, 1280, ['appetizer', 'bread']),
  item('tomasino-wings', 'Buffalo Wings (10)', "Tomasino's Pizza", 'lunch', '10 wings', 720, 58, 4, 52, 1860, ['wings']),
  item('tomasino-greek-salad', 'Greek Salad', "Tomasino's Pizza", 'lunch', '1 salad', 480, 22, 18, 36, 1420, ['salad']),

  // Pizzeria Valdiano — Winter Park / Waterford Lakes / Lakeland
  item('valdiano-cheese-slice', 'Cheese Pizza (slice)', 'Pizzeria Valdiano', 'dinner', '1 slice', 360, 14, 40, 16, 780, ['pizza', 'valdianos']),
  item('valdiano-pepperoni-slice', 'Pepperoni Pizza (slice)', 'Pizzeria Valdiano', 'dinner', '1 slice', 400, 16, 40, 18, 920, ['pizza']),
  item('valdiano-sausage-lasagna', 'Pizza Sausage Lasagna (slice)', 'Pizzeria Valdiano', 'dinner', '1 slice', 440, 18, 38, 22, 1080, ['pizza', 'lasagna']),
  item('valdiano-meatball-sub', 'Meatball Sub', 'Pizzeria Valdiano', 'sandwiches', '1 sub', 820, 40, 74, 38, 1920, ['sub']),
  item('valdiano-antipasto', 'Antipasto Salad', 'Pizzeria Valdiano', 'lunch', '1 salad', 520, 28, 16, 38, 1480, ['salad']),
  item('valdiano-stromboli', 'Stromboli (slice)', 'Pizzeria Valdiano', 'lunch', '1 slice', 380, 16, 36, 18, 980, ['stromboli']),
  item('valdiano-garlic-knots', 'Garlic Knots', 'Pizzeria Valdiano', 'snacks', '1 order', 420, 10, 52, 18, 860, ['bread']),
  item('valdiano-caprese', 'Caprese Pizza (slice)', 'Pizzeria Valdiano', 'dinner', '1 slice', 340, 14, 38, 14, 720, ['pizza']),
];
