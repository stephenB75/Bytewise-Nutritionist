import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Cultural / ethnic chains with published nutrition.
 * Bibibop — Apr 2026 nutrition PDF (components + typical bowls).
 * Nando's PERi-PERi — Spring 2025 USA allergen & nutritional guide.
 * Lee's Sandwiches — official menu pages (10" bánh mì).
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

export const CULTURAL_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // Bibibop — Apr 2026 PDF (original bowl portions)
  item('bibibop-chicken', 'Chicken (4 oz protein)', 'Bibibop', 'lunch', '4 oz', 190, 25, 14, 3, 950, ['korean', 'bowl']),
  item('bibibop-spicy-chicken', 'Spicy Chicken (4 oz protein)', 'Bibibop', 'lunch', '4 oz', 170, 25, 9, 3, 760, ['korean', 'bowl']),
  item('bibibop-bbq-beef', 'Korean BBQ Beef (4 oz protein)', 'Bibibop', 'lunch', '4 oz', 170, 15, 14, 6, 715, ['korean', 'bowl', 'beef']),
  item('bibibop-crispy-chicken', 'Korean Crispy Chicken (5 oz protein)', 'Bibibop', 'lunch', '5 oz', 140, 12, 13, 5, 780, ['korean', 'fried chicken']),
  item('bibibop-salmon', 'Miso Glazed Salmon (4 oz protein)', 'Bibibop', 'lunch', '4 oz', 270, 27, 7, 15, 620, ['korean', 'fish']),
  item('bibibop-steak', 'Steak (4 oz protein)', 'Bibibop', 'lunch', '4 oz', 190, 18, 10, 8.5, 540, ['korean', 'steak']),
  item('bibibop-tofu', 'Tofu (4 oz protein)', 'Bibibop', 'lunch', '4 oz', 210, 19, 10, 8, 300, ['korean', 'vegetarian']),
  item('bibibop-white-rice', 'White Rice (bowl base)', 'Bibibop', 'snacks', '10 oz', 370, 8, 80, 1.5, 210, ['korean', 'rice']),
  item('bibibop-purple-rice', 'Purple Rice (bowl base)', 'Bibibop', 'snacks', '10 oz', 350, 9, 75, 1.5, 0, ['korean', 'rice']),
  item('bibibop-noodles', 'Sweet Potato Noodles (bowl base)', 'Bibibop', 'snacks', '10 oz', 350, 6, 63, 7, 1110, ['korean', 'japchae']),
  item('bibibop-chicken-bowl', 'Chicken Bowl (rice, broccoli, gochujang)', 'Bibibop', 'lunch', '1 bowl', 690, 36, 112, 12.5, 1970, ['korean', 'bowl']),
  item('bibibop-bbq-beef-bowl', 'Korean BBQ Beef Bowl (rice, broccoli, teriyaki)', 'Bibibop', 'dinner', '1 bowl', 670, 26, 113, 12.5, 1795, ['korean', 'bowl']),
  item('bibibop-spicy-bowl', 'Spicy Chicken Bowl (rice, kimchi, gochujang)', 'Bibibop', 'dinner', '1 bowl', 620, 34, 106, 11.5, 1880, ['korean', 'bowl']),
  item('bibibop-salmon-bowl', 'Miso Salmon Bowl (rice, broccoli, sesame ginger)', 'Bibibop', 'dinner', '1 bowl', 800, 38, 98, 28.5, 1440, ['korean', 'bowl', 'fish']),
  item('bibibop-miso-soup', 'Miso Soup', 'Bibibop', 'snacks', '8 oz', 35, 3, 4, 1.5, 680, ['korean', 'soup']),
  item('bibibop-kimchi-side', 'Kimchi (side)', 'Bibibop', 'snacks', '3.5 oz', 25, 0, 7, 0, 675, ['korean', 'kimchi']),

  // Nando's PERi-PERi — Spring 2025 USA guide (Plainish / standard)
  item('nandos-half-chicken', '1/2 Chicken', "Nando's PERi-PERi", 'dinner', '1/2 chicken', 540, 68, 0, 29, 970, ['peri peri', 'portuguese', 'african']),
  item('nandos-half-chips', '1/2 Chicken and Chips', "Nando's PERi-PERi", 'dinner', '1 plate', 840, 72, 34, 47, 1960, ['peri peri', 'fries']),
  item('nandos-quarter-breast', '1/4 Chicken Breast', "Nando's PERi-PERi", 'dinner', '1/4 chicken', 290, 42, 0, 14, 570, ['peri peri']),
  item('nandos-quarter-leg', '1/4 Chicken Leg', "Nando's PERi-PERi", 'dinner', '1/4 chicken', 260, 28, 0, 16, 420, ['peri peri']),
  item('nandos-boneless-breast', 'Boneless Chicken Breast', "Nando's PERi-PERi", 'dinner', '1 breast', 390, 55, 1, 18, 1300, ['peri peri']),
  item('nandos-thighs-3', 'Boneless Chicken Thighs (3)', "Nando's PERi-PERi", 'dinner', '3 thighs', 420, 39, 1, 28, 1110, ['peri peri']),
  item('nandos-skewers', 'Chicken Thigh Skewers (2)', "Nando's PERi-PERi", 'dinner', '2 skewers', 400, 36, 6, 26, 980, ['peri peri']),
  item('nandos-sandwich', 'Chicken Breast Sandwich', "Nando's PERi-PERi", 'sandwiches', '1 sandwich', 530, 32, 49, 23, 1200, ['peri peri', 'chicken sandwich']),
  item('nandos-burger', 'Chicken Burger', "Nando's PERi-PERi", 'sandwiches', '1 burger', 580, 32, 58, 26, 1230, ['peri peri', 'burger']),
  item('nandos-thigh-mighty', 'Thigh and Mighty Sandwich', "Nando's PERi-PERi", 'sandwiches', '1 sandwich', 600, 27, 49, 34, 1210, ['peri peri']),
  item('nandos-nandocas', "Nandoca's Choice", "Nando's PERi-PERi", 'sandwiches', '1 sandwich', 970, 63, 43, 60, 1630, ['peri peri']),
  item('nandos-chicken-bowl', 'PERi-PERi Chicken Bowl (breast)', "Nando's PERi-PERi", 'lunch', '1 bowl', 870, 47, 95, 32, 2520, ['peri peri', 'bowl']),
  item('nandos-rainbow-bowl', 'Rainbow Bowl (breast)', "Nando's PERi-PERi", 'lunch', '1 bowl', 1010, 53, 79, 51, 2300, ['peri peri', 'bowl']),
  item('nandos-chips', 'PERi Chips (regular)', "Nando's PERi-PERi", 'snacks', '1 side', 300, 4, 34, 17, 990, ['fries', 'peri peri']),
  item('nandos-rice', 'Portuguese Rice (regular)', "Nando's PERi-PERi", 'snacks', '1 side', 210, 4, 36, 10, 570, ['rice', 'peri peri']),
  item('nandos-garlic-bread', 'Garlic Bread (regular)', "Nando's PERi-PERi", 'snacks', '1 side', 370, 6, 35, 24, 550, ['bread']),
  item('nandos-coleslaw', 'Coleslaw (regular)', "Nando's PERi-PERi", 'snacks', '1 side', 180, 2, 12, 15, 200, ['side']),
  item('nandos-mac', 'PERi Mac (regular)', "Nando's PERi-PERi", 'snacks', '1 side', 300, 9, 30, 16, 1010, ['mac and cheese']),

  // Lee's Sandwiches — official 10" bánh mì pages
  item('lees-combination', "Lee's Combination (#1)", "Lee's Sandwiches", 'sandwiches', '10" baguette', 690, 29, 92, 22, 1180, ['banh mi', 'vietnamese', 'jambon']),
  item('lees-pork-roll', 'Pork Roll (#2)', "Lee's Sandwiches", 'sandwiches', '10" baguette', 800, 26, 94, 35, 1020, ['banh mi', 'vietnamese']),
  item('lees-cured-pork', 'Cured Pork (#3)', "Lee's Sandwiches", 'sandwiches', '10" baguette', 860, 25, 92, 42, 1010, ['banh mi', 'vietnamese']),
  item('lees-grilled-chicken', 'Grilled Chicken (#4)', "Lee's Sandwiches", 'sandwiches', '10" baguette', 660, 26, 97, 17, 1090, ['banh mi', 'vietnamese', 'chicken']),
  item('lees-grilled-pork', 'Grilled Pork (#5)', "Lee's Sandwiches", 'sandwiches', '10" baguette', 710, 26, 95, 24, 980, ['banh mi', 'vietnamese', 'pork']),
  item('lees-bbq-pork', 'B.B.Q. Pork (#6)', "Lee's Sandwiches", 'sandwiches', '10" baguette', 690, 26, 94, 22, 960, ['banh mi', 'vietnamese', 'char siu']),
  item('lees-meatball', 'Pork Meatball (#7)', "Lee's Sandwiches", 'sandwiches', '10" baguette', 710, 32, 124, 8, 1320, ['banh mi', 'vietnamese']),
  item('lees-shredded-pork', 'Shredded Pork (#8)', "Lee's Sandwiches", 'sandwiches', '10" baguette', 600, 25, 96, 11, 1290, ['banh mi', 'vietnamese']),
  item('lees-sardine', 'Sardine (#9)', "Lee's Sandwiches", 'sandwiches', '10" baguette', 590, 35, 96, 5, 1260, ['banh mi', 'vietnamese', 'fish']),
];
