import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Southeast / Florida chains with published nutrition guides.
 * Sonny's BBQ — Dec 2024 nutritionals PDF.
 * PDQ — Nutritionix interactive menu (chain-provided).
 * Miller's Ale House — May 2026 nutrition guide (items without sides unless named).
 * Bonefish Grill — Nov 2025 OSI nutrition PDF.
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

export const SOUTHEAST_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // Sonny's BBQ — official Dec 2024 PDF
  item('sonnys-pulled-pork-sandwich', 'Pulled Pork Sandwich (regular)', "Sonny's BBQ", 'sandwiches', '1 sandwich', 650, 42, 38, 36, 930, ['bbq', 'pork']),
  item('sonnys-pulled-chicken-sandwich', 'Pulled Chicken Sandwich (regular)', "Sonny's BBQ", 'sandwiches', '1 sandwich', 430, 34, 46, 12, 1160, ['bbq', 'chicken']),
  item('sonnys-brisket-sandwich', 'Chopped Brisket Sandwich (regular)', "Sonny's BBQ", 'sandwiches', '1 sandwich', 630, 48, 33, 34, 1020, ['bbq', 'brisket']),
  item('sonnys-turkey-sandwich', 'Smoked Turkey Sandwich (regular)', "Sonny's BBQ", 'sandwiches', '1 sandwich', 400, 39, 33, 13, 1050, ['bbq', 'turkey']),
  item('sonnys-sweet-carolina', 'Sweet Carolina Sandwich', "Sonny's BBQ", 'sandwiches', '1 sandwich', 860, 52, 51, 49, 1440, ['bbq', 'pork']),
  item('sonnys-whole-hog', 'Whole Hog Sandwich', "Sonny's BBQ", 'sandwiches', '1 sandwich', 920, 49, 69, 52, 2590, ['bbq']),
  item('sonnys-cuban', "Sonny's Cuban", "Sonny's BBQ", 'sandwiches', '1 sandwich', 1090, 63, 52, 69, 2300, ['cuban', 'bbq']),
  item('sonnys-steakburger', "Sonny's Steakburger", "Sonny's BBQ", 'sandwiches', '1 burger', 670, 44, 38, 38, 1360, ['burger']),
  item('sonnys-pulled-pork-dinner', 'Pulled Pork Dinner', "Sonny's BBQ", 'dinner', '1 plate', 1230, 68, 87, 71, 2190, ['bbq', 'pork']),
  item('sonnys-ribs-sweet', 'Sweet & Smokey Ribs Dinner', "Sonny's BBQ", 'dinner', '1 plate', 1580, 69, 139, 89, 3420, ['bbq', 'ribs']),
  item('sonnys-ribs-dry', 'House Dry-Rubbed Ribs Dinner', "Sonny's BBQ", 'dinner', '1 plate', 1420, 68, 101, 86, 2360, ['bbq', 'ribs']),
  item('sonnys-brisket-dinner', 'Chopped Brisket Dinner', "Sonny's BBQ", 'dinner', '1 plate', 1210, 78, 79, 68, 2340, ['bbq', 'brisket']),
  item('sonnys-chicken-dinner', 'Smoked Chicken Dinner (dark & white)', "Sonny's BBQ", 'dinner', '1 plate', 1180, 84, 120, 43, 1760, ['bbq', 'chicken']),
  item('sonnys-pulled-pork-pit', 'Pulled Pork (pit combo portion)', "Sonny's BBQ", 'lunch', '145 g', 440, 35, 5, 31, 520, ['bbq', 'pork']),
  item('sonnys-ribs-pit', 'Sweet & Smokey Ribs (pit combo portion)', "Sonny's BBQ", 'lunch', '182 g', 460, 49, 7, 45, 510, ['bbq', 'ribs']),
  item('sonnys-brisket-pit', 'Chopped Brisket (pit combo portion)', "Sonny's BBQ", 'lunch', '145 g', 420, 41, 0, 29, 610, ['bbq', 'brisket']),
  item('sonnys-smoked-wings', 'Smoked Wings', "Sonny's BBQ", 'lunch', '1 order', 750, 83, 3, 45, 2380, ['wings', 'bbq']),
  item('sonnys-fries', 'Crinkle-Cut Fries', "Sonny's BBQ", 'snacks', '1 side', 480, 6, 61, 23, 1590, ['fries']),
  item('sonnys-beans', "Sonny's BBQ Beans", "Sonny's BBQ", 'snacks', '1 side', 240, 8, 49, 4.5, 900, ['beans', 'side']),
  item('sonnys-mac', 'Mac & Cheese', "Sonny's BBQ", 'snacks', '1 side', 320, 10, 26, 19, 870, ['side']),
  item('sonnys-coleslaw', 'Homemade Coleslaw', "Sonny's BBQ", 'snacks', '1 side', 130, 2, 12, 9, 190, ['side']),
  item('sonnys-cornbread', 'Cornbread', "Sonny's BBQ", 'snacks', '1 piece', 180, 2, 31, 4.5, 380, ['bread']),

  // PDQ — Nutritionix / chain nutrition
  item('pdq-crispy-3', 'Hand-Breaded Crispy Tenders (3 ct)', 'PDQ', 'lunch', '3 tenders', 320, 31, 17, 14, 440, ['chicken', 'tenders']),
  item('pdq-crispy-4', 'Hand-Breaded Crispy Tenders (4 ct)', 'PDQ', 'lunch', '4 tenders', 430, 41, 23, 19, 590, ['chicken', 'tenders']),
  item('pdq-crispy-5', 'Hand-Breaded Crispy Tenders (5 ct)', 'PDQ', 'lunch', '5 tenders', 540, 51, 29, 24, 740, ['chicken', 'tenders']),
  item('pdq-grilled-3', 'Grilled Chicken Tenders (3 ct)', 'PDQ', 'lunch', '3 tenders', 130, 30, 0, 1, 850, ['chicken', 'grilled']),
  item('pdq-grilled-4', 'Grilled Chicken Tenders (4 ct)', 'PDQ', 'lunch', '4 tenders', 170, 39, 0, 1.5, 1130, ['chicken', 'grilled']),
  item('pdq-crispy-sandwich', 'Crispy Chicken Sandwich', 'PDQ', 'sandwiches', '1 sandwich', 490, 35, 37, 22, 1210, ['chicken sandwich']),
  item('pdq-grilled-sandwich', 'Grilled Chicken Sandwich', 'PDQ', 'sandwiches', '1 sandwich', 290, 34, 29, 5, 910, ['chicken sandwich']),
  item('pdq-honey-butter', 'Honey Butter Chicken Sandwich', 'PDQ', 'sandwiches', '1 sandwich', 660, 35, 68, 29, 1350, ['chicken sandwich']),
  item('pdq-buffy-bleu', 'Buffy Bleu Sandwich', 'PDQ', 'sandwiches', '1 sandwich', 440, 29, 39, 18, 900, ['chicken sandwich']),
  item('pdq-salad-crispy', 'PDQ Salad (crispy)', 'PDQ', 'lunch', '1 salad', 380, 30, 23, 19, 520, ['salad']),
  item('pdq-salad-grilled', 'PDQ Salad (grilled)', 'PDQ', 'lunch', '1 salad', 270, 34, 11, 11, 940, ['salad']),
  item('pdq-waffle-fries', 'Waffle Fries', 'PDQ', 'snacks', '1 side', 360, 5, 46, 17, 330, ['fries']),
  item('pdq-nuggets-kids', 'Kids Nuggets', 'PDQ', 'lunch', 'kids order', 180, 16, 11, 8, 270, ['nuggets']),
  item('pdq-sauce', 'PDQ Sauce', 'PDQ', 'snacks', '1 serving', 150, 1, 2, 15, 210, ['sauce']),

  // Miller's Ale House — May 2026 guide (no sides unless named)
  item('mah-classic-cheeseburger', 'Classic Cheeseburger', "Miller's Ale House", 'sandwiches', '1 burger', 1010, 53, 42, 70, 2150, ['burger']),
  item('mah-prime-burger', 'Prime Burger', "Miller's Ale House", 'sandwiches', '1 burger', 1280, 64, 51, 92, 3040, ['burger']),
  item('mah-cue-bacon', 'Cue Bacon Cheeseburger', "Miller's Ale House", 'sandwiches', '1 burger', 1160, 58, 53, 79, 2890, ['burger', 'bbq']),
  item('mah-brunch-burger', 'Brunch Burger', "Miller's Ale House", 'sandwiches', '1 burger', 1440, 56, 46, 114, 2690, ['burger']),
  item('mah-wings-12', 'Fresh Chicken Wings (12, no sauce)', "Miller's Ale House", 'lunch', '12 wings', 440, 76, 0, 12, 280, ['wings']),
  item('mah-wings-6', 'Fresh Chicken Wings (6, no sauce)', "Miller's Ale House", 'lunch', '6 wings', 220, 38, 0, 6, 140, ['wings']),
  item('mah-zingers', 'World Famous Zingers (no sauce)', "Miller's Ale House", 'lunch', '1 order', 850, 60, 38, 49, 240, ['zingers', 'chicken']),
  item('mah-philly', 'Philly Cheese Steak', "Miller's Ale House", 'sandwiches', '1 sandwich', 990, 60, 65, 53, 3030, ['philly']),
  item('mah-chicken-blt', 'Grilled Chicken BLT', "Miller's Ale House", 'sandwiches', '1 sandwich', 590, 56, 42, 21, 3050, ['chicken']),
  item('mah-french-fries', 'French Fries', "Miller's Ale House", 'snacks', '1 side', 450, 1, 12, 46, 510, ['fries']),
  item('mah-ribs', 'Barbecue Baby Back Ribs', "Miller's Ale House", 'dinner', '1 order', 1320, 95, 0, 83, 0, ['ribs', 'bbq']),
  item('mah-prime-rib-12', 'Prime Rib (12 oz)', "Miller's Ale House", 'dinner', '12 oz', 810, 109, 6, 39, 3950, ['steak']),

  // Bonefish Grill — Nov 2025 OSI PDF
  item('bfg-bang-bang', 'Bang Bang Shrimp', 'Bonefish Grill', 'snacks', '1 serving', 740, 29, 28, 60, 1950, ['shrimp', 'appetizer']),
  item('bfg-calamari', 'Calamari', 'Bonefish Grill', 'snacks', '1 serving', 1050, 53, 82, 56, 1920, ['appetizer']),
  item('bfg-crab-cakes', 'Crab Cakes', 'Bonefish Grill', 'snacks', '1 serving', 510, 28, 12, 40, 1610, ['crab']),
  item('bfg-ahi-tuna', 'Tempura Crunch Sashimi Tuna', 'Bonefish Grill', 'snacks', '1 serving', 380, 34, 18, 20, 3330, ['tuna', 'fish']),
  item('bfg-chicken-egg-rolls', 'Blackened Chicken Egg Rolls', 'Bonefish Grill', 'snacks', '1 serving', 440, 15, 53, 20, 1560, ['appetizer']),
  item('bfg-imperial-dip', 'Imperial Dip with Tortilla Strips', 'Bonefish Grill', 'snacks', '1 serving', 910, 39, 57, 59, 1660, ['dip']),
  item('bfg-caesar-chicken', 'Caesar Salad with Wood-Grilled Chicken', 'Bonefish Grill', 'lunch', '1 salad', 940, 67, 32, 62, 1280, ['salad', 'chicken']),
  item('bfg-bourbon-salmon', 'Bourbon Glazed Salmon (with sides)', 'Bonefish Grill', 'dinner', '1 plate', 880, 55, 59, 47, 1880, ['salmon', 'fish']),
  item('bfg-lily-chicken', "Lily's Chicken (with whipped potatoes & broccoli)", 'Bonefish Grill', 'dinner', '1 plate', 920, 71, 38, 55, 3120, ['chicken']),
  item('bfg-chicken-marsala', 'Chicken Marsala (with whipped potatoes & broccoli)', 'Bonefish Grill', 'dinner', '1 plate', 960, 69, 42, 56, 5120, ['chicken']),
  item('bfg-cod-imperial', 'Cod Imperial (with jasmine rice & asparagus)', 'Bonefish Grill', 'dinner', '1 plate', 780, 53, 51, 41, 2110, ['fish', 'cod']),
  item('bfg-scallops-shrimp', 'Scallops & Shrimp (with jasmine rice & broccoli)', 'Bonefish Grill', 'dinner', '1 plate', 720, 63, 53, 30, 2330, ['shrimp', 'scallops']),
  item('bfg-bfg-burger', 'Half Pound BFG Burger with Fries', 'Bonefish Grill', 'sandwiches', '1 burger + fries', 1510, 65, 114, 89, 4480, ['burger']),
  item('bfg-chilean-bass', 'Chilean Sea Bass (simply grilled)', 'Bonefish Grill', 'dinner', '1 serving', 570, 36, 0, 47, 180, ['fish', 'sea bass']),
  item('bfg-atlantic-salmon', 'Atlantic Salmon (simply grilled)', 'Bonefish Grill', 'dinner', '1 serving', 360, 41, 3, 21, 190, ['salmon', 'fish']),
  item('bfg-grilled-chicken', 'Simply Grilled Chicken', 'Bonefish Grill', 'dinner', '1 serving', 280, 58, 0, 5, 190, ['chicken']),
  item('bfg-jasmine-rice', 'Jasmine Rice', 'Bonefish Grill', 'snacks', '1 side', 200, 3, 37, 4.5, 440, ['side', 'rice']),
];
