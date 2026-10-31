import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Ninth wave: regional institutions across the US — New York delis and slices, Philly
 * cheesesteaks, Boston and New Haven pizza, Buffalo wings, Carolina whole hog, New Orleans
 * po'boys, Chicago beef and dogs, Upper Midwest butter burgers and Jucy Lucys, LA dips and
 * tacos, Bay Area burritos, Pacific Northwest chowder, Hawaii plate lunch, Southwest chile,
 * and Central Texas barbecue. Independents rarely publish nutrition: values are Atwater-aligned
 * estimates from USDA analogs and typical portions, and every item carries the estimated keyword.
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
  keywords: string[] = [],
): FastFoodItem => ({ id, name, restaurant, category, serving, calories, protein, carbs, fat, sodium, keywords: [...keywords, 'estimated'] });

export const AMERICAN_ICONS_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // ——— New York City ———
  item('katzs-pastrami', 'Pastrami on Rye', "Katz's Delicatessen", 'sandwiches', '1 sandwich', 1100, 80, 50, 64, 4200, ['pastrami', 'deli']),
  item('katzs-matzo-ball', 'Matzo Ball Soup', "Katz's Delicatessen", 'lunch', '1 bowl', 380, 22, 34, 16, 1680, ['soup', 'deli']),
  item('joespizza-cheese', 'Cheese Slice', "Joe's Pizza", 'lunch', '1 slice', 300, 13, 36, 11, 640, ['pizza', 'new york slice']),
  item('joespizza-pepperoni', 'Pepperoni Slice', "Joe's Pizza", 'lunch', '1 slice', 350, 15, 36, 16, 820, ['pizza', 'new york slice']),
  item('lombardis-margherita', 'Margherita Pizza (¼ large)', "Lombardi's Pizza", 'dinner', '2 slices', 520, 22, 62, 20, 1080, ['pizza', 'coal oven']),
  item('difara-square', 'Square Slice', 'Di Fara Pizza', 'lunch', '1 slice', 420, 16, 44, 20, 880, ['pizza']),
  item('russ-classic', 'The Classic (bagel, lox & cream cheese)', 'Russ & Daughters', 'breakfast', '1 bagel', 520, 26, 62, 18, 1680, ['bagel', 'lox']),
  item('juniors-cheesecake', 'Original Cheesecake (slice)', "Junior's Restaurant", 'snacks', '1 slice', 720, 12, 58, 50, 520, ['cheesecake', 'dessert']),
  item('levain-chocolate-chip', 'Chocolate Chip Walnut Cookie', 'Levain Bakery', 'snacks', '1 cookie', 580, 8, 64, 34, 320, ['cookie']),
  item('peterluger-porterhouse', 'Porterhouse for Two (per person)', 'Peter Luger Steak House', 'dinner', '½ order', 1100, 82, 0, 86, 520, ['steak', 'porterhouse']),
  item('peterluger-bacon', 'Thick-Cut Bacon (1 slice)', 'Peter Luger Steak House', 'snacks', '1 slice', 320, 18, 2, 27, 980, ['bacon']),
  item('grayspapaya-recession', 'Recession Special (2 franks)', "Gray's Papaya", 'lunch', '2 hot dogs', 620, 22, 52, 36, 1980, ['hot dog']),
  item('xian-cumin-lamb-noodles', 'Spicy Cumin Lamb Hand-Ripped Noodles', "Xi'an Famous Foods", 'dinner', '1 bowl', 920, 38, 112, 34, 2480, ['noodles', 'chinese']),
  item('xian-lamb-burger', 'Spicy Cumin Lamb Burger', "Xi'an Famous Foods", 'lunch', '1 burger', 480, 22, 42, 25, 980, ['chinese']),
  item('joesshanghai-xlb', 'Pork Soup Dumplings (8)', "Joe's Shanghai", 'dinner', '8 dumplings', 520, 24, 52, 24, 1280, ['soup dumplings', 'xiao long bao']),
  item('nomwah-har-gow', 'Shrimp Har Gow (4)', 'Nom Wah Tea Parlor', 'lunch', '4 dumplings', 240, 12, 30, 8, 620, ['dim sum']),
  item('nomwah-egg-roll', 'Original Egg Roll', 'Nom Wah Tea Parlor', 'snacks', '1 roll', 360, 10, 34, 20, 780, ['dim sum', 'egg roll']),
  item('lostacos1-adobada', 'Adobada Taco', 'Los Tacos No. 1', 'lunch', '1 taco', 230, 12, 20, 11, 480, ['taco', 'al pastor']),

  // ——— Philadelphia ———
  item('pats-cheesesteak', 'Cheesesteak Wit Whiz', "Pat's King of Steaks", 'sandwiches', '1 sandwich', 980, 48, 78, 52, 2280, ['cheesesteak', 'philly']),
  item('genos-cheesesteak', 'Cheesesteak with Provolone', "Geno's Steaks", 'sandwiches', '1 sandwich', 940, 50, 76, 48, 2080, ['cheesesteak', 'philly']),
  item('johns-roast-pork', 'Roast Pork with Greens & Provolone', "John's Roast Pork", 'sandwiches', '1 sandwich', 880, 58, 70, 40, 2380, ['roast pork', 'philly']),
  item('dalessandros-cheesesteak', 'Cheesesteak', "Dalessandro's Steaks", 'sandwiches', '1 sandwich', 960, 52, 76, 50, 2180, ['cheesesteak', 'philly']),
  item('tonyluke-roast-pork', 'Roast Pork Italian', "Tony Luke's", 'sandwiches', '1 sandwich', 860, 56, 70, 38, 2280, ['roast pork', 'philly']),
  item('dinics-roast-pork', 'Roast Pork with Greens & Sharp Provolone', "DiNic's Roast Pork", 'sandwiches', '1 sandwich', 860, 58, 68, 40, 2280, ['roast pork', 'philly']),
  item('federal-chicken', 'Korean Fried Chicken (3 pieces)', 'Federal Donuts & Chicken', 'lunch', '3 pieces', 720, 52, 30, 44, 1680, ['fried chicken']),
  item('federal-donut', 'Hot Fresh Donut (cinnamon brown sugar)', 'Federal Donuts & Chicken', 'breakfast', '1 donut', 260, 3, 32, 13, 180, ['donut']),

  // ——— DC & Baltimore ———
  item('bens-half-smoke', 'Chili Half-Smoke', "Ben's Chili Bowl", 'lunch', '1 sausage', 640, 24, 40, 42, 1880, ['half smoke', 'chili dog']),
  item('bens-chili-cheese-fries', 'Chili Cheese Fries', "Ben's Chili Bowl", 'snacks', '1 order', 860, 24, 78, 50, 1680, ['fries', 'chili']),
  item('oldebbitt-crab-cakes', 'Crab Cakes (2)', "Old Ebbitt Grill", 'dinner', '2 cakes', 620, 40, 24, 40, 1480, ['crab cake']),
  item('faidleys-crab-cake', 'Jumbo Lump Crab Cake', "Faidley's Seafood", 'lunch', '1 cake', 480, 34, 14, 32, 1180, ['crab cake']),

  // ——— Boston ———
  item('regina-pepperoni', 'Pepperoni Pizza (slice)', 'Pizzeria Regina', 'lunch', '1 slice', 360, 15, 34, 18, 820, ['pizza']),
  item('santarpios-sausage', 'Sausage Pizza (¼ pie)', "Santarpio's Pizza", 'dinner', '2 slices', 620, 26, 58, 32, 1380, ['pizza']),
  item('mikes-cannoli', 'Ricotta Cannoli', "Mike's Pastry", 'snacks', '1 cannoli', 480, 10, 48, 28, 140, ['cannoli', 'pastry']),
  item('modern-cannoli', 'Ricotta Cannoli', 'Modern Pastry', 'snacks', '1 cannoli', 440, 9, 44, 26, 130, ['cannoli', 'pastry']),
  item('neptune-lobster-roll', 'Hot Lobster Roll (butter)', 'Neptune Oyster', 'lunch', '1 roll', 780, 38, 48, 48, 1480, ['lobster roll']),
  item('kellys-roast-beef', 'Large Roast Beef Sandwich', "Kelly's Roast Beef", 'sandwiches', '1 sandwich', 820, 52, 62, 40, 2080, ['roast beef']),

  // ——— Connecticut & New Jersey ———
  item('pepe-white-clam', 'White Clam Pizza (2 slices)', "Frank Pepe Pizzeria Napoletana", 'dinner', '2 slices', 480, 22, 56, 18, 1080, ['pizza', 'apizza', 'clam']),
  item('sallys-tomato-pie', 'Tomato Pie (2 slices)', "Sally's Apizza", 'dinner', '2 slices', 420, 14, 62, 13, 880, ['pizza', 'apizza']),
  item('modern-italian-bomb', 'Italian Bomb (2 slices)', 'Modern Apizza', 'dinner', '2 slices', 620, 28, 54, 32, 1680, ['pizza', 'apizza']),
  item('louislunch-burger', 'Burger on Toast', "Louis' Lunch", 'lunch', '1 burger', 520, 30, 30, 30, 820, ['burger']),
  item('whitemanna-slider', 'Cheeseburger Slider', 'White Manna', 'lunch', '1 slider', 220, 10, 16, 13, 420, ['burger', 'slider']),
  item('holstens-onion-rings', 'Onion Rings', "Holsten's", 'snacks', '1 order', 520, 7, 58, 29, 820, ['onion rings']),
  item('holstens-sundae', 'Hot Fudge Sundae', "Holsten's", 'snacks', '1 sundae', 620, 10, 74, 32, 240, ['ice cream']),
  item('rutts-ripper', 'The Ripper (deep-fried hot dog)', "Rutt's Hut", 'lunch', '1 hot dog', 420, 14, 26, 29, 1280, ['hot dog']),

  // ——— Western New York ———
  item('anchorbar-wings', 'Original Buffalo Wings (10)', 'Anchor Bar', 'dinner', '10 wings', 900, 70, 4, 66, 2800, ['wings', 'buffalo']),
  item('duffs-wings', 'Medium Wings (10)', "Duff's Famous Wings", 'dinner', '10 wings', 920, 72, 4, 68, 2900, ['wings', 'buffalo']),
  item('teds-hot-dog', 'Charcoal-Grilled Hot Dog', "Ted's Hot Dogs", 'lunch', '1 hot dog', 360, 13, 26, 23, 1080, ['hot dog']),
  item('charliebutcher-beef-weck', 'Beef on Weck', 'Charlie the Butcher', 'sandwiches', '1 sandwich', 640, 44, 56, 24, 1880, ['beef on weck']),
  item('schwabls-beef-weck', 'Beef on Weck', "Schwabl's", 'sandwiches', '1 sandwich', 620, 44, 54, 22, 1820, ['beef on weck']),
  item('nicktahou-garbage-plate', 'Garbage Plate', "Nick Tahou Hots", 'dinner', '1 plate', 1680, 62, 170, 82, 3880, ['garbage plate']),

  // ——— Southeast & Carolinas ———
  item('martins-whole-hog', 'Whole Hog Plate with 2 sides', "Martin's Bar-B-Que Joint", 'dinner', '1 plate', 980, 48, 92, 46, 2280, ['whole hog', 'bbq']),
  item('princes-hot-chicken', 'Quarter Dark Hot Chicken', "Prince's Hot Chicken Shack", 'dinner', '1 quarter', 920, 52, 46, 58, 2480, ['hot chicken', 'nashville']),
  item('marymacs-fried-chicken', 'Fried Chicken with 3 sides', "Mary Mac's Tea Room", 'dinner', '1 plate', 1180, 58, 98, 62, 2680, ['fried chicken', 'southern']),
  item('varsity-chili-dog', 'Chili Dog', 'The Varsity', 'lunch', '1 hot dog', 330, 12, 26, 20, 980, ['hot dog']),
  item('varsity-frosted-orange', 'Frosted Orange', 'The Varsity', 'snacks', '1 drink', 340, 6, 62, 7, 180, ['shake']),
  item('foxbros-brisket', 'Texas Brisket (½ lb)', 'Fox Bros. Bar-B-Q', 'dinner', '½ lb', 720, 56, 2, 54, 1680, ['brisket']),
  item('lexington-chopped', 'Chopped Pork Sandwich with red slaw', 'Lexington Barbecue', 'sandwiches', '1 sandwich', 480, 24, 46, 22, 1180, ['pulled pork', 'carolina']),
  item('skylight-tray', 'Chopped Whole Hog Tray', 'Skylight Inn BBQ', 'dinner', '1 tray', 540, 40, 26, 30, 1480, ['whole hog', 'carolina']),
  item('rodneyscott-whole-hog', 'Whole Hog Sandwich', "Rodney Scott's Whole Hog BBQ", 'sandwiches', '1 sandwich', 620, 32, 52, 30, 1480, ['whole hog']),
  item('berthas-fried-chicken', 'Fried Chicken with lima beans & rice', "Bertha's Kitchen", 'dinner', '1 plate', 980, 48, 96, 44, 2080, ['fried chicken', 'soul food']),
  item('husk-cheeseburger', 'Husk Cheeseburger', 'Husk', 'lunch', '1 burger', 920, 46, 48, 60, 1480, ['burger']),
  item('callies-bacon-biscuit', 'Black Pepper Bacon Biscuit', "Callie's Hot Little Biscuit", 'breakfast', '1 biscuit', 420, 12, 38, 24, 980, ['biscuit']),

  // ——— New Orleans ———
  item('commanders-turtle-soup', 'Turtle Soup', "Commander's Palace", 'dinner', '1 bowl', 320, 18, 18, 18, 1380, ['creole', 'soup']),
  item('commanders-bread-pudding', 'Bread Pudding Soufflé', "Commander's Palace", 'snacks', '1 soufflé', 680, 12, 92, 30, 420, ['dessert']),
  item('acme-chargrilled', 'Char-Grilled Oysters (dozen)', 'Acme Oyster House', 'dinner', '12 oysters', 920, 30, 30, 74, 1880, ['oysters']),
  item('parkway-roast-beef', "Roast Beef Po' Boy (regular)", 'Parkway Bakery & Tavern', 'sandwiches', '1 po boy', 860, 40, 82, 40, 2280, ['po boy']),
  item('domilises-shrimp', "Fried Shrimp Po' Boy", "Domilise's Po-Boy & Bar", 'sandwiches', '1 po boy', 880, 32, 82, 46, 2080, ['po boy', 'shrimp']),
  item('mothers-ferdi', "Ferdi Special Po' Boy", "Mother's Restaurant", 'sandwiches', '1 po boy', 980, 46, 86, 50, 2680, ['po boy', 'ham', 'roast beef']),
  item('williemae-fried-chicken', 'Fried Chicken (3 pieces)', "Willie Mae's Scotch House", 'dinner', '3 pieces', 820, 56, 30, 52, 2080, ['fried chicken']),
  item('dookychase-gumbo', 'Creole Gumbo (cup)', "Dooky Chase's Restaurant", 'lunch', '1 cup', 380, 22, 26, 20, 1580, ['gumbo', 'creole']),
  item('centralgrocery-muffuletta', 'Muffuletta (half)', 'Central Grocery', 'sandwiches', '½ sandwich', 1080, 48, 78, 64, 3880, ['muffuletta']),

  // ——— South Florida ———
  item('joesstonecrab-claws', 'Stone Crab Claws (4 medium) with mustard sauce', "Joe's Stone Crab", 'dinner', '4 claws', 420, 40, 6, 26, 980, ['stone crab']),
  item('joesstonecrab-key-lime', 'Key Lime Pie (slice)', "Joe's Stone Crab", 'snacks', '1 slice', 480, 7, 58, 25, 260, ['pie']),
  item('versailles-cubano', 'Cuban Sandwich', 'Versailles Restaurant', 'sandwiches', '1 sandwich', 720, 38, 58, 36, 1980, ['cuban sandwich']),
  item('versailles-ropa-vieja', 'Ropa Vieja with rice & beans', 'Versailles Restaurant', 'dinner', '1 plate', 980, 48, 104, 38, 1880, ['cuban']),
  item('lacarreta-vaca-frita', 'Vaca Frita with rice & plantains', 'La Carreta', 'dinner', '1 plate', 1020, 50, 100, 44, 1780, ['cuban']),

  // ——— Chicago ———
  item('alsbeef-italian-beef', 'Italian Beef (dipped, hot giardiniera)', "Al's #1 Italian Beef", 'sandwiches', '1 sandwich', 760, 44, 66, 34, 2380, ['italian beef']),
  item('superdawg-dog', 'Superdawg with fries', 'Superdawg Drive-In', 'lunch', '1 hot dog with fries', 780, 24, 72, 44, 2080, ['hot dog', 'chicago dog']),
  item('johnnies-beef', 'Italian Beef', "Johnnie's Beef", 'sandwiches', '1 sandwich', 720, 42, 64, 32, 2180, ['italian beef']),
  item('johnnies-italian-ice', 'Lemon Italian Ice', "Johnnie's Beef", 'snacks', '1 cup', 180, 0, 45, 0, 10, ['italian ice']),
  item('loumitchells-skillet', 'Skillet Breakfast', "Lou Mitchell's", 'breakfast', '1 skillet', 880, 32, 62, 56, 1680, ['diner', 'breakfast']),
  item('kumas-burger', 'Kuma Burger (bacon, egg, cheddar)', "Kuma's Corner", 'lunch', '1 burger', 1180, 62, 52, 80, 2180, ['burger']),
  item('aucheval-cheeseburger', 'Cheeseburger (single)', 'Au Cheval', 'lunch', '1 burger', 820, 44, 40, 54, 1380, ['burger']),
  item('garrett-chicago-mix', 'Garrett Mix (caramel & cheese)', 'Garrett Popcorn Shops', 'snacks', '1 cup', 170, 2, 22, 9, 140, ['popcorn']),
  item('mannys-corned-beef', 'Corned Beef Sandwich', "Manny's Cafeteria & Delicatessen", 'sandwiches', '1 sandwich', 920, 62, 48, 52, 3480, ['corned beef', 'deli']),
  item('billygoat-cheezborger', 'Double Cheezborger', 'Billy Goat Tavern', 'lunch', '1 burger', 720, 42, 30, 48, 1280, ['burger']),
  item('mrbeef-italian-beef', 'Italian Beef', 'Mr. Beef on Orleans', 'sandwiches', '1 sandwich', 740, 44, 64, 33, 2280, ['italian beef']),
  item('jimsoriginal-polish', 'Maxwell Street Polish', "Jim's Original", 'lunch', '1 sausage', 720, 22, 46, 50, 2080, ['polish sausage']),

  // ——— Wisconsin, Minnesota & Michigan ———
  item('leons-custard', 'Frozen Custard (single scoop cone)', "Leon's Frozen Custard", 'snacks', '1 cone', 380, 7, 42, 20, 180, ['custard']),
  item('sollys-butter-burger', "Solly's Butter Burger", "Solly's Grille", 'lunch', '1 burger', 820, 38, 34, 58, 1180, ['butter burger']),
  item('krolls-butter-burger', 'Butter Burger (single)', "Kroll's", 'lunch', '1 burger', 620, 30, 32, 40, 980, ['butter burger']),
  item('matts-jucy-lucy', 'Jucy Lucy', "Matt's Bar", 'lunch', '1 burger', 640, 36, 32, 40, 1380, ['burger', 'juicy lucy']),
  item('58club-juicy-lucy', 'Juicy Lucy', '5-8 Club', 'lunch', '1 burger', 660, 36, 34, 42, 1420, ['burger', 'juicy lucy']),
  item('hellskitchen-hotcakes', 'Lemon Ricotta Hotcakes', "Hell's Kitchen", 'breakfast', '1 order', 780, 18, 96, 36, 880, ['pancakes']),
  item('zingermans-reuben', "#2 Zingerman's Reuben", "Zingerman's Delicatessen", 'sandwiches', '1 sandwich', 1080, 60, 58, 66, 3680, ['reuben', 'deli']),
  item('lafayette-coney', 'Coney Dog', 'Lafayette Coney Island', 'lunch', '1 hot dog', 330, 12, 26, 20, 980, ['coney', 'hot dog']),
  item('american-coney', 'Coney Dog', 'American Coney Island', 'lunch', '1 hot dog', 340, 13, 26, 21, 1020, ['coney', 'hot dog']),
  item('buddys-detroit', 'Detroit-Style Pepperoni (2 squares)', "Buddy's Pizza", 'dinner', '2 squares', 680, 28, 62, 36, 1580, ['pizza', 'detroit']),

  // ——— Ohio, Missouri & the Plains ———
  item('campwashington-3way', '3-Way Chili', 'Camp Washington Chili', 'lunch', '1 plate', 760, 32, 78, 36, 1480, ['cincinnati chili']),
  item('montgomery-ribs', 'Ribs (full slab)', 'Montgomery Inn', 'dinner', '1 slab', 1580, 104, 58, 102, 3200, ['ribs']),
  item('q39-burnt-ends', 'Burnt Ends (½ lb)', 'Q39', 'dinner', '½ lb', 820, 52, 22, 58, 1880, ['burnt ends']),
  item('jackstack-beef-rib', 'Crown Prime Beef Rib', 'Jack Stack Barbecue', 'dinner', '1 rib', 1240, 80, 6, 100, 1680, ['beef rib']),
  item('teddrewes-concrete', 'Frozen Custard Concrete (medium)', 'Ted Drewes Frozen Custard', 'snacks', '1 medium', 820, 16, 104, 38, 380, ['custard', 'concrete']),
  item('pappys-ribs', 'Memphis-Style Ribs (half slab)', "Pappy's Smokehouse", 'dinner', '½ slab', 920, 62, 28, 62, 2080, ['ribs']),
  item('crowncandy-malt', 'Chocolate Malt', 'Crown Candy Kitchen', 'snacks', '1 malt', 1080, 22, 140, 48, 480, ['shake', 'malt']),
  item('valentinos-pizza', 'Buffet Pizza (slice)', "Valentino's", 'dinner', '1 slice', 300, 12, 32, 14, 680, ['pizza', 'buffet']),
  item('maidrite-sandwich', 'Original Maid-Rite', 'Maid-Rite', 'lunch', '1 sandwich', 390, 24, 30, 19, 820, ['loose meat']),

  // ——— Los Angeles ———
  item('pinks-chili-dog', 'Chili Dog', "Pink's Hot Dogs", 'lunch', '1 hot dog', 420, 15, 30, 26, 1180, ['hot dog']),
  item('philippe-french-dip', 'Beef French Dip (single dip)', 'Philippe the Original', 'sandwiches', '1 sandwich', 560, 40, 52, 20, 1580, ['french dip']),
  item('langers-19', '#19 Pastrami (coleslaw, Swiss, Russian)', "Langer's Delicatessen", 'sandwiches', '1 sandwich', 1080, 60, 58, 66, 3480, ['pastrami', 'deli']),
  item('coles-french-dip', 'French Dip', "Cole's French Dip", 'sandwiches', '1 sandwich', 620, 42, 52, 26, 1680, ['french dip']),
  item('roscoes-chicken-waffles', 'Chicken & Waffles (3 wings, 1 waffle)', "Roscoe's House of Chicken 'N Waffles", 'dinner', '1 plate', 980, 42, 84, 52, 1880, ['chicken and waffles']),
  item('titos-taco', 'Beef Taco', "Tito's Tacos", 'lunch', '1 taco', 220, 10, 14, 14, 380, ['taco']),
  item('guelaguetza-mole', 'Mole Negro with chicken', 'Guelaguetza', 'dinner', '1 plate', 780, 42, 52, 44, 1380, ['mole', 'oaxacan']),
  item('bludsos-brisket', 'Brisket (½ lb)', "Bludso's BBQ", 'dinner', '½ lb', 720, 56, 2, 54, 1680, ['brisket']),
  item('applepan-hickory', 'Hickory Burger', 'The Apple Pan', 'lunch', '1 burger', 680, 32, 46, 40, 1380, ['burger']),
  item('fathersoffice-burger', 'Office Burger', "Father's Office", 'lunch', '1 burger', 920, 42, 52, 60, 1480, ['burger']),
  item('musso-flannel-cakes', 'Flannel Cakes', 'Musso & Frank Grill', 'breakfast', '1 order', 620, 14, 78, 28, 880, ['pancakes']),
  item('canters-pastrami', 'Pastrami Sandwich', "Canter's Deli", 'sandwiches', '1 sandwich', 920, 62, 46, 54, 3280, ['pastrami', 'deli']),
  item('zankou-tarna-plate', 'Chicken Tarna Plate with garlic sauce', 'Zankou Chicken', 'dinner', '1 plate', 980, 52, 82, 48, 1980, ['shawarma', 'garlic sauce']),

  // ——— San Diego ———
  item('hodads-double', 'Double Cheeseburger', "Hodad's", 'lunch', '1 burger', 1120, 62, 50, 74, 1880, ['burger']),
  item('phils-ribs', 'Baby Back Ribs (half rack)', "Phil's BBQ", 'dinner', '½ rack', 820, 56, 30, 52, 1880, ['ribs']),
  item('lolitas-cali-burrito', 'California Burrito', "Lolita's Mexican Food", 'lunch', '1 burrito', 1180, 46, 110, 62, 2380, ['burrito', 'california burrito']),
  item('tacoselgordo-adobada', 'Adobada Taco', 'Tacos El Gordo', 'lunch', '1 taco', 230, 12, 20, 11, 480, ['taco', 'al pastor']),

  // ——— San Francisco Bay Area ———
  item('swan-crab-louie', 'Crab Louie', 'Swan Oyster Depot', 'lunch', '1 salad', 480, 38, 14, 30, 1280, ['crab']),
  item('tartine-morning-bun', 'Morning Bun', 'Tartine Bakery', 'breakfast', '1 bun', 420, 6, 56, 19, 280, ['pastry']),
  item('tartine-croissant', 'Croissant', 'Tartine Bakery', 'breakfast', '1 croissant', 300, 6, 32, 17, 320, ['croissant']),
  item('lataqueria-carne-asada', 'Carne Asada Burrito (no rice)', 'La Taqueria', 'lunch', '1 burrito', 980, 52, 82, 48, 2080, ['burrito', 'mission burrito']),
  item('elfarolito-super-burrito', 'Super Burrito al Pastor', 'El Farolito', 'lunch', '1 burrito', 1240, 52, 136, 54, 2680, ['burrito', 'mission burrito']),
  item('zuni-roast-chicken', 'Roast Chicken with bread salad (per person)', 'Zuni Café', 'dinner', '½ order', 880, 56, 42, 54, 1480, ['roast chicken']),
  item('hopr-king-henry', 'King Henry VIII Cut Prime Rib', 'House of Prime Rib', 'dinner', '1 cut', 1480, 110, 4, 114, 1880, ['prime rib', 'steak']),
  item('boudin-chowder-bowl', 'Clam Chowder Bread Bowl', 'Boudin Bakery', 'lunch', '1 bread bowl', 1020, 36, 148, 30, 2480, ['clam chowder', 'sourdough']),
  item('ghirardelli-sundae', 'Hot Fudge Sundae', 'Ghirardelli Chocolate', 'snacks', '1 sundae', 1020, 14, 120, 56, 320, ['ice cream', 'chocolate']),
  item('mitchells-ube', 'Ube Ice Cream (1 scoop)', "Mitchell's Ice Cream", 'snacks', '1 scoop', 300, 5, 32, 17, 110, ['ice cream']),
  item('superduper-burger', 'Super Burger', 'Super Duper Burgers', 'lunch', '1 burger', 640, 32, 40, 38, 1180, ['burger']),
  item('goldenboy-clam-garlic', 'Clam & Garlic Focaccia Square', 'Golden Boy Pizza', 'lunch', '1 square', 460, 16, 52, 21, 920, ['pizza', 'focaccia']),

  // ——— Pacific Northwest ———
  item('pikeplace-chowder', 'New England Clam Chowder (cup)', 'Pike Place Chowder', 'lunch', '1 cup', 380, 12, 26, 25, 980, ['clam chowder']),
  item('piroshky-beef-cheese', 'Beef & Cheese Piroshky', 'Piroshky Piroshky', 'lunch', '1 piroshky', 480, 20, 50, 22, 820, ['piroshky', 'russian']),
  item('beechers-mac', "World's Best Mac & Cheese (cup)", "Beecher's Handmade Cheese", 'lunch', '1 cup', 520, 22, 40, 30, 980, ['mac and cheese']),
  item('paseo-cuban-roast', 'Cuban Roast Sandwich', 'Paseo Caribbean Food', 'sandwiches', '1 sandwich', 1020, 42, 96, 52, 1680, ['cuban', 'pork']),
  item('mollymoons-scoop', 'Ice Cream (1 scoop)', "Molly Moon's Homemade Ice Cream", 'snacks', '1 scoop', 300, 5, 32, 17, 110, ['ice cream']),
  item('bluestar-blueberry-basil', 'Blueberry Bourbon Basil Donut', 'Blue Star Donuts', 'breakfast', '1 donut', 410, 6, 52, 20, 260, ['donut']),
  item('screendoor-chicken-waffle', 'Fried Chicken & Waffle', 'Screen Door', 'breakfast', '1 plate', 1280, 58, 110, 66, 2480, ['chicken and waffles']),
  item('pinestate-reggie', 'The Reggie (chicken, bacon, cheese, gravy)', 'Pine State Biscuits', 'breakfast', '1 biscuit sandwich', 1080, 44, 74, 66, 2680, ['biscuit', 'fried chicken']),
  item('nongs-khao-man-gai', 'Khao Man Gai', "Nong's Khao Man Gai", 'lunch', '1 plate', 620, 36, 72, 18, 1280, ['thai', 'chicken and rice']),
  item('lardo-pork-shoulder', 'Korean Pork Shoulder Sandwich', 'Lardo', 'sandwiches', '1 sandwich', 780, 36, 72, 38, 1880, ['sandwich']),
  item('kennyzuke-pastrami', 'Pastrami Sandwich', "Kenny & Zuke's Delicatessen", 'sandwiches', '1 sandwich', 920, 62, 46, 54, 3280, ['pastrami', 'deli']),

  // ——— Hawaii ———
  item('leonards-malasada', 'Malasada (sugar)', "Leonard's Bakery", 'snacks', '1 malasada', 250, 4, 32, 12, 180, ['malasada']),
  item('rainbow-loco-moco', 'Loco Moco', 'Rainbow Drive-In', 'lunch', '1 plate', 1080, 42, 110, 50, 2080, ['loco moco', 'plate lunch']),
  item('rainbow-mixed-plate', 'Mix Plate', 'Rainbow Drive-In', 'lunch', '1 plate', 980, 52, 104, 38, 2280, ['plate lunch']),
  item('helenas-kalua-pig', 'Kalua Pig with poi', "Helena's Hawaiian Food", 'lunch', '1 plate', 620, 36, 44, 32, 1580, ['kalua pig', 'hawaiian']),
  item('giovannis-scampi', 'Shrimp Scampi Plate', "Giovanni's Shrimp Truck", 'lunch', '1 plate', 880, 40, 90, 40, 1680, ['garlic shrimp']),
  item('matsumoto-shave-ice', 'Shave Ice (regular)', 'Matsumoto Shave Ice', 'snacks', '1 regular', 220, 0, 55, 0, 15, ['shave ice']),
  item('onoseafood-poke-bowl', 'Ahi Poke Bowl', 'Ono Seafood', 'lunch', '1 bowl', 620, 38, 82, 14, 1480, ['poke']),
  item('dukes-hula-pie', 'Hula Pie (slice)', "Duke's Waikiki", 'snacks', '1 slice', 1080, 14, 118, 62, 620, ['dessert']),

  // ——— Southwest ———
  item('bianco-rosa', 'Rosa Pizza', 'Pizzeria Bianco', 'dinner', '1 pizza', 880, 28, 92, 44, 1380, ['pizza']),
  item('bianco-margherita', 'Margherita Pizza', 'Pizzeria Bianco', 'dinner', '1 pizza', 820, 32, 102, 30, 1580, ['pizza']),
  item('mattsbig-chop-chick', 'Chop & Chick (pork chop & eggs)', "Matt's Big Breakfast", 'breakfast', '1 plate', 980, 58, 52, 58, 1880, ['breakfast']),
  item('dosmolinos-carne-adovada', 'Carne Adovada Plate', 'Los Dos Molinos', 'dinner', '1 plate', 1020, 48, 92, 50, 2480, ['new mexican', 'red chile']),
  item('barrio-chiles-en-nogada', 'Chiles en Nogada', 'Barrio Café', 'dinner', '1 entrée', 820, 30, 62, 50, 1180, ['mexican']),
  item('elcharro-chimichanga', 'Carne Seca Chimichanga', 'El Charro Café', 'dinner', '1 chimichanga', 1080, 46, 96, 56, 2380, ['chimichanga']),
  item('minidito-combo', 'Combination Plate', 'Mi Nidito', 'dinner', '1 plate', 1120, 44, 108, 56, 2480, ['mexican']),
  item('frontier-sweet-roll', 'Sweet Roll', 'Frontier Restaurant', 'breakfast', '1 roll', 680, 10, 98, 28, 520, ['cinnamon roll']),
  item('frontier-breakfast-burrito', 'Breakfast Burrito with green chile', 'Frontier Restaurant', 'breakfast', '1 burrito', 780, 30, 66, 44, 1880, ['breakfast burrito', 'green chile']),
  item('sadies-enchiladas', 'Red Chile Enchiladas', "Sadie's of New Mexico", 'dinner', '1 plate', 920, 40, 80, 48, 2280, ['new mexican', 'enchiladas']),
  item('casabonita-enchiladas', 'Enchilada Platter', 'Casa Bonita', 'dinner', '1 platter', 980, 38, 104, 46, 2280, ['enchiladas']),
  item('casabonita-sopapillas', 'Sopaipillas (3) with honey', 'Casa Bonita', 'snacks', '3 sopaipillas', 480, 6, 72, 18, 420, ['sopapilla']),
  item('bikerjims-elk-dog', 'Elk Jalapeño Cheddar Dog', "Biker Jim's Gourmet Dogs", 'lunch', '1 hot dog', 520, 22, 38, 31, 1480, ['hot dog']),
  item('sams3-kitchen-sink', 'Kitchen Sink', "Sam's No. 3", 'breakfast', '1 plate', 1180, 52, 96, 64, 2880, ['diner', 'breakfast']),
  item('littleman-scoop', 'Ice Cream (1 scoop)', 'Little Man Ice Cream', 'snacks', '1 scoop', 300, 5, 32, 17, 110, ['ice cream']),

  // ——— Texas barbecue & Tex-Mex ———
  item('franklin-brisket', 'Brisket (½ lb)', 'Franklin Barbecue', 'dinner', '½ lb', 720, 56, 2, 54, 1680, ['brisket']),
  item('franklin-ribs', 'Pork Ribs (½ lb)', 'Franklin Barbecue', 'dinner', '½ lb', 680, 48, 6, 51, 1380, ['ribs']),
  item('saltlick-family-style', 'Family Style (per person)', 'The Salt Lick BBQ', 'dinner', '1 serving', 1280, 72, 76, 76, 2880, ['brisket', 'sausage', 'ribs']),
  item('kreuz-jalapeno-sausage', 'Jalapeño Cheese Sausage (1 link)', 'Kreuz Market', 'dinner', '1 link', 360, 16, 4, 31, 1080, ['sausage']),
  item('blacks-beef-rib', 'Beef Rib (1 bone)', "Black's Barbecue", 'dinner', '1 rib', 1180, 90, 0, 90, 1480, ['beef rib']),
  item('louiemueller-beef-rib', 'Beef Rib (1 bone)', 'Louie Mueller Barbecue', 'dinner', '1 rib', 1180, 90, 0, 90, 1480, ['beef rib']),
  item('snows-brisket', 'Brisket (½ lb)', "Snow's BBQ", 'dinner', '½ lb', 720, 56, 2, 54, 1680, ['brisket']),
  item('killens-brisket', 'Brisket (½ lb)', "Killen's Barbecue", 'dinner', '½ lb', 720, 56, 2, 54, 1680, ['brisket']),
  item('truth-brisket', 'Brisket (½ lb)', 'Truth BBQ', 'dinner', '½ lb', 720, 56, 2, 54, 1680, ['brisket']),
  item('goode-brisket-sandwich', 'Brisket Sandwich', 'Goode Company Barbeque', 'sandwiches', '1 sandwich', 780, 44, 62, 40, 1980, ['brisket']),
  item('veracruz-migas', 'Migas Taco', 'Veracruz All Natural', 'breakfast', '1 taco', 340, 14, 26, 20, 680, ['breakfast taco', 'migas']),
  item('joetgarcias-dinner', 'Dinner Plate (enchiladas, tacos & nachos)', "Joe T. Garcia's", 'dinner', '1 plate', 1280, 48, 120, 68, 2880, ['tex mex']),
  item('ninfas-fajitas', 'Tacos al Carbon (beef fajitas)', "The Original Ninfa's on Navigation", 'dinner', '1 order', 1080, 62, 84, 54, 2680, ['fajitas', 'tex mex']),
];
