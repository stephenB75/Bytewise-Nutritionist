import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Sixth wave: steakhouses, bakeries, coffee chains, regional fast food franchises, seafood houses,
 * and family diners across the US. Values follow each chain's published nutrition where it is
 * posted (PDFs / online menus / Nutritionix). Where a chain posts calories only, macros are
 * Atwater-aligned to the posted calories. Recipes vary by location and over time.
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

export const NATIONWIDE_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // ——— Steakhouses ———
  item('mortons-filet-8', 'Center-Cut Filet Mignon (8 oz)', "Morton's The Steakhouse", 'dinner', '8 oz', 620, 54, 0, 44, 520, ['steak', 'filet']),
  item('mortons-ribeye-16', 'Prime Ribeye (16 oz)', "Morton's The Steakhouse", 'dinner', '16 oz', 1290, 96, 0, 100, 900, ['steak', 'ribeye']),
  item('mortons-ny-strip', 'Prime New York Strip (16 oz)', "Morton's The Steakhouse", 'dinner', '16 oz', 1080, 104, 0, 72, 820, ['steak', 'strip']),
  item('mortons-mashed', 'Mashed Potatoes', "Morton's The Steakhouse", 'dinner', '1 side', 520, 7, 42, 36, 640, ['potatoes', 'side']),

  item('delfrisco-filet-8', 'Filet Mignon (8 oz)', "Del Frisco's Double Eagle Steakhouse", 'dinner', '8 oz', 640, 54, 0, 46, 560, ['steak', 'filet']),
  item('delfrisco-ribeye', 'Prime Bone-In Ribeye (22 oz)', "Del Frisco's Double Eagle Steakhouse", 'dinner', '22 oz', 1560, 116, 0, 120, 1080, ['steak', 'ribeye']),
  item('delfrisco-lemon-cake', 'Lemon Doberge Cake', "Del Frisco's Double Eagle Steakhouse", 'snacks', '1 slice', 1340, 14, 176, 64, 760, ['dessert', 'cake']),

  item('sw-sirloin', 'Prime Dry-Aged Sirloin (16 oz)', 'Smith & Wollensky', 'dinner', '16 oz', 1100, 102, 0, 76, 840, ['steak', 'sirloin']),
  item('sw-filet', 'Filet Mignon (10 oz)', 'Smith & Wollensky', 'dinner', '10 oz', 780, 68, 0, 56, 640, ['steak', 'filet']),
  item('sw-creamed-spinach', 'Creamed Spinach', 'Smith & Wollensky', 'dinner', '1 side', 420, 9, 14, 38, 780, ['spinach', 'side']),

  item('fogo-picanha', 'Picanha (2 slices)', 'Fogo de Chão', 'dinner', '4 oz', 360, 30, 0, 26, 420, ['steak', 'brazilian', 'churrasco']),
  item('fogo-fraldinha', 'Fraldinha (bottom sirloin, 2 slices)', 'Fogo de Chão', 'dinner', '4 oz', 280, 32, 0, 16, 400, ['steak', 'brazilian']),
  item('fogo-pao-de-queijo', 'Pão de Queijo (cheese bread)', 'Fogo de Chão', 'snacks', '3 pieces', 270, 6, 30, 14, 420, ['bread', 'brazilian']),
  item('fogo-market-table', 'Market Table & Feijoada plate', 'Fogo de Chão', 'lunch', '1 plate', 520, 22, 48, 26, 1240, ['salad', 'beans']),

  item('tdb-picanha', 'Picanha (2 slices)', 'Texas de Brazil', 'dinner', '4 oz', 370, 30, 0, 27, 440, ['steak', 'brazilian', 'churrasco']),
  item('tdb-garlic-beef', 'Garlic Picanha (2 slices)', 'Texas de Brazil', 'dinner', '4 oz', 390, 30, 2, 28, 520, ['steak', 'brazilian']),
  item('tdb-bacon-chicken', 'Bacon-Wrapped Chicken', 'Texas de Brazil', 'dinner', '3 pieces', 300, 30, 1, 19, 680, ['chicken', 'bacon']),

  item('blackangus-sirloin', 'Top Sirloin (8 oz) with mashed potatoes', 'Black Angus Steakhouse', 'dinner', '1 entrée', 820, 58, 34, 50, 1380, ['steak', 'sirloin']),
  item('blackangus-prime-rib', 'Prime Rib (12 oz)', 'Black Angus Steakhouse', 'dinner', '12 oz', 1060, 76, 2, 84, 1520, ['prime rib', 'steak']),
  item('blackangus-campfire', 'Campfire Platter (for two)', 'Black Angus Steakhouse', 'snacks', '1/2 platter', 1180, 46, 82, 74, 2760, ['appetizer']),

  item('ponderosa-ribeye', 'Ribeye Steak (12 oz)', 'Ponderosa Steakhouse', 'dinner', '12 oz', 900, 70, 0, 68, 820, ['steak', 'ribeye']),
  item('ponderosa-sirloin', 'Sirloin Tips', 'Ponderosa Steakhouse', 'dinner', '8 oz', 430, 48, 8, 22, 1080, ['steak']),
  item('ponderosa-buffet-plate', 'Grand Buffet plate (typical)', 'Ponderosa Steakhouse', 'lunch', '1 plate', 780, 34, 74, 38, 1680, ['buffet']),

  item('ws-sirloin', 'Sirloin (8 oz)', 'Western Sizzlin', 'dinner', '8 oz', 460, 58, 0, 25, 640, ['steak', 'sirloin']),
  item('ws-chopped-steak', 'Chopped Steak with gravy', 'Western Sizzlin', 'dinner', '1 entrée', 650, 40, 12, 49, 1340, ['steak']),
  item('ws-yeast-rolls', 'Yeast Roll with butter', 'Western Sizzlin', 'snacks', '1 roll', 190, 4, 26, 8, 260, ['bread']),

  item('stk-filet', 'Filet (6 oz)', 'STK Steakhouse', 'dinner', '6 oz', 460, 40, 0, 33, 480, ['steak', 'filet']),
  item('stk-lil-brgs', "Lil' BRGs (3 sliders)", 'STK Steakhouse', 'snacks', '3 sliders', 760, 38, 48, 46, 1320, ['burger', 'sliders']),
  item('stk-parmesan-truffle-fries', 'Parmesan Truffle Fries', 'STK Steakhouse', 'snacks', '1 side', 620, 10, 62, 38, 880, ['fries']),

  item('mastros-bone-in-filet', 'Bone-In Filet (14 oz)', "Mastro's Steakhouse", 'dinner', '14 oz', 1000, 92, 0, 70, 780, ['steak', 'filet']),
  item('mastros-lobster-mash', 'Lobster Mashed Potatoes', "Mastro's Steakhouse", 'dinner', '1 side (shared)', 1080, 34, 62, 78, 1640, ['lobster', 'potatoes']),
  item('mastros-butter-cake', 'Warm Butter Cake', "Mastro's Steakhouse", 'snacks', '1/2 cake', 1050, 10, 116, 62, 760, ['dessert', 'cake']),

  item('stoney-filet', 'Filet Mignon (7 oz)', 'Stoney River Steakhouse', 'dinner', '7 oz', 540, 46, 0, 39, 540, ['steak', 'filet']),
  item('stoney-ribeye', 'Hand-Cut Ribeye (14 oz)', 'Stoney River Steakhouse', 'dinner', '14 oz', 1140, 84, 0, 88, 860, ['steak', 'ribeye']),
  item('stoney-crab-cake', 'Jumbo Lump Crab Cake', 'Stoney River Steakhouse', 'snacks', '1 crab cake', 380, 22, 14, 26, 880, ['crab', 'seafood']),

  item('sullivans-filet', 'Filet Mignon (8 oz)', "Sullivan's Steakhouse", 'dinner', '8 oz', 620, 54, 0, 44, 540, ['steak', 'filet']),
  item('sullivans-ny-strip', 'Prime NY Strip (14 oz)', "Sullivan's Steakhouse", 'dinner', '14 oz', 960, 92, 0, 64, 760, ['steak', 'strip']),

  item('bobs-steak-filet', 'Filet (9 oz) with glazed carrot', "Bob's Steak & Chop House", 'dinner', '1 entrée', 800, 62, 14, 54, 840, ['steak', 'filet']),
  item('bobs-steak-prime-strip', 'Prime Strip (16 oz)', "Bob's Steak & Chop House", 'dinner', '16 oz', 1080, 104, 0, 72, 820, ['steak', 'strip']),

  // ——— Bakeries ———
  item('pb-croissant', 'Butter Croissant', 'Paris Baguette', 'breakfast', '1 croissant', 310, 6, 31, 18, 300, ['croissant', 'pastry']),
  item('pb-cream-bread', 'Soboro Cream Bread', 'Paris Baguette', 'snacks', '1 bun', 420, 8, 56, 18, 340, ['bread', 'korean']),
  item('pb-mango-cake', 'Mango Cream Cake (slice)', 'Paris Baguette', 'snacks', '1 slice', 330, 4, 38, 18, 160, ['cake', 'dessert']),
  item('pb-ham-cheese', 'Ham & Cheese Croissant Sandwich', 'Paris Baguette', 'sandwiches', '1 sandwich', 450, 18, 34, 27, 980, ['sandwich']),

  item('tlj-milk-bread', 'Milk Bread (2 slices)', 'Tous les Jours', 'breakfast', '2 slices', 220, 7, 38, 4, 300, ['bread', 'korean']),
  item('tlj-red-bean', 'Red Bean Bread', 'Tous les Jours', 'snacks', '1 bun', 290, 7, 56, 4, 190, ['bread', 'red bean']),
  item('tlj-cream-cheese-garlic', 'Cream Cheese Garlic Bread', 'Tous les Jours', 'snacks', '1 bun', 470, 9, 42, 30, 520, ['bread', 'garlic']),

  item('gac-chocolate-chip', 'Chocolate Chip Cookie', 'Great American Cookies', 'snacks', '1 cookie', 230, 2, 32, 11, 150, ['cookie', 'dessert']),
  item('gac-cookie-cake', 'Original Cookie Cake (slice)', 'Great American Cookies', 'snacks', '1/16 cake', 290, 3, 40, 13, 200, ['cookie', 'cake']),
  item('gac-double-doozie', 'Double Doozie', 'Great American Cookies', 'snacks', '1 sandwich cookie', 580, 5, 80, 27, 380, ['cookie']),

  item('tiffs-chocolate-chip', 'Chocolate Chip Cookie', "Tiff's Treats", 'snacks', '1 cookie', 230, 2, 30, 12, 150, ['cookie', 'warm cookie']),
  item('tiffs-snickerdoodle', 'Snickerdoodle', "Tiff's Treats", 'snacks', '1 cookie', 210, 2, 29, 10, 160, ['cookie']),

  item('sprinkles-red-velvet', 'Red Velvet Cupcake', 'Sprinkles', 'snacks', '1 cupcake', 470, 4, 60, 24, 320, ['cupcake', 'dessert']),
  item('sprinkles-chocolate', 'Dark Chocolate Cupcake', 'Sprinkles', 'snacks', '1 cupcake', 480, 5, 62, 25, 300, ['cupcake', 'dessert']),

  item('gigis-wedding-cake', 'Wedding Cake Cupcake', "Gigi's Cupcakes", 'snacks', '1 cupcake', 610, 3, 92, 26, 300, ['cupcake', 'dessert']),
  item('gigis-midnight-magic', 'Midnight Magic Cupcake', "Gigi's Cupcakes", 'snacks', '1 cupcake', 650, 5, 86, 33, 330, ['cupcake', 'chocolate']),

  item('magnolia-banana-pudding', 'Banana Pudding (regular)', 'Magnolia Bakery', 'snacks', '1 regular cup', 560, 7, 72, 27, 340, ['pudding', 'dessert']),
  item('magnolia-vanilla-cupcake', 'Classic Vanilla Cupcake', 'Magnolia Bakery', 'snacks', '1 cupcake', 450, 3, 62, 22, 230, ['cupcake']),

  item('portos-guava-cheese', 'Refugiado (Guava & Cheese Strudel)', "Porto's Bakery & Cafe", 'snacks', '1 pastry', 330, 4, 34, 20, 210, ['pastry', 'cuban', 'guava']),
  item('portos-potato-ball', 'Potato Ball (Papa Rellena)', "Porto's Bakery & Cafe", 'snacks', '1 potato ball', 280, 9, 30, 14, 520, ['cuban']),
  item('portos-cubano', 'Cuban Sandwich', "Porto's Bakery & Cafe", 'sandwiches', '1 sandwich', 720, 38, 62, 35, 1980, ['cuban', 'sandwich']),
  item('portos-cheese-roll', 'Cheese Roll', "Porto's Bakery & Cafe", 'breakfast', '1 roll', 290, 5, 28, 18, 230, ['pastry']),

  item('lamadeleine-tomato-soup', 'Tomato Basil Soup (cup)', 'La Madeleine', 'lunch', '1 cup', 260, 4, 16, 20, 760, ['soup']),
  item('lamadeleine-croque', 'Croque Monsieur', 'La Madeleine', 'sandwiches', '1 sandwich', 760, 38, 48, 46, 1980, ['ham', 'sandwich', 'french']),
  item('lamadeleine-quiche', 'Quiche Lorraine', 'La Madeleine', 'breakfast', '1 slice', 590, 19, 30, 44, 820, ['quiche', 'french']),

  item('lpq-avocado-toast', 'Avocado Toast', 'Le Pain Quotidien', 'breakfast', '1 toast', 470, 12, 48, 27, 640, ['toast', 'avocado']),
  item('lpq-quinoa-salad', 'Quinoa Taboulé Salad', 'Le Pain Quotidien', 'lunch', '1 salad', 540, 15, 56, 30, 780, ['salad']),
  item('lpq-croissant', 'Croissant', 'Le Pain Quotidien', 'breakfast', '1 croissant', 300, 6, 32, 17, 300, ['croissant']),

  item('gh-honey-whole-wheat', 'Honey Whole Wheat Bread', 'Great Harvest Bread Co.', 'breakfast', '1 slice', 150, 5, 30, 1, 180, ['bread']),
  item('gh-cinnamon-chip', 'Cinnamon Chip Bread', 'Great Harvest Bread Co.', 'breakfast', '1 slice', 200, 5, 36, 4, 170, ['bread', 'cinnamon']),
  item('gh-turkey-sandwich', 'Turkey & Cheddar on Honey Wheat', 'Great Harvest Bread Co.', 'sandwiches', '1 sandwich', 560, 34, 62, 19, 1380, ['turkey']),

  item('kf-sausage-kolache', 'Sausage & Cheese Kolache', 'Kolache Factory', 'breakfast', '1 kolache', 340, 12, 30, 19, 760, ['kolache', 'klobasnek']),
  item('kf-egg-bacon', 'Bacon, Egg & Cheese Kolache', 'Kolache Factory', 'breakfast', '1 kolache', 330, 13, 30, 17, 640, ['kolache']),
  item('kf-cream-cheese', 'Cream Cheese Sweet Kolache', 'Kolache Factory', 'snacks', '1 kolache', 280, 6, 36, 12, 220, ['kolache', 'pastry']),

  item('winchells-glazed', 'Glazed Raised Donut', "Winchell's Donuts", 'breakfast', '1 donut', 260, 4, 32, 13, 230, ['donut', 'doughnut']),
  item('winchells-apple-fritter', 'Apple Fritter', "Winchell's Donuts", 'snacks', '1 fritter', 510, 6, 66, 25, 380, ['donut', 'fritter']),

  item('voodoo-bacon-maple', 'Bacon Maple Bar', 'Voodoo Doughnut', 'snacks', '1 doughnut', 460, 7, 58, 22, 470, ['doughnut', 'donut', 'bacon']),
  item('voodoo-doll', 'Voodoo Doll', 'Voodoo Doughnut', 'snacks', '1 doughnut', 420, 5, 56, 20, 330, ['doughnut', 'donut']),

  item('randys-glazed', 'Glazed Donut', "Randy's Donuts", 'breakfast', '1 donut', 270, 4, 33, 14, 240, ['donut', 'doughnut']),
  item('randys-cinnamon-roll', 'Cinnamon Roll Donut', "Randy's Donuts", 'snacks', '1 donut', 420, 5, 56, 20, 330, ['donut']),

  item('cinnaholic-classic', 'Old Skool Cinnamon Roll (vegan)', 'Cinnaholic', 'snacks', '1 roll', 560, 7, 88, 20, 480, ['cinnamon roll', 'vegan']),
  item('cinnaholic-cookie-dough', 'Cookie Dough Roll (vegan)', 'Cinnaholic', 'snacks', '1 roll', 760, 8, 112, 31, 540, ['cinnamon roll', 'vegan']),

  // ——— Coffee chains ———
  item('philz-mint-mojito', 'Mint Mojito Iced Coffee (medium, cream & sugar)', 'Philz Coffee', 'breakfast', '16 fl oz', 230, 2, 28, 12, 30, ['coffee', 'iced']),
  item('philz-tesora', 'Tesora (medium, cream & sugar)', 'Philz Coffee', 'breakfast', '16 fl oz', 180, 2, 20, 10, 25, ['coffee']),
  item('bluebottle-new-orleans', 'New Orleans Iced Coffee', 'Blue Bottle Coffee', 'breakfast', '12 fl oz', 190, 5, 28, 7, 70, ['coffee', 'iced']),
  item('bluebottle-latte', 'Latte (whole milk)', 'Blue Bottle Coffee', 'breakfast', '12 fl oz', 180, 10, 14, 9, 140, ['coffee', 'latte']),
  item('brcc-vanilla-latte', 'Vanilla Latte (16 oz)', 'Black Rifle Coffee', 'breakfast', '16 fl oz', 260, 11, 36, 8, 170, ['coffee', 'latte']),
  item('brcc-breakfast-burrito', 'Breakfast Burrito', 'Black Rifle Coffee', 'breakfast', '1 burrito', 560, 24, 46, 31, 1180, ['burrito']),
  item('ziggis-mocha', 'White Chocolate Mocha (16 oz)', "Ziggi's Coffee", 'breakfast', '16 fl oz', 430, 12, 58, 16, 260, ['coffee', 'mocha']),
  item('ziggis-energy', 'Red Bull Italian Soda (16 oz)', "Ziggi's Coffee", 'snacks', '16 fl oz', 220, 0, 55, 0, 140, ['energy drink']),
  item('pjs-cafe-au-lait', 'Iced Cafe au Lait (medium)', "PJ's Coffee", 'breakfast', '16 fl oz', 170, 8, 14, 9, 120, ['coffee']),
  item('pjs-beignets', 'Beignets', "PJ's Coffee", 'snacks', '3 beignets', 420, 6, 54, 20, 300, ['beignet', 'pastry']),
  item('humanbean-breve', 'Caramel Breve (16 oz)', 'The Human Bean', 'breakfast', '16 fl oz', 540, 10, 46, 35, 180, ['coffee', 'breve']),
  item('humanbean-chai', 'Chai Latte (16 oz)', 'The Human Bean', 'breakfast', '16 fl oz', 280, 9, 48, 6, 120, ['chai', 'tea']),
  item('gregorys-latte', 'Latte (whole milk, medium)', 'Gregorys Coffee', 'breakfast', '16 fl oz', 210, 11, 17, 11, 160, ['coffee', 'latte']),
  item('gregorys-egg-sandwich', 'Egg & Cheese on Brioche', 'Gregorys Coffee', 'breakfast', '1 sandwich', 450, 20, 34, 26, 760, ['egg sandwich']),
  item('joejuice-tunacado', 'Tunacado Sandwich', 'Joe & The Juice', 'sandwiches', '1 sandwich', 560, 27, 46, 30, 980, ['tuna', 'avocado']),
  item('joejuice-iron-man', 'Iron Man Juice', 'Joe & The Juice', 'snacks', '16 fl oz', 190, 2, 46, 1, 30, ['juice']),
  item('cdm-beignets', 'Beignets', 'Café Du Monde', 'snacks', '3 beignets', 470, 7, 56, 24, 300, ['beignet', 'new orleans']),
  item('cdm-cafe-au-lait', 'Café au Lait', 'Café Du Monde', 'breakfast', '12 fl oz', 140, 7, 11, 7, 105, ['coffee', 'chicory']),
  item('lacolombe-draft-latte', 'Draft Latte (can)', 'La Colombe', 'breakfast', '9 fl oz', 130, 5, 15, 5, 85, ['coffee', 'latte']),
  item('lacolombe-oat-latte', 'Oat Milk Latte (medium)', 'La Colombe', 'breakfast', '16 fl oz', 220, 4, 30, 9, 180, ['coffee', 'latte']),
  item('bluestone-avo-toast', 'Smashed Avocado Toast', 'Bluestone Lane', 'breakfast', '1 toast', 480, 15, 42, 29, 720, ['toast', 'avocado']),
  item('bluestone-flat-white', 'Flat White (whole milk)', 'Bluestone Lane', 'breakfast', '8 fl oz', 140, 7, 10, 8, 100, ['coffee']),

  // ——— Burger franchises ———
  item('jacks-big-jack', 'Big Jack', "Jack's Family Restaurants", 'lunch', '1 burger', 580, 28, 42, 33, 1050, ['burger']),
  item('jacks-chicken-biscuit', 'Chicken Biscuit', "Jack's Family Restaurants", 'breakfast', '1 biscuit', 520, 20, 50, 27, 1440, ['biscuit', 'chicken']),
  item('jacks-chicken-fingers', 'Chicken Fingers (3)', "Jack's Family Restaurants", 'lunch', '3 fingers', 390, 26, 22, 22, 1080, ['chicken tenders']),

  item('byb-classic', 'Classic Burger', 'Back Yard Burgers', 'lunch', '1 burger', 620, 32, 44, 35, 1080, ['burger']),
  item('byb-black-jack', 'Black Jack Burger', 'Back Yard Burgers', 'lunch', '1 burger', 760, 38, 46, 46, 1380, ['burger']),
  item('byb-waffle-fries', 'Waffle Fries (regular)', 'Back Yard Burgers', 'snacks', '1 regular', 420, 5, 50, 22, 620, ['fries']),

  item('burgerville-tillamook', 'Tillamook Cheeseburger', 'Burgerville', 'lunch', '1 burger', 540, 27, 41, 30, 1040, ['burger']),
  item('burgerville-walla-walla', 'Walla Walla Onion Rings', 'Burgerville', 'snacks', '1 regular', 480, 6, 52, 27, 760, ['onion rings']),
  item('burgerville-marionberry-shake', 'Marionberry Shake (regular)', 'Burgerville', 'snacks', '1 regular', 740, 14, 104, 30, 380, ['shake']),

  item('farmerboys-big-cheese', 'Big Cheese', 'Farmer Boys', 'lunch', '1 burger', 820, 40, 46, 52, 1540, ['burger']),
  item('farmerboys-breakfast-burrito', 'Farmer Boys Breakfast Burrito', 'Farmer Boys', 'breakfast', '1 burrito', 1070, 46, 72, 66, 2380, ['burrito']),
  item('farmerboys-zucchini', 'Zucchini Sticks', 'Farmer Boys', 'snacks', '1 order', 480, 8, 46, 29, 980, ['zucchini']),

  item('goodtimes-big-daddy', 'Big Daddy Bacon Cheeseburger', 'Good Times Burgers & Frozen Custard', 'lunch', '1 burger', 960, 50, 44, 64, 1780, ['burger']),
  item('goodtimes-wild-fries', 'Wild Fries (regular)', 'Good Times Burgers & Frozen Custard', 'snacks', '1 regular', 380, 5, 44, 20, 880, ['fries']),
  item('goodtimes-custard', 'Vanilla Frozen Custard (regular)', 'Good Times Burgers & Frozen Custard', 'snacks', '1 regular', 480, 9, 52, 26, 220, ['custard', 'dessert']),

  item('wahlburgers-our-burger', 'Our Burger', 'Wahlburgers', 'lunch', '1 burger', 690, 35, 42, 42, 1280, ['burger']),
  item('wahlburgers-tots', 'Tots', 'Wahlburgers', 'snacks', '1 side', 400, 4, 44, 24, 760, ['tater tots']),

  item('mooyah-cheeseburger', 'Cheeseburger (single)', 'MOOYAH', 'lunch', '1 burger', 590, 30, 40, 34, 980, ['burger']),
  item('mooyah-fries', 'Hand-Cut Fries (regular)', 'MOOYAH', 'snacks', '1 regular', 430, 6, 54, 21, 380, ['fries']),

  item('hwy55-carolina', 'Carolina Burger', 'Hwy 55 Burgers Shakes & Fries', 'lunch', '1 burger', 780, 36, 52, 47, 1380, ['burger', 'slaw', 'chili']),
  item('hwy55-philly', 'Philly Cheesesteak', 'Hwy 55 Burgers Shakes & Fries', 'sandwiches', '1 sandwich', 720, 38, 54, 39, 1640, ['cheesesteak']),

  item('arcticcircle-ranch-burger', 'Ranch Burger', 'Arctic Circle', 'lunch', '1 burger', 560, 24, 46, 31, 1040, ['burger']),
  item('arcticcircle-fry-sauce-fries', 'Fries with Fry Sauce (regular)', 'Arctic Circle', 'snacks', '1 regular', 520, 5, 54, 32, 720, ['fries', 'fry sauce']),

  // ——— Chicken franchises ———
  item('kkc-thigh', 'Cajun Fried Chicken Thigh', 'Krispy Krunchy Chicken', 'lunch', '1 thigh', 360, 20, 12, 26, 920, ['fried chicken']),
  item('kkc-tenders', 'Chicken Tenders (3)', 'Krispy Krunchy Chicken', 'lunch', '3 tenders', 420, 30, 26, 22, 1260, ['chicken tenders']),
  item('kkc-honey-biscuit', 'Honey Butter Biscuit', 'Krispy Krunchy Chicken', 'snacks', '1 biscuit', 260, 4, 32, 13, 560, ['biscuit']),

  item('bushs-tenders', 'Chicken Tenders (3)', "Bush's Chicken", 'lunch', '3 tenders', 450, 33, 25, 25, 1380, ['chicken tenders']),
  item('bushs-yeast-roll', 'Yeast Roll', "Bush's Chicken", 'snacks', '1 roll', 180, 4, 28, 5, 270, ['bread']),

  item('chickenexpress-tenders', 'Chicken Tenders (3)', 'Chicken Express', 'lunch', '3 tenders', 430, 31, 24, 24, 1300, ['chicken tenders']),
  item('chickenexpress-gizzards', 'Fried Gizzards (regular)', 'Chicken Express', 'snacks', '1 regular', 420, 34, 20, 22, 980, ['gizzards']),

  item('hueymagoos-tenders', 'Chicken Tenders (3)', "Huey Magoo's", 'lunch', '3 tenders', 360, 36, 16, 17, 1040, ['chicken tenders']),
  item('hueymagoos-sammie', 'Sammie (grilled tender sandwich)', "Huey Magoo's", 'sandwiches', '1 sandwich', 470, 36, 42, 17, 1180, ['chicken sandwich']),

  // ——— Mexican / Tex-Mex franchises ———
  item('tacotime-crisp-meat', 'Crisp Meat Burrito', 'Taco Time', 'lunch', '1 burrito', 470, 21, 48, 22, 920, ['burrito']),
  item('tacotime-mexi-fries', 'Mexi-Fries (medium)', 'Taco Time', 'snacks', '1 medium', 420, 4, 46, 25, 980, ['fries', 'tots']),

  item('velvettaco-spicy-tikka', 'Spicy Tikka Chicken Taco', 'Velvet Taco', 'lunch', '1 taco', 370, 19, 34, 18, 840, ['taco', 'chicken']),
  item('velvettaco-cuban-pig', 'Cuban Pig Taco', 'Velvet Taco', 'lunch', '1 taco', 380, 19, 28, 21, 1080, ['taco', 'pork']),
  item('velvettaco-elote', 'Elote', 'Velvet Taco', 'snacks', '1 side', 360, 7, 32, 24, 620, ['corn']),

  item('condado-bowl', 'Build-Your-Own Taco (chicken, typical)', 'Condado Tacos', 'lunch', '1 taco', 260, 15, 22, 12, 620, ['taco']),
  item('condado-queso', 'Queso with chips', 'Condado Tacos', 'snacks', '1 order', 790, 22, 76, 44, 1380, ['queso', 'chips']),

  item('chronic-carne-asada', 'Carne Asada Burrito', 'Chronic Tacos', 'lunch', '1 burrito', 880, 42, 92, 37, 1640, ['burrito']),
  item('chronic-street-taco', 'Fish Street Taco', 'Chronic Tacos', 'lunch', '1 taco', 240, 11, 24, 11, 420, ['taco', 'fish']),

  item('bubbakoos-burrito', 'Chicken Burrito', "Bubbakoo's Burritos", 'lunch', '1 burrito', 860, 44, 96, 31, 1980, ['burrito']),
  item('bubbakoos-nachos', 'Nachos', "Bubbakoo's Burritos", 'snacks', '1 order', 980, 34, 92, 54, 1860, ['nachos']),

  item('barberitos-burrito', 'Chicken Burrito', 'Barberitos', 'lunch', '1 burrito', 790, 42, 88, 28, 1840, ['burrito']),
  item('barberitos-bowl', 'Chicken Burrito Bowl', 'Barberitos', 'lunch', '1 bowl', 540, 40, 56, 17, 1380, ['bowl']),

  item('tacos4life-chicken', 'Grilled Chicken Taco', 'Tacos 4 Life', 'lunch', '1 taco', 280, 17, 24, 13, 640, ['taco']),
  item('tacos4life-quesadilla', 'Chicken Quesadilla', 'Tacos 4 Life', 'lunch', '1 quesadilla', 820, 46, 58, 45, 1760, ['quesadilla']),

  // ——— Pizza franchises ———
  item('pizzaranch-pepperoni', 'Pepperoni Pizza (medium)', 'Pizza Ranch', 'dinner', '1 slice', 240, 10, 24, 11, 540, ['pizza']),
  item('pizzaranch-chicken', 'Ranch Fried Chicken', 'Pizza Ranch', 'dinner', '1 piece', 330, 22, 12, 21, 860, ['fried chicken']),
  item('pizzaranch-cactus-bread', 'Cactus Bread', 'Pizza Ranch', 'snacks', '2 pieces', 280, 8, 32, 13, 480, ['dessert']),

  item('ledo-cheese', 'Cheese Pizza (square slice)', 'Ledo Pizza', 'dinner', '1 square', 170, 8, 18, 7, 380, ['pizza']),
  item('ledo-pepperoni', 'Pepperoni Pizza (square slice)', 'Ledo Pizza', 'dinner', '1 square', 200, 9, 18, 10, 470, ['pizza']),

  item('toppers-pepperoni', 'Pepperoni Pizza (large)', 'Toppers Pizza', 'dinner', '1 slice', 300, 13, 30, 14, 720, ['pizza']),
  item('toppers-topperstix', 'Original Topperstix', 'Toppers Pizza', 'snacks', '3 sticks', 330, 14, 36, 14, 640, ['breadsticks']),

  item('pizzainn-buffet', 'Pepperoni Pizza (buffet slice)', 'Pizza Inn', 'dinner', '1 slice', 200, 8, 22, 9, 450, ['pizza']),
  item('pizzainn-cinnamon', 'Cinnamon Dessert Pizza', 'Pizza Inn', 'snacks', '1 slice', 160, 2, 26, 5, 120, ['dessert']),

  // ——— Asian franchises ———
  item('pickupstix-orange', 'Orange Chicken (entrée)', 'Pick Up Stix', 'dinner', '1 entrée', 580, 24, 62, 26, 820, ['chicken', 'chinese']),
  item('pickupstix-chow-mein', 'Chow Mein (side)', 'Pick Up Stix', 'dinner', '1 side', 420, 11, 62, 14, 1080, ['noodles']),

  item('flamebroiler-chicken-bowl', 'Chicken Bowl (white rice)', 'Flame Broiler', 'lunch', '1 regular bowl', 610, 38, 98, 6, 980, ['rice bowl', 'chicken']),
  item('flamebroiler-beef-bowl', 'Angus Beef Bowl (brown rice)', 'Flame Broiler', 'lunch', '1 regular bowl', 680, 36, 90, 18, 1080, ['rice bowl', 'beef']),

  item('pokeworks-classic', 'Classic Poke Bowl (regular)', 'Pokeworks', 'lunch', '1 regular bowl', 640, 34, 80, 20, 1380, ['poke', 'tuna']),
  item('pokeworks-spicy-salmon', 'Spicy Ahi & Salmon Burrito', 'Pokeworks', 'lunch', '1 burrito', 720, 34, 92, 24, 1580, ['poke', 'salmon']),

  item('benihana-hibachi-chicken', 'Hibachi Chicken dinner', 'Benihana', 'dinner', '1 dinner', 990, 62, 92, 38, 2680, ['hibachi', 'teppanyaki']),
  item('benihana-steak', 'Hibachi Steak dinner', 'Benihana', 'dinner', '1 dinner', 1100, 62, 92, 50, 2580, ['hibachi', 'steak']),
  item('benihana-fried-rice', 'Hibachi Chicken Rice', 'Benihana', 'dinner', '1 side', 460, 14, 64, 15, 1180, ['fried rice']),

  // ——— Mediterranean franchises ———
  item('tazikis-gyro', 'Lamb Gyro', "Taziki's Mediterranean Cafe", 'sandwiches', '1 gyro', 620, 32, 46, 34, 1380, ['gyro', 'greek']),
  item('tazikis-chicken-plate', 'Grilled Chicken Feast (basmati rice)', "Taziki's Mediterranean Cafe", 'dinner', '1 plate', 640, 48, 62, 22, 1440, ['chicken', 'rice']),

  item('garbanzo-chicken-plate', 'Chicken Shawarma Plate', 'Garbanzo Mediterranean Fresh', 'lunch', '1 plate', 760, 48, 74, 30, 1680, ['shawarma']),
  item('garbanzo-falafel-pita', 'Falafel Pita', 'Garbanzo Mediterranean Fresh', 'sandwiches', '1 pita', 620, 18, 76, 28, 1240, ['falafel', 'vegetarian']),

  item('roti-chicken-bowl', 'Chicken Rice Plate', 'Roti Modern Mediterranean', 'lunch', '1 plate', 720, 46, 72, 26, 1580, ['rice bowl']),
  item('roti-steak-pita', 'Steak Pita', 'Roti Modern Mediterranean', 'sandwiches', '1 pita', 640, 36, 58, 28, 1340, ['pita']),

  item('nafnaf-chicken-pita', 'Chicken Shawarma Pita', 'Naf Naf Grill', 'sandwiches', '1 pita', 700, 38, 76, 26, 1580, ['shawarma', 'pita']),
  item('nafnaf-hummus-plate', 'Hummus & Pita', 'Naf Naf Grill', 'snacks', '1 order', 520, 15, 58, 25, 880, ['hummus']),

  item('daphnes-chicken-plate', 'Chicken Plate', "Daphne's", 'lunch', '1 plate', 640, 46, 66, 20, 1480, ['greek', 'chicken']),
  item('daphnes-gyro', 'Gyro Pita', "Daphne's", 'sandwiches', '1 pita', 580, 28, 52, 28, 1320, ['gyro']),

  // ——— Sub shops & convenience ———
  item('cousins-italian', 'Italian Special (8")', 'Cousins Subs', 'sandwiches', '8 inch', 760, 34, 62, 41, 2480, ['sub', 'italian']),
  item('cousins-turkey', 'Turkey Breast (8")', 'Cousins Subs', 'sandwiches', '8 inch', 480, 30, 60, 13, 1580, ['sub', 'turkey']),

  item('jonsmith-original', 'Original Sub (8")', 'Jon Smith Subs', 'sandwiches', '8 inch', 690, 34, 62, 34, 2240, ['sub', 'grilled']),
  item('jonsmith-philly', 'Philly Cheesesteak (8")', 'Jon Smith Subs', 'sandwiches', '8 inch', 780, 44, 64, 38, 1980, ['cheesesteak']),

  item('erberts-boney-billy', 'Boney Billy (turkey)', "Erbert & Gerbert's", 'sandwiches', '1 sandwich', 620, 30, 66, 26, 1720, ['sub', 'turkey']),
  item('erberts-comet-candy', 'Comet Candy (club)', "Erbert & Gerbert's", 'sandwiches', '1 sandwich', 760, 38, 66, 38, 2240, ['sub']),

  item('qt-breakfast-sandwich', 'Sausage, Egg & Cheese Biscuit', 'QuikTrip', 'breakfast', '1 sandwich', 540, 18, 34, 37, 1240, ['breakfast sandwich']),
  item('qt-roller-taquito', 'Chicken & Cheese Taquito', 'QuikTrip', 'snacks', '1 taquito', 270, 9, 30, 12, 620, ['taquito']),
  item('qt-pizza-slice', 'Pepperoni Pizza Slice', 'QuikTrip', 'lunch', '1 slice', 390, 16, 38, 19, 960, ['pizza']),

  // ——— Seafood houses ———
  item('joescrab-steampot', 'Classic Steampot', "Joe's Crab Shack", 'dinner', '1 steampot', 1070, 98, 64, 46, 5340, ['crab', 'shrimp', 'boil']),
  item('joescrab-fish-chips', 'Fish & Chips', "Joe's Crab Shack", 'dinner', '1 entrée', 1240, 46, 108, 70, 2380, ['fish']),

  item('bubbagump-shrimpers-heaven', "Shrimper's Heaven", 'Bubba Gump Shrimp Co.', 'dinner', '1 entrée', 1250, 52, 120, 62, 2780, ['shrimp', 'fried']),
  item('bubbagump-fried-chicken', "Mama's Southern Fried Chicken", 'Bubba Gump Shrimp Co.', 'dinner', '1 entrée', 1180, 66, 86, 64, 2860, ['chicken']),

  item('pappadeaux-gumbo', 'Seafood Gumbo (cup)', 'Pappadeaux Seafood Kitchen', 'lunch', '1 cup', 280, 16, 18, 16, 1180, ['gumbo', 'cajun']),
  item('pappadeaux-fried-catfish', 'Fried Catfish', 'Pappadeaux Seafood Kitchen', 'dinner', '1 entrée', 1080, 54, 74, 62, 2140, ['catfish', 'fish']),
  item('pappadeaux-salmon', 'Grilled Salmon', 'Pappadeaux Seafood Kitchen', 'dinner', '1 entrée', 640, 52, 22, 38, 1320, ['salmon']),

  item('legal-clam-chowder', 'New England Clam Chowder (cup)', 'Legal Sea Foods', 'lunch', '1 cup', 240, 10, 16, 15, 820, ['chowder', 'clam']),
  item('legal-lobster-roll', 'Lobster Roll', 'Legal Sea Foods', 'sandwiches', '1 roll', 560, 28, 40, 32, 1240, ['lobster']),
  item('legal-baked-scrod', 'Baked Boston Scrod', 'Legal Sea Foods', 'dinner', '1 entrée', 520, 46, 18, 28, 980, ['cod', 'fish']),

  item('ivars-fish-chips', "Ivar's Fish & Chips (2 piece)", "Ivar's", 'lunch', '2 pieces', 830, 28, 82, 43, 1480, ['fish']),
  item('ivars-clam-chowder', 'Clam Chowder (cup)', "Ivar's", 'lunch', '1 cup', 210, 7, 16, 13, 780, ['chowder']),

  item('mccormick-salmon', 'Cedar Plank Salmon', "McCormick & Schmick's", 'dinner', '1 entrée', 680, 52, 22, 42, 1280, ['salmon']),
  item('mccormick-crab-cakes', 'Maryland Crab Cakes', "McCormick & Schmick's", 'dinner', '1 entrée', 760, 36, 42, 50, 1880, ['crab']),

  item('shells-shrimp-scampi', 'Shrimp Scampi', 'Shells Seafood Restaurant', 'dinner', '1 entrée', 980, 42, 92, 48, 1880, ['shrimp', 'pasta']),
  item('shells-grouper', 'Grilled Grouper', 'Shells Seafood Restaurant', 'dinner', '1 entrée', 460, 48, 18, 22, 1040, ['grouper', 'fish']),

  item('landrys-snapper', 'Pontchartrain-Style Red Snapper', "Landry's Seafood House", 'dinner', '1 entrée', 880, 56, 32, 58, 1980, ['snapper', 'fish']),
  item('landrys-shrimp-platter', 'Fried Shrimp Platter', "Landry's Seafood House", 'dinner', '1 platter', 1040, 42, 102, 52, 2260, ['shrimp']),

  // ——— Family diners ———
  item('bbd-bear-claw', 'Bear Claw', 'Black Bear Diner', 'breakfast', '1 pastry', 820, 11, 104, 40, 640, ['pastry']),
  item('bbd-chicken-fried-steak', 'Chicken Fried Steak & Eggs', 'Black Bear Diner', 'breakfast', '1 plate', 1420, 54, 104, 86, 3260, ['chicken fried steak']),
  item('bbd-pot-roast', 'Pot Roast', 'Black Bear Diner', 'dinner', '1 entrée', 880, 54, 62, 44, 2180, ['beef']),

  item('villageinn-pancakes', 'Buttermilk Pancakes (3)', 'Village Inn', 'breakfast', '3 pancakes', 680, 16, 104, 22, 1580, ['pancakes']),
  item('villageinn-pie', 'French Silk Pie', 'Village Inn', 'snacks', '1 slice', 620, 6, 52, 44, 380, ['pie', 'dessert']),

  item('shoneys-breakfast-bar', 'Breakfast Bar plate (typical)', "Shoney's", 'breakfast', '1 plate', 760, 26, 62, 46, 1680, ['buffet']),
  item('shoneys-hot-fudge-cake', 'Hot Fudge Cake', "Shoney's", 'snacks', '1 slice', 650, 8, 88, 30, 460, ['dessert']),

  item('friendlys-fribble', 'Fribble (vanilla, regular)', "Friendly's", 'snacks', '1 regular', 630, 14, 94, 22, 380, ['shake']),
  item('friendlys-patty-melt', 'Patty Melt', "Friendly's", 'sandwiches', '1 sandwich', 1010, 46, 56, 66, 1680, ['burger']),

  item('eatnpark-smiley', 'Smiley Cookie', "Eat'n Park", 'snacks', '1 cookie', 240, 2, 35, 10, 170, ['cookie']),
  item('eatnpark-breakfast', 'Classic Breakfast (eggs, bacon, home fries, toast)', "Eat'n Park", 'breakfast', '1 plate', 860, 32, 66, 52, 1640, ['eggs']),

  item('ocharleys-rolls', 'Caramel Rolls (2)', "O'Charley's", 'snacks', '2 rolls', 480, 8, 72, 18, 520, ['bread']),
  item('ocharleys-chicken-tenders', 'Chicken Tender Platter', "O'Charley's", 'dinner', '1 platter', 1280, 58, 108, 68, 3040, ['chicken tenders']),
];
