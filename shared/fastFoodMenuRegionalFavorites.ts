import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Eighth wave: convenience and travel stops, warehouse and grocery food courts, movie theaters,
 * regional BBQ, chicken, burger and pizza institutions, boba and dirty-soda shops, ice cream,
 * hoagie shops, and hot pot / Korean BBQ. Values follow each chain's published nutrition where it
 * is posted; where only calories are posted, macros are Atwater-aligned to the posted calories.
 * Recipes vary by location and over time.
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

export const REGIONAL_FAVORITES_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // ——— Convenience & travel stops ———
  item('racetrac-taquito', 'Chicken & Cheese Roller Taquito', 'RaceTrac', 'snacks', '1 taquito', 220, 8, 22, 11, 480, ['taquito', 'roller grill']),
  item('racetrac-swirl', 'Swirl World Frozen Yogurt (small)', 'RaceTrac', 'snacks', '12 oz', 340, 8, 60, 8, 200, ['frozen yogurt']),

  item('cumbyfarms-croissant', 'Bacon, Egg & Cheese Croissant', 'Cumberland Farms', 'breakfast', '1 sandwich', 460, 18, 30, 30, 880, ['breakfast sandwich']),
  item('cumbyfarms-chill-zone', 'Chill Zone Frozen Drink (32 oz)', 'Cumberland Farms', 'snacks', '32 fl oz', 260, 0, 65, 0, 40, ['slushie', 'frozen drink']),

  item('stewarts-cone', 'Ice Cream Cone (2 scoops, vanilla)', "Stewart's Shops", 'snacks', '1 cone', 420, 7, 50, 21, 140, ['ice cream']),
  item('stewarts-breakfast', 'Sausage, Egg & Cheese Sandwich', "Stewart's Shops", 'breakfast', '1 sandwich', 480, 20, 30, 31, 960, ['breakfast sandwich']),

  item('maverik-burrito', 'Bonfire Breakfast Burrito', 'Maverik', 'breakfast', '1 burrito', 590, 22, 52, 32, 1340, ['burrito']),
  item('maverik-pizza', 'Pepperoni Pizza (slice)', 'Maverik', 'lunch', '1 slice', 380, 15, 38, 18, 860, ['pizza']),

  item('loves-hot-dog', 'Roller Grill Hot Dog with bun', "Love's Travel Stops", 'snacks', '1 hot dog', 330, 11, 26, 20, 940, ['hot dog', 'roller grill']),
  item('loves-pizza', 'Pepperoni Pizza (slice)', "Love's Travel Stops", 'lunch', '1 slice', 360, 14, 36, 18, 820, ['pizza']),

  item('pilot-biscuit', 'Sausage, Egg & Cheese Biscuit', 'Pilot Flying J', 'breakfast', '1 biscuit', 520, 17, 34, 35, 1240, ['breakfast sandwich']),
  item('pilot-pizza', 'PJ Fresh Pepperoni Pizza (slice)', 'Pilot Flying J', 'lunch', '1 slice', 350, 14, 36, 16, 800, ['pizza']),

  item('speedway-hot-dog', 'Quarter-Pound Hot Dog', 'Speedway', 'snacks', '1 hot dog', 450, 15, 28, 31, 1260, ['hot dog', 'roller grill']),
  item('speedway-freezoni', 'Freezoni Frozen Drink (32 oz)', 'Speedway', 'snacks', '32 fl oz', 280, 0, 70, 0, 40, ['slushie', 'frozen drink']),

  item('rutters-chicken', 'Crispy Chicken Sandwich', "Rutter's", 'sandwiches', '1 sandwich', 520, 24, 48, 26, 1180, ['chicken sandwich']),
  item('rutters-croissant', 'Sausage, Egg & Cheese Croissant', "Rutter's", 'breakfast', '1 sandwich', 480, 17, 30, 32, 920, ['breakfast sandwich']),

  item('getgo-hoagie', 'Italian Hoagie (6 in)', 'GetGo', 'sandwiches', '1 hoagie', 560, 26, 46, 30, 1780, ['hoagie', 'sub']),
  item('getgo-wings', 'Wings (6)', 'GetGo', 'snacks', '6 wings', 480, 38, 4, 34, 1620, ['wings']),

  item('hyvee-fried-chicken', 'Fried Chicken (breast & thigh)', 'Hy-Vee', 'dinner', '2 pieces', 620, 48, 18, 40, 1480, ['fried chicken']),
  item('hyvee-breakfast-pizza', 'Breakfast Pizza (slice)', 'Hy-Vee', 'breakfast', '1 slice', 380, 15, 32, 21, 840, ['pizza']),

  // ——— Warehouse & grocery food courts ———
  item('costco-hot-dog', 'Hot Dog with bun', 'Costco Food Court', 'lunch', '1 hot dog', 570, 24, 46, 32, 1750, ['hot dog']),
  item('costco-cheese-pizza', 'Cheese Pizza (slice)', 'Costco Food Court', 'lunch', '1 slice', 710, 38, 74, 28, 1500, ['pizza']),
  item('costco-pepperoni-pizza', 'Pepperoni Pizza (slice)', 'Costco Food Court', 'lunch', '1 slice', 700, 36, 72, 30, 1720, ['pizza']),
  item('costco-chicken-bake', 'Chicken Bake', 'Costco Food Court', 'lunch', '1 bake', 770, 46, 76, 31, 2200, ['chicken bake']),
  item('costco-churro', 'Churro', 'Costco Food Court', 'snacks', '1 churro', 360, 4, 52, 16, 250, ['churro', 'dessert']),

  item('samsclub-hot-dog', 'Hot Dog with bun', "Sam's Club Café", 'lunch', '1 hot dog', 520, 20, 44, 30, 1500, ['hot dog']),
  item('samsclub-pizza', 'Pepperoni Pizza (slice)', "Sam's Club Café", 'lunch', '1 slice', 680, 32, 72, 29, 1680, ['pizza']),

  item('ikea-meatballs', 'Swedish Meatballs (15) with mashed potatoes & gravy', 'IKEA Restaurant', 'lunch', '1 plate', 740, 30, 52, 46, 1980, ['meatballs', 'swedish']),
  item('ikea-plant-balls', 'Plant Balls (15) with mashed potatoes & gravy', 'IKEA Restaurant', 'lunch', '1 plate', 610, 22, 66, 28, 1680, ['plant based', 'vegan']),
  item('ikea-hot-dog', 'Hot Dog', 'IKEA Restaurant', 'snacks', '1 hot dog', 290, 10, 26, 16, 760, ['hot dog']),

  item('publix-chicken-tender-sub', 'Chicken Tender Sub (whole)', 'Publix Deli', 'sandwiches', '1 whole sub', 1300, 62, 128, 60, 3200, ['pub sub', 'chicken tender sub']),
  item('publix-italian-sub', 'Boar’s Head Italian Sub (half)', 'Publix Deli', 'sandwiches', '1 half sub', 680, 32, 56, 36, 2340, ['pub sub', 'italian sub']),
  item('publix-fried-chicken', 'Fried Chicken (breast & wing)', 'Publix Deli', 'dinner', '2 pieces', 560, 40, 18, 36, 1420, ['fried chicken']),

  item('wegmans-italian-sub', 'Italian Classic Sub (half)', 'Wegmans', 'sandwiches', '1 half sub', 640, 30, 52, 34, 2080, ['sub']),
  item('wegmans-wings', 'Buffalo Wings (6)', 'Wegmans', 'snacks', '6 wings', 480, 38, 2, 35, 1520, ['wings']),
  item('wegmans-california-roll', 'California Roll', 'Wegmans', 'lunch', '8 pieces', 300, 8, 48, 8, 640, ['sushi']),

  item('wholefoods-hot-bar', 'Hot Bar: Roasted Chicken & Vegetables', 'Whole Foods Market', 'lunch', '1 lb', 620, 52, 34, 30, 1240, ['hot bar']),
  item('wholefoods-pizza', 'Cheese Pizza (slice)', 'Whole Foods Market', 'lunch', '1 slice', 330, 14, 40, 12, 720, ['pizza']),

  // ——— Movie theaters ———
  item('amc-popcorn-large', 'Popcorn (large, no added butter)', 'AMC Theatres', 'snacks', '1 large', 1030, 16, 120, 58, 1500, ['popcorn', 'movie']),
  item('amc-popcorn-small', 'Popcorn (small, no added butter)', 'AMC Theatres', 'snacks', '1 small', 430, 7, 50, 24, 620, ['popcorn', 'movie']),
  item('amc-nachos', 'Nachos with cheese', 'AMC Theatres', 'snacks', '1 tray', 620, 10, 66, 36, 1340, ['nachos', 'movie']),

  item('regal-popcorn-large', 'Popcorn (large, no added butter)', 'Regal Cinemas', 'snacks', '1 large', 1200, 18, 136, 68, 1650, ['popcorn', 'movie']),
  item('regal-pretzel-bites', 'Soft Pretzel Bites', 'Regal Cinemas', 'snacks', '1 order', 480, 13, 90, 7, 1100, ['pretzel', 'movie']),

  item('cinemark-popcorn-medium', 'Popcorn (medium, no added butter)', 'Cinemark', 'snacks', '1 medium', 720, 11, 82, 40, 1050, ['popcorn', 'movie']),
  item('cinemark-hot-dog', 'Hot Dog', 'Cinemark', 'snacks', '1 hot dog', 420, 14, 30, 27, 1180, ['hot dog', 'movie']),

  // ——— Regional BBQ ———
  item('smokeybones-ribs', 'St. Louis Ribs (half rack)', 'Smokey Bones', 'dinner', '1 half rack', 920, 62, 30, 60, 2280, ['ribs']),
  item('smokeybones-brisket', 'Smoked Brisket (meat only)', 'Smokey Bones', 'dinner', '6 oz', 520, 44, 6, 36, 1440, ['brisket']),

  item('rudys-brisket', 'Moist Brisket (1/2 lb)', "Rudy's Country Store and Bar-B-Q", 'dinner', '1/2 lb', 720, 56, 2, 54, 1680, ['brisket']),
  item('rudys-turkey', 'Smoked Turkey (1/2 lb)', "Rudy's Country Store and Bar-B-Q", 'dinner', '1/2 lb', 340, 60, 4, 9, 1600, ['turkey']),
  item('rudys-creamed-corn', 'Creamed Corn', "Rudy's Country Store and Bar-B-Q", 'snacks', '1 side', 280, 5, 22, 20, 420, ['side']),

  item('jimnnicks-pork', 'Pulled Pork (meat only)', "Jim 'N Nick's Bar-B-Q", 'dinner', '6 oz', 420, 38, 8, 26, 1180, ['pulled pork']),
  item('jimnnicks-cheese-biscuits', 'Cheese Biscuits (3)', "Jim 'N Nick's Bar-B-Q", 'snacks', '3 biscuits', 450, 9, 48, 25, 780, ['biscuits']),

  item('joeskc-z-man', 'Z-Man Sandwich', "Joe's Kansas City Bar-B-Que", 'sandwiches', '1 sandwich', 780, 44, 62, 40, 1980, ['brisket sandwich']),
  item('joeskc-ribs', 'Spare Ribs (half slab)', "Joe's Kansas City Bar-B-Que", 'dinner', '1 half slab', 980, 64, 20, 72, 2100, ['ribs']),

  item('gates-beef-on-bun', 'Beef on Bun (regular)', 'Gates Bar-B-Q', 'sandwiches', '1 sandwich', 620, 42, 48, 28, 1640, ['beef sandwich']),
  item('gates-short-end', 'Short End Ribs', 'Gates Bar-B-Q', 'dinner', '1 order', 940, 60, 22, 68, 2040, ['ribs']),

  item('arthurbryants-burnt-ends', 'Burnt Ends Sandwich', "Arthur Bryant's Barbeque", 'sandwiches', '1 sandwich', 860, 48, 64, 46, 2180, ['burnt ends']),

  item('pappasbbq-brisket-plate', 'Brisket Plate with 2 sides', 'Pappas Bar-B-Q', 'dinner', '1 plate', 1180, 62, 78, 68, 2880, ['brisket']),

  item('dinosaur-pulled-pork', 'Pulled Pork Sandwich', 'Dinosaur Bar-B-Que', 'sandwiches', '1 sandwich', 760, 40, 64, 36, 1820, ['pulled pork']),
  item('dinosaur-wings', 'Wings (8)', 'Dinosaur Bar-B-Que', 'snacks', '8 wings', 680, 52, 8, 48, 2280, ['wings']),

  item('moesbbq-pork-plate', 'Pulled Pork Plate with 2 sides', "Moe's Original Bar B Que", 'dinner', '1 plate', 980, 44, 92, 48, 2340, ['pulled pork']),

  item('lucilles-tri-tip', 'Tri-Tip (meat only)', "Lucille's Smokehouse Bar-B-Que", 'dinner', '6 oz', 560, 52, 10, 34, 1520, ['tri tip']),
  item('lucilles-biscuits', 'Biscuits with apple butter (2)', "Lucille's Smokehouse Bar-B-Que", 'snacks', '2 biscuits', 520, 8, 64, 26, 840, ['biscuits']),

  // ——— Chicken & wings ———
  item('grandys-chicken', 'Fried Chicken (breast & wing)', "Grandy's", 'dinner', '2 pieces', 640, 42, 24, 42, 1680, ['fried chicken']),
  item('grandys-cinnamon-roll', 'Cinnamon Roll', "Grandy's", 'breakfast', '1 roll', 520, 8, 78, 20, 480, ['cinnamon roll']),

  item('hartz-chicken', 'Fried Chicken (2 pieces)', 'Hartz Chicken Buffet', 'dinner', '2 pieces', 600, 40, 22, 40, 1580, ['fried chicken', 'buffet']),

  item('mrswinners-biscuit', 'Chicken Biscuit', "Mrs. Winner's", 'breakfast', '1 biscuit', 480, 18, 44, 26, 1240, ['chicken biscuit']),
  item('mrswinners-chicken', 'Fried Chicken (2 pieces)', "Mrs. Winner's", 'dinner', '2 pieces', 620, 42, 22, 40, 1640, ['fried chicken']),

  item('browns-chicken', 'Fried Chicken (breast & thigh)', "Brown's Chicken", 'dinner', '2 pieces', 680, 46, 24, 44, 1720, ['fried chicken']),

  item('harolds-half-white', 'Half White Chicken with fries & mild sauce', "Harold's Chicken", 'dinner', '1 order', 1580, 82, 120, 86, 3200, ['fried chicken']),
  item('harolds-wings', 'Wings (6) with fries', "Harold's Chicken", 'dinner', '1 order', 1120, 52, 92, 60, 2400, ['wings']),

  item('superchix-sandwich', 'Chicken Sandwich', 'Super Chix', 'sandwiches', '1 sandwich', 540, 32, 50, 23, 1280, ['chicken sandwich']),
  item('superchix-custard', 'Frozen Custard (regular)', 'Super Chix', 'snacks', '1 cup', 480, 9, 52, 26, 220, ['custard', 'dessert']),

  item('bigchicken-shaq-attack', 'Shaq Attack Sandwich', 'Big Chicken', 'sandwiches', '1 sandwich', 980, 44, 82, 52, 2240, ['chicken sandwich']),
  item('bigchicken-tenders', 'Chicken Tenders (3)', 'Big Chicken', 'lunch', '3 tenders', 540, 40, 30, 29, 1580, ['chicken tenders']),

  item('starbird-sandwich', 'Crispy Chicken Sandwich', 'Starbird Chicken', 'sandwiches', '1 sandwich', 620, 36, 52, 29, 1380, ['chicken sandwich']),

  item('howlinrays-sando', 'Nashville Hot Chicken Sando', "Howlin' Ray's", 'sandwiches', '1 sandwich', 920, 46, 72, 50, 2180, ['hot chicken', 'nashville']),

  item('wingsnob-wings', 'Traditional Wings (10) with sauce', 'Wing Snob', 'dinner', '10 wings', 900, 72, 8, 64, 2600, ['wings']),
  item('wingsnob-fries', 'Fries', 'Wing Snob', 'snacks', '1 side', 420, 5, 52, 21, 580, ['fries']),

  item('wingsover-boneless', 'Boneless Wings (10) with sauce', 'Wings Over', 'dinner', '10 wings', 860, 46, 72, 42, 3100, ['wings', 'boneless']),

  item('quaker-wings', 'Wings (10)', 'Quaker Steak & Lube', 'dinner', '10 wings', 920, 74, 6, 66, 2680, ['wings']),
  item('quaker-tenders', 'Chicken Tenders Basket', 'Quaker Steak & Lube', 'dinner', '1 basket', 1020, 48, 92, 52, 2240, ['chicken tenders']),

  item('atomicwings-wings', 'Atomic Wings (10)', 'Atomic Wings', 'dinner', '10 wings', 880, 72, 6, 62, 2900, ['wings']),

  // ——— Burgers & sports bars ———
  item('tommys-chili-cheeseburger', 'Original Chili Cheeseburger', "Original Tommy's", 'lunch', '1 burger', 690, 32, 48, 40, 1620, ['burger', 'chili']),
  item('tommys-chili-fries', 'Chili Cheese Fries', "Original Tommy's", 'snacks', '1 order', 820, 22, 74, 48, 1580, ['fries', 'chili']),

  item('dicks-deluxe', 'Deluxe', "Dick's Drive-In", 'lunch', '1 burger', 580, 26, 38, 36, 1020, ['burger']),
  item('dicks-fries', 'Fries', "Dick's Drive-In", 'snacks', '1 order', 400, 5, 48, 21, 240, ['fries']),
  item('dicks-shake', 'Vanilla Shake', "Dick's Drive-In", 'snacks', '1 shake', 680, 14, 84, 32, 360, ['shake']),

  item('kewpee-cheeseburger', 'Hamburger with cheese', 'Kewpee', 'lunch', '1 burger', 420, 22, 30, 24, 880, ['burger']),

  item('twistedroot-original', 'Original Burger', 'Twisted Root Burger Co.', 'lunch', '1 burger', 840, 44, 46, 52, 1460, ['burger']),

  item('grub-burger', 'Grub Burger', 'Grub Burger Bar', 'lunch', '1 burger', 960, 48, 52, 62, 1680, ['burger']),

  item('burger21-classic', 'The Classic', 'Burger 21', 'lunch', '1 burger', 780, 40, 44, 48, 1320, ['burger']),

  item('teddys-original', 'Original Burger (Big, 1/3 lb)', "Teddy's Bigger Burgers", 'lunch', '1 burger', 760, 40, 44, 46, 1240, ['burger']),

  item('wayback-classic', 'Classic Single', 'Wayback Burgers', 'lunch', '1 burger', 560, 28, 40, 32, 1020, ['burger']),
  item('wayback-shake', 'Oreo Mint Shake (16 oz)', 'Wayback Burgers', 'snacks', '16 fl oz', 920, 16, 118, 42, 560, ['shake']),

  item('milos-burger', "Milo's Burger with Milo's sauce", "Milo's Hamburgers", 'lunch', '1 burger', 520, 22, 42, 29, 1240, ['burger']),
  item('milos-tea', 'Sweet Tea (large)', "Milo's Hamburgers", 'snacks', '32 fl oz', 360, 0, 90, 0, 30, ['sweet tea']),

  item('rushs-burger', 'Rush Burger', "Rush's", 'lunch', '1 burger', 640, 30, 44, 38, 1340, ['burger']),

  item('pals-sauceburger', 'Sauceburger', "Pal's Sudden Service", 'lunch', '1 burger', 480, 22, 40, 26, 980, ['burger']),
  item('pals-frenchie-fries', 'Frenchie Fries (regular)', "Pal's Sudden Service", 'snacks', '1 order', 360, 4, 46, 18, 420, ['fries']),

  item('bubbas33-burger', "Bubba's Burger", "Bubba's 33", 'lunch', '1 burger', 1080, 54, 56, 70, 2140, ['burger']),
  item('bubbas33-pizza', 'Pepperoni Pizza (personal)', "Bubba's 33", 'dinner', '1 pizza', 1120, 48, 104, 56, 2560, ['pizza']),

  item('beefobradys-wings', 'Wings (10)', "Beef 'O' Brady's", 'dinner', '10 wings', 900, 72, 4, 66, 2480, ['wings']),
  item('beefobradys-cheeseburger', 'Cheeseburger with fries', "Beef 'O' Brady's", 'lunch', '1 burger with fries', 1160, 48, 96, 64, 2120, ['burger']),

  item('rockbottom-burger', 'Brewery Burger', 'Rock Bottom Restaurant & Brewery', 'lunch', '1 burger', 1080, 52, 62, 68, 1980, ['burger']),

  item('gordonbiersch-garlic-fries', 'Garlic Fries', 'Gordon Biersch Brewery Restaurant', 'snacks', '1 order', 860, 10, 88, 52, 1280, ['fries']),

  item('punchbowl-burger', 'Punch Bowl Burger', 'Punch Bowl Social', 'lunch', '1 burger', 980, 48, 52, 64, 1780, ['burger']),

  // ——— Diners & breakfast ———
  item('mels-melburger', 'Melburger with fries', "Mel's Drive-In", 'lunch', '1 burger with fries', 1260, 48, 104, 72, 2040, ['burger', 'diner']),

  item('rubys-classic', 'Ruby’s Classic Burger', "Ruby's Diner", 'lunch', '1 burger', 840, 40, 52, 52, 1520, ['burger', 'diner']),

  item('norms-steak-eggs', 'Steak & Eggs with hash browns & toast', 'Norms', 'breakfast', '1 plate', 1180, 68, 72, 68, 2240, ['diner', 'steak and eggs']),
  item('norms-pancakes', 'Buttermilk Pancakes (3)', 'Norms', 'breakfast', '3 pancakes', 720, 16, 110, 24, 1480, ['pancakes', 'diner']),

  item('silverdiner-chicken-waffles', 'Chicken & Waffles', 'Silver Diner', 'breakfast', '1 plate', 1240, 54, 118, 60, 2380, ['chicken and waffles', 'diner']),

  item('eggsup-classic', 'Classic Breakfast (2 eggs, bacon, grits, toast)', 'Eggs Up Grill', 'breakfast', '1 plate', 720, 30, 52, 42, 1480, ['breakfast']),
  item('eggsup-pancakes', 'Pancakes (3)', 'Eggs Up Grill', 'breakfast', '3 pancakes', 690, 15, 108, 22, 1420, ['pancakes']),

  item('kerbey-queso', 'Kerbey Queso with chips', 'Kerbey Lane Cafe', 'snacks', '1 order', 980, 26, 86, 58, 1820, ['queso']),
  item('kerbey-pancakes', 'Gingerbread Pancakes (3)', 'Kerbey Lane Cafe', 'breakfast', '3 pancakes', 780, 16, 116, 28, 1380, ['pancakes']),

  item('sunnystreet-skillet', 'Breakfast Skillet', 'Sunny Street Cafe', 'breakfast', '1 skillet', 920, 40, 58, 58, 1980, ['skillet']),

  item('piccadilly-fried-fish', 'Fried Fish with 2 vegetables', 'Piccadilly', 'dinner', '1 plate', 780, 34, 64, 42, 1680, ['fish', 'cafeteria']),
  item('piccadilly-baked-chicken', 'Baked Chicken Breast with 2 vegetables', 'Piccadilly', 'dinner', '1 plate', 620, 48, 44, 26, 1480, ['chicken', 'cafeteria']),

  // ——— Mexican ———
  item('tacomayo-taco', 'Crispy Beef Taco', 'Taco Mayo', 'lunch', '1 taco', 170, 8, 13, 10, 320, ['taco']),
  item('tacomayo-potato-oles', 'Potato Olés (regular)', 'Taco Mayo', 'snacks', '1 order', 380, 4, 40, 23, 820, ['potatoes']),

  item('salsaritas-burrito', 'Chicken Burrito', "Salsarita's Fresh Mexican Grill", 'lunch', '1 burrito', 980, 48, 112, 36, 2380, ['burrito']),
  item('salsaritas-queso', 'Queso & chips', "Salsarita's Fresh Mexican Grill", 'snacks', '1 order', 720, 18, 70, 42, 1320, ['queso']),

  item('tacodeli-cowboy', 'Cowboy Taco', 'Tacodeli', 'lunch', '1 taco', 380, 20, 26, 22, 820, ['taco', 'brisket']),
  item('tacodeli-jess-special', 'Jess Special Breakfast Taco', 'Tacodeli', 'breakfast', '1 taco', 340, 14, 26, 20, 680, ['breakfast taco', 'migas']),

  item('bartaco-chicken', 'Chicken Taco', 'bartaco', 'lunch', '1 taco', 160, 10, 14, 7, 320, ['taco']),
  item('bartaco-pork-belly', 'Pork Belly Taco', 'bartaco', 'lunch', '1 taco', 220, 8, 16, 14, 380, ['taco']),

  // ——— Mediterranean ———
  item('pitapit-chicken', 'Chicken Souvlaki Pita', 'Pita Pit', 'lunch', '1 pita', 520, 34, 58, 16, 1280, ['pita']),
  item('pitapit-gyro', 'Gyro Pita', 'Pita Pit', 'lunch', '1 pita', 640, 28, 60, 32, 1580, ['gyro', 'pita']),

  item('littlegreek-gyro', 'Gyro Pita', 'Little Greek Fresh Grill', 'lunch', '1 pita', 720, 30, 62, 38, 1680, ['gyro', 'pita']),
  item('littlegreek-salad', 'Greek Salad with chicken', 'Little Greek Fresh Grill', 'lunch', '1 salad', 480, 40, 18, 28, 1380, ['salad']),

  // ——— Steakhouses ———
  item('perrys-pork-chop', 'Famous Pork Chop', "Perry's Steakhouse & Grille", 'dinner', '1 chop', 1180, 96, 40, 70, 2460, ['pork chop']),
  item('perrys-ribeye', 'Ribeye (14 oz)', "Perry's Steakhouse & Grille", 'dinner', '14 oz', 1120, 84, 0, 86, 860, ['steak', 'ribeye']),

  item('hillstone-prime-rib', 'Prime Rib', 'Hillstone', 'dinner', '1 entrée', 1020, 74, 4, 78, 1480, ['prime rib', 'steak']),
  item('hillstone-french-dip', 'French Dip', 'Hillstone', 'sandwiches', '1 sandwich', 920, 58, 60, 48, 2380, ['french dip']),

  // ——— Regional pizza & Italian ———
  item('shakeys-mojos', 'Mojo Potatoes (regular)', "Shakey's Pizza Parlor", 'snacks', '1 order', 640, 9, 72, 35, 1460, ['mojos', 'potatoes']),
  item('shakeys-pepperoni', 'Pepperoni Pizza (large)', "Shakey's Pizza Parlor", 'dinner', '1 slice', 290, 12, 28, 14, 640, ['pizza']),

  item('happyjoes-taco-pizza', 'Taco Pizza (large)', "Happy Joe's", 'dinner', '1 slice', 320, 14, 30, 16, 720, ['pizza', 'taco pizza']),

  item('larosas-pepperoni', 'Pepperoni Pizza (large)', "LaRosa's Pizzeria", 'dinner', '1 slice', 300, 13, 30, 14, 720, ['pizza']),
  item('larosas-hoagie', 'Italian Hoagie', "LaRosa's Pizzeria", 'sandwiches', '1 hoagie', 860, 38, 74, 44, 2480, ['hoagie']),

  item('gioninos-pepperoni', 'Pepperoni Pizza (large)', "Gionino's Pizzeria", 'dinner', '1 slice', 310, 13, 32, 14, 700, ['pizza']),

  item('vocelli-cheese', 'Cheese Pizza (large)', 'Vocelli Pizza', 'dinner', '1 slice', 280, 12, 32, 11, 580, ['pizza']),

  item('foxs-pepperoni', 'Pepperoni Pizza (large)', "Fox's Pizza Den", 'dinner', '1 slice', 320, 13, 32, 15, 740, ['pizza']),
  item('foxs-wedgie', 'Ham & Cheese Wedgie (half)', "Fox's Pizza Den", 'sandwiches', '1/2 wedgie', 520, 26, 48, 24, 1380, ['wedgie', 'sandwich']),

  item('papaginos-cheese', 'Cheese Pizza (large)', "Papa Gino's", 'dinner', '1 slice', 290, 13, 34, 11, 620, ['pizza']),

  item('ginoseast-deep-dish', 'Deep Dish Cheese Pizza (medium)', "Gino's East", 'dinner', '1 slice', 480, 22, 36, 28, 940, ['pizza', 'deep dish']),
  item('ginoseast-meaty-legend', 'The Meaty Legend Deep Dish (medium)', "Gino's East", 'dinner', '1 slice', 620, 28, 36, 40, 1380, ['pizza', 'deep dish']),

  item('aurelios-sausage', 'Sausage Thin Crust (large)', "Aurelio's Pizza", 'dinner', '2 squares', 340, 15, 26, 19, 780, ['pizza', 'tavern style']),

  item('nancys-stuffed', 'Stuffed Pepperoni Pizza', "Nancy's Pizza", 'dinner', '1 slice', 560, 26, 42, 32, 1240, ['pizza', 'stuffed']),

  item('pequods-pan', 'Sausage Pan Pizza (caramelized crust)', "Pequod's Pizza", 'dinner', '1 slice', 600, 26, 44, 36, 1280, ['pizza', 'deep dish']),

  item('homeruninn-sausage', 'Sausage Thin Crust (large)', 'Home Run Inn Pizza', 'dinner', '1/8 pizza', 330, 14, 28, 18, 760, ['pizza']),

  item('oldchicago-chicago-seven', 'Chicago Seven Deep Dish (individual)', 'Old Chicago Pizza + Taproom', 'dinner', '1 pizza', 1640, 72, 130, 92, 3680, ['pizza', 'deep dish']),

  item('biaggis-alfredo', 'Fettuccine Alfredo with Chicken', "Biaggi's Ristorante Italiano", 'dinner', '1 entrée', 1340, 64, 104, 72, 2180, ['pasta', 'alfredo']),

  // ——— Korean BBQ, hot pot & Asian ———
  item('gen-brisket', 'Beef Brisket (grilled)', 'Gen Korean BBQ House', 'dinner', '6 oz', 560, 32, 2, 48, 180, ['korean bbq']),
  item('gen-bulgogi', 'Beef Bulgogi', 'Gen Korean BBQ House', 'dinner', '6 oz', 420, 34, 16, 24, 920, ['korean bbq', 'bulgogi']),

  item('kpot-hot-pot', 'Hot Pot (beef, vegetables, noodles & broth)', 'KPOT Korean BBQ & Hot Pot', 'dinner', '1 meal', 820, 52, 62, 40, 3400, ['hot pot', 'korean bbq']),

  item('haidilao-hot-pot', 'Spicy Broth Hot Pot (lamb, tofu & noodles)', 'Haidilao Hot Pot', 'dinner', '1 meal', 920, 54, 58, 52, 3800, ['hot pot']),

  item('dtf-xlb', 'Kurobuta Pork Xiao Long Bao (10)', 'Din Tai Fung', 'dinner', '10 dumplings', 560, 28, 52, 26, 1180, ['dumplings', 'soup dumplings']),
  item('dtf-shrimp-fried-rice', 'Shrimp Fried Rice', 'Din Tai Fung', 'dinner', '1 plate', 720, 26, 96, 24, 1480, ['fried rice']),
  item('dtf-string-beans', 'String Beans with Garlic', 'Din Tai Fung', 'snacks', '1 plate', 260, 6, 18, 19, 780, ['green beans']),

  item('lees-iced-coffee', 'Vietnamese Iced Coffee (16 oz)', "Lee's Sandwiches", 'snacks', '16 fl oz', 280, 4, 46, 9, 90, ['coffee']),

  // ——— Boba, tea & dirty soda ———
  item('kungfutea-milk-tea', 'Kung Fu Milk Tea with boba (medium)', 'Kung Fu Tea', 'snacks', '22 fl oz', 420, 3, 82, 9, 140, ['boba', 'bubble tea', 'milk tea']),

  item('gongcha-pearl', 'Pearl Milk Tea (medium)', 'Gong cha', 'snacks', '16 fl oz', 420, 3, 82, 9, 140, ['boba', 'bubble tea', 'milk tea']),
  item('gongcha-milk-foam', 'Milk Foam Green Tea (medium)', 'Gong cha', 'snacks', '16 fl oz', 280, 3, 48, 9, 120, ['tea']),

  item('tigersugar-brown-sugar', 'Brown Sugar Boba Milk with Cream Mousse', 'Tiger Sugar', 'snacks', '1 drink', 520, 9, 86, 16, 180, ['boba', 'bubble tea']),

  item('sharetea-classic', 'Classic Pearl Milk Tea (regular)', 'Sharetea', 'snacks', '1 drink', 400, 3, 78, 9, 130, ['boba', 'bubble tea', 'milk tea']),

  item('chatime-pearl', 'Pearl Milk Tea (large)', 'Chatime', 'snacks', '1 large', 460, 3, 90, 10, 150, ['boba', 'bubble tea', 'milk tea']),

  item('bambu-che-ba-mau', 'Che Ba Mau (three-color dessert drink)', 'Bambu Desserts & Drinks', 'snacks', '1 drink', 420, 6, 80, 9, 120, ['che', 'vietnamese']),

  item('swig-dirty-dr-pepper', 'Dirty Dr Pepper (32 oz)', 'Swig', 'snacks', '32 fl oz', 520, 1, 104, 11, 100, ['dirty soda']),
  item('swig-sugar-cookie', 'Sugar Cookie', 'Swig', 'snacks', '1 cookie', 360, 3, 50, 16, 260, ['cookie']),

  item('fiiz-dirty-coke', 'Dirty Coke (32 oz)', 'Fiiz Drinks', 'snacks', '32 fl oz', 480, 1, 100, 8, 80, ['dirty soda']),

  item('hteao-sweet-tea', 'Sweet Tea (32 oz)', 'HTeaO', 'snacks', '32 fl oz', 280, 0, 70, 0, 20, ['sweet tea']),

  item('aromajoes-rush', 'Rush Energy Drink (medium)', "Aroma Joe's", 'snacks', '24 fl oz', 300, 0, 74, 0, 120, ['energy drink']),
  item('aromajoes-latte', 'Caramel Swirl Latte (medium)', "Aroma Joe's", 'breakfast', '20 fl oz', 360, 12, 54, 11, 220, ['coffee', 'latte']),

  item('ellianos-latte', 'Caramel Latte (medium)', 'Ellianos Coffee', 'breakfast', '20 fl oz', 340, 12, 50, 10, 210, ['coffee', 'latte']),

  // ——— Ice cream, gelato & shaved ice ———
  item('kilwins-fudge', 'Chocolate Fudge', 'Kilwins', 'snacks', '2 oz slice', 240, 2, 36, 10, 60, ['fudge', 'dessert']),
  item('kilwins-cone', 'Ice Cream Waffle Cone (1 scoop)', 'Kilwins', 'snacks', '1 cone', 480, 7, 62, 23, 180, ['ice cream']),

  item('dippindots-regular', "Cookies 'n Cream (regular)", "Dippin' Dots", 'snacks', '1 regular cup', 380, 7, 46, 19, 160, ['ice cream']),

  item('bahamabucks-shaved-ice', 'Sno (medium, 1 flavor)', "Bahama Buck's", 'snacks', '1 medium', 260, 0, 65, 0, 20, ['shaved ice']),

  item('konaice-medium', 'Shaved Ice (medium)', 'Kona Ice', 'snacks', '1 medium', 200, 0, 50, 0, 15, ['shaved ice']),

  item('jenis-scoop', 'Brown Butter Almond Brittle (1 scoop)', "Jeni's Splendid Ice Creams", 'snacks', '1/2 cup', 320, 5, 32, 19, 140, ['ice cream']),

  item('saltstraw-scoop', 'Sea Salt with Caramel Ribbons (1 scoop)', 'Salt & Straw', 'snacks', '1 scoop', 340, 4, 36, 20, 260, ['ice cream']),

  item('graeters-black-raspberry', 'Black Raspberry Chocolate Chip (1 scoop)', "Graeter's Ice Cream", 'snacks', '1/2 cup', 300, 4, 32, 18, 60, ['ice cream']),

  item('paciugo-gelato', 'Gelato (small cup)', 'Paciugo Gelato', 'snacks', '1 small', 260, 5, 36, 11, 80, ['gelato']),

  // ——— Subs & hoagies ———
  item('mrhero-romanburger', 'Romanburger', 'Mr. Hero', 'sandwiches', '1 sandwich', 760, 34, 52, 46, 1680, ['burger', 'sub']),
  item('mrhero-cheesesteak', 'Cheesesteak', 'Mr. Hero', 'sandwiches', '1 sandwich', 680, 36, 60, 32, 1720, ['cheesesteak']),

  item('lennys-philly', 'Philly Cheesesteak (regular)', "Lenny's Grill & Subs", 'sandwiches', '1 sub', 640, 38, 54, 30, 1680, ['cheesesteak', 'sub']),

  item('primo-italiano', 'Italiano Hoagie (shorty)', 'Primo Hoagies', 'sandwiches', '1 hoagie', 780, 38, 60, 42, 2580, ['hoagie', 'italian']),

  item('dibellas-italian', 'Italian Sub (medium)', "DiBella's Subs", 'sandwiches', '1 sub', 820, 40, 66, 44, 2780, ['sub', 'italian']),

  item('portofsubs-italian', '#5 Italian Sub (regular)', 'Port of Subs', 'sandwiches', '1 sub', 720, 34, 62, 36, 2340, ['sub', 'italian']),

  // ——— Cajun seafood ———
  item('razzoos-gator', 'Fried Alligator', "Razzoo's Cajun Cafe", 'snacks', '1 appetizer', 620, 34, 40, 36, 1480, ['alligator', 'cajun']),
  item('razzoos-etouffee', 'Crawfish Étouffée', "Razzoo's Cajun Cafe", 'dinner', '1 entrée', 820, 32, 84, 38, 2480, ['etouffee', 'cajun', 'crawfish']),
];
