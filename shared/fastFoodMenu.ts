/**
 * Popular fast food items with per-item nutrition from each chain's published menu data.
 * Values are for the standard build of one menu item; recipes vary by region and over time.
 */

export type FastFoodCategory = 'breakfast' | 'sandwiches' | 'lunch' | 'dinner' | 'snacks';

export interface FastFoodItem {
  id: string;
  name: string;
  restaurant: string;
  category: FastFoodCategory;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number; // mg
  keywords?: string[];
}

export const FAST_FOOD_CATEGORIES: { id: FastFoodCategory; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'sandwiches', label: 'Sandwiches' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snacks', label: 'Snacks' },
];

export const FAST_FOOD_ITEMS: FastFoodItem[] = [
  // Breakfast
  { id: 'mcd-egg-mcmuffin', name: 'Egg McMuffin', restaurant: "McDonald's", category: 'breakfast', serving: '1 sandwich', calories: 310, protein: 17, carbs: 30, fat: 13, sodium: 770 },
  { id: 'mcd-sausage-mcmuffin-egg', name: 'Sausage McMuffin with Egg', restaurant: "McDonald's", category: 'breakfast', serving: '1 sandwich', calories: 480, protein: 20, carbs: 30, fat: 31, sodium: 820 },
  { id: 'mcd-hotcakes', name: 'Hotcakes with Butter & Syrup', restaurant: "McDonald's", category: 'breakfast', serving: '3 hotcakes', calories: 580, protein: 9, carbs: 101, fat: 15, sodium: 550, keywords: ['pancakes'] },
  { id: 'mcd-sausage-burrito', name: 'Sausage Burrito', restaurant: "McDonald's", category: 'breakfast', serving: '1 burrito', calories: 310, protein: 13, carbs: 25, fat: 17, sodium: 800 },
  { id: 'cfa-chicken-biscuit', name: 'Chicken Biscuit', restaurant: 'Chick-fil-A', category: 'breakfast', serving: '1 biscuit', calories: 460, protein: 19, carbs: 45, fat: 23, sodium: 1510 },
  { id: 'cfa-egg-white-grill', name: 'Egg White Grill', restaurant: 'Chick-fil-A', category: 'breakfast', serving: '1 sandwich', calories: 300, protein: 27, carbs: 30, fat: 8, sodium: 990 },
  { id: 'bk-croissanwich-sec', name: "Sausage, Egg & Cheese Croissan'wich", restaurant: 'Burger King', category: 'breakfast', serving: '1 sandwich', calories: 500, protein: 18, carbs: 27, fat: 36, sodium: 1080 },
  { id: 'wendys-breakfast-baconator', name: 'Breakfast Baconator', restaurant: "Wendy's", category: 'breakfast', serving: '1 sandwich', calories: 730, protein: 34, carbs: 30, fat: 50, sodium: 1480 },
  { id: 'sbux-bacon-gouda', name: 'Bacon, Gouda & Egg Sandwich', restaurant: 'Starbucks', category: 'breakfast', serving: '1 sandwich', calories: 360, protein: 19, carbs: 34, fat: 18, sodium: 770 },
  { id: 'sbux-spinach-feta-wrap', name: 'Spinach, Feta & Egg White Wrap', restaurant: 'Starbucks', category: 'breakfast', serving: '1 wrap', calories: 290, protein: 20, carbs: 34, fat: 8, sodium: 840 },
  { id: 'sbux-egg-bites-bacon', name: 'Bacon & Gruyère Egg Bites', restaurant: 'Starbucks', category: 'breakfast', serving: '2 bites', calories: 300, protein: 19, carbs: 9, fat: 20, sodium: 600 },
  { id: 'dunkin-sec-croissant', name: 'Sausage, Egg & Cheese on Croissant', restaurant: "Dunkin'", category: 'breakfast', serving: '1 sandwich', calories: 700, protein: 23, carbs: 38, fat: 51, sodium: 1270 },
  { id: 'dunkin-wake-up-wrap', name: 'Bacon, Egg & Cheese Wake-Up Wrap', restaurant: "Dunkin'", category: 'breakfast', serving: '1 wrap', calories: 210, protein: 10, carbs: 14, fat: 13, sodium: 540 },
  { id: 'tb-breakfast-crunchwrap', name: 'Breakfast Crunchwrap (Sausage)', restaurant: 'Taco Bell', category: 'breakfast', serving: '1 crunchwrap', calories: 680, protein: 21, carbs: 51, fat: 44, sodium: 1260 },

  // Sandwiches & burgers
  { id: 'mcd-big-mac', name: 'Big Mac', restaurant: "McDonald's", category: 'sandwiches', serving: '1 burger', calories: 590, protein: 25, carbs: 46, fat: 34, sodium: 1050, keywords: ['burger'] },
  { id: 'mcd-qpc', name: 'Quarter Pounder with Cheese', restaurant: "McDonald's", category: 'sandwiches', serving: '1 burger', calories: 520, protein: 30, carbs: 42, fat: 26, sodium: 1140, keywords: ['burger', 'cheeseburger'] },
  { id: 'mcd-cheeseburger', name: 'Cheeseburger', restaurant: "McDonald's", category: 'sandwiches', serving: '1 burger', calories: 300, protein: 15, carbs: 32, fat: 13, sodium: 720, keywords: ['burger'] },
  { id: 'mcd-mcchicken', name: 'McChicken', restaurant: "McDonald's", category: 'sandwiches', serving: '1 sandwich', calories: 400, protein: 14, carbs: 39, fat: 21, sodium: 560, keywords: ['chicken sandwich'] },
  { id: 'mcd-mccrispy', name: 'McCrispy Chicken Sandwich', restaurant: "McDonald's", category: 'sandwiches', serving: '1 sandwich', calories: 470, protein: 26, carbs: 45, fat: 20, sodium: 1040, keywords: ['chicken sandwich'] },
  { id: 'mcd-filet-o-fish', name: 'Filet-O-Fish', restaurant: "McDonald's", category: 'sandwiches', serving: '1 sandwich', calories: 390, protein: 16, carbs: 38, fat: 19, sodium: 560, keywords: ['fish sandwich'] },
  { id: 'cfa-chicken-sandwich', name: 'Chick-fil-A Chicken Sandwich', restaurant: 'Chick-fil-A', category: 'sandwiches', serving: '1 sandwich', calories: 420, protein: 28, carbs: 41, fat: 18, sodium: 1460, keywords: ['chicken sandwich'] },
  { id: 'cfa-spicy-chicken-sandwich', name: 'Spicy Chicken Sandwich', restaurant: 'Chick-fil-A', category: 'sandwiches', serving: '1 sandwich', calories: 450, protein: 28, carbs: 42, fat: 19, sodium: 1620, keywords: ['chicken sandwich'] },
  { id: 'cfa-grilled-chicken-sandwich', name: 'Grilled Chicken Sandwich', restaurant: 'Chick-fil-A', category: 'sandwiches', serving: '1 sandwich', calories: 390, protein: 28, carbs: 44, fat: 12, sodium: 770, keywords: ['chicken sandwich'] },
  { id: 'bk-whopper', name: 'Whopper', restaurant: 'Burger King', category: 'sandwiches', serving: '1 burger', calories: 670, protein: 31, carbs: 51, fat: 40, sodium: 1140, keywords: ['burger'] },
  { id: 'bk-whopper-jr', name: 'Whopper Jr.', restaurant: 'Burger King', category: 'sandwiches', serving: '1 burger', calories: 330, protein: 16, carbs: 29, fat: 17, sodium: 560, keywords: ['burger'] },
  { id: 'bk-original-chicken', name: 'Original Chicken Sandwich', restaurant: 'Burger King', category: 'sandwiches', serving: '1 sandwich', calories: 670, protein: 23, carbs: 55, fat: 40, sodium: 1170, keywords: ['chicken sandwich'] },
  { id: 'wendys-daves-single', name: "Dave's Single", restaurant: "Wendy's", category: 'sandwiches', serving: '1 burger', calories: 590, protein: 29, carbs: 39, fat: 37, sodium: 1180, keywords: ['burger', 'cheeseburger'] },
  { id: 'wendys-baconator', name: 'Baconator', restaurant: "Wendy's", category: 'sandwiches', serving: '1 burger', calories: 950, protein: 57, carbs: 38, fat: 64, sodium: 1830, keywords: ['burger', 'bacon'] },
  { id: 'wendys-jr-bacon-cheeseburger', name: 'Jr. Bacon Cheeseburger', restaurant: "Wendy's", category: 'sandwiches', serving: '1 burger', calories: 370, protein: 19, carbs: 25, fat: 21, sodium: 710, keywords: ['burger'] },
  { id: 'wendys-spicy-chicken', name: 'Spicy Chicken Sandwich', restaurant: "Wendy's", category: 'sandwiches', serving: '1 sandwich', calories: 500, protein: 29, carbs: 50, fat: 20, sodium: 1160, keywords: ['chicken sandwich'] },
  { id: 'popeyes-chicken-sandwich', name: 'Classic Chicken Sandwich', restaurant: 'Popeyes', category: 'sandwiches', serving: '1 sandwich', calories: 700, protein: 28, carbs: 50, fat: 42, sodium: 1440, keywords: ['chicken sandwich'] },
  { id: 'subway-turkey-6', name: 'Turkey Breast Sub (6")', restaurant: 'Subway', category: 'sandwiches', serving: '6-inch sub', calories: 270, protein: 18, carbs: 40, fat: 4, sodium: 740, keywords: ['sub', 'hoagie'] },
  { id: 'subway-italian-bmt-6', name: 'Italian B.M.T. (6")', restaurant: 'Subway', category: 'sandwiches', serving: '6-inch sub', calories: 400, protein: 19, carbs: 42, fat: 17, sodium: 1230, keywords: ['sub', 'bmt'] },
  { id: 'subway-meatball-6', name: 'Meatball Marinara (6")', restaurant: 'Subway', category: 'sandwiches', serving: '6-inch sub', calories: 470, protein: 21, carbs: 57, fat: 18, sodium: 1100, keywords: ['sub'] },
  { id: 'subway-spicy-italian-6', name: 'Spicy Italian (6")', restaurant: 'Subway', category: 'sandwiches', serving: '6-inch sub', calories: 470, protein: 19, carbs: 43, fat: 25, sodium: 1380, keywords: ['sub'] },
  { id: 'subway-tuna-6', name: 'Tuna Sub (6")', restaurant: 'Subway', category: 'sandwiches', serving: '6-inch sub', calories: 470, protein: 19, carbs: 40, fat: 25, sodium: 610, keywords: ['sub'] },
  { id: 'subway-steak-cheese-6', name: 'Steak & Cheese (6")', restaurant: 'Subway', category: 'sandwiches', serving: '6-inch sub', calories: 380, protein: 26, carbs: 44, fat: 12, sodium: 1100, keywords: ['sub', 'philly'] },
  { id: 'subway-teriyaki-6', name: 'Sweet Onion Chicken Teriyaki (6")', restaurant: 'Subway', category: 'sandwiches', serving: '6-inch sub', calories: 350, protein: 25, carbs: 50, fat: 5, sodium: 820, keywords: ['sub'] },

  // Lunch
  { id: 'mcd-nuggets-10', name: 'Chicken McNuggets (10 pc)', restaurant: "McDonald's", category: 'lunch', serving: '10 pieces', calories: 410, protein: 23, carbs: 25, fat: 24, sodium: 840, keywords: ['nuggets'] },
  { id: 'cfa-nuggets-8', name: 'Chick-fil-A Nuggets (8 ct)', restaurant: 'Chick-fil-A', category: 'lunch', serving: '8 nuggets', calories: 250, protein: 27, carbs: 11, fat: 11, sodium: 1210, keywords: ['nuggets'] },
  { id: 'cfa-grilled-nuggets-8', name: 'Grilled Nuggets (8 ct)', restaurant: 'Chick-fil-A', category: 'lunch', serving: '8 nuggets', calories: 130, protein: 25, carbs: 1, fat: 3, sodium: 440, keywords: ['nuggets'] },
  { id: 'popeyes-tenders-3', name: 'Chicken Tenders (3 pc)', restaurant: 'Popeyes', category: 'lunch', serving: '3 tenders', calories: 440, protein: 36, carbs: 26, fat: 21, sodium: 1520, keywords: ['strips'] },
  { id: 'tb-crunchwrap', name: 'Crunchwrap Supreme', restaurant: 'Taco Bell', category: 'lunch', serving: '1 crunchwrap', calories: 530, protein: 16, carbs: 71, fat: 21, sodium: 1200 },
  { id: 'tb-chicken-quesadilla', name: 'Chicken Quesadilla', restaurant: 'Taco Bell', category: 'lunch', serving: '1 quesadilla', calories: 510, protein: 26, carbs: 37, fat: 27, sodium: 1250 },
  { id: 'tb-crunchy-taco', name: 'Crunchy Taco', restaurant: 'Taco Bell', category: 'lunch', serving: '1 taco', calories: 170, protein: 8, carbs: 13, fat: 10, sodium: 310 },
  { id: 'tb-cheesy-gordita', name: 'Cheesy Gordita Crunch', restaurant: 'Taco Bell', category: 'lunch', serving: '1 gordita', calories: 500, protein: 20, carbs: 41, fat: 28, sodium: 850, keywords: ['taco'] },
  { id: 'tb-bean-burrito', name: 'Bean Burrito', restaurant: 'Taco Bell', category: 'lunch', serving: '1 burrito', calories: 350, protein: 13, carbs: 54, fat: 9, sodium: 1050 },
  { id: 'tb-power-bowl', name: 'Cantina Chicken Bowl', restaurant: 'Taco Bell', category: 'lunch', serving: '1 bowl', calories: 490, protein: 25, carbs: 42, fat: 25, sodium: 1260 },
  { id: 'chipotle-chicken-burrito', name: 'Chicken Burrito (rice, black beans, salsa, cheese)', restaurant: 'Chipotle', category: 'lunch', serving: '1 burrito', calories: 975, protein: 58, carbs: 117, fat: 30, sodium: 2210 },
  { id: 'chipotle-chicken-bowl', name: 'Chicken Burrito Bowl (rice, black beans, salsa, cheese)', restaurant: 'Chipotle', category: 'lunch', serving: '1 bowl', calories: 655, protein: 50, carbs: 67, fat: 21, sodium: 1610 },
  { id: 'panera-broccoli-cheddar', name: 'Broccoli Cheddar Soup (bowl)', restaurant: 'Panera Bread', category: 'lunch', serving: '1 bowl', calories: 360, protein: 14, carbs: 30, fat: 21, sodium: 1330, keywords: ['soup'] },
  { id: 'wendys-chili-small', name: 'Chili (small)', restaurant: "Wendy's", category: 'lunch', serving: 'small cup', calories: 250, protein: 17, carbs: 23, fat: 9, sodium: 880 },

  // Dinner
  { id: 'panda-orange-chicken', name: 'Orange Chicken', restaurant: 'Panda Express', category: 'dinner', serving: '1 entrée', calories: 490, protein: 25, carbs: 51, fat: 23, sodium: 820 },
  { id: 'panda-broccoli-beef', name: 'Broccoli Beef', restaurant: 'Panda Express', category: 'dinner', serving: '1 entrée', calories: 150, protein: 9, carbs: 13, fat: 7, sodium: 520 },
  { id: 'panda-kung-pao', name: 'Kung Pao Chicken', restaurant: 'Panda Express', category: 'dinner', serving: '1 entrée', calories: 290, protein: 16, carbs: 14, fat: 19, sodium: 970 },
  { id: 'panda-teriyaki', name: 'Grilled Teriyaki Chicken', restaurant: 'Panda Express', category: 'dinner', serving: '1 entrée', calories: 300, protein: 36, carbs: 8, fat: 13, sodium: 530 },
  { id: 'panda-chow-mein', name: 'Chow Mein', restaurant: 'Panda Express', category: 'dinner', serving: '1 side', calories: 510, protein: 13, carbs: 80, fat: 20, sodium: 860, keywords: ['noodles'] },
  { id: 'panda-fried-rice', name: 'Fried Rice', restaurant: 'Panda Express', category: 'dinner', serving: '1 side', calories: 520, protein: 11, carbs: 85, fat: 16, sodium: 850 },
  { id: 'kfc-original-breast', name: 'Original Recipe Chicken Breast', restaurant: 'KFC', category: 'dinner', serving: '1 piece', calories: 390, protein: 39, carbs: 11, fat: 21, sodium: 1190, keywords: ['fried chicken'] },
  { id: 'kfc-famous-bowl', name: 'Famous Bowl', restaurant: 'KFC', category: 'dinner', serving: '1 bowl', calories: 720, protein: 26, carbs: 79, fat: 34, sodium: 2350 },
  { id: 'dominos-pepperoni-slice', name: 'Pepperoni Pizza (large, hand tossed)', restaurant: "Domino's", category: 'dinner', serving: '1 slice', calories: 300, protein: 12, carbs: 34, fat: 13, sodium: 680, keywords: ['pizza'] },
  { id: 'dominos-cheese-slice', name: 'Cheese Pizza (large, hand tossed)', restaurant: "Domino's", category: 'dinner', serving: '1 slice', calories: 280, protein: 11, carbs: 34, fat: 11, sodium: 560, keywords: ['pizza'] },
  { id: 'tb-nachos-bellgrande', name: 'Nachos BellGrande', restaurant: 'Taco Bell', category: 'dinner', serving: '1 order', calories: 740, protein: 16, carbs: 82, fat: 38, sodium: 1050, keywords: ['nachos'] },

  // Snacks & sides
  { id: 'mcd-fries-medium', name: 'World Famous Fries (medium)', restaurant: "McDonald's", category: 'snacks', serving: 'medium', calories: 320, protein: 5, carbs: 43, fat: 15, sodium: 260, keywords: ['french fries'] },
  { id: 'mcd-hash-brown', name: 'Hash Brown', restaurant: "McDonald's", category: 'snacks', serving: '1 hash brown', calories: 140, protein: 1, carbs: 16, fat: 8, sodium: 310 },
  { id: 'mcd-apple-pie', name: 'Baked Apple Pie', restaurant: "McDonald's", category: 'snacks', serving: '1 pie', calories: 230, protein: 2, carbs: 33, fat: 11, sodium: 150, keywords: ['dessert'] },
  { id: 'mcd-mcflurry-oreo', name: 'McFlurry with Oreo (regular)', restaurant: "McDonald's", category: 'snacks', serving: 'regular', calories: 510, protein: 12, carbs: 80, fat: 16, sodium: 280, keywords: ['dessert', 'ice cream'] },
  { id: 'cfa-waffle-fries-medium', name: 'Waffle Potato Fries (medium)', restaurant: 'Chick-fil-A', category: 'snacks', serving: 'medium', calories: 420, protein: 5, carbs: 45, fat: 24, sodium: 240, keywords: ['french fries'] },
  { id: 'bk-chicken-fries-9', name: 'Chicken Fries (9 pc)', restaurant: 'Burger King', category: 'snacks', serving: '9 pieces', calories: 280, protein: 13, carbs: 20, fat: 16, sodium: 870 },
  { id: 'wendys-frosty-small', name: 'Chocolate Frosty (small)', restaurant: "Wendy's", category: 'snacks', serving: 'small', calories: 350, protein: 9, carbs: 58, fat: 9, sodium: 190, keywords: ['dessert', 'shake'] },
  { id: 'wendys-baked-potato', name: 'Plain Baked Potato', restaurant: "Wendy's", category: 'snacks', serving: '1 potato', calories: 270, protein: 7, carbs: 61, fat: 0, sodium: 40 },
  { id: 'tb-cinnamon-twists', name: 'Cinnamon Twists', restaurant: 'Taco Bell', category: 'snacks', serving: '1 order', calories: 170, protein: 1, carbs: 26, fat: 7, sodium: 210, keywords: ['dessert'] },
  { id: 'chipotle-chips-guac', name: 'Chips & Guacamole', restaurant: 'Chipotle', category: 'snacks', serving: '1 order', calories: 770, protein: 9, carbs: 81, fat: 47, sodium: 760 },
  { id: 'dunkin-glazed-donut', name: 'Glazed Donut', restaurant: "Dunkin'", category: 'snacks', serving: '1 donut', calories: 240, protein: 4, carbs: 33, fat: 11, sodium: 270, keywords: ['doughnut'] },
  { id: 'sbux-butter-croissant', name: 'Butter Croissant', restaurant: 'Starbucks', category: 'snacks', serving: '1 croissant', calories: 260, protein: 5, carbs: 28, fat: 14, sodium: 320 },
  { id: 'sbux-blueberry-muffin', name: 'Blueberry Muffin', restaurant: 'Starbucks', category: 'snacks', serving: '1 muffin', calories: 360, protein: 5, carbs: 52, fat: 15, sodium: 270 },
  { id: 'sbux-cake-pop', name: 'Birthday Cake Pop', restaurant: 'Starbucks', category: 'snacks', serving: '1 pop', calories: 160, protein: 2, carbs: 23, fat: 7, sodium: 80, keywords: ['dessert'] },

  // More breakfast
  { id: 'whataburger-honey-butter-biscuit', name: 'Honey Butter Chicken Biscuit', restaurant: 'Whataburger', category: 'breakfast', serving: '1 biscuit', calories: 580, protein: 19, carbs: 50, fat: 34, sodium: 1190 },
  { id: 'jitb-breakfast-jack', name: 'Breakfast Jack', restaurant: 'Jack in the Box', category: 'breakfast', serving: '1 sandwich', calories: 350, protein: 16, carbs: 30, fat: 18, sodium: 780 },
  { id: 'bojangles-cajun-filet-biscuit', name: 'Cajun Filet Biscuit', restaurant: 'Bojangles', category: 'breakfast', serving: '1 biscuit', calories: 570, protein: 22, carbs: 49, fat: 31, sodium: 1590 },
  { id: 'krispy-kreme-glazed', name: 'Original Glazed Doughnut', restaurant: 'Krispy Kreme', category: 'breakfast', serving: '1 doughnut', calories: 190, protein: 3, carbs: 22, fat: 11, sodium: 85, keywords: ['donut'] },

  // More sandwiches & burgers
  { id: 'five-guys-cheeseburger', name: 'Cheeseburger', restaurant: 'Five Guys', category: 'sandwiches', serving: '1 burger', calories: 840, protein: 47, carbs: 40, fat: 55, sodium: 1050, keywords: ['burger'] },
  { id: 'five-guys-bacon-cheeseburger', name: 'Bacon Cheeseburger', restaurant: 'Five Guys', category: 'sandwiches', serving: '1 burger', calories: 920, protein: 51, carbs: 40, fat: 62, sodium: 1310, keywords: ['burger'] },
  { id: 'five-guys-little-hamburger', name: 'Little Hamburger', restaurant: 'Five Guys', category: 'sandwiches', serving: '1 burger', calories: 540, protein: 23, carbs: 39, fat: 26, sodium: 380, keywords: ['burger'] },
  { id: 'innout-double-double', name: 'Double-Double', restaurant: 'In-N-Out', category: 'sandwiches', serving: '1 burger', calories: 610, protein: 37, carbs: 41, fat: 34, sodium: 1440, keywords: ['burger', 'cheeseburger'] },
  { id: 'innout-cheeseburger', name: 'Cheeseburger', restaurant: 'In-N-Out', category: 'sandwiches', serving: '1 burger', calories: 430, protein: 20, carbs: 39, fat: 21, sodium: 1000, keywords: ['burger'] },
  { id: 'innout-hamburger', name: 'Hamburger', restaurant: 'In-N-Out', category: 'sandwiches', serving: '1 burger', calories: 360, protein: 16, carbs: 37, fat: 16, sodium: 720, keywords: ['burger'] },
  { id: 'whataburger-original', name: 'Whataburger', restaurant: 'Whataburger', category: 'sandwiches', serving: '1 burger', calories: 590, protein: 29, carbs: 62, fat: 25, sodium: 1220, keywords: ['burger'] },
  { id: 'shake-shack-shackburger', name: 'ShackBurger', restaurant: 'Shake Shack', category: 'sandwiches', serving: '1 burger', calories: 500, protein: 29, carbs: 26, fat: 30, sodium: 1250, keywords: ['burger'] },
  { id: 'shake-shack-chicken-shack', name: 'Chicken Shack', restaurant: 'Shake Shack', category: 'sandwiches', serving: '1 sandwich', calories: 550, protein: 33, carbs: 34, fat: 32, sodium: 1470, keywords: ['chicken sandwich'] },
  { id: 'culvers-butterburger-cheese', name: 'ButterBurger Cheese (single)', restaurant: "Culver's", category: 'sandwiches', serving: '1 burger', calories: 460, protein: 24, carbs: 38, fat: 24, sodium: 760, keywords: ['burger'] },
  { id: 'carls-famous-star', name: 'Famous Star with Cheese', restaurant: "Carl's Jr.", category: 'sandwiches', serving: '1 burger', calories: 670, protein: 28, carbs: 53, fat: 38, sodium: 1210, keywords: ['burger'] },
  { id: 'jitb-jumbo-jack', name: 'Jumbo Jack', restaurant: 'Jack in the Box', category: 'sandwiches', serving: '1 burger', calories: 520, protein: 22, carbs: 37, fat: 32, sodium: 830, keywords: ['burger'] },
  { id: 'arbys-classic-roast-beef', name: 'Classic Roast Beef', restaurant: "Arby's", category: 'sandwiches', serving: '1 sandwich', calories: 360, protein: 23, carbs: 37, fat: 14, sodium: 970 },
  { id: 'arbys-beef-n-cheddar', name: "Classic Beef 'n Cheddar", restaurant: "Arby's", category: 'sandwiches', serving: '1 sandwich', calories: 450, protein: 23, carbs: 45, fat: 20, sodium: 1310, keywords: ['roast beef'] },
  { id: 'jersey-mikes-13-italian', name: '#13 Original Italian (regular, Mike’s Way)', restaurant: "Jersey Mike's", category: 'sandwiches', serving: 'regular sub', calories: 880, protein: 38, carbs: 70, fat: 49, sodium: 2560, keywords: ['sub', 'hoagie'] },
  { id: 'jersey-mikes-7-turkey', name: '#7 Turkey & Provolone (regular, Mike’s Way)', restaurant: "Jersey Mike's", category: 'sandwiches', serving: 'regular sub', calories: 640, protein: 38, carbs: 70, fat: 23, sodium: 1800, keywords: ['sub', 'hoagie'] },
  { id: 'jimmy-johns-turkey-tom', name: '#4 Turkey Tom (8")', restaurant: "Jimmy John's", category: 'sandwiches', serving: '8-inch sub', calories: 490, protein: 25, carbs: 50, fat: 22, sodium: 1100, keywords: ['sub'] },

  // More lunch
  { id: 'canes-3-finger-combo', name: '3 Finger Combo (fries, toast, slaw, sauce)', restaurant: "Raising Cane's", category: 'lunch', serving: '1 combo', calories: 1260, protein: 49, carbs: 103, fat: 72, sodium: 2080, keywords: ['chicken fingers', 'tenders'] },
  { id: 'canes-chicken-fingers-3', name: 'Chicken Fingers (3 only)', restaurant: "Raising Cane's", category: 'lunch', serving: '3 fingers', calories: 390, protein: 39, carbs: 15, fat: 18, sodium: 870, keywords: ['tenders'] },
  { id: 'wingstop-classic-6', name: 'Classic Wings, Original Hot (6)', restaurant: 'Wingstop', category: 'lunch', serving: '6 wings', calories: 540, protein: 48, carbs: 2, fat: 38, sodium: 1560, keywords: ['chicken wings'] },
  { id: 'jitb-tacos-2', name: 'Tacos (2)', restaurant: 'Jack in the Box', category: 'lunch', serving: '2 tacos', calories: 360, protein: 12, carbs: 34, fat: 20, sodium: 580 },
  { id: 'chipotle-steak-bowl', name: 'Steak Burrito Bowl (rice, black beans, salsa, cheese)', restaurant: 'Chipotle', category: 'lunch', serving: '1 bowl', calories: 625, protein: 39, carbs: 68, fat: 20, sodium: 1630 },
  { id: 'sweetgreen-harvest-bowl', name: 'Harvest Bowl', restaurant: 'Sweetgreen', category: 'lunch', serving: '1 bowl', calories: 705, protein: 37, carbs: 60, fat: 36, sodium: 1045, keywords: ['salad'] },
  { id: 'cfa-mac-cheese-medium', name: 'Mac & Cheese (medium)', restaurant: 'Chick-fil-A', category: 'lunch', serving: 'medium', calories: 450, protein: 20, carbs: 29, fat: 28, sodium: 1170 },

  // More dinner
  { id: 'panda-beijing-beef', name: 'Beijing Beef', restaurant: 'Panda Express', category: 'dinner', serving: '1 entrée', calories: 480, protein: 14, carbs: 46, fat: 27, sodium: 660 },
  { id: 'panda-honey-walnut-shrimp', name: 'Honey Walnut Shrimp', restaurant: 'Panda Express', category: 'dinner', serving: '1 entrée', calories: 430, protein: 13, carbs: 35, fat: 28, sodium: 440 },
  { id: 'pizzahut-pepperoni-personal-pan', name: 'Pepperoni Personal Pan Pizza', restaurant: 'Pizza Hut', category: 'dinner', serving: '1 personal pizza', calories: 620, protein: 25, carbs: 69, fat: 27, sodium: 1300, keywords: ['pizza'] },
  { id: 'papa-johns-pepperoni-slice', name: 'Pepperoni Pizza (large, original crust)', restaurant: "Papa John's", category: 'dinner', serving: '1 slice', calories: 330, protein: 13, carbs: 37, fat: 14, sodium: 810, keywords: ['pizza'] },
  { id: 'little-caesars-pepperoni-slice', name: 'Classic Pepperoni Pizza (large)', restaurant: 'Little Caesars', category: 'dinner', serving: '1 slice', calories: 280, protein: 12, carbs: 32, fat: 11, sodium: 520, keywords: ['pizza'] },

  // More snacks & sides
  { id: 'five-guys-fries-regular', name: 'Fries (regular)', restaurant: 'Five Guys', category: 'snacks', serving: 'regular', calories: 950, protein: 13, carbs: 131, fat: 41, sodium: 960, keywords: ['french fries'] },
  { id: 'innout-fries', name: 'French Fries', restaurant: 'In-N-Out', category: 'snacks', serving: '1 order', calories: 360, protein: 6, carbs: 49, fat: 15, sodium: 150, keywords: ['fries'] },
  { id: 'shake-shack-fries', name: 'Crinkle Cut Fries', restaurant: 'Shake Shack', category: 'snacks', serving: '1 order', calories: 470, protein: 6, carbs: 63, fat: 22, sodium: 580, keywords: ['french fries'] },
  { id: 'arbys-curly-fries-small', name: 'Curly Fries (small)', restaurant: "Arby's", category: 'snacks', serving: 'small', calories: 410, protein: 5, carbs: 49, fat: 22, sodium: 950, keywords: ['french fries'] },
  { id: 'sonic-tots-medium', name: 'Tots (medium)', restaurant: 'Sonic', category: 'snacks', serving: 'medium', calories: 390, protein: 4, carbs: 41, fat: 23, sodium: 780, keywords: ['tater tots'] },
  { id: 'sonic-corn-dog', name: 'Corn Dog', restaurant: 'Sonic', category: 'snacks', serving: '1 corn dog', calories: 230, protein: 6, carbs: 24, fat: 12, sodium: 510, keywords: ['hot dog'] },
  { id: 'dq-oreo-blizzard-small', name: 'Oreo Blizzard (small)', restaurant: 'Dairy Queen', category: 'snacks', serving: 'small', calories: 610, protein: 12, carbs: 90, fat: 23, sodium: 450, keywords: ['dessert', 'ice cream'] },
  { id: 'culvers-cheese-curds', name: 'Wisconsin Cheese Curds (regular)', restaurant: "Culver's", category: 'snacks', serving: 'regular', calories: 510, protein: 24, carbs: 38, fat: 29, sodium: 1380 },
  { id: 'auntie-annes-original', name: 'Original Pretzel', restaurant: "Auntie Anne's", category: 'snacks', serving: '1 pretzel', calories: 340, protein: 9, carbs: 72, fat: 5, sodium: 990 },

  // Signature items that round out each chain
  // McDonald's
  { id: 'mcd-double-qpc', name: 'Double Quarter Pounder with Cheese', restaurant: "McDonald's", category: 'sandwiches', serving: '1 burger', calories: 740, protein: 48, carbs: 43, fat: 42, sodium: 1360, keywords: ['burger'] },
  { id: 'mcd-double-cheeseburger', name: 'Double Cheeseburger', restaurant: "McDonald's", category: 'sandwiches', serving: '1 burger', calories: 450, protein: 25, carbs: 34, fat: 24, sodium: 1110, keywords: ['burger'] },
  { id: 'mcd-hamburger', name: 'Hamburger', restaurant: "McDonald's", category: 'sandwiches', serving: '1 burger', calories: 250, protein: 12, carbs: 31, fat: 9, sodium: 510, keywords: ['burger'] },
  { id: 'mcd-spicy-mccrispy', name: 'Spicy McCrispy', restaurant: "McDonald's", category: 'sandwiches', serving: '1 sandwich', calories: 530, protein: 27, carbs: 48, fat: 26, sodium: 1230, keywords: ['chicken sandwich'] },
  { id: 'mcd-nuggets-6', name: 'Chicken McNuggets (6 pc)', restaurant: "McDonald's", category: 'lunch', serving: '6 pieces', calories: 250, protein: 14, carbs: 15, fat: 15, sodium: 500, keywords: ['nuggets'] },
  { id: 'mcd-bec-biscuit', name: 'Bacon, Egg & Cheese Biscuit', restaurant: "McDonald's", category: 'breakfast', serving: '1 biscuit', calories: 460, protein: 17, carbs: 38, fat: 26, sodium: 1320 },
  { id: 'mcd-sausage-biscuit', name: 'Sausage Biscuit', restaurant: "McDonald's", category: 'breakfast', serving: '1 biscuit', calories: 460, protein: 12, carbs: 38, fat: 30, sodium: 1140 },
  { id: 'mcd-big-breakfast-hotcakes', name: 'Big Breakfast with Hotcakes', restaurant: "McDonald's", category: 'breakfast', serving: '1 platter', calories: 1340, protein: 36, carbs: 158, fat: 63, sodium: 2070, keywords: ['pancakes'] },
  { id: 'mcd-oatmeal', name: 'Fruit & Maple Oatmeal', restaurant: "McDonald's", category: 'breakfast', serving: '1 bowl', calories: 320, protein: 6, carbs: 64, fat: 5, sodium: 150 },
  { id: 'mcd-fries-large', name: 'World Famous Fries (large)', restaurant: "McDonald's", category: 'snacks', serving: 'large', calories: 480, protein: 7, carbs: 65, fat: 23, sodium: 400, keywords: ['french fries'] },
  { id: 'mcd-vanilla-cone', name: 'Vanilla Cone', restaurant: "McDonald's", category: 'snacks', serving: '1 cone', calories: 200, protein: 5, carbs: 33, fat: 5, sodium: 80, keywords: ['dessert', 'ice cream'] },
  { id: 'mcd-chocolate-shake', name: 'Chocolate Shake (medium)', restaurant: "McDonald's", category: 'snacks', serving: 'medium', calories: 630, protein: 14, carbs: 105, fat: 17, sodium: 350, keywords: ['dessert', 'milkshake'] },

  // Chick-fil-A
  { id: 'cfa-deluxe-sandwich', name: 'Deluxe Chicken Sandwich', restaurant: 'Chick-fil-A', category: 'sandwiches', serving: '1 sandwich', calories: 490, protein: 29, carbs: 43, fat: 22, sodium: 1570, keywords: ['chicken sandwich'] },
  { id: 'cfa-strips-3', name: 'Chick-n-Strips (3 ct)', restaurant: 'Chick-fil-A', category: 'lunch', serving: '3 strips', calories: 310, protein: 29, carbs: 14, fat: 15, sodium: 1000, keywords: ['tenders'] },
  { id: 'cfa-cobb-salad', name: 'Cobb Salad (no dressing)', restaurant: 'Chick-fil-A', category: 'lunch', serving: '1 salad', calories: 530, protein: 40, carbs: 27, fat: 28, sodium: 1340, keywords: ['salad'] },
  { id: 'cfa-chick-n-minis-4', name: 'Chick-n-Minis (4 ct)', restaurant: 'Chick-fil-A', category: 'breakfast', serving: '4 minis', calories: 360, protein: 19, carbs: 41, fat: 13, sodium: 1060 },
  { id: 'cfa-hash-brown-scramble-burrito', name: 'Hash Brown Scramble Burrito', restaurant: 'Chick-fil-A', category: 'breakfast', serving: '1 burrito', calories: 700, protein: 34, carbs: 50, fat: 40, sodium: 1750 },
  { id: 'cfa-cookie', name: 'Chocolate Chunk Cookie', restaurant: 'Chick-fil-A', category: 'snacks', serving: '1 cookie', calories: 370, protein: 4, carbs: 49, fat: 17, sodium: 290, keywords: ['dessert'] },
  { id: 'cfa-icedream-cone', name: 'Icedream Cone', restaurant: 'Chick-fil-A', category: 'snacks', serving: '1 cone', calories: 180, protein: 5, carbs: 31, fat: 4, sodium: 90, keywords: ['dessert', 'ice cream'] },

  // Taco Bell
  { id: 'tb-doritos-locos', name: 'Nacho Cheese Doritos Locos Taco', restaurant: 'Taco Bell', category: 'lunch', serving: '1 taco', calories: 170, protein: 8, carbs: 13, fat: 9, sodium: 360 },
  { id: 'tb-soft-taco', name: 'Soft Taco', restaurant: 'Taco Bell', category: 'lunch', serving: '1 taco', calories: 180, protein: 9, carbs: 18, fat: 9, sodium: 500 },
  { id: 'tb-chalupa-supreme', name: 'Chalupa Supreme (beef)', restaurant: 'Taco Bell', category: 'lunch', serving: '1 chalupa', calories: 360, protein: 13, carbs: 31, fat: 20, sodium: 580 },
  { id: 'tb-burrito-supreme', name: 'Burrito Supreme (beef)', restaurant: 'Taco Bell', category: 'lunch', serving: '1 burrito', calories: 390, protein: 16, carbs: 51, fat: 14, sodium: 1110 },
  { id: 'tb-beefy-5-layer', name: 'Beefy 5-Layer Burrito', restaurant: 'Taco Bell', category: 'lunch', serving: '1 burrito', calories: 490, protein: 18, carbs: 63, fat: 18, sodium: 1210 },
  { id: 'tb-cheesy-bean-rice', name: 'Cheesy Bean and Rice Burrito', restaurant: 'Taco Bell', category: 'lunch', serving: '1 burrito', calories: 420, protein: 9, carbs: 56, fat: 17, sodium: 900 },
  { id: 'tb-mexican-pizza', name: 'Mexican Pizza', restaurant: 'Taco Bell', category: 'dinner', serving: '1 pizza', calories: 540, protein: 20, carbs: 46, fat: 31, sodium: 910 },
  { id: 'tb-nacho-fries', name: 'Nacho Fries (regular)', restaurant: 'Taco Bell', category: 'snacks', serving: 'regular', calories: 320, protein: 3, carbs: 35, fat: 19, sodium: 560, keywords: ['french fries'] },
  { id: 'tb-chips-cheese', name: 'Chips and Nacho Cheese Sauce', restaurant: 'Taco Bell', category: 'snacks', serving: '1 order', calories: 220, protein: 3, carbs: 25, fat: 12, sodium: 280 },

  // Wendy's
  { id: 'wendys-daves-double', name: "Dave's Double", restaurant: "Wendy's", category: 'sandwiches', serving: '1 burger', calories: 850, protein: 48, carbs: 40, fat: 55, sodium: 1560, keywords: ['burger'] },
  { id: 'wendys-nuggets-10', name: 'Chicken Nuggets (10 pc)', restaurant: "Wendy's", category: 'lunch', serving: '10 pieces', calories: 450, protein: 22, carbs: 26, fat: 29, sodium: 890, keywords: ['nuggets'] },
  { id: 'wendys-honey-butter-biscuit', name: 'Honey Butter Chicken Biscuit', restaurant: "Wendy's", category: 'breakfast', serving: '1 biscuit', calories: 490, protein: 16, carbs: 42, fat: 28, sodium: 1200 },
  { id: 'wendys-fries-medium', name: 'Natural-Cut Fries (medium)', restaurant: "Wendy's", category: 'snacks', serving: 'medium', calories: 350, protein: 5, carbs: 47, fat: 16, sodium: 330, keywords: ['french fries'] },

  // Burger King
  { id: 'bk-double-whopper', name: 'Double Whopper', restaurant: 'Burger King', category: 'sandwiches', serving: '1 burger', calories: 920, protein: 48, carbs: 51, fat: 58, sodium: 1330, keywords: ['burger'] },
  { id: 'bk-impossible-whopper', name: 'Impossible Whopper', restaurant: 'Burger King', category: 'sandwiches', serving: '1 burger', calories: 630, protein: 25, carbs: 58, fat: 34, sodium: 1080, keywords: ['burger', 'plant based', 'vegetarian'] },
  { id: 'bk-nuggets-8', name: 'Chicken Nuggets (8 pc)', restaurant: 'Burger King', category: 'lunch', serving: '8 pieces', calories: 380, protein: 18, carbs: 23, fat: 24, sodium: 690, keywords: ['nuggets'] },
  { id: 'bk-fries-medium', name: 'French Fries (medium)', restaurant: 'Burger King', category: 'snacks', serving: 'medium', calories: 380, protein: 5, carbs: 53, fat: 17, sodium: 570, keywords: ['fries'] },
  { id: 'bk-onion-rings-medium', name: 'Onion Rings (medium)', restaurant: 'Burger King', category: 'snacks', serving: 'medium', calories: 410, protein: 5, carbs: 50, fat: 21, sodium: 740 },

  // Subway
  { id: 'subway-black-forest-ham-6', name: 'Black Forest Ham (6")', restaurant: 'Subway', category: 'sandwiches', serving: '6-inch sub', calories: 270, protein: 18, carbs: 41, fat: 4, sodium: 800, keywords: ['sub'] },
  { id: 'subway-rotisserie-chicken-6', name: 'Rotisserie-Style Chicken (6")', restaurant: 'Subway', category: 'sandwiches', serving: '6-inch sub', calories: 300, protein: 25, carbs: 40, fat: 6, sodium: 560, keywords: ['sub'] },
  { id: 'subway-cold-cut-combo-6', name: 'Cold Cut Combo (6")', restaurant: 'Subway', category: 'sandwiches', serving: '6-inch sub', calories: 370, protein: 17, carbs: 40, fat: 15, sodium: 1110, keywords: ['sub'] },
  { id: 'subway-chicken-bacon-ranch-6', name: 'Chicken & Bacon Ranch (6")', restaurant: 'Subway', category: 'sandwiches', serving: '6-inch sub', calories: 530, protein: 35, carbs: 43, fat: 26, sodium: 1240, keywords: ['sub'] },
  { id: 'subway-veggie-delite-6', name: 'Veggie Delite (6")', restaurant: 'Subway', category: 'sandwiches', serving: '6-inch sub', calories: 230, protein: 9, carbs: 39, fat: 3, sodium: 280, keywords: ['sub', 'vegetarian'] },

  // Chipotle
  { id: 'chipotle-steak-burrito', name: 'Steak Burrito (rice, black beans, salsa, cheese)', restaurant: 'Chipotle', category: 'dinner', serving: '1 burrito', calories: 945, protein: 47, carbs: 118, fat: 29, sodium: 2230 },
  { id: 'chipotle-carnitas-bowl', name: 'Carnitas Burrito Bowl (rice, black beans, salsa, cheese)', restaurant: 'Chipotle', category: 'lunch', serving: '1 bowl', calories: 685, protein: 41, carbs: 67, fat: 26, sodium: 1750 },
  { id: 'chipotle-sofritas-bowl', name: 'Sofritas Burrito Bowl (rice, black beans, salsa, cheese)', restaurant: 'Chipotle', category: 'lunch', serving: '1 bowl', calories: 625, protein: 26, carbs: 76, fat: 24, sodium: 1860, keywords: ['vegetarian', 'tofu'] },
  { id: 'chipotle-chicken-salad', name: 'Chicken Salad (fajita veggies, salsa, cheese)', restaurant: 'Chipotle', category: 'lunch', serving: '1 salad', calories: 340, protein: 39, carbs: 8, fat: 16, sodium: 1210, keywords: ['salad', 'low carb'] },

  // Starbucks
  { id: 'sbux-turkey-bacon-egg-white', name: 'Turkey Bacon, Cheddar & Egg White Sandwich', restaurant: 'Starbucks', category: 'breakfast', serving: '1 sandwich', calories: 230, protein: 17, carbs: 28, fat: 5, sodium: 560 },
  { id: 'sbux-classic-oatmeal', name: 'Rolled & Steel-Cut Oatmeal', restaurant: 'Starbucks', category: 'breakfast', serving: '1 bowl', calories: 160, protein: 5, carbs: 28, fat: 3, sodium: 125 },
  { id: 'sbux-eggs-cheese-protein-box', name: 'Eggs & Cheddar Protein Box', restaurant: 'Starbucks', category: 'lunch', serving: '1 box', calories: 470, protein: 23, carbs: 41, fat: 24, sodium: 490 },
  { id: 'sbux-chocolate-croissant', name: 'Chocolate Croissant', restaurant: 'Starbucks', category: 'snacks', serving: '1 croissant', calories: 300, protein: 5, carbs: 32, fat: 17, sodium: 230 },
  { id: 'sbux-banana-nut-bread', name: 'Banana Walnut & Pecan Loaf', restaurant: 'Starbucks', category: 'snacks', serving: '1 slice', calories: 420, protein: 6, carbs: 52, fat: 20, sodium: 320, keywords: ['banana bread'] },

  // Dunkin'
  { id: 'dunkin-bagel-cream-cheese', name: 'Everything Bagel with Cream Cheese', restaurant: "Dunkin'", category: 'breakfast', serving: '1 bagel', calories: 500, protein: 14, carbs: 69, fat: 17, sodium: 890 },
  { id: 'dunkin-avocado-toast', name: 'Avocado Toast', restaurant: "Dunkin'", category: 'breakfast', serving: '1 order', calories: 240, protein: 6, carbs: 32, fat: 11, sodium: 590 },
  { id: 'dunkin-hash-browns', name: 'Hash Browns (6 pc)', restaurant: "Dunkin'", category: 'snacks', serving: '6 pieces', calories: 130, protein: 1, carbs: 15, fat: 7, sodium: 330 },
  { id: 'dunkin-boston-kreme', name: 'Boston Kreme Donut', restaurant: "Dunkin'", category: 'snacks', serving: '1 donut', calories: 300, protein: 4, carbs: 38, fat: 15, sodium: 330, keywords: ['doughnut'] },
  { id: 'dunkin-munchkins-glazed-5', name: 'Glazed Munchkins (5)', restaurant: "Dunkin'", category: 'snacks', serving: '5 pieces', calories: 250, protein: 3, carbs: 33, fat: 12, sodium: 230, keywords: ['donut holes'] },

  // Popeyes
  { id: 'popeyes-spicy-chicken-sandwich', name: 'Spicy Chicken Sandwich', restaurant: 'Popeyes', category: 'sandwiches', serving: '1 sandwich', calories: 700, protein: 28, carbs: 50, fat: 42, sodium: 1470, keywords: ['chicken sandwich'] },
  { id: 'popeyes-spicy-breast', name: 'Spicy Chicken Breast', restaurant: 'Popeyes', category: 'dinner', serving: '1 piece', calories: 420, protein: 35, carbs: 16, fat: 24, sodium: 1160, keywords: ['fried chicken'] },
  { id: 'popeyes-red-beans-rice', name: 'Red Beans & Rice (regular)', restaurant: 'Popeyes', category: 'dinner', serving: 'regular', calories: 250, protein: 8, carbs: 27, fat: 13, sodium: 610 },
  { id: 'popeyes-cajun-fries', name: 'Cajun Fries (regular)', restaurant: 'Popeyes', category: 'snacks', serving: 'regular', calories: 260, protein: 3, carbs: 30, fat: 14, sodium: 590, keywords: ['french fries'] },
  { id: 'popeyes-biscuit', name: 'Buttermilk Biscuit', restaurant: 'Popeyes', category: 'snacks', serving: '1 biscuit', calories: 210, protein: 3, carbs: 25, fat: 11, sodium: 500 },

  // KFC
  { id: 'kfc-extra-crispy-breast', name: 'Extra Crispy Chicken Breast', restaurant: 'KFC', category: 'dinner', serving: '1 piece', calories: 530, protein: 35, carbs: 18, fat: 35, sodium: 1150, keywords: ['fried chicken'] },
  { id: 'kfc-pot-pie', name: 'Chicken Pot Pie', restaurant: 'KFC', category: 'dinner', serving: '1 pie', calories: 720, protein: 26, carbs: 60, fat: 41, sodium: 1750 },
  { id: 'kfc-chicken-sandwich', name: 'Classic Chicken Sandwich', restaurant: 'KFC', category: 'sandwiches', serving: '1 sandwich', calories: 650, protein: 34, carbs: 49, fat: 35, sodium: 1260, keywords: ['chicken sandwich'] },
  { id: 'kfc-mashed-potatoes', name: 'Mashed Potatoes & Gravy (individual)', restaurant: 'KFC', category: 'snacks', serving: 'individual', calories: 130, protein: 2, carbs: 18, fat: 5, sodium: 530 },
  { id: 'kfc-mac-cheese', name: 'Mac & Cheese (individual)', restaurant: 'KFC', category: 'snacks', serving: 'individual', calories: 140, protein: 5, carbs: 14, fat: 7, sodium: 580 },
  { id: 'kfc-coleslaw', name: 'Coleslaw (individual)', restaurant: 'KFC', category: 'snacks', serving: 'individual', calories: 170, protein: 1, carbs: 22, fat: 9, sodium: 190 },
  { id: 'kfc-biscuit', name: 'Biscuit', restaurant: 'KFC', category: 'snacks', serving: '1 biscuit', calories: 180, protein: 4, carbs: 22, fat: 8, sodium: 530 },

  // Panda Express
  { id: 'panda-mushroom-chicken', name: 'Mushroom Chicken', restaurant: 'Panda Express', category: 'dinner', serving: '1 entrée', calories: 220, protein: 13, carbs: 10, fat: 14, sodium: 760 },
  { id: 'panda-string-bean-chicken', name: 'String Bean Chicken Breast', restaurant: 'Panda Express', category: 'dinner', serving: '1 entrée', calories: 210, protein: 12, carbs: 13, fat: 12, sodium: 590 },
  { id: 'panda-white-rice', name: 'White Steamed Rice', restaurant: 'Panda Express', category: 'dinner', serving: '1 side', calories: 380, protein: 7, carbs: 87, fat: 0, sodium: 0 },
  { id: 'panda-super-greens', name: 'Super Greens', restaurant: 'Panda Express', category: 'dinner', serving: '1 side', calories: 90, protein: 6, carbs: 10, fat: 3, sodium: 260, keywords: ['vegetables'] },
  { id: 'panda-egg-roll', name: 'Chicken Egg Roll', restaurant: 'Panda Express', category: 'snacks', serving: '1 roll', calories: 200, protein: 6, carbs: 20, fat: 10, sodium: 390 },
  { id: 'panda-rangoon', name: 'Cream Cheese Rangoon (3)', restaurant: 'Panda Express', category: 'snacks', serving: '3 pieces', calories: 190, protein: 5, carbs: 24, fat: 8, sodium: 180 },

  // Panera Bread
  { id: 'panera-chicken-noodle-soup', name: 'Chicken Noodle Soup (bowl)', restaurant: 'Panera Bread', category: 'lunch', serving: '1 bowl', calories: 150, protein: 10, carbs: 16, fat: 5, sodium: 1240, keywords: ['soup'] },
  { id: 'panera-chocolate-chipper', name: 'Chocolate Chipper Cookie', restaurant: 'Panera Bread', category: 'snacks', serving: '1 cookie', calories: 390, protein: 4, carbs: 53, fat: 19, sodium: 290, keywords: ['dessert'] },

  // Five Guys
  { id: 'five-guys-hot-dog', name: 'Hot Dog', restaurant: 'Five Guys', category: 'lunch', serving: '1 hot dog', calories: 520, protein: 18, carbs: 40, fat: 35, sodium: 1130 },
  { id: 'five-guys-grilled-cheese', name: 'Grilled Cheese', restaurant: 'Five Guys', category: 'sandwiches', serving: '1 sandwich', calories: 470, protein: 11, carbs: 41, fat: 26, sodium: 715, keywords: ['vegetarian'] },
  { id: 'five-guys-little-fries', name: 'Little Fries', restaurant: 'Five Guys', category: 'snacks', serving: 'little', calories: 530, protein: 8, carbs: 72, fat: 23, sodium: 530, keywords: ['french fries'] },

  // In-N-Out
  { id: 'innout-protein-style', name: 'Double-Double Protein Style (lettuce wrap)', restaurant: 'In-N-Out', category: 'sandwiches', serving: '1 burger', calories: 520, protein: 33, carbs: 11, fat: 39, sodium: 1160, keywords: ['burger', 'low carb'] },
  { id: 'innout-animal-fries', name: 'Animal Style Fries', restaurant: 'In-N-Out', category: 'snacks', serving: '1 order', calories: 750, protein: 19, carbs: 54, fat: 42, sodium: 1100, keywords: ['french fries'] },

  // Whataburger
  { id: 'whataburger-patty-melt', name: 'Patty Melt', restaurant: 'Whataburger', category: 'sandwiches', serving: '1 sandwich', calories: 950, protein: 49, carbs: 51, fat: 61, sodium: 1920, keywords: ['burger'] },
  { id: 'whataburger-taquito', name: 'Bacon & Egg Taquito with Cheese', restaurant: 'Whataburger', category: 'breakfast', serving: '1 taquito', calories: 390, protein: 20, carbs: 30, fat: 21, sodium: 950 },

  // Raising Cane's
  { id: 'canes-box-combo', name: 'Box Combo (4 fingers, fries, toast, slaw, sauce)', restaurant: "Raising Cane's", category: 'dinner', serving: '1 combo', calories: 1390, protein: 62, carbs: 108, fat: 78, sodium: 2500, keywords: ['chicken fingers', 'tenders'] },
  { id: 'canes-texas-toast', name: 'Texas Toast', restaurant: "Raising Cane's", category: 'snacks', serving: '1 slice', calories: 140, protein: 4, carbs: 19, fat: 6, sodium: 280 },

  // Wingstop
  { id: 'wingstop-boneless-8', name: 'Boneless Wings, Original Hot (8)', restaurant: 'Wingstop', category: 'lunch', serving: '8 wings', calories: 640, protein: 40, carbs: 40, fat: 34, sodium: 2000, keywords: ['chicken wings'] },
  { id: 'wingstop-fries', name: 'Seasoned Fries (regular)', restaurant: 'Wingstop', category: 'snacks', serving: 'regular', calories: 330, protein: 5, carbs: 42, fat: 16, sodium: 510, keywords: ['french fries'] },

  // Arby's
  { id: 'arbys-smokehouse-brisket', name: 'Smokehouse Brisket', restaurant: "Arby's", category: 'sandwiches', serving: '1 sandwich', calories: 600, protein: 34, carbs: 50, fat: 30, sodium: 1600 },
  { id: 'arbys-mozzarella-sticks', name: 'Mozzarella Sticks (4 pc)', restaurant: "Arby's", category: 'snacks', serving: '4 sticks', calories: 440, protein: 18, carbs: 38, fat: 24, sodium: 1170 },
  { id: 'arbys-potato-cakes', name: 'Potato Cakes (2 pc)', restaurant: "Arby's", category: 'snacks', serving: '2 cakes', calories: 250, protein: 2, carbs: 26, fat: 15, sodium: 470 },

  // Sonic
  { id: 'sonic-cheeseburger', name: 'SONIC Cheeseburger', restaurant: 'Sonic', category: 'sandwiches', serving: '1 burger', calories: 710, protein: 32, carbs: 50, fat: 43, sodium: 1260, keywords: ['burger'] },
  { id: 'sonic-chili-cheese-coney', name: 'Chili Cheese Coney', restaurant: 'Sonic', category: 'lunch', serving: '1 hot dog', calories: 380, protein: 15, carbs: 26, fat: 24, sodium: 1040, keywords: ['hot dog'] },

  // Dairy Queen
  { id: 'dq-chicken-strip-basket', name: 'Chicken Strip Basket (4 pc)', restaurant: 'Dairy Queen', category: 'dinner', serving: '1 basket', calories: 1010, protein: 44, carbs: 91, fat: 51, sodium: 2300, keywords: ['tenders'] },
  { id: 'dq-vanilla-cone-small', name: 'Vanilla Cone (small)', restaurant: 'Dairy Queen', category: 'snacks', serving: 'small', calories: 230, protein: 6, carbs: 38, fat: 7, sodium: 95, keywords: ['dessert', 'ice cream'] },
  { id: 'dq-dilly-bar', name: 'Dilly Bar', restaurant: 'Dairy Queen', category: 'snacks', serving: '1 bar', calories: 220, protein: 3, carbs: 23, fat: 13, sodium: 60, keywords: ['dessert', 'ice cream'] },

  // Jersey Mike's & Jimmy John's
  { id: 'jersey-mikes-17-philly', name: "#17 Mike's Famous Philly (regular)", restaurant: "Jersey Mike's", category: 'sandwiches', serving: 'regular sub', calories: 700, protein: 43, carbs: 58, fat: 32, sodium: 1560, keywords: ['sub', 'cheesesteak'] },
  { id: 'jimmy-johns-pepe', name: '#1 Pepe (8")', restaurant: "Jimmy John's", category: 'sandwiches', serving: '8-inch sub', calories: 610, protein: 30, carbs: 51, fat: 32, sodium: 1440, keywords: ['sub', 'ham'] },
  { id: 'jimmy-johns-vito', name: '#5 Vito (8")', restaurant: "Jimmy John's", category: 'sandwiches', serving: '8-inch sub', calories: 620, protein: 27, carbs: 49, fat: 35, sodium: 1780, keywords: ['sub', 'italian'] },

  // Carl's Jr., Culver's, Shake Shack, Jack in the Box
  { id: 'carls-western-bacon', name: 'Western Bacon Cheeseburger', restaurant: "Carl's Jr.", category: 'sandwiches', serving: '1 burger', calories: 760, protein: 33, carbs: 81, fat: 34, sodium: 1480, keywords: ['burger'] },
  { id: 'culvers-butterburger-double', name: 'ButterBurger Cheese (double)', restaurant: "Culver's", category: 'sandwiches', serving: '1 burger', calories: 690, protein: 40, carbs: 39, fat: 41, sodium: 1110, keywords: ['burger'] },
  { id: 'culvers-crinkle-fries', name: 'Crinkle Cut Fries (regular)', restaurant: "Culver's", category: 'snacks', serving: 'regular', calories: 360, protein: 4, carbs: 45, fat: 18, sodium: 310, keywords: ['french fries'] },
  { id: 'shake-shack-smokeshack', name: 'SmokeShack', restaurant: 'Shake Shack', category: 'sandwiches', serving: '1 burger', calories: 570, protein: 32, carbs: 26, fat: 36, sodium: 1440, keywords: ['burger', 'bacon'] },
  { id: 'jitb-sourdough-jack', name: 'Sourdough Jack', restaurant: 'Jack in the Box', category: 'sandwiches', serving: '1 burger', calories: 690, protein: 31, carbs: 38, fat: 46, sodium: 1290, keywords: ['burger'] },
  { id: 'jitb-egg-rolls-3', name: 'Egg Rolls (3 pc)', restaurant: 'Jack in the Box', category: 'snacks', serving: '3 rolls', calories: 390, protein: 12, carbs: 45, fat: 18, sodium: 990 },

  // Pizza chains
  { id: 'pizzahut-pepperoni-pan-slice', name: 'Pepperoni Pizza (large, pan)', restaurant: 'Pizza Hut', category: 'dinner', serving: '1 slice', calories: 340, protein: 13, carbs: 30, fat: 19, sodium: 690, keywords: ['pizza'] },
  { id: 'pizzahut-breadstick', name: 'Breadstick', restaurant: 'Pizza Hut', category: 'snacks', serving: '1 stick', calories: 140, protein: 4, carbs: 19, fat: 5, sodium: 250 },
  { id: 'papa-johns-cheese-slice', name: 'Cheese Pizza (large, original crust)', restaurant: "Papa John's", category: 'dinner', serving: '1 slice', calories: 300, protein: 12, carbs: 37, fat: 11, sodium: 700, keywords: ['pizza'] },
  { id: 'little-caesars-cheese-slice', name: 'Classic Cheese Pizza (large)', restaurant: 'Little Caesars', category: 'dinner', serving: '1 slice', calories: 250, protein: 11, carbs: 32, fat: 9, sodium: 420, keywords: ['pizza'] },
  { id: 'little-caesars-crazy-bread', name: 'Crazy Bread', restaurant: 'Little Caesars', category: 'snacks', serving: '1 stick', calories: 100, protein: 3, carbs: 15, fat: 3, sodium: 150, keywords: ['breadstick'] },

  // Bakery & snack chains
  { id: 'krispy-kreme-chocolate-iced', name: 'Chocolate Iced Glazed Doughnut', restaurant: 'Krispy Kreme', category: 'snacks', serving: '1 doughnut', calories: 240, protein: 3, carbs: 33, fat: 11, sodium: 95, keywords: ['donut'] },
  { id: 'bojangles-bo-berry-biscuit', name: 'Bo-Berry Biscuit', restaurant: 'Bojangles', category: 'breakfast', serving: '1 biscuit', calories: 370, protein: 4, carbs: 47, fat: 18, sodium: 540 },
  { id: 'auntie-annes-cinnamon-sugar', name: 'Cinnamon Sugar Pretzel', restaurant: "Auntie Anne's", category: 'snacks', serving: '1 pretzel', calories: 470, protein: 8, carbs: 84, fat: 12, sodium: 400 },
  { id: 'auntie-annes-pretzel-dog', name: 'Original Pretzel Dog', restaurant: "Auntie Anne's", category: 'lunch', serving: '1 pretzel dog', calories: 400, protein: 12, carbs: 38, fat: 22, sodium: 820, keywords: ['hot dog'] },
  { id: 'sweetgreen-kale-caesar', name: 'Kale Caesar', restaurant: 'Sweetgreen', category: 'lunch', serving: '1 bowl', calories: 430, protein: 30, carbs: 21, fat: 26, sodium: 920, keywords: ['salad'] },
];

export const FAST_FOOD_RESTAURANTS: string[] = Array.from(new Set(FAST_FOOD_ITEMS.map((item) => item.restaurant))).sort(
  (a, b) => a.localeCompare(b)
);

function normalize(text: string): string {
  return text.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function searchFastFood(
  query: string,
  category: FastFoodCategory | 'all' = 'all',
  restaurant: string | 'all' = 'all'
): FastFoodItem[] {
  const words = normalize(query).split(' ').filter(Boolean);
  return FAST_FOOD_ITEMS.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    if (restaurant !== 'all' && item.restaurant !== restaurant) return false;
    if (words.length === 0) return true;
    const haystack = normalize([item.name, item.restaurant, item.category, ...(item.keywords || [])].join(' '));
    return words.every((word) => haystack.includes(word));
  });
}
