import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Seventh wave: well-known US chains still missing from the catalog — entertainment and casual
 * dining, Mexican cantinas, wing bars, burger bars, regional pizza and Italian, breakfast houses,
 * frozen dessert, smoothie and juice bars, and convenience stores. Values follow each chain's
 * published nutrition where it is posted; where only calories are posted, macros are
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

export const KNOWN_CHAINS_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // ——— Entertainment & casual dining ———
  item('cec-cheese-pizza', 'Cheese Pizza (large)', 'Chuck E. Cheese', 'dinner', '1 slice', 250, 11, 30, 9, 520, ['pizza']),
  item('cec-pepperoni-pizza', 'Pepperoni Pizza (large)', 'Chuck E. Cheese', 'dinner', '1 slice', 290, 12, 30, 13, 640, ['pizza']),
  item('cec-wings', 'Traditional Wings (8)', 'Chuck E. Cheese', 'snacks', '8 wings', 640, 52, 2, 47, 1840, ['wings']),

  item('mainevent-pizza', 'Pepperoni Pizza (personal)', 'Main Event', 'dinner', '1 pizza', 880, 36, 92, 40, 1980, ['pizza']),
  item('mainevent-tenders', 'Chicken Tenders with fries', 'Main Event', 'dinner', '1 basket', 1180, 48, 104, 64, 2380, ['chicken tenders']),

  item('topgolf-injectable-donuts', 'Injectable Donut Holes', 'Topgolf', 'snacks', '1 order', 1150, 12, 152, 56, 720, ['dessert', 'donut']),
  item('topgolf-wings', 'Wings (8)', 'Topgolf', 'snacks', '8 wings', 720, 56, 6, 52, 2140, ['wings']),
  item('topgolf-sliders', 'Cheeseburger Sliders (3)', 'Topgolf', 'lunch', '3 sliders', 880, 44, 56, 52, 1680, ['burger', 'sliders']),

  item('rainforest-rumble', 'Rainforest Rumble Burger', 'Rainforest Cafe', 'lunch', '1 burger with fries', 1450, 58, 112, 84, 2580, ['burger']),
  item('rainforest-volcano', 'Volcano (shared dessert)', 'Rainforest Cafe', 'snacks', '1/4 dessert', 820, 9, 104, 42, 520, ['dessert', 'brownie']),

  item('margaritaville-cheeseburger', 'Cheeseburger in Paradise', "Jimmy Buffett's Margaritaville", 'lunch', '1 burger with fries', 1380, 56, 104, 80, 2240, ['burger']),
  item('margaritaville-fish-tacos', 'Baja Fish Tacos', "Jimmy Buffett's Margaritaville", 'lunch', '1 order', 940, 38, 86, 50, 1880, ['tacos', 'fish']),

  item('lazydog-chicken-sandwich', 'Nashville Hot Chicken Sandwich', 'Lazy Dog Restaurant & Bar', 'sandwiches', '1 sandwich', 1080, 48, 82, 62, 2480, ['chicken sandwich']),
  item('lazydog-pot-roast', 'Slow-Braised Pot Roast', 'Lazy Dog Restaurant & Bar', 'dinner', '1 entrée', 860, 52, 54, 48, 1980, ['beef']),
  item('lazydog-fried-rice', 'Chicken Fried Rice', 'Lazy Dog Restaurant & Bar', 'dinner', '1 entrée', 1020, 44, 118, 40, 2340, ['fried rice']),

  item('eureka-original', 'Original Burger', 'Eureka!', 'lunch', '1 burger', 870, 44, 46, 56, 1580, ['burger']),
  item('eureka-fries', 'Truffle Fries', 'Eureka!', 'snacks', '1 side', 560, 8, 58, 33, 780, ['fries']),

  item('kona-sushi-roll', 'Spicy Tuna Roll', 'Kona Grill', 'dinner', '8 pieces', 380, 18, 52, 11, 920, ['sushi']),
  item('kona-macadamia-chicken', 'Macadamia Nut Chicken', 'Kona Grill', 'dinner', '1 entrée', 1150, 66, 74, 66, 1980, ['chicken']),

  item('jalexanders-prime-rib', 'Slow-Roasted Prime Rib', "J. Alexander's", 'dinner', '1 entrée', 1080, 72, 32, 74, 1680, ['prime rib', 'steak']),
  item('jalexanders-chicken-salad', 'Grilled Chicken Salad', "J. Alexander's", 'lunch', '1 salad', 640, 44, 28, 40, 1240, ['salad']),

  // ——— Mexican & Tex-Mex cantinas ———
  item('pappasitos-beef-fajitas', 'Beef Fajitas (for one)', "Pappasito's Cantina", 'dinner', '1 order', 1340, 82, 102, 66, 3280, ['fajitas']),
  item('pappasitos-queso', 'Chile con Queso with chips', "Pappasito's Cantina", 'snacks', '1 order', 980, 24, 86, 60, 1680, ['queso']),

  item('abuelos-fajitas', 'Chicken Fajitas', "Abuelo's", 'dinner', '1 order', 1120, 76, 98, 46, 3040, ['fajitas']),
  item('abuelos-enchiladas', 'Cheese Enchiladas (2)', "Abuelo's", 'dinner', '1 entrée', 960, 38, 74, 56, 2140, ['enchiladas']),

  item('eltorito-fajitas', 'Chicken Fajitas', 'El Torito', 'dinner', '1 order', 1080, 72, 96, 44, 2980, ['fajitas']),
  item('eltorito-sweet-corn', 'Sweet Corn Tamalito', 'El Torito', 'snacks', '1 side', 210, 3, 32, 8, 380, ['corn cake']),

  item('chevys-fajitas', 'Steak Fajitas', 'Chevys Fresh Mex', 'dinner', '1 order', 1220, 76, 104, 54, 3160, ['fajitas']),
  item('chevys-chimichanga', 'Chicken Chimichanga', 'Chevys Fresh Mex', 'dinner', '1 entrée', 1180, 52, 112, 58, 2680, ['chimichanga']),

  item('unclejulios-fajitas', 'Mesquite-Grilled Chicken Fajitas', "Uncle Julio's", 'dinner', '1 order', 1160, 78, 104, 46, 3080, ['fajitas']),
  item('unclejulios-chocolate-pinata', 'Chocolate Piñata (shared)', "Uncle Julio's", 'snacks', '1/4 dessert', 640, 7, 76, 35, 220, ['dessert']),

  item('rosa-guacamole', 'Guacamole en Molcajete with chips', 'Rosa Mexicano', 'snacks', '1 order', 860, 10, 74, 60, 980, ['guacamole']),
  item('rosa-enchiladas', 'Enchiladas de Mole Poblano', 'Rosa Mexicano', 'dinner', '1 entrée', 940, 50, 68, 52, 2080, ['enchiladas', 'mole']),

  item('laredo-top-shelf-guac', 'Top Shelf Guacamole with chips', 'Cantina Laredo', 'snacks', '1 order', 760, 9, 70, 50, 880, ['guacamole']),
  item('laredo-carne-asada', 'Carne Asada', 'Cantina Laredo', 'dinner', '1 entrée', 980, 64, 52, 58, 2140, ['steak']),

  item('tacocasa-super-burrito', 'Super Burrito', 'Taco Casa', 'lunch', '1 burrito', 820, 36, 84, 38, 1840, ['burrito']),
  item('tacocasa-taco', 'Crispy Beef Taco', 'Taco Casa', 'lunch', '1 taco', 210, 10, 14, 13, 380, ['taco']),

  item('palenque-pirata', 'Pirata (flour tortilla, fajita beef)', 'Taco Palenque', 'lunch', '1 pirata', 540, 26, 40, 31, 1180, ['taco', 'beef']),
  item('palenque-taco', 'Taco de Fajita', 'Taco Palenque', 'lunch', '1 taco', 290, 18, 22, 14, 620, ['taco']),

  // ——— Steakhouses & upscale seafood ———
  item('pappasbros-ribeye', 'Prime Ribeye (16 oz)', 'Pappas Bros. Steakhouse', 'dinner', '16 oz', 1290, 96, 0, 100, 900, ['steak', 'ribeye']),
  item('pappasbros-strip', 'Dry-Aged Prime Strip (20 oz)', 'Pappas Bros. Steakhouse', 'dinner', '20 oz', 1360, 130, 0, 92, 1020, ['steak', 'strip']),

  item('steak48-filet', 'Filet (8 oz)', 'Steak 48', 'dinner', '8 oz', 620, 54, 0, 44, 520, ['steak', 'filet']),
  item('steak48-crispy-potatoes', 'Crispy Potato Skins', 'Steak 48', 'snacks', '1 side', 640, 16, 46, 44, 980, ['potatoes']),

  item('eddiemerlots-filet', 'Filet Mignon (8 oz)', "Eddie Merlot's", 'dinner', '8 oz', 620, 54, 0, 44, 520, ['steak', 'filet']),
  item('eddiemerlots-lobster-bisque', 'Lobster Bisque (cup)', "Eddie Merlot's", 'lunch', '1 cup', 320, 8, 14, 26, 860, ['soup', 'lobster']),

  item('kobe-hibachi-chicken', 'Hibachi Chicken dinner', 'Kobe Japanese Steakhouse', 'dinner', '1 dinner', 960, 60, 90, 38, 2580, ['hibachi', 'teppanyaki']),
  item('kobe-hibachi-steak', 'Hibachi Steak dinner', 'Kobe Japanese Steakhouse', 'dinner', '1 dinner', 1080, 62, 90, 50, 2480, ['hibachi', 'steak']),

  item('oceanprime-sea-bass', 'Chilean Sea Bass', 'Ocean Prime', 'dinner', '1 entrée', 680, 44, 22, 46, 1180, ['fish']),
  item('oceanprime-filet', 'Filet (8 oz)', 'Ocean Prime', 'dinner', '8 oz', 620, 54, 0, 44, 520, ['steak']),

  item('eddiev-sea-bass', 'Chilean Sea Bass', "Eddie V's Prime Seafood", 'dinner', '1 entrée', 700, 44, 24, 48, 1240, ['fish']),
  item('eddiev-crab-cake', 'Jumbo Lump Crab Cake', "Eddie V's Prime Seafood", 'snacks', '1 crab cake', 420, 24, 14, 30, 940, ['crab']),

  item('charthouse-mahi', 'Macadamia-Crusted Mahi', 'Chart House', 'dinner', '1 entrée', 920, 52, 56, 54, 1480, ['fish']),
  item('charthouse-lava-cake', 'Hot Chocolate Lava Cake', 'Chart House', 'snacks', '1 cake', 1040, 12, 108, 64, 380, ['dessert']),

  // ——— Wing & sports bars ———
  item('pluckers-wings', 'Traditional Wings (10)', 'Pluckers Wing Bar', 'snacks', '10 wings', 800, 66, 2, 58, 2280, ['wings']),
  item('pluckers-fried-pickles', 'Fried Pickles', 'Pluckers Wing Bar', 'snacks', '1 order', 520, 6, 48, 34, 2180, ['pickles']),

  item('wingzone-wings', 'Bone-In Wings (10)', 'Wing Zone', 'snacks', '10 wings', 780, 64, 4, 56, 2340, ['wings']),
  item('wingzone-boneless', 'Boneless Wings (10)', 'Wing Zone', 'snacks', '10 pieces', 820, 46, 58, 44, 2580, ['wings', 'boneless']),

  item('walkons-gumbo', 'Chicken & Sausage Gumbo (cup)', "Walk-On's Sports Bistreaux", 'lunch', '1 cup', 300, 14, 22, 17, 1180, ['gumbo', 'cajun']),
  item('walkons-burger', 'Walk-On\'s Burger', "Walk-On's Sports Bistreaux", 'lunch', '1 burger with fries', 1340, 54, 104, 78, 2380, ['burger']),

  item('glorydays-wings', 'Wings (10)', 'Glory Days Grill', 'snacks', '10 wings', 790, 64, 4, 57, 2240, ['wings']),
  item('glorydays-burger', 'Classic Cheeseburger', 'Glory Days Grill', 'lunch', '1 burger', 820, 44, 44, 52, 1480, ['burger']),

  item('bwr-wings', 'Traditional Wings (10)', 'Buffalo Wings & Rings', 'snacks', '10 wings', 780, 64, 4, 56, 2280, ['wings']),
  item('bwr-onion-rings', 'Onion Rings', 'Buffalo Wings & Rings', 'snacks', '1 order', 640, 8, 72, 36, 1080, ['onion rings']),

  item('wildwing-wings', 'Wings (10)', 'Wild Wing Cafe', 'snacks', '10 wings', 790, 64, 4, 57, 2260, ['wings']),
  item('wildwing-tenders', 'Chicken Tenders', 'Wild Wing Cafe', 'snacks', '4 tenders', 620, 42, 38, 33, 1720, ['chicken tenders']),

  item('tiltedkilt-wings', 'Wings (10)', 'Tilted Kilt Pub & Eatery', 'snacks', '10 wings', 790, 64, 4, 57, 2260, ['wings']),
  item('tiltedkilt-fish-chips', 'Fish & Chips', 'Tilted Kilt Pub & Eatery', 'dinner', '1 entrée', 1180, 44, 104, 64, 2080, ['fish']),

  // ——— Burger bars ———
  item('fudds-third-pound', 'Original 1/3 lb Burger', 'Fuddruckers', 'lunch', '1 burger', 680, 38, 48, 37, 980, ['burger']),
  item('fudds-fries', 'Steak Fries', 'Fuddruckers', 'snacks', '1 regular', 440, 6, 58, 20, 520, ['fries']),

  item('rockets-original', 'The Original Burger', 'Johnny Rockets', 'lunch', '1 burger', 820, 34, 52, 52, 1280, ['burger']),
  item('rockets-shake', 'Chocolate Shake', 'Johnny Rockets', 'snacks', '1 shake', 920, 18, 112, 44, 480, ['shake']),

  item('elevation-burger', 'Elevation Burger (single)', 'Elevation Burger', 'lunch', '1 burger', 460, 26, 32, 25, 760, ['burger', 'organic']),
  item('elevation-fries', 'Fries (regular, olive oil)', 'Elevation Burger', 'snacks', '1 regular', 420, 5, 52, 22, 240, ['fries']),

  item('bareburger-original', 'Original Bareburger', 'Bareburger', 'lunch', '1 burger', 760, 40, 44, 46, 1280, ['burger', 'organic']),
  item('bareburger-sweet-potato', 'Sweet Potato Fries', 'Bareburger', 'snacks', '1 side', 420, 4, 56, 21, 480, ['fries']),

  item('umami-original', 'Umami Burger', 'Umami Burger', 'lunch', '1 burger', 760, 40, 40, 48, 1480, ['burger']),
  item('umami-fries', 'Thin Fries', 'Umami Burger', 'snacks', '1 side', 400, 5, 48, 21, 560, ['fries']),

  item('hopdoddy-classic', 'Classic Burger', 'Hopdoddy Burger Bar', 'lunch', '1 burger', 690, 37, 42, 41, 1180, ['burger']),
  item('hopdoddy-queso-fries', "Green Chile Queso Fries", 'Hopdoddy Burger Bar', 'snacks', '1 order', 760, 15, 70, 47, 1380, ['fries', 'queso']),

  item('steakescape-cheesesteak', 'Original Cheesesteak (regular)', 'Steak Escape', 'sandwiches', '1 regular', 640, 38, 56, 29, 1580, ['cheesesteak']),
  item('steakescape-fries', 'Cajun Fries (regular)', 'Steak Escape', 'snacks', '1 regular', 480, 6, 58, 25, 880, ['fries']),

  // ——— Asian ———
  item('kura-salmon-nigiri', 'Salmon Nigiri (2 pieces)', 'Kura Revolving Sushi Bar', 'dinner', '1 plate', 110, 6, 15, 3, 180, ['sushi']),
  item('kura-tonkotsu-ramen', 'Tonkotsu Ramen', 'Kura Revolving Sushi Bar', 'dinner', '1 bowl', 680, 26, 82, 26, 2680, ['ramen']),
  item('kura-california-roll', 'California Roll (4 pieces)', 'Kura Revolving Sushi Bar', 'dinner', '1 plate', 180, 5, 28, 5, 340, ['sushi']),

  item('gyukaku-short-rib', 'Harami Skirt Steak (miso)', 'Gyu-Kaku Japanese BBQ', 'dinner', '1 order', 360, 28, 6, 25, 820, ['yakiniku', 'beef']),
  item('gyukaku-bibimbap', 'Stone Grill Bibimbap', 'Gyu-Kaku Japanese BBQ', 'dinner', '1 bowl', 620, 22, 88, 20, 1240, ['rice']),

  item('genghis-bowl', 'Build-Your-Own Bowl (chicken, typical)', 'Genghis Grill', 'dinner', '1 bowl', 780, 46, 92, 24, 2180, ['stir fry', 'mongolian']),

  // ——— Salad, soup & healthy fast casual ———
  item('mendocino-chicken-pesto', 'Chicken Pesto Caprese', 'Mendocino Farms', 'sandwiches', '1 sandwich', 760, 44, 62, 37, 1480, ['sandwich']),
  item('mendocino-kale-salad', 'Not So Fried Chicken Salad', 'Mendocino Farms', 'lunch', '1 salad', 640, 36, 40, 38, 1180, ['salad']),

  item('tendergreens-chicken-plate', 'Chipotle BBQ Chicken Plate', 'Tender Greens', 'lunch', '1 plate', 620, 46, 50, 26, 1380, ['chicken']),
  item('tendergreens-salmon', 'Salmon Plate', 'Tender Greens', 'lunch', '1 plate', 640, 38, 44, 34, 1080, ['salmon']),

  item('dig-chicken-bowl', 'Charred Chicken Bowl', 'Dig', 'lunch', '1 bowl', 620, 40, 62, 23, 1180, ['bowl']),
  item('dig-salmon-bowl', 'Wild Salmon Bowl', 'Dig', 'lunch', '1 bowl', 640, 36, 58, 28, 980, ['bowl', 'salmon']),

  item('saladworks-cobb', 'Cobb Salad (with dressing)', 'Saladworks', 'lunch', '1 salad', 680, 40, 16, 50, 1580, ['salad']),
  item('saladworks-wrap', 'Chicken Caesar Wrap', 'Saladworks', 'sandwiches', '1 wrap', 640, 36, 48, 34, 1480, ['wrap']),

  item('pret-tuna-baguette', 'Tuna Baguette', 'Pret A Manger', 'sandwiches', '1 baguette', 520, 28, 56, 20, 1120, ['tuna', 'sandwich']),
  item('pret-chicken-avocado', 'Chicken & Avocado Sandwich', 'Pret A Manger', 'sandwiches', '1 sandwich', 480, 28, 40, 23, 880, ['chicken']),
  item('pret-croissant', 'Butter Croissant', 'Pret A Manger', 'breakfast', '1 croissant', 290, 6, 30, 16, 300, ['croissant']),

  item('zoup-chicken-noodle', 'Chicken Noodle Soup (medium)', 'Zoup! Fresh Soup Co.', 'lunch', '16 fl oz', 260, 18, 30, 7, 1480, ['soup']),
  item('zoup-lobster-bisque', 'Lobster Bisque (medium)', 'Zoup! Fresh Soup Co.', 'lunch', '16 fl oz', 480, 12, 32, 34, 1580, ['soup', 'lobster']),

  // ——— Subs & convenience stores ———
  item('blimpie-best', 'Blimpie Best (6")', 'Blimpie', 'sandwiches', '6 inch', 450, 26, 46, 17, 1480, ['sub', 'italian']),
  item('blimpie-turkey', 'Turkey & Provolone (6")', 'Blimpie', 'sandwiches', '6 inch', 400, 25, 46, 12, 1240, ['sub', 'turkey']),

  item('711-big-bite', 'Big Bite Hot Dog (quarter pound)', '7-Eleven', 'snacks', '1 hot dog with bun', 470, 16, 30, 32, 1280, ['hot dog']),
  item('711-pizza', 'Pepperoni Pizza Slice', '7-Eleven', 'lunch', '1 slice', 380, 15, 38, 18, 920, ['pizza']),
  item('711-taquito', 'Chicken & Cheese Taquito', '7-Eleven', 'snacks', '1 taquito', 240, 8, 26, 11, 560, ['taquito']),
  item('711-slurpee', 'Slurpee (Coca-Cola, medium)', '7-Eleven', 'snacks', '22 fl oz', 180, 0, 47, 0, 40, ['slurpee', 'frozen drink']),

  item('circlek-hot-dog', 'Roller Grill Hot Dog', 'Circle K', 'snacks', '1 hot dog with bun', 360, 12, 26, 23, 1080, ['hot dog']),
  item('circlek-breakfast-sandwich', 'Sausage, Egg & Cheese Croissant', 'Circle K', 'breakfast', '1 sandwich', 500, 17, 30, 35, 1080, ['breakfast sandwich']),

  item('kwiktrip-glazer', 'Glazer Donut', 'Kwik Trip', 'breakfast', '1 donut', 260, 4, 32, 13, 230, ['donut']),
  item('kwiktrip-hot-spot-pizza', 'Pepperoni Pizza Slice', 'Kwik Trip', 'lunch', '1 slice', 370, 15, 36, 18, 900, ['pizza']),
  item('kwiktrip-breakfast-sandwich', 'Sausage Breakfast Sandwich', 'Kwik Trip', 'breakfast', '1 sandwich', 460, 18, 30, 30, 1040, ['breakfast sandwich']),

  // ——— Regional pizza & Italian ———
  item('pieology-pepperoni', 'Pepperoni Pizza (11")', 'Pieology', 'dinner', '1/2 pizza', 520, 22, 56, 23, 1180, ['pizza']),

  item('uno-deep-dish', 'Chicago Classic Deep Dish (individual)', 'Uno Pizzeria & Grill', 'dinner', '1/3 pizza', 610, 25, 46, 36, 1380, ['pizza', 'deep dish']),
  item('uno-pasta', 'Chicken & Broccoli Alfredo', 'Uno Pizzeria & Grill', 'dinner', '1 entrée', 1320, 62, 110, 70, 2380, ['pasta']),

  item('bertuccis-margherita', 'Margherita Pizza (large)', "Bertucci's", 'dinner', '1 slice', 260, 11, 30, 11, 520, ['pizza']),
  item('bertuccis-rolls', 'Brick Oven Rolls', "Bertucci's", 'snacks', '1 roll', 160, 4, 30, 2, 260, ['bread']),

  item('malnatis-deep-dish', 'The Lou (deep dish, individual)', "Lou Malnati's", 'dinner', '1 slice (of 4)', 330, 14, 24, 20, 620, ['pizza', 'deep dish', 'chicago']),
  item('malnatis-sausage', 'Buttercrust Sausage Deep Dish', "Lou Malnati's", 'dinner', '1 slice (large)', 420, 18, 26, 27, 880, ['pizza', 'deep dish', 'chicago']),

  item('rosatis-thin', 'Thin Crust Sausage Pizza', "Rosati's Pizza", 'dinner', '1 slice (large)', 260, 11, 20, 15, 620, ['pizza', 'chicago']),

  item('imos-cheese', 'St. Louis-Style Cheese Pizza', "Imo's Pizza", 'dinner', '1 square (large)', 130, 6, 10, 7, 290, ['pizza', 'provel', 'st louis']),
  item('imos-deluxe', 'The Deluxe Pizza', "Imo's Pizza", 'dinner', '1 square (large)', 170, 8, 11, 10, 420, ['pizza', 'provel']),

  item('buca-spaghetti-meatball', 'Spaghetti with Meatballs (small)', 'Buca di Beppo', 'dinner', '1 serving (small, shared)', 820, 38, 82, 38, 1840, ['pasta']),
  item('buca-chicken-parm', 'Chicken Parmigiana (small)', 'Buca di Beppo', 'dinner', '1 serving (small, shared)', 960, 68, 52, 54, 2380, ['chicken parm']),

  item('carinos-spicy-chicken-pasta', 'Spicy Shrimp & Chicken', "Johnny Carino's", 'dinner', '1 entrée', 1240, 62, 112, 60, 2680, ['pasta']),
  item('carinos-lasagna', 'Lasagna', "Johnny Carino's", 'dinner', '1 entrée', 960, 50, 62, 56, 2280, ['lasagna']),

  item('bravo-pasta-woozie', 'Pasta Woozie', 'BRAVO! Italian Kitchen', 'dinner', '1 entrée', 1180, 52, 104, 60, 2280, ['pasta']),
  item('bravo-lasagna', 'Lasagna Bolognese al Forno', 'BRAVO! Italian Kitchen', 'dinner', '1 entrée', 1040, 52, 64, 62, 2380, ['lasagna']),

  item('brio-chicken-milanese', 'Chicken Milanese', 'Brio Italian Grille', 'dinner', '1 entrée', 1020, 62, 68, 54, 2180, ['chicken']),
  item('brio-bruschetta', 'Bruschetta Quattro', 'Brio Italian Grille', 'snacks', '1 order', 880, 26, 88, 46, 1680, ['bruschetta']),

  item('ilfornaio-margherita', 'Pizza Margherita', 'Il Fornaio', 'dinner', '1 pizza', 980, 40, 112, 40, 2080, ['pizza']),
  item('ilfornaio-pasta', 'Spaghetti alla Bolognese', 'Il Fornaio', 'dinner', '1 entrée', 880, 38, 98, 36, 1480, ['pasta']),

  // ——— Breakfast houses & diners ———
  item('ophr-dutch-baby', 'Dutch Baby', 'The Original Pancake House', 'breakfast', '1 dutch baby', 1100, 32, 130, 50, 760, ['pancake']),
  item('ophr-apple-pancake', 'Apple Pancake', 'The Original Pancake House', 'breakfast', '1 pancake', 1300, 18, 196, 50, 820, ['pancake']),
  item('ophr-buttermilk', 'Buttermilk Pancakes (6)', 'The Original Pancake House', 'breakfast', '6 pancakes', 740, 18, 112, 24, 1640, ['pancakes']),

  item('shari-marionberry-pie', 'Marionberry Pie', "Shari's Cafe & Pies", 'snacks', '1 slice', 560, 5, 78, 26, 400, ['pie']),
  item('shari-breakfast', 'Classic Breakfast (2 eggs, bacon, hash browns, toast)', "Shari's Cafe & Pies", 'breakfast', '1 plate', 840, 30, 66, 50, 1580, ['eggs']),

  item('mc-pot-pie', 'Chicken Pot Pie', "Marie Callender's", 'dinner', '1 pie', 1080, 34, 84, 68, 1780, ['pot pie']),
  item('mc-banana-cream-pie', 'Banana Cream Pie', "Marie Callender's", 'snacks', '1 slice', 650, 8, 72, 37, 480, ['pie']),

  item('cocos-pancakes', 'Buttermilk Pancakes (3)', "Coco's Bakery Restaurant", 'breakfast', '3 pancakes', 620, 14, 98, 19, 1420, ['pancakes']),
  item('cocos-pie', 'Apple Pie', "Coco's Bakery Restaurant", 'snacks', '1 slice', 480, 4, 66, 23, 420, ['pie']),

  item('bakerssquare-french-silk', 'French Silk Pie', 'Bakers Square', 'snacks', '1 slice', 680, 6, 56, 48, 380, ['pie']),
  item('bakerssquare-skillet', 'Country Skillet', 'Bakers Square', 'breakfast', '1 skillet', 960, 36, 62, 62, 2180, ['eggs']),

  item('lepeep-pancakes', 'Pancakes (3) with bacon', 'Le Peep', 'breakfast', '1 plate', 760, 20, 104, 29, 1480, ['pancakes']),
  item('lepeep-skillet', 'Peasant Skillet', 'Le Peep', 'breakfast', '1 skillet', 880, 34, 58, 56, 1880, ['eggs']),

  item('eggharbor-skillet', 'Harbor Hash Skillet', 'Egg Harbor Café', 'breakfast', '1 skillet', 820, 36, 52, 52, 1780, ['eggs']),
  item('eggharbor-pancakes', 'Buttermilk Pancakes (2)', 'Egg Harbor Café', 'breakfast', '2 pancakes', 520, 12, 86, 14, 1080, ['pancakes']),

  item('brokenyolk-skillet', 'Broken Yolk Skillet', 'The Broken Yolk Cafe', 'breakfast', '1 skillet', 920, 38, 56, 60, 1980, ['eggs']),
  item('brokenyolk-chicken-waffle', 'Chicken & Waffles', 'The Broken Yolk Cafe', 'breakfast', '1 plate', 1240, 48, 132, 58, 2380, ['waffle']),

  item('tupelo-biscuit', 'Sweet Potato Pancake', 'Tupelo Honey Southern Kitchen', 'breakfast', '1 pancake', 760, 12, 108, 31, 820, ['pancake']),
  item('tupelo-fried-chicken', 'Southern Fried Chicken Plate', 'Tupelo Honey Southern Kitchen', 'dinner', '1 entrée', 1240, 62, 96, 66, 2680, ['fried chicken']),

  item('maplestreet-squawking-goat', 'The Squawking Goat', 'Maple Street Biscuit Company', 'breakfast', '1 biscuit', 820, 34, 64, 48, 1880, ['biscuit', 'fried chicken']),
  item('maplestreet-five-stack', 'The Five Stack', 'Maple Street Biscuit Company', 'breakfast', '1 biscuit', 1080, 44, 70, 68, 2480, ['biscuit']),

  // ——— Bakeries & donuts ———
  item('85c-sea-salt-coffee', 'Sea Salt Coffee (medium)', '85°C Bakery Cafe', 'breakfast', '16 fl oz', 230, 3, 28, 12, 220, ['coffee']),
  item('85c-brioche', 'Brioche', '85°C Bakery Cafe', 'snacks', '1 brioche', 370, 9, 50, 15, 300, ['bread']),
  item('85c-marble-taro', 'Marble Taro Bread', '85°C Bakery Cafe', 'snacks', '1/4 loaf', 300, 6, 48, 9, 220, ['bread', 'taro']),

  item('lamars-glazed', 'Original Glazed Donut', "LaMar's Donuts", 'breakfast', '1 donut', 290, 4, 36, 14, 240, ['donut']),
  item('lamars-cinnamon-roll', 'Cinnamon Roll', "LaMar's Donuts", 'snacks', '1 roll', 540, 7, 70, 26, 420, ['donut']),

  item('daylight-glazed', 'Glazed Donut', 'Daylight Donuts', 'breakfast', '1 donut', 260, 4, 32, 13, 230, ['donut']),
  item('daylight-kolache', 'Sausage Kolache', 'Daylight Donuts', 'breakfast', '1 kolache', 340, 11, 30, 20, 780, ['kolache']),

  item('pretzelmaker-original', 'Original Pretzel', 'Pretzelmaker', 'snacks', '1 pretzel', 380, 10, 72, 6, 980, ['pretzel']),
  item('pretzelmaker-bites', 'Cinnamon Sugar Pretzel Bites', 'Pretzelmaker', 'snacks', '1 regular cup', 520, 10, 92, 13, 460, ['pretzel']),

  // ——— Frozen dessert ———
  item('carvel-cone', 'Vanilla Soft Serve (small cone)', 'Carvel', 'snacks', '1 small', 260, 6, 40, 8, 120, ['ice cream']),
  item('carvel-flying-saucer', 'Flying Saucer', 'Carvel', 'snacks', '1 sandwich', 240, 4, 36, 9, 180, ['ice cream sandwich']),

  item('marbleslab-like-it', 'Ice Cream with 1 mix-in ("Like It")', 'Marble Slab Creamery', 'snacks', '1 like it', 520, 8, 58, 29, 180, ['ice cream']),
  item('marbleslab-waffle-cone', 'Waffle Cone', 'Marble Slab Creamery', 'snacks', '1 cone', 160, 2, 28, 4, 40, ['cone']),

  item('brusters-cone', 'Vanilla Ice Cream (single, cone)', "Bruster's Real Ice Cream", 'snacks', '1 single', 390, 6, 46, 20, 140, ['ice cream']),
  item('brusters-sundae', 'Hot Fudge Sundae', "Bruster's Real Ice Cream", 'snacks', '1 sundae', 780, 11, 90, 42, 300, ['sundae']),

  item('handels-cone', 'Vanilla Ice Cream (single scoop)', "Handel's Homemade Ice Cream", 'snacks', '1 scoop', 340, 5, 34, 21, 100, ['ice cream']),

  item('pinkberry-original', 'Original Frozen Yogurt (small)', 'Pinkberry', 'snacks', '1 small', 140, 4, 30, 0, 80, ['frozen yogurt']),
  item('16handles-froyo', 'Frozen Yogurt with toppings (typical cup)', '16 Handles', 'snacks', '1 cup', 360, 8, 66, 7, 160, ['frozen yogurt']),
  item('sweetfrog-froyo', 'Frozen Yogurt with toppings (typical cup)', 'sweetFrog', 'snacks', '1 cup', 360, 8, 66, 7, 160, ['frozen yogurt']),

  item('kopps-custard', 'Frozen Custard (single scoop)', "Kopp's Frozen Custard", 'snacks', '1 scoop', 330, 6, 32, 20, 140, ['custard']),
  item('kopps-burger', 'Single Hamburger', "Kopp's Frozen Custard", 'lunch', '1 burger', 560, 30, 30, 35, 760, ['burger']),

  item('orangejulius-original', 'Original Orange Julius (medium)', 'Orange Julius', 'snacks', '20 fl oz', 330, 3, 76, 1, 80, ['smoothie']),
  item('orangejulius-strawberry', 'Strawberry Banana Smoothie (medium)', 'Orange Julius', 'snacks', '20 fl oz', 380, 3, 92, 0, 70, ['smoothie']),

  // ——— Smoothie & juice bars ———
  item('robeks-hawaiian', 'Hawaiian Sunrise (medium)', 'Robeks', 'snacks', '24 fl oz', 380, 3, 92, 1, 40, ['smoothie']),
  item('robeks-acai-bowl', 'Acai Bowl (regular)', 'Robeks', 'breakfast', '1 bowl', 520, 8, 92, 15, 60, ['acai']),

  item('planetsmoothie-chocolate-elvis', 'Chocolate Elvis (medium)', 'Planet Smoothie', 'snacks', '22 fl oz', 620, 22, 88, 22, 340, ['smoothie']),
  item('planetsmoothie-mr-mongo', 'Mr. Mongo (medium)', 'Planet Smoothie', 'snacks', '22 fl oz', 360, 3, 88, 1, 40, ['smoothie']),

  item('nekter-acai-bowl', 'Acai Bowl (regular)', 'Nékter Juice Bar', 'breakfast', '1 bowl', 480, 7, 84, 14, 60, ['acai']),
  item('nekter-juice', 'Green Juice (16 oz)', 'Nékter Juice Bar', 'snacks', '16 fl oz', 120, 3, 28, 0, 120, ['juice']),

  item('pressed-greens', 'Greens 1 Juice', 'Pressed', 'snacks', '12 fl oz', 70, 3, 13, 0, 160, ['juice']),
  item('pressed-acai', 'Acai Bowl', 'Pressed', 'breakfast', '1 bowl', 460, 7, 80, 13, 60, ['acai']),

  item('cleanjuice-acai', 'The Coco-Nut Bowl', 'Clean Juice', 'breakfast', '1 bowl', 560, 9, 86, 22, 70, ['acai', 'organic']),
  item('cleanjuice-green', 'The Green One Juice', 'Clean Juice', 'snacks', '16 fl oz', 140, 3, 32, 0, 140, ['juice']),

  item('playa-acai', 'Acai Bowl (regular)', 'Playa Bowls', 'breakfast', '1 regular', 540, 8, 96, 15, 60, ['acai']),
  item('playa-pitaya', 'Pitaya Bowl (regular)', 'Playa Bowls', 'breakfast', '1 regular', 480, 7, 92, 11, 50, ['pitaya']),

  item('vitality-acai', 'Acai Bowl (regular)', 'Vitality Bowls', 'breakfast', '1 regular', 520, 8, 90, 15, 60, ['acai']),

  // ——— Coffee ———
  item('blackrock-fuel', 'Fuel Energy Drink (medium)', 'Black Rock Coffee Bar', 'snacks', '24 fl oz', 290, 0, 72, 0, 160, ['energy drink']),
  item('blackrock-latte', 'Caramel Latte (medium)', 'Black Rock Coffee Bar', 'breakfast', '20 fl oz', 380, 13, 56, 12, 240, ['coffee', 'latte']),
];
