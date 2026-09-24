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
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function searchFastFood(query: string, category: FastFoodCategory | 'all' = 'all'): FastFoodItem[] {
  const words = normalize(query).split(' ').filter(Boolean);
  return FAST_FOOD_ITEMS.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    if (words.length === 0) return true;
    const haystack = normalize([item.name, item.restaurant, item.category, ...(item.keywords || [])].join(' '));
    return words.every((word) => haystack.includes(word));
  });
}
