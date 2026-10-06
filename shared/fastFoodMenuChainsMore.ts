import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Fourth wave of missing popular chains.
 * Which Wich — 2024 nutrition PDF (large sandwiches).
 * Romano's Macaroni Grill — official nutrition facts PDF.
 * Firebirds Wood Fired Grill — Mar 2026 nutritional guide.
 * City Barbeque — Nutritionix interactive menu.
 * On The Border — Feb 2024 nutrition/allergen PDF (+ HealthyFastFood decode).
 * Jet's Pizza — published slice nutrition (FatSecret / CalorieKing).
 * Anthony's Coal Fired Pizza — FatSecret + menu calorie midpoints; macros Atwater-aligned.
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

export const CHAINS_MORE_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // ——— Which Wich (large sandwiches) ———
  item('ww-turkey', 'Turkey Sandwich (large)', 'Which Wich', 'sandwiches', '1 large', 560, 39, 85, 6, 2400, ['turkey']),
  item('ww-chicken', 'Chicken Sandwich (large)', 'Which Wich', 'sandwiches', '1 large', 560, 40, 82, 8, 2180, ['chicken']),
  item('ww-roast-beef', 'Roast Beef Sandwich (large)', 'Which Wich', 'sandwiches', '1 large', 560, 40, 82, 8, 2710, ['roast beef']),
  item('ww-ham', 'Ham Sandwich (large)', 'Which Wich', 'sandwiches', '1 large', 580, 35, 88, 11, 2950, ['ham']),
  item('ww-club', 'Club Sandwich (large)', 'Which Wich', 'sandwiches', '1 large', 690, 45, 86, 18, 2910, ['club']),
  item('ww-wicked', 'Wicked Sandwich (large)', 'Which Wich', 'sandwiches', '1 large', 770, 46, 85, 28, 3150, ['wicked']),
  item('ww-buffalo', 'Buffalo Chicken Sandwich (large)', 'Which Wich', 'sandwiches', '1 large', 570, 40, 84, 8, 2830, ['buffalo', 'chicken']),
  item('ww-chicken-pesto', 'Chicken Pesto Sandwich (large)', 'Which Wich', 'sandwiches', '1 large', 640, 42, 83, 16, 2340, ['chicken', 'pesto']),
  item('ww-philly', 'Philly Cheesesteak', 'Which Wich', 'sandwiches', '1 sandwich', 720, 47, 64, 30, 1730, ['philly']),
  item('ww-meatball', 'Meatball Sandwich (large)', 'Which Wich', 'sandwiches', '1 large', 950, 46, 96, 43, 2410, ['meatball']),
  item('ww-grinder', 'Grinder Sandwich (large)', 'Which Wich', 'sandwiches', '1 large', 870, 37, 82, 42, 3010, ['italian']),
  item('ww-caprese', 'Caprese Sandwich (large)', 'Which Wich', 'sandwiches', '1 large', 820, 36, 95, 34, 1500, ['caprese']),
  item('ww-blt', 'Ultimate BLT', 'Which Wich', 'sandwiches', '1 sandwich', 850, 30, 61, 56, 1730, ['blt']),
  item('ww-reuben', 'The Reuben', 'Which Wich', 'sandwiches', '1 sandwich', 610, 48, 47, 27, 2690, ['reuben']),
  item('ww-tuna', 'Tuna Salad Sandwich (large)', 'Which Wich', 'sandwiches', '1 large', 1290, 72, 88, 72, 2980, ['tuna']),
  item('ww-avocado', 'Avocado Sandwich (large)', 'Which Wich', 'sandwiches', '1 large', 600, 15, 91, 20, 990, ['avocado', 'vegetarian']),
  item('ww-cookie', 'Chocolate Chip Cookie', 'Which Wich', 'snacks', '1 cookie', 240, 3, 34, 11, 180, ['cookie', 'dessert']),

  // ——— Romano's Macaroni Grill ———
  item('rmg-fettuccine-alfredo', 'Fettuccine Alfredo', "Romano's Macaroni Grill", 'dinner', '1 entrée', 1140, 44, 114, 56, 1840, ['pasta', 'alfredo']),
  item('rmg-fettuccine-chicken', 'Fettuccine Alfredo with Chicken', "Romano's Macaroni Grill", 'dinner', '1 entrée', 1370, 66, 117, 72, 2470, ['pasta', 'chicken']),
  item('rmg-lasagna', 'Lasagna Bolognese', "Romano's Macaroni Grill", 'dinner', '1 entrée', 1110, 60, 69, 67, 2740, ['pasta', 'lasagna']),
  item('rmg-pasta-milano', 'Pasta Milano', "Romano's Macaroni Grill", 'dinner', '1 entrée', 1040, 49, 123, 39, 1850, ['pasta', 'chicken']),
  item('rmg-penne-rustica', 'Penne Rustica', "Romano's Macaroni Grill", 'dinner', '1 entrée', 1060, 66, 82, 52, 3020, ['pasta']),
  item('rmg-chicken-parm', 'Chicken Parmesan', "Romano's Macaroni Grill", 'dinner', '1 entrée', 1610, 79, 120, 92, 1890, ['chicken']),
  item('rmg-carmelas', "Carmela's Chicken", "Romano's Macaroni Grill", 'dinner', '1 entrée', 1090, 33, 98, 61, 1380, ['chicken']),
  item('rmg-pollo-caprese', 'Pollo Caprese', "Romano's Macaroni Grill", 'dinner', '1 entrée', 560, 50, 40, 22, 1080, ['chicken']),
  item('rmg-shrimp-scampi', 'Shrimp Scampi', "Romano's Macaroni Grill", 'dinner', '1 entrée', 1180, 35, 56, 88, 2560, ['shrimp', 'pasta']),
  item('rmg-pepperoni-pizza', 'Pepperoni Pizza', "Romano's Macaroni Grill", 'dinner', '1 pizza', 1280, 54, 143, 76, 2860, ['pizza']),
  item('rmg-margherita', 'Margherita Pizza', "Romano's Macaroni Grill", 'dinner', '1 pizza', 1140, 47, 146, 41, 2310, ['pizza']),
  item('rmg-caesar-chicken', "Rosa's Signature Caesar with Chicken", "Romano's Macaroni Grill", 'lunch', '1 salad', 630, 51, 15, 41, 1090, ['salad', 'caesar']),
  item('rmg-italian-chopped', 'Italian Chopped Salad', "Romano's Macaroni Grill", 'lunch', '1 salad', 490, 27, 20, 34, 2280, ['salad']),
  item('rmg-calamari', 'Calamari Fritti', "Romano's Macaroni Grill", 'snacks', '1 order', 760, 33, 33, 55, 700, ['appetizer']),
  item('rmg-spinach-dip', 'Spinach + Artichoke Dip', "Romano's Macaroni Grill", 'snacks', '1 order', 1100, 30, 109, 61, 1980, ['appetizer', 'dip']),
  item('rmg-meatball-sand', 'Meatball Sandwich', "Romano's Macaroni Grill", 'sandwiches', '1 sandwich', 1180, 56, 70, 73, 2520, ['meatball']),
  item('rmg-truffle-mac', 'Signature Truffle Mac + Cheese', "Romano's Macaroni Grill", 'dinner', '1 entrée', 1060, 45, 24, 89, 2970, ['mac']),
  item('rmg-tiramisu', 'Tiramisu', "Romano's Macaroni Grill", 'snacks', '1 slice', 600, 7, 54, 39, 65, ['dessert']),

  // ——— Firebirds Wood Fired Grill ———
  item('fb-cheeseburger', 'Cheeseburger', 'Firebirds Wood Fired Grill', 'sandwiches', '1 burger', 910, 47, 51, 56, 1400, ['burger']),
  item('fb-bacon-cheese', 'Cheeseburger with Bacon', 'Firebirds Wood Fired Grill', 'sandwiches', '1 burger', 990, 51, 52, 62, 1700, ['burger']),
  item('fb-smokehouse-burger', 'Smokehouse Burger', 'Firebirds Wood Fired Grill', 'sandwiches', '1 burger', 980, 45, 73, 54, 2150, ['burger']),
  item('fb-hot-honey', 'Hot Honey Chicken Sandwich', 'Firebirds Wood Fired Grill', 'sandwiches', '1 sandwich', 1420, 54, 120, 84, 3840, ['chicken']),
  item('fb-club', 'Classic Club Sandwich', 'Firebirds Wood Fired Grill', 'sandwiches', '1 sandwich', 1070, 53, 61, 66, 2380, ['club']),
  item('fb-filet-7', 'Filet Mignon (7 oz)', 'Firebirds Wood Fired Grill', 'dinner', '7 oz', 340, 38, 2, 20, 1610, ['steak', 'filet']),
  item('fb-filet-9', 'Filet Mignon (9 oz)', 'Firebirds Wood Fired Grill', 'dinner', '9 oz', 410, 48, 2, 23, 1640, ['steak', 'filet']),
  item('fb-ribeye-12', 'Aged Ribeye (12 oz)', 'Firebirds Wood Fired Grill', 'dinner', '12 oz', 580, 53, 6, 38, 1630, ['steak', 'ribeye']),
  item('fb-ny-strip', 'Wood Grilled NY Strip (14 oz)', 'Firebirds Wood Fired Grill', 'dinner', '14 oz', 720, 91, 1, 37, 1570, ['steak', 'strip']),
  item('fb-salmon', 'Wood Grilled Salmon Dinner', 'Firebirds Wood Fired Grill', 'dinner', '1 entrée', 490, 39, 10, 32, 760, ['salmon', 'seafood']),
  item('fb-shrimp-grits', 'Shrimp & Grits', 'Firebirds Wood Fired Grill', 'dinner', '1 entrée', 920, 71, 67, 40, 2580, ['shrimp']),
  item('fb-ribs', 'Baby Back Ribs Dinner', 'Firebirds Wood Fired Grill', 'dinner', '1 order', 1260, 60, 78, 81, 1550, ['ribs', 'bbq']),
  item('fb-parm-chicken', 'Parmesan Crusted Chicken (lunch)', 'Firebirds Wood Fired Grill', 'dinner', '1 entrée', 880, 49, 42, 51, 1590, ['chicken']),
  item('fb-honey-garlic', 'Honey Garlic Chicken (lunch)', 'Firebirds Wood Fired Grill', 'dinner', '1 entrée', 460, 38, 27, 24, 1080, ['chicken']),
  item('fb-cobb', 'Grilled Chopped Cobb Salad', 'Firebirds Wood Fired Grill', 'lunch', '1 salad', 600, 52, 18, 34, 1530, ['salad', 'cobb']),
  item('fb-wings', 'Smoked Chicken Wings', 'Firebirds Wood Fired Grill', 'dinner', '1 order', 700, 64, 1, 49, 2150, ['wings']),
  item('fb-mac', 'Killer Mac & Cheese', 'Firebirds Wood Fired Grill', 'snacks', '1 side', 700, 31, 81, 27, 320, ['mac']),
  item('fb-fries', 'Seasoned Steak Fries', 'Firebirds Wood Fired Grill', 'snacks', '1 side', 610, 9, 80, 28, 960, ['fries']),

  // ——— City Barbeque ———
  item('cbbq-brisket-sand', 'Beef Brisket Sandwich', 'City Barbeque', 'sandwiches', '1 sandwich', 680, 43, 33, 40, 1010, ['brisket', 'bbq']),
  item('cbbq-pork-sand', 'Hand-Pulled Pork Sandwich', 'City Barbeque', 'sandwiches', '1 sandwich', 630, 44, 31, 36, 880, ['pork', 'bbq']),
  item('cbbq-chicken-sand', "Bama Pulled Chicken Sandwich", 'City Barbeque', 'sandwiches', '1 sandwich', 570, 34, 33, 35, 1140, ['chicken', 'bbq']),
  item('cbbq-turkey-sand', 'Turkey Breast Sandwich', 'City Barbeque', 'sandwiches', '1 sandwich', 430, 46, 32, 13, 1500, ['turkey', 'bbq']),
  item('cbbq-lolo', "Lolo's Pulled Pork", 'City Barbeque', 'sandwiches', '1 sandwich', 710, 41, 40, 43, 1140, ['pork', 'bbq']),
  item('cbbq-nashville', 'Nashville Hot Chicken', 'City Barbeque', 'sandwiches', '1 sandwich', 600, 31, 48, 31, 2080, ['chicken', 'nashville']),
  item('cbbq-cowbell', 'More Cowbell', 'City Barbeque', 'sandwiches', '1 sandwich', 1020, 36, 72, 64, 1350, ['brisket', 'bbq']),
  item('cbbq-brisket-half', 'Beef Brisket (1/2 lb)', 'City Barbeque', 'dinner', '1/2 lb', 570, 41, 3, 43, 810, ['brisket', 'bbq']),
  item('cbbq-pork-half', 'Hand-Pulled Pork (1/2 lb)', 'City Barbeque', 'dinner', '1/2 lb', 530, 42, 1, 38, 660, ['pork', 'bbq']),
  item('cbbq-ribs-half', 'Half Slab of Ribs', 'City Barbeque', 'dinner', 'half slab', 660, 44, 3, 51, 770, ['ribs', 'bbq']),
  item('cbbq-ribs-full', 'Full Slab of Ribs', 'City Barbeque', 'dinner', 'full slab', 1320, 88, 6, 102, 1550, ['ribs', 'bbq']),
  item('cbbq-half-bird', 'Half Bird', 'City Barbeque', 'dinner', '1/2 chicken', 830, 75, 0, 60, 1220, ['chicken', 'bbq']),
  item('cbbq-mac', '3 Cheese Baked Mac', 'City Barbeque', 'snacks', '1 side', 460, 26, 26, 29, 730, ['mac', 'side']),
  item('cbbq-beans', 'Baked Beans with Brisket', 'City Barbeque', 'snacks', '1 side', 280, 11, 49, 5, 960, ['beans', 'side']),
  item('cbbq-cornbread', 'Cornbread', 'City Barbeque', 'snacks', '1 piece', 370, 6, 50, 16, 760, ['cornbread']),
  item('cbbq-banana', 'Banana Pudding', 'City Barbeque', 'snacks', '1 serving', 720, 7, 103, 31, 1080, ['dessert']),

  // ——— On The Border ———
  item('otb-chips-salsa', 'Chips & Salsa', 'On The Border', 'snacks', '1 order', 390, 5, 51, 19, 470, ['chips']),
  item('otb-queso', 'Signature Queso Bowl', 'On The Border', 'snacks', '1 bowl', 480, 26, 18, 35, 2350, ['queso', 'dip']),
  item('otb-guac', 'Guacamole (without chips)', 'On The Border', 'snacks', '1 order', 240, 3, 15, 20, 450, ['guacamole']),
  item('otb-chicken-fajita', 'Grilled Chicken Fajita Filling', 'On The Border', 'dinner', '1 serving', 370, 48, 12, 15, 1040, ['fajita', 'chicken']),
  item('otb-steak-fajita', 'Grilled Steak Fajita Filling', 'On The Border', 'dinner', '1 serving', 470, 44, 16, 26, 1590, ['fajita', 'steak']),
  item('otb-smart-fajita', 'Border Smarts Chicken Fajitas', 'On The Border', 'dinner', '1 entrée', 650, 53, 80, 13, 1500, ['fajita', 'chicken']),
  item('otb-ultimate-fajita', 'The Ultimate Fajita', 'On The Border', 'dinner', '1 entrée', 980, 50, 23, 81, 2800, ['fajita']),
  item('otb-queso-ench', 'Border Queso Beef Enchiladas', 'On The Border', 'dinner', '1 entrée', 510, 26, 35, 29, 1610, ['enchilada']),
  item('otb-chicken-ench', 'Chicken Tinga Tomatillo Enchiladas with Rice', 'On The Border', 'dinner', '1 entrée', 460, 22, 71, 10, 1290, ['enchilada']),
  item('otb-burrito-beef', 'Classic Burrito (Seasoned Ground Beef)', 'On The Border', 'sandwiches', '1 burrito', 840, 48, 55, 47, 2110, ['burrito']),
  item('otb-chimi', 'Classic Chimichanga (Seasoned Ground Beef)', 'On The Border', 'dinner', '1 entrée', 960, 50, 66, 55, 2340, ['chimichanga']),
  item('otb-carne-asada', 'Carne Asada', 'On The Border', 'dinner', '1 entrée', 990, 49, 55, 65, 2920, ['steak']),
  item('otb-grilled-chicken', 'Mexican Grilled Chicken', 'On The Border', 'dinner', '1 entrée', 670, 70, 60, 18, 2300, ['chicken']),
  item('otb-nachos', 'Grande Fajita Nachos (Steak)', 'On The Border', 'snacks', '1 order', 1410, 69, 72, 96, 2390, ['nachos']),
  item('otb-rice', 'Mexican Rice', 'On The Border', 'snacks', '1 side', 220, 4, 37, 6, 840, ['rice', 'side']),
  item('otb-beans', 'Refried Beans', 'On The Border', 'snacks', '1 side', 230, 10, 30, 7, 560, ['beans', 'side']),

  // ——— Jet's Pizza (per slice / piece) ———
  item('jets-cheese-deep', 'Cheese Deep Dish Pizza (large slice)', "Jet's Pizza", 'dinner', '1 slice', 310, 16, 35, 11, 470, ['pizza', 'detroit']),
  item('jets-pep-deep', 'Pepperoni Deep Dish Pizza (slice)', "Jet's Pizza", 'dinner', '1 slice', 380, 19, 40, 16, 720, ['pizza', 'pepperoni']),
  item('jets-cheese-pep', 'Cheese & Pepperoni Slice', "Jet's Pizza", 'dinner', '1 slice', 490, 23, 57, 19, 980, ['pizza', 'pepperoni']),
  item('jets-cheese-round', 'Cheese Round Pizza (small slice)', "Jet's Pizza", 'dinner', '1 slice', 220, 13, 28, 6, 337, ['pizza']),
  item('jets-deep-bread', 'Deep Dish Bread (per piece)', "Jet's Pizza", 'snacks', '1 piece', 140, 6, 16, 6, 280, ['breadsticks']),
  item('jets-turbo', 'Triple Cheese Turbo Stix (per piece)', "Jet's Pizza", 'snacks', '1 piece', 150, 7, 16, 7, 320, ['breadsticks']),
  item('jets-crust-deep-lg', 'Deep Dish Crust only (large piece)', "Jet's Pizza", 'dinner', '1 piece', 210, 5, 34, 5, 380, ['pizza', 'crust']),
  item('jets-ham-sand', 'Ham & Cheese Sub (half)', "Jet's Pizza", 'sandwiches', '1/2 sandwich', 380, 22, 36, 16, 1180, ['sub', 'estimated']),
  item('jets-italian-sand', 'Italian Sub (half)', "Jet's Pizza", 'sandwiches', '1/2 sandwich', 420, 22, 36, 20, 1280, ['sub', 'estimated']),
  item('jets-salad', 'Garden Salad', "Jet's Pizza", 'lunch', '1 salad', 80, 3, 10, 3, 180, ['salad', 'estimated']),

  // ——— Anthony's Coal Fired Pizza ———
  item('acfp-wings-6', 'Roasted Chicken Wings (6)', "Anthony's Coal Fired Pizza", 'dinner', '6 wings', 537, 42, 0, 39, 980, ['wings']),
  item('acfp-wings-10', 'Roasted Chicken Wings (10)', "Anthony's Coal Fired Pizza", 'dinner', '10 wings', 895, 70, 0, 65, 1630, ['wings']),
  item('acfp-eggplant', 'Eggplant Marino Pizza (2 slices)', "Anthony's Coal Fired Pizza", 'dinner', '2 slices', 290, 16, 40, 6, 389, ['pizza']),
  item('acfp-italian-salad', 'Italian Salad with Gorgonzola', "Anthony's Coal Fired Pizza", 'lunch', '2 cups', 249, 4, 9, 21, 520, ['salad']),
  item('acfp-white-slice', 'White Pizza (per slice, mid)', "Anthony's Coal Fired Pizza", 'dinner', '1 slice', 305, 14, 32, 14, 620, ['pizza', 'estimated']),
  item('acfp-classic-slice', "Anthony's Classic Pizza (per slice, mid)", "Anthony's Coal Fired Pizza", 'dinner', '1 slice', 320, 15, 34, 14, 680, ['pizza', 'estimated']),
  item('acfp-meatball', 'Meatballs', "Anthony's Coal Fired Pizza", 'snacks', '1 order', 419, 24, 18, 28, 980, ['meatball', 'estimated']),
  item('acfp-caesar', 'Caesar Salad', "Anthony's Coal Fired Pizza", 'lunch', '1 salad', 480, 18, 22, 36, 980, ['salad', 'estimated']),
  item('acfp-italian-sand', 'Italian Sandwich', "Anthony's Coal Fired Pizza", 'sandwiches', '1 sandwich', 720, 38, 58, 36, 1680, ['italian', 'estimated']),
  item('acfp-cannoli', 'Mini Cannolis (mid-range)', "Anthony's Coal Fired Pizza", 'snacks', '1 order', 565, 12, 62, 28, 280, ['dessert', 'estimated']),
];
