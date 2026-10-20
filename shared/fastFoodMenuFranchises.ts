import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Fifth wave: missing national, legacy, and regional US franchise menus.
 * Values follow each chain’s published nutrition (PDFs / Nutritionix / CalorieKing)
 * for a standard build. Recipes vary by region and over time; some buffet/plated
 * items are typical servings rather than all-you-can-eat totals.
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

export const FRANCHISE_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // ——— Quiznos ———
  item('qz-turkey-ranch', 'Turkey Ranch & Swiss (regular)', 'Quiznos', 'sandwiches', '1 regular', 540, 32, 52, 22, 1540, ['turkey']),
  item('qz-classic-italian', 'Classic Italian (regular)', 'Quiznos', 'sandwiches', '1 regular', 980, 44, 55, 62, 2390, ['italian']),
  item('qz-chicken-carbonara', 'Chicken Carbonara (regular)', 'Quiznos', 'sandwiches', '1 regular', 820, 46, 51, 47, 1680, ['chicken']),
  item('qz-honey-bourbon', 'Honey Bourbon Chicken (regular)', 'Quiznos', 'sandwiches', '1 regular', 620, 35, 68, 22, 1510, ['chicken']),
  item('qz-tuna', 'Tuna Melt (regular)', 'Quiznos', 'sandwiches', '1 regular', 720, 32, 50, 42, 1220, ['tuna']),
  item('qz-broccoli-cheddar', 'Broccoli Cheddar Soup', 'Quiznos', 'lunch', '1 cup', 310, 12, 22, 20, 980, ['soup']),
  item('qz-cookie', 'Chocolate Chip Cookie', 'Quiznos', 'snacks', '1 cookie', 350, 4, 46, 17, 210, ['cookie', 'dessert']),

  // ——— Togo's (West Coast) ———
  item('togo-turkey-avo', 'Turkey & Avocado', "Togo's", 'sandwiches', '1 sandwich', 690, 38, 64, 30, 1480, ['turkey', 'avocado']),
  item('togo-pastrami', 'Hot Pastrami', "Togo's", 'sandwiches', '1 sandwich', 710, 40, 58, 34, 1920, ['pastrami']),
  item('togo-reuben', 'Pastrami Reuben', "Togo's", 'sandwiches', '1 sandwich', 820, 42, 62, 42, 1980, ['reuben']),
  item('togo-club', 'Club Sandwich', "Togo's", 'sandwiches', '1 sandwich', 780, 44, 60, 38, 1760, ['club']),
  item('togo-meatball', 'Meatball Sandwich', "Togo's", 'sandwiches', '1 sandwich', 850, 38, 72, 42, 1840, ['meatball']),
  item('togo-caesar', 'Chicken Caesar Sandwich', "Togo's", 'sandwiches', '1 sandwich', 640, 42, 48, 28, 1420, ['chicken']),

  // ——— Penn Station East Coast Subs ———
  item('penn-cheesesteak', 'Cheesesteak', 'Penn Station East Coast Subs', 'sandwiches', '1 sub', 790, 45, 58, 40, 1680, ['philly']),
  item('penn-italian', 'Italian Sub', 'Penn Station East Coast Subs', 'sandwiches', '1 sub', 820, 38, 62, 42, 1920, ['italian']),
  item('penn-club', 'Club Sub', 'Penn Station East Coast Subs', 'sandwiches', '1 sub', 740, 42, 54, 36, 1710, ['club']),
  item('penn-teriyaki', 'Chicken Teriyaki Sub', 'Penn Station East Coast Subs', 'sandwiches', '1 sub', 680, 40, 72, 22, 1540, ['chicken']),
  item('penn-fries', 'Fresh-Cut Fries', 'Penn Station East Coast Subs', 'snacks', '1 order', 380, 5, 48, 18, 620, ['fries']),

  // ——— Capriotti's ———
  item('cap-bobbie', 'The Bobbie', "Capriotti's", 'sandwiches', '1 sandwich', 1080, 52, 78, 58, 2140, ['turkey', 'stuffing']),
  item('cap-turkey', 'Turkey Sandwich', "Capriotti's", 'sandwiches', '1 sandwich', 620, 42, 52, 24, 1480, ['turkey']),
  item('cap-capastrami', 'Capastrami', "Capriotti's", 'sandwiches', '1 sandwich', 890, 46, 64, 46, 2010, ['pastrami']),
  item('cap-chicken-steak', 'Chicken Cheese Steak', "Capriotti's", 'sandwiches', '1 sandwich', 760, 48, 54, 36, 1680, ['chicken']),
  item('cap-slaw', 'Cole Slaw', "Capriotti's", 'snacks', '1 side', 180, 1, 14, 14, 280, ['slaw']),

  // ——— Round Table Pizza (West) ———
  item('rtp-pepperoni', 'Pepperoni Pizza (large slice)', 'Round Table Pizza', 'dinner', '1 slice', 330, 14, 32, 16, 780, ['pizza', 'pepperoni']),
  item('rtp-king-arthur', "King Arthur's Supreme (large slice)", 'Round Table Pizza', 'dinner', '1 slice', 360, 16, 34, 18, 860, ['pizza', 'supreme']),
  item('rtp-maui', 'Maui Zaui (large slice)', 'Round Table Pizza', 'dinner', '1 slice', 340, 14, 38, 14, 720, ['pizza', 'hawaiian']),
  item('rtp-all-meat', "Montague's All Meat (large slice)", 'Round Table Pizza', 'dinner', '1 slice', 390, 18, 32, 20, 920, ['pizza']),
  item('rtp-twists', 'Garlic Parmesan Twists', 'Round Table Pizza', 'snacks', '1 order', 420, 10, 48, 20, 640, ['bread']),

  // ——— Mountain Mike's Pizza (West) ———
  item('mm-combo', 'Classic Combo (slice)', "Mountain Mike's Pizza", 'dinner', '1 slice', 350, 15, 34, 16, 820, ['pizza']),
  item('mm-meat', 'Mountain of Meat (slice)', "Mountain Mike's Pizza", 'dinner', '1 slice', 400, 18, 32, 22, 980, ['pizza']),
  item('mm-hawaiian', 'Happy Hawaiian (slice)', "Mountain Mike's Pizza", 'dinner', '1 slice', 330, 13, 38, 14, 740, ['pizza']),
  item('mm-crazy-bread', 'Crazy Bread', "Mountain Mike's Pizza", 'snacks', '1 order', 280, 8, 36, 12, 520, ['bread']),

  // ——— Godfather's Pizza (Midwest) ———
  item('gf-combo', 'Super Combo (slice)', "Godfather's Pizza", 'dinner', '1 slice', 370, 16, 34, 18, 880, ['pizza']),
  item('gf-pepperoni', 'Pepperoni (slice)', "Godfather's Pizza", 'dinner', '1 slice', 320, 13, 32, 15, 760, ['pizza']),
  item('gf-ham', 'Hot Ham & Cheese (slice)', "Godfather's Pizza", 'dinner', '1 slice', 340, 16, 32, 16, 900, ['pizza']),
  item('gf-sticks', 'Breadsticks', "Godfather's Pizza", 'snacks', '1 order', 300, 8, 42, 10, 580, ['bread']),

  // ——— CiCi's Pizza ———
  item('cici-pepperoni', 'Pepperoni Pizza (slice)', "CiCi's Pizza", 'dinner', '1 slice', 240, 10, 26, 10, 540, ['pizza']),
  item('cici-supreme', 'Supreme Pizza (slice)', "CiCi's Pizza", 'dinner', '1 slice', 260, 11, 26, 12, 620, ['pizza']),
  item('cici-mac', 'Macaroni & Cheese', "CiCi's Pizza", 'lunch', '1 serving', 320, 12, 34, 14, 780, ['pasta']),
  item('cici-cinnamon', 'Cinnamon Rolls', "CiCi's Pizza", 'snacks', '1 roll', 280, 4, 48, 8, 240, ['dessert']),
  item('cici-salad', 'Salad Bar Plate', "CiCi's Pizza", 'lunch', '1 plate', 180, 6, 14, 10, 320, ['salad']),

  // ——— Donatos Pizza (Midwest) ———
  item('don-pepperoni', 'Pepperoni Edge (slice)', 'Donatos Pizza', 'dinner', '1 slice', 280, 13, 26, 13, 680, ['pizza']),
  item('don-founders', "Founder's Favorite (slice)", 'Donatos Pizza', 'dinner', '1 slice', 300, 14, 27, 14, 760, ['pizza']),
  item('don-meat', 'Serious Meat (slice)', 'Donatos Pizza', 'dinner', '1 slice', 330, 16, 26, 16, 860, ['pizza']),
  item('don-italian-sub', 'Oven-Baked Italian Sub', 'Donatos Pizza', 'sandwiches', '1 sub', 720, 34, 64, 34, 1680, ['italian']),

  // ——— Giordano's (Chicago) ———
  item('gio-stuffed', 'Stuffed Pepperoni (slice)', "Giordano's", 'dinner', '1 slice', 430, 20, 38, 22, 980, ['pizza', 'stuffed']),
  item('gio-sausage', 'Deep Dish Sausage (slice)', "Giordano's", 'dinner', '1 slice', 450, 22, 36, 24, 1040, ['pizza']),
  item('gio-thin', 'Thin Crust Pepperoni (slice)', "Giordano's", 'dinner', '1 slice', 280, 14, 28, 12, 720, ['pizza']),
  item('gio-salad', 'Italian Salad', "Giordano's", 'lunch', '1 salad', 320, 8, 18, 24, 640, ['salad']),

  // ——— Perkins Restaurant & Bakery ———
  item('perk-tremendous', 'Tremendous Twelve', 'Perkins Restaurant & Bakery', 'breakfast', '1 platter', 1120, 48, 78, 68, 2140, ['breakfast']),
  item('perk-sausage-biscuit', 'Country Sausage Biscuit Breakfast', 'Perkins Restaurant & Bakery', 'breakfast', '1 platter', 780, 24, 52, 52, 1680, ['biscuit']),
  item('perk-muffin', 'Mammoth Muffin', 'Perkins Restaurant & Bakery', 'breakfast', '1 muffin', 540, 8, 72, 24, 420, ['muffin']),
  item('perk-build', '2 Eggs, Bacon & Hash Browns', 'Perkins Restaurant & Bakery', 'breakfast', '1 platter', 680, 28, 42, 44, 1420, ['breakfast']),
  item('perk-chicken-salad', 'Grilled Chicken Salad', 'Perkins Restaurant & Bakery', 'lunch', '1 salad', 420, 38, 22, 20, 980, ['salad', 'chicken']),
  item('perk-pie', "Granny's Apple Pie (slice)", 'Perkins Restaurant & Bakery', 'snacks', '1 slice', 480, 4, 62, 24, 320, ['pie', 'dessert']),

  // ——— Huddle House (Southeast) ———
  item('hh-big-house', 'Big House Breakfast', 'Huddle House', 'breakfast', '1 platter', 980, 42, 64, 62, 1980, ['breakfast']),
  item('hh-ham-eggs', 'Country Ham & Eggs', 'Huddle House', 'breakfast', '1 platter', 720, 36, 38, 46, 2140, ['ham']),
  item('hh-hashbrowns', 'Hashbrowns', 'Huddle House', 'breakfast', '1 order', 280, 4, 28, 18, 540, ['hashbrowns']),
  item('hh-cheeseburger', 'Cheeseburger', 'Huddle House', 'lunch', '1 burger', 680, 32, 42, 40, 1280, ['burger']),
  item('hh-pancakes', 'Buttermilk Pancakes (3)', 'Huddle House', 'breakfast', '3 pancakes', 540, 12, 86, 16, 980, ['pancakes']),

  // ——— Golden Corral ———
  item('gc-fried-chicken', 'Fried Chicken (2 pieces)', 'Golden Corral', 'dinner', '2 pieces', 480, 32, 18, 30, 980, ['chicken']),
  item('gc-roast-beef', 'Carved Roast Beef', 'Golden Corral', 'dinner', '6 oz', 320, 38, 2, 18, 620, ['beef']),
  item('gc-mac', 'Macaroni & Cheese', 'Golden Corral', 'dinner', '1 serving', 360, 12, 34, 20, 860, ['pasta']),
  item('gc-roll', 'Yeast Roll', 'Golden Corral', 'snacks', '1 roll', 170, 4, 28, 4, 280, ['bread']),
  item('gc-bourbon-chicken', 'Bourbon Street Chicken', 'Golden Corral', 'dinner', '1 serving', 280, 24, 18, 12, 720, ['chicken']),
  item('gc-pizza', 'Pizza (slice)', 'Golden Corral', 'dinner', '1 slice', 240, 10, 26, 10, 520, ['pizza']),
  item('gc-soft-serve', 'Soft-Serve Cone', 'Golden Corral', 'snacks', '1 cone', 220, 4, 32, 8, 80, ['ice cream']),

  // ——— Ruby Tuesday ———
  item('rt-turkey-burger', 'Avocado Turkey Burger', 'Ruby Tuesday', 'lunch', '1 burger', 820, 42, 54, 46, 1480, ['burger', 'turkey']),
  item('rt-ribs', 'Ribs (half rack)', 'Ruby Tuesday', 'dinner', '1 half rack', 980, 52, 42, 62, 1680, ['ribs']),
  item('rt-bella', 'Chicken Bella Pasta', 'Ruby Tuesday', 'dinner', '1 entrée', 860, 48, 72, 38, 1540, ['pasta', 'chicken']),
  item('rt-garden', 'Garden Bar Salad', 'Ruby Tuesday', 'lunch', '1 plate', 180, 6, 14, 10, 280, ['salad']),
  item('rt-soup', 'Loaded Potato Soup', 'Ruby Tuesday', 'lunch', '1 cup', 340, 10, 28, 20, 980, ['soup']),
  item('rt-brownie', 'Mini Brownie Bites', 'Ruby Tuesday', 'snacks', '1 order', 420, 5, 52, 22, 180, ['dessert']),

  // ——— Guthrie's (Southeast) ———
  item('guth-4pc', '4-Piece Chicken Tenders Box', "Guthrie's", 'lunch', '1 box', 520, 42, 28, 26, 1280, ['chicken', 'tenders']),
  item('guth-8pc', '8-Piece Chicken Tenders', "Guthrie's", 'dinner', '8 tenders', 1040, 84, 56, 52, 2560, ['chicken']),
  item('guth-toast', 'Texas Toast', "Guthrie's", 'snacks', '1 slice', 180, 5, 24, 6, 320, ['toast']),
  item('guth-slaw', 'Coleslaw', "Guthrie's", 'snacks', '1 side', 160, 1, 12, 12, 240, ['slaw']),
  item('guth-sauce', 'Signature Sauce', "Guthrie's", 'snacks', '2 oz', 190, 0, 2, 20, 280, ['sauce']),
  item('guth-fries', 'Crinkle Fries', "Guthrie's", 'snacks', '1 order', 380, 5, 48, 18, 620, ['fries']),

  // ——— Biscuitville (Carolinas / Virginia) ———
  item('bv-bec', 'Bacon Egg & Cheese Biscuit', 'Biscuitville', 'breakfast', '1 biscuit', 540, 22, 38, 32, 1280, ['biscuit', 'bacon']),
  item('bv-steak', 'Steak Biscuit', 'Biscuitville', 'breakfast', '1 biscuit', 580, 24, 38, 36, 1420, ['biscuit', 'steak']),
  item('bv-chicken', 'Fried Chicken Biscuit', 'Biscuitville', 'breakfast', '1 biscuit', 620, 26, 42, 36, 1480, ['biscuit', 'chicken']),
  item('bv-ham', 'Country Ham Biscuit', 'Biscuitville', 'breakfast', '1 biscuit', 480, 20, 36, 26, 1680, ['biscuit', 'ham']),
  item('bv-grits', 'Grits', 'Biscuitville', 'breakfast', '1 cup', 140, 3, 22, 4, 420, ['grits']),
  item('bv-hash', 'Hash Rounds', 'Biscuitville', 'breakfast', '1 order', 280, 3, 28, 18, 480, ['hashbrowns']),

  // ——— Fuzzy's Taco Shop (Texas / Southwest) ———
  item('fuzzy-fish', 'Baja Fish Tacos (2)', "Fuzzy's Taco Shop", 'lunch', '2 tacos', 540, 24, 48, 26, 980, ['taco', 'fish']),
  item('fuzzy-chicken', 'Street Tacos Chicken (2)', "Fuzzy's Taco Shop", 'lunch', '2 tacos', 420, 28, 34, 18, 860, ['taco', 'chicken']),
  item('fuzzy-bowl', 'Baja Bowl', "Fuzzy's Taco Shop", 'lunch', '1 bowl', 620, 32, 64, 24, 1120, ['bowl']),
  item('fuzzy-queso', 'Queso & Chips', "Fuzzy's Taco Shop", 'snacks', '1 order', 680, 16, 52, 42, 1280, ['queso']),
  item('fuzzy-rita', 'Frozen Margarita (12 oz)', "Fuzzy's Taco Shop", 'snacks', '12 oz', 280, 0, 42, 0, 40, ['margarita']),

  // ——— Tijuana Flats (Florida / Southeast) ———
  item('tj-burrito', 'One-n-Only Burrito', 'Tijuana Flats', 'lunch', '1 burrito', 980, 42, 86, 48, 1980, ['burrito']),
  item('tj-tacos', 'Street Tacos (3)', 'Tijuana Flats', 'lunch', '3 tacos', 620, 32, 48, 32, 1280, ['taco']),
  item('tj-bowl', 'Fajita Bowl', 'Tijuana Flats', 'lunch', '1 bowl', 720, 38, 62, 32, 1420, ['bowl']),
  item('tj-quesadilla', 'Chicken Quesadilla', 'Tijuana Flats', 'lunch', '1 quesadilla', 780, 40, 54, 42, 1680, ['quesadilla']),
  item('tj-queso', 'Chips & Queso', 'Tijuana Flats', 'snacks', '1 order', 640, 14, 48, 40, 1120, ['queso']),

  // ——— Costa Vida (West / Mountain) ———
  item('cv-pork-burrito', 'Sweet Pork Burrito', 'Costa Vida', 'lunch', '1 burrito', 1080, 44, 112, 48, 2140, ['burrito', 'pork']),
  item('cv-chicken-salad', 'Chicken Salad', 'Costa Vida', 'lunch', '1 salad', 540, 38, 32, 28, 980, ['salad', 'chicken']),
  item('cv-quesadilla', 'Steak Quesadilla', 'Costa Vida', 'lunch', '1 quesadilla', 820, 46, 54, 44, 1680, ['quesadilla']),
  item('cv-horchata', 'Horchata', 'Costa Vida', 'snacks', '1 drink', 280, 4, 52, 6, 80, ['horchata']),
  item('cv-tres', 'Tres Leches', 'Costa Vida', 'snacks', '1 slice', 420, 8, 58, 16, 180, ['dessert']),

  // ——— Baja Fresh ———
  item('bf-tacos', 'Baja-Style Tacos (2)', 'Baja Fresh', 'lunch', '2 tacos', 480, 26, 36, 24, 860, ['taco']),
  item('bf-burrito', 'Chicken Burrito', 'Baja Fresh', 'lunch', '1 burrito', 890, 42, 92, 36, 1860, ['burrito']),
  item('bf-bowl', 'Ultimo Bowl', 'Baja Fresh', 'lunch', '1 bowl', 640, 38, 54, 28, 1280, ['bowl']),
  item('bf-chips', 'Chips & Salsa', 'Baja Fresh', 'snacks', '1 order', 380, 6, 52, 16, 540, ['chips']),
  item('bf-fish', 'Baja Fish Taco', 'Baja Fresh', 'lunch', '1 taco', 260, 14, 22, 12, 480, ['taco', 'fish']),

  // ——— Salad and Go (Southwest) ———
  item('sg-southwest', 'Southwest Salad', 'Salad and Go', 'lunch', '1 salad', 380, 28, 32, 16, 820, ['salad']),
  item('sg-chef', 'Chef Salad', 'Salad and Go', 'lunch', '1 salad', 340, 30, 14, 18, 780, ['salad']),
  item('sg-harvest', 'Harvest Salad', 'Salad and Go', 'lunch', '1 salad', 420, 22, 38, 20, 640, ['salad']),
  item('sg-burrito', 'Breakfast Burrito', 'Salad and Go', 'breakfast', '1 burrito', 480, 24, 42, 22, 980, ['burrito']),

  // ——— Chopt ———
  item('chopt-mexican', 'Mexican Caesar', 'Chopt', 'lunch', '1 salad', 540, 28, 32, 32, 980, ['salad']),
  item('chopt-kale', 'Kale Caesar', 'Chopt', 'lunch', '1 salad', 480, 22, 24, 34, 860, ['salad']),
  item('chopt-steakhouse', 'Steakhouse Salad', 'Chopt', 'lunch', '1 salad', 620, 38, 28, 38, 1120, ['salad', 'steak']),
  item('chopt-harvest', 'Seasonal Harvest', 'Chopt', 'lunch', '1 salad', 440, 18, 42, 22, 520, ['salad']),
  item('chopt-pita', 'Warm Pita', 'Chopt', 'snacks', '1 pita', 180, 6, 32, 3, 320, ['pita']),

  // ——— BurgerFi ———
  item('bfi-burger', 'BurgerFi Burger', 'BurgerFi', 'lunch', '1 burger', 680, 36, 42, 38, 980, ['burger']),
  item('bfi-ceo', 'CEO Burger', 'BurgerFi', 'lunch', '1 burger', 920, 48, 44, 58, 1280, ['burger']),
  item('bfi-vege', 'VegeFi Burger', 'BurgerFi', 'lunch', '1 burger', 540, 22, 48, 28, 860, ['burger', 'vegetarian']),
  item('bfi-fries', 'Fries', 'BurgerFi', 'snacks', '1 order', 360, 5, 48, 16, 540, ['fries']),
  item('bfi-shake', 'Vanilla Shake', 'BurgerFi', 'snacks', '1 shake', 520, 10, 62, 24, 180, ['shake']),

  // ——— Braum's (Oklahoma / Texas / Midwest) ———
  item('braum-deluxe', 'Deluxe Burger', "Braum's", 'lunch', '1 burger', 720, 34, 48, 42, 1120, ['burger']),
  item('braum-strips', 'Chicken Strips (4)', "Braum's", 'lunch', '4 strips', 480, 28, 32, 26, 980, ['chicken']),
  item('braum-split', 'Fresh Banana Split', "Braum's", 'snacks', '1 split', 640, 12, 98, 22, 180, ['ice cream']),
  item('braum-scoop', 'Ice Cream Scoop', "Braum's", 'snacks', '1 scoop', 220, 4, 24, 12, 70, ['ice cream']),
  item('braum-biscuit', 'Breakfast Biscuit', "Braum's", 'breakfast', '1 biscuit', 540, 20, 38, 32, 1280, ['biscuit']),

  // ——— Shipley Do-Nuts (Texas / South) ———
  item('ship-glazed', 'Glazed Doughnut', 'Shipley Do-Nuts', 'breakfast', '1 doughnut', 280, 3, 34, 15, 210, ['donut']),
  item('ship-kolache', 'Sausage Kolache', 'Shipley Do-Nuts', 'breakfast', '1 kolache', 380, 12, 36, 20, 780, ['kolache']),
  item('ship-chocolate', 'Chocolate Iced Doughnut', 'Shipley Do-Nuts', 'breakfast', '1 doughnut', 320, 3, 38, 17, 180, ['donut']),
  item('ship-bismarck', 'Filled Bismarck', 'Shipley Do-Nuts', 'breakfast', '1 doughnut', 360, 4, 42, 19, 220, ['donut']),

  // ——— Biggby Coffee (Midwest) ———
  item('bigg-latte', 'Medium Latte', 'Biggby Coffee', 'breakfast', '16 oz', 190, 10, 18, 7, 140, ['coffee']),
  item('bigg-mocha', 'Medium Mocha', 'Biggby Coffee', 'breakfast', '16 oz', 320, 10, 48, 10, 180, ['coffee']),
  item('bigg-frozen', 'Frozen Classic', 'Biggby Coffee', 'snacks', '16 oz', 420, 6, 72, 12, 160, ['coffee']),
  item('bigg-sandwich', 'Breakfast Sandwich', 'Biggby Coffee', 'breakfast', '1 sandwich', 480, 22, 36, 26, 980, ['breakfast']),
  item('bigg-cookie', 'Cookie', 'Biggby Coffee', 'snacks', '1 cookie', 280, 3, 38, 13, 180, ['cookie']),

  // ——— Royal Farms (Mid-Atlantic) ———
  item('rf-chicken', 'Fried Chicken (2 pieces)', 'Royal Farms', 'lunch', '2 pieces', 480, 32, 14, 32, 980, ['chicken']),
  item('rf-sub', 'Chicken Tender Sub', 'Royal Farms', 'sandwiches', '1 sub', 720, 38, 62, 34, 1680, ['chicken']),
  item('rf-mac', 'Mac & Cheese', 'Royal Farms', 'lunch', '1 side', 340, 12, 32, 18, 820, ['pasta']),
  item('rf-wedges', 'Potato Wedges', 'Royal Farms', 'snacks', '1 order', 380, 5, 44, 20, 720, ['fries']),

  // ——— Hurricane Grill & Wings (Florida) ———
  item('hurr-wings', 'Wings (10)', 'Hurricane Grill & Wings', 'dinner', '10 wings', 780, 52, 8, 58, 2140, ['wings']),
  item('hurr-grouper', 'Grouper Sandwich', 'Hurricane Grill & Wings', 'lunch', '1 sandwich', 720, 38, 54, 36, 1280, ['fish']),
  item('hurr-tacos', 'Fish Tacos (2)', 'Hurricane Grill & Wings', 'lunch', '2 tacos', 540, 28, 42, 26, 980, ['taco', 'fish']),
  item('hurr-shrimp', 'Coconut Shrimp', 'Hurricane Grill & Wings', 'dinner', '1 order', 620, 24, 48, 36, 1120, ['shrimp']),
  item('hurr-pie', 'Key Lime Pie', 'Hurricane Grill & Wings', 'snacks', '1 slice', 420, 5, 52, 22, 220, ['pie', 'dessert']),

  // ——— Dave & Buster's ———
  item('dab-burger', 'Cheeseburger', "Dave & Buster's", 'lunch', '1 burger', 980, 48, 62, 58, 1680, ['burger']),
  item('dab-wings', 'Boneless Wings', "Dave & Buster's", 'dinner', '1 order', 860, 42, 54, 50, 2140, ['wings']),
  item('dab-tacos', 'Street Tacos', "Dave & Buster's", 'lunch', '3 tacos', 620, 32, 48, 32, 1420, ['taco']),
  item('dab-fries', 'Loaded Fries', "Dave & Buster's", 'snacks', '1 order', 780, 18, 72, 46, 1680, ['fries']),
  item('dab-shake', 'Milkshake', "Dave & Buster's", 'snacks', '1 shake', 640, 12, 86, 28, 240, ['shake']),

  // ——— Hattie B's Hot Chicken (Southeast) ———
  item('hattie-sandwich', 'Hot Chicken Sandwich', "Hattie B's Hot Chicken", 'lunch', '1 sandwich', 680, 38, 52, 34, 1480, ['chicken', 'hot']),
  item('hattie-quarter', 'Dark Quarter', "Hattie B's Hot Chicken", 'dinner', '1 quarter', 420, 32, 8, 28, 980, ['chicken']),
  item('hattie-mac', 'Mac & Cheese', "Hattie B's Hot Chicken", 'lunch', '1 side', 360, 12, 32, 20, 820, ['pasta']),
  item('hattie-pimento', 'Pimento Cheese', "Hattie B's Hot Chicken", 'snacks', '1 side', 280, 8, 6, 26, 540, ['pimento']),
  item('hattie-pudding', 'Banana Pudding', "Hattie B's Hot Chicken", 'snacks', '1 cup', 320, 5, 48, 12, 180, ['dessert']),

  // ——— Zippy's (Hawaii) ———
  item('zip-mixed', 'Mixed Plate', "Zippy's", 'dinner', '1 plate', 980, 42, 92, 48, 1860, ['plate']),
  item('zip-chili', 'Chili Mince Over Rice', "Zippy's", 'lunch', '1 plate', 720, 28, 86, 28, 1420, ['chili']),
  item('zip-katsu', 'Chicken Katsu Plate', "Zippy's", 'dinner', '1 plate', 860, 38, 92, 36, 1540, ['katsu', 'chicken']),
  item('zip-loco', 'Loco Moco', "Zippy's", 'lunch', '1 plate', 920, 36, 78, 48, 1680, ['loco moco']),
  item('zip-napoleon', 'Napoleon', "Zippy's", 'snacks', '1 pastry', 380, 5, 48, 18, 160, ['dessert']),

  // ——— Corner Bakery Cafe ———
  item('cbc-club', 'Club Sandwich', 'Corner Bakery Cafe', 'sandwiches', '1 sandwich', 780, 42, 64, 38, 1680, ['club']),
  item('cbc-soup', 'Tomato Basil Soup', 'Corner Bakery Cafe', 'lunch', '1 cup', 240, 6, 28, 12, 780, ['soup']),
  item('cbc-power', 'Breakfast Power', 'Corner Bakery Cafe', 'breakfast', '1 platter', 540, 28, 42, 26, 980, ['breakfast']),
  item('cbc-chicken-salad', "Mom's Chicken Salad Sandwich", 'Corner Bakery Cafe', 'sandwiches', '1 sandwich', 620, 32, 48, 32, 1120, ['chicken']),
  item('cbc-cookie', 'Chocolate Chunk Cookie', 'Corner Bakery Cafe', 'snacks', '1 cookie', 380, 4, 48, 20, 220, ['cookie']),

  // ——— Au Bon Pain ———
  item('abp-turkey', 'Turkey Cheddar Sandwich', 'Au Bon Pain', 'sandwiches', '1 sandwich', 540, 32, 48, 22, 1280, ['turkey']),
  item('abp-bisque', 'Tomato Basil Bisque', 'Au Bon Pain', 'lunch', '1 cup', 280, 6, 28, 16, 860, ['soup']),
  item('abp-black-bean', 'Chipotle Black Bean', 'Au Bon Pain', 'lunch', '1 bowl', 420, 16, 62, 12, 980, ['vegetarian']),
  item('abp-bagel', 'Bagel with Cream Cheese', 'Au Bon Pain', 'breakfast', '1 bagel', 420, 12, 58, 14, 640, ['bagel']),
  item('abp-croissant', 'Chocolate Croissant', 'Au Bon Pain', 'breakfast', '1 pastry', 340, 6, 38, 18, 280, ['croissant']),

  // ——— Mrs. Fields ———
  item('mf-chip', 'Milk Chocolate Chip Cookie', 'Mrs. Fields', 'snacks', '1 cookie', 280, 3, 38, 14, 180, ['cookie']),
  item('mf-macadamia', 'White Chunk Macadamia Cookie', 'Mrs. Fields', 'snacks', '1 cookie', 300, 3, 36, 16, 160, ['cookie']),
  item('mf-brownie', 'Brownie', 'Mrs. Fields', 'snacks', '1 brownie', 340, 4, 44, 18, 140, ['brownie']),
  item('mf-nibbler', 'Nibblers (4)', 'Mrs. Fields', 'snacks', '4 cookies', 320, 4, 42, 16, 180, ['cookie']),

  // ——— TCBY ———
  item('tcby-original', 'Original 91% Fat-Free (small)', 'TCBY', 'snacks', '1 small', 140, 5, 26, 2, 80, ['yogurt']),
  item('tcby-gold', 'Gold (small)', 'TCBY', 'snacks', '1 small', 220, 5, 36, 6, 90, ['yogurt']),
  item('tcby-sundae', 'Sundae (medium)', 'TCBY', 'snacks', '1 medium', 380, 8, 62, 10, 140, ['sundae']),
  item('tcby-shake', 'Shake', 'TCBY', 'snacks', '1 shake', 420, 10, 68, 12, 180, ['shake']),
  item('tcby-cone', 'Waffle Cone', 'TCBY', 'snacks', '1 cone', 120, 2, 24, 2, 80, ['cone']),

  // ——— Gold Star Chili (Cincinnati) ———
  item('gs-3way', '3-Way', 'Gold Star Chili', 'dinner', '1 3-way', 680, 28, 62, 34, 1480, ['chili', 'spaghetti']),
  item('gs-4way', '4-Way Onion', 'Gold Star Chili', 'dinner', '1 4-way', 720, 30, 66, 36, 1620, ['chili']),
  item('gs-coney', 'Coney', 'Gold Star Chili', 'lunch', '1 coney', 340, 16, 28, 18, 820, ['hot dog']),
  item('gs-cheese-coney', 'Cheese Coney', 'Gold Star Chili', 'lunch', '1 coney', 380, 18, 28, 22, 920, ['hot dog']),
  item('gs-fries', 'Fries', 'Gold Star Chili', 'snacks', '1 order', 320, 4, 42, 14, 480, ['fries']),

  // ——— Frisch's Big Boy (Midwest) ———
  item('frisch-bigboy', 'Big Boy', "Frisch's Big Boy", 'lunch', '1 burger', 680, 32, 48, 38, 1280, ['burger']),
  item('frisch-super', 'Super Big Boy', "Frisch's Big Boy", 'lunch', '1 burger', 860, 42, 54, 48, 1540, ['burger']),
  item('frisch-brawny', 'Brawny Lad', "Frisch's Big Boy", 'lunch', '1 burger', 720, 34, 42, 42, 1420, ['burger']),
  item('frisch-cake', 'Hot Fudge Cake', "Frisch's Big Boy", 'snacks', '1 slice', 780, 10, 98, 38, 420, ['dessert']),
  item('frisch-skillet', 'Breakfast Skillet', "Frisch's Big Boy", 'breakfast', '1 skillet', 820, 36, 52, 50, 1680, ['breakfast']),

  // ——— Lee's Famous Recipe Chicken ———
  item('lee-2pc', 'Famous Recipe Chicken (2 pieces)', "Lee's Famous Recipe Chicken", 'lunch', '2 pieces', 520, 36, 16, 34, 980, ['chicken']),
  item('lee-slaw', 'Famous Slaw', "Lee's Famous Recipe Chicken", 'snacks', '1 side', 160, 1, 14, 12, 280, ['slaw']),
  item('lee-wedges', 'Potato Wedges', "Lee's Famous Recipe Chicken", 'snacks', '1 order', 360, 5, 44, 18, 680, ['fries']),
  item('lee-biscuit', 'Biscuit', "Lee's Famous Recipe Chicken", 'snacks', '1 biscuit', 240, 4, 32, 10, 540, ['biscuit']),

  // ——— Sizzler (West) ———
  item('siz-malibu', 'Malibu Chicken', 'Sizzler', 'dinner', '1 entrée', 620, 42, 38, 32, 1280, ['chicken']),
  item('siz-steak-shrimp', 'Steak & Shrimp', 'Sizzler', 'dinner', '1 entrée', 780, 52, 24, 48, 1420, ['steak', 'shrimp']),
  item('siz-salad', 'Salad Bar Plate', 'Sizzler', 'lunch', '1 plate', 280, 12, 22, 14, 540, ['salad']),
  item('siz-toast', 'Cheese Toast', 'Sizzler', 'snacks', '1 slice', 180, 6, 18, 8, 320, ['toast']),
  item('siz-sundae', 'Sundae', 'Sizzler', 'snacks', '1 sundae', 320, 6, 48, 12, 140, ['ice cream']),

  // ——— Luby's (Texas) ———
  item('luby-fish', 'Fried Fish', "Luby's", 'dinner', '1 serving', 420, 28, 22, 24, 780, ['fish']),
  item('luby-chopped', 'Chopped Steak', "Luby's", 'dinner', '1 serving', 480, 32, 12, 32, 980, ['steak']),
  item('luby-mac', 'Macaroni & Cheese', "Luby's", 'dinner', '1 serving', 320, 12, 32, 16, 860, ['pasta']),
  item('luby-okra', 'Fried Okra', "Luby's", 'snacks', '1 serving', 240, 4, 22, 16, 540, ['okra']),
  item('luby-roll', 'Yeast Roll', "Luby's", 'snacks', '1 roll', 160, 4, 26, 4, 280, ['bread']),
];
