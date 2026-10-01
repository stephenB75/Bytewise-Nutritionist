import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Additional chains and menu items, using each chain's published nutrition (rounded).
 * Drinks and desserts use the `snacks` category.
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

export const MORE_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // Zaxby's
  item('zaxbys-fingerz-5', 'Chicken Fingerz (5 pc)', "Zaxby's", 'dinner', '5 fingers', 600, 52, 30, 30, 1640, ['tenders', 'strips']),
  item('zaxbys-big-zax-snak', 'Big Zax Snak Meal (fingerz, fries, toast, sauce)', "Zaxby's", 'dinner', '1 meal', 1170, 50, 108, 60, 2780, ['tenders', 'combo']),
  item('zaxbys-kickin-chicken-sandwich', "Kickin' Chicken Sandwich", "Zaxby's", 'sandwiches', '1 sandwich', 690, 35, 62, 33, 2090),
  item('zaxbys-wings-5', 'Traditional Wings, Buffalo (5)', "Zaxby's", 'dinner', '5 wings', 410, 34, 3, 29, 1820),
  item('zaxbys-crinkle-fries', 'Crinkle Fries (regular)', "Zaxby's", 'snacks', 'regular', 410, 5, 55, 19, 740, ['french fries']),
  item('zaxbys-zax-sauce', 'Zax Sauce', "Zaxby's", 'snacks', '1 cup (1.5 oz)', 170, 0, 6, 16, 300, ['dip']),

  // Church's Texas Chicken
  item('churchs-original-breast', 'Original Chicken Breast', "Church's Texas Chicken", 'dinner', '1 piece', 300, 24, 9, 19, 690, ['fried chicken']),
  item('churchs-spicy-thigh', 'Spicy Chicken Thigh', "Church's Texas Chicken", 'dinner', '1 piece', 330, 17, 10, 25, 720, ['fried chicken']),
  item('churchs-tenders-3', 'Original Tenders (3 pc)', "Church's Texas Chicken", 'dinner', '3 tenders', 370, 30, 21, 18, 1210, ['strips']),
  item('churchs-honey-butter-biscuit', 'Honey-Butter Biscuit', "Church's Texas Chicken", 'snacks', '1 biscuit', 230, 3, 26, 13, 360),
  item('churchs-jalapeno-bombers', 'Jalapeño Cheese Bombers (4)', "Church's Texas Chicken", 'snacks', '4 pieces', 240, 7, 22, 14, 760),

  // Hardee's
  item('hardees-sausage-biscuit', 'Sausage Biscuit', "Hardee's", 'breakfast', '1 biscuit', 530, 13, 35, 38, 1300),
  item('hardees-frisco-breakfast', 'Frisco Breakfast Sandwich', "Hardee's", 'breakfast', '1 sandwich', 420, 25, 38, 19, 1360),
  item('hardees-original-thickburger', '1/3 lb Original Thickburger', "Hardee's", 'sandwiches', '1 burger', 790, 31, 53, 50, 1480, ['burger']),
  item('hardees-big-hot-ham-cheese', "Big Hot Ham 'N' Cheese", "Hardee's", 'sandwiches', '1 sandwich', 410, 26, 38, 17, 1650),
  item('hardees-tenders-3', 'Hand-Breaded Chicken Tenders (3 pc)', "Hardee's", 'dinner', '3 tenders', 260, 26, 14, 11, 880, ['strips']),

  // Del Taco
  item('del-taco-crunchy-taco', 'Crunchy Taco', 'Del Taco', 'lunch', '1 taco', 120, 6, 9, 7, 160),
  item('del-taco-bean-cheese-burrito', 'Bean & Cheese Burrito (green sauce)', 'Del Taco', 'lunch', '1 burrito', 380, 16, 52, 12, 1030),
  item('del-taco-chicken-burrito', 'Del Classic Chicken Burrito', 'Del Taco', 'lunch', '1 burrito', 400, 22, 39, 17, 960),
  item('del-taco-chicken-quesadilla', 'Chicken Cheddar Quesadilla', 'Del Taco', 'lunch', '1 quesadilla', 540, 31, 39, 29, 1290),
  item('del-taco-egg-cheese-burrito', 'Egg & Cheese Breakfast Burrito', 'Del Taco', 'breakfast', '1 burrito', 260, 13, 25, 12, 560),
  item('del-taco-crinkle-fries', 'Crinkle Cut Fries (small)', 'Del Taco', 'snacks', 'small', 210, 2, 25, 11, 320, ['french fries']),

  // El Pollo Loco
  item('epl-chicken-breast', 'Fire-Grilled Chicken Breast', 'El Pollo Loco', 'dinner', '1 piece', 210, 35, 0, 8, 730, ['grilled chicken']),
  item('epl-chicken-thigh', 'Fire-Grilled Chicken Thigh', 'El Pollo Loco', 'dinner', '1 piece', 220, 20, 0, 15, 470, ['grilled chicken']),
  item('epl-chicken-leg', 'Fire-Grilled Chicken Leg', 'El Pollo Loco', 'dinner', '1 piece', 90, 12, 0, 5, 230, ['grilled chicken', 'drumstick']),
  item('epl-original-pollo-bowl', 'Original Pollo Bowl', 'El Pollo Loco', 'lunch', '1 bowl', 610, 38, 90, 10, 2130, ['rice', 'beans']),
  item('epl-chicken-avocado-burrito', 'Chicken Avocado Burrito', 'El Pollo Loco', 'lunch', '1 burrito', 900, 54, 72, 44, 2120),
  item('epl-pinto-beans', 'Pinto Beans (regular)', 'El Pollo Loco', 'snacks', 'regular side', 130, 8, 22, 1, 590),

  // Qdoba
  item('qdoba-chicken-burrito', 'Grilled Adobo Chicken Burrito (rice, black beans, pico, cheese)', 'Qdoba', 'lunch', '1 burrito', 870, 49, 105, 26, 2150),
  item('qdoba-chicken-bowl', 'Grilled Adobo Chicken Bowl (rice, black beans, pico, cheese)', 'Qdoba', 'lunch', '1 bowl', 560, 42, 58, 18, 1530),
  item('qdoba-steak-quesadilla', 'Steak Quesadilla', 'Qdoba', 'dinner', '1 quesadilla', 1000, 52, 70, 56, 2160),
  item('qdoba-queso-chips', '3-Cheese Queso & Chips', 'Qdoba', 'snacks', '1 order', 980, 26, 89, 58, 1610, ['nachos']),

  // Moe's Southwest Grill
  item('moes-homewrecker', 'Homewrecker Burrito (chicken)', "Moe's Southwest Grill", 'lunch', '1 burrito', 1010, 57, 107, 39, 2430),
  item('moes-joey-bag-of-donuts', 'Joey Bag of Donuts Burrito (chicken)', "Moe's Southwest Grill", 'lunch', '1 burrito', 750, 48, 86, 22, 1940),
  item('moes-chips-queso', 'Chips & Queso (regular)', "Moe's Southwest Grill", 'snacks', 'regular', 680, 18, 64, 39, 1260),

  // Taco John's
  item('taco-johns-potato-oles', 'Potato Olés (medium)', "Taco John's", 'snacks', 'medium', 420, 4, 46, 25, 1140, ['tater tots']),
  item('taco-johns-crispy-beef-taco', 'Crispy Beef Taco', "Taco John's", 'lunch', '1 taco', 180, 8, 12, 11, 330),
  item('taco-johns-meat-potato-burrito', 'Meat & Potato Burrito', "Taco John's", 'lunch', '1 burrito', 520, 16, 59, 25, 1420),

  // White Castle
  item('white-castle-original-slider', 'The Original Slider', 'White Castle', 'sandwiches', '1 slider', 140, 7, 13, 7, 360, ['burger']),
  item('white-castle-cheese-slider', 'Original Slider with Cheese', 'White Castle', 'sandwiches', '1 slider', 170, 9, 14, 9, 520, ['burger', 'cheeseburger']),
  item('white-castle-impossible-slider', 'Impossible Slider', 'White Castle', 'sandwiches', '1 slider', 190, 11, 18, 9, 430, ['burger', 'vegetarian']),
  item('white-castle-chicken-rings', 'Chicken Rings (6 pc)', 'White Castle', 'snacks', '6 rings', 290, 15, 14, 19, 780),
  item('white-castle-crinkle-fries', 'Crinkle Fries (small)', 'White Castle', 'snacks', 'small', 280, 3, 33, 15, 40, ['french fries']),

  // Checkers & Rally's
  item('checkers-big-buford', 'Big Buford', "Checkers & Rally's", 'sandwiches', '1 burger', 650, 39, 32, 41, 1590, ['burger']),
  item('checkers-checkerburger-cheese', 'Checkerburger with Cheese', "Checkers & Rally's", 'sandwiches', '1 burger', 480, 21, 39, 27, 1100, ['burger']),
  item('checkers-fries-medium', 'Famous Seasoned Fries (medium)', "Checkers & Rally's", 'snacks', 'medium', 420, 5, 52, 22, 1000, ['french fries']),

  // Steak 'n Shake
  item('steak-n-shake-double-cheese', "Double 'n Cheese Steakburger", "Steak 'n Shake", 'sandwiches', '1 burger', 530, 29, 42, 27, 1140, ['burger']),
  item('steak-n-shake-fries', "Thin 'n Crispy Fries (regular)", "Steak 'n Shake", 'snacks', 'regular', 330, 4, 43, 16, 470, ['french fries']),
  item('steak-n-shake-vanilla-shake', 'Vanilla Milkshake (regular)', "Steak 'n Shake", 'snacks', 'regular', 610, 12, 82, 26, 300, ['dessert', 'drink']),

  // Krystal
  item('krystal-original', 'The Krystal', 'Krystal', 'sandwiches', '1 burger', 160, 7, 15, 8, 260, ['burger', 'slider']),
  item('krystal-chik', 'Krystal Chik', 'Krystal', 'sandwiches', '1 sandwich', 230, 9, 24, 11, 590, ['chicken']),

  // Tim Hortons
  item('tim-hortons-double-double', 'Double-Double Coffee (medium)', 'Tim Hortons', 'breakfast', 'medium', 220, 4, 26, 11, 50, ['coffee', 'drink']),
  item('tim-hortons-timbits-10', 'Timbits (10 assorted)', 'Tim Hortons', 'snacks', '10 pieces', 700, 8, 100, 30, 650, ['donut holes', 'donut']),
  item('tim-hortons-boston-cream', 'Boston Cream Donut', 'Tim Hortons', 'snacks', '1 donut', 250, 4, 38, 9, 220, ['donut']),
  item('tim-hortons-farmers-wrap', "Sausage Farmer's Breakfast Wrap", 'Tim Hortons', 'breakfast', '1 wrap', 590, 23, 37, 38, 1310),
  item('tim-hortons-bacon-sandwich', 'Bacon Breakfast Sandwich (English muffin)', 'Tim Hortons', 'breakfast', '1 sandwich', 370, 17, 29, 20, 830),

  // Cava
  item('cava-greens-grains-chicken', 'Greens + Grains Bowl with Grilled Chicken', 'Cava', 'lunch', '1 bowl', 610, 38, 42, 31, 1460, ['mediterranean']),
  item('cava-chicken-rice-bowl', 'Chicken + Rice Bowl', 'Cava', 'lunch', '1 bowl', 700, 42, 62, 30, 1700, ['mediterranean']),
  item('cava-harissa-avocado-bowl', 'Harissa Avocado Bowl', 'Cava', 'dinner', '1 bowl', 820, 38, 65, 45, 1790, ['mediterranean']),
  item('cava-pita-chips', 'Pita Chips', 'Cava', 'snacks', '1 bag', 370, 6, 44, 19, 450),

  // Firehouse Subs
  item('firehouse-hook-ladder', 'Hook & Ladder (medium)', 'Firehouse Subs', 'sandwiches', 'medium sub', 780, 45, 75, 33, 2250, ['sub', 'turkey', 'ham']),
  item('firehouse-meatball', 'Firehouse Meatball (medium)', 'Firehouse Subs', 'sandwiches', 'medium sub', 960, 48, 82, 49, 2600, ['sub']),
  item('firehouse-italian', 'Italian (medium)', 'Firehouse Subs', 'sandwiches', 'medium sub', 930, 46, 73, 51, 2930, ['sub']),

  // Jollibee
  item('jollibee-chickenjoy', 'Chickenjoy (1 pc, breast)', 'Jollibee', 'dinner', '1 piece', 370, 29, 11, 24, 1060, ['fried chicken', 'filipino']),
  item('jollibee-jolly-spaghetti', 'Jolly Spaghetti', 'Jollibee', 'lunch', '1 plate', 520, 19, 69, 19, 1220, ['filipino', 'pasta']),
  item('jollibee-palabok', 'Palabok Fiesta', 'Jollibee', 'lunch', '1 plate', 610, 23, 80, 22, 1700, ['filipino', 'noodles']),
  item('jollibee-yumburger', 'Yumburger', 'Jollibee', 'sandwiches', '1 burger', 290, 13, 32, 12, 590, ['burger']),
  item('jollibee-peach-mango-pie', 'Peach Mango Pie', 'Jollibee', 'snacks', '1 pie', 260, 2, 36, 12, 200, ['dessert']),

  // Golden Krust (Caribbean)
  item('golden-krust-beef-patty', 'Jamaican Beef Patty', 'Golden Krust', 'lunch', '1 patty', 430, 12, 43, 23, 690, ['caribbean', 'jamaican']),
  item('golden-krust-chicken-patty', 'Curry Chicken Patty', 'Golden Krust', 'lunch', '1 patty', 380, 12, 42, 18, 700, ['caribbean', 'jamaican']),
  item('golden-krust-coco-bread', 'Coco Bread', 'Golden Krust', 'snacks', '1 piece', 400, 8, 58, 15, 470, ['caribbean', 'jamaican']),
  item('golden-krust-patty-coco-bread', 'Beef Patty in Coco Bread', 'Golden Krust', 'lunch', '1 sandwich', 830, 20, 101, 38, 1160, ['caribbean', 'jamaican']),
  item('golden-krust-jerk-chicken', 'Jerk Chicken with Rice & Peas (regular)', 'Golden Krust', 'dinner', '1 plate', 900, 50, 95, 34, 1900, ['caribbean', 'jamaican']),
  item('golden-krust-curry-goat', 'Curry Goat with Rice & Peas (regular)', 'Golden Krust', 'dinner', '1 plate', 870, 46, 92, 34, 1700, ['caribbean', 'jamaican']),
  item('golden-krust-oxtail', 'Oxtail with Rice & Peas (regular)', 'Golden Krust', 'dinner', '1 plate', 1050, 52, 92, 52, 1600, ['caribbean', 'jamaican']),

  // Pollo Tropical (also searched as tropical pollo)
  item('pollo-tropical-quarter-white', '1/4 Chicken (white meat, with skin)', 'Pollo Tropical', 'dinner', '1/4 chicken', 360, 43, 0, 20, 730, ['grilled chicken', 'caribbean', 'tropical pollo']),
  item('pollo-tropical-quarter-dark', '1/4 Chicken (dark meat, with skin)', 'Pollo Tropical', 'dinner', '1/4 chicken', 290, 24, 0, 22, 430, ['grilled chicken', 'caribbean', 'tropical pollo']),
  item('pollo-tropical-half-chicken', '1/2 Chicken', 'Pollo Tropical', 'dinner', '1/2 chicken', 650, 67, 0, 42, 1160, ['grilled chicken', 'caribbean', 'tropical pollo']),
  item('pollo-tropical-grilled-breasts', 'Grilled Chicken Breasts (2)', 'Pollo Tropical', 'dinner', '2 breasts', 240, 59, 10, 6, 860, ['grilled chicken', 'tropical pollo']),
  item('pollo-tropical-tropichop', 'Chicken TropiChop (white rice, black beans)', 'Pollo Tropical', 'lunch', '1 bowl', 530, 31, 90, 10, 1460, ['bowl', 'caribbean', 'tropical pollo']),
  item('pollo-tropical-pollo-bites', 'Pollo Bites (8 pc)', 'Pollo Tropical', 'lunch', '8 pieces', 410, 44, 21, 17, 990, ['nuggets', 'tropical pollo']),
  item('pollo-tropical-classic-sandwich', 'Classic Chicken Sandwich', 'Pollo Tropical', 'sandwiches', '1 sandwich', 430, 35, 41, 19, 770, ['tropical pollo']),
  item('pollo-tropical-cuban', 'Cuban Sandwich', 'Pollo Tropical', 'sandwiches', '1 sandwich', 1050, 61, 67, 59, 2260, ['cuban', 'tropical pollo']),
  item('pollo-tropical-chicken-blt', 'Chicken BLT Sandwich', 'Pollo Tropical', 'sandwiches', '1 sandwich', 570, 44, 41, 29, 1170, ['tropical pollo']),
  item('pollo-tropical-caesar-wrap', 'Chicken Caesar Wrap (crispy)', 'Pollo Tropical', 'lunch', '1 wrap', 770, 32, 48, 50, 1410, ['tropical pollo']),
  item('pollo-tropical-white-rice', 'White Rice (regular)', 'Pollo Tropical', 'snacks', 'regular side', 330, 6, 67, 5, 700, ['tropical pollo']),
  item('pollo-tropical-black-beans', 'Black Beans (regular)', 'Pollo Tropical', 'snacks', 'regular side', 310, 15, 44, 8, 660, ['tropical pollo']),
  item('pollo-tropical-rice-beans', 'White Rice and Black Beans (regular)', 'Pollo Tropical', 'lunch', 'regular side', 520, 15, 93, 10, 1100, ['tropical pollo']),
  item('pollo-tropical-sweet-plantains', 'Sweet Plantains (regular)', 'Pollo Tropical', 'snacks', 'regular side', 450, 3, 85, 11, 0, ['maduros', 'caribbean', 'tropical pollo']),
  item('pollo-tropical-fried-yuca', 'Fried Yuca (regular)', 'Pollo Tropical', 'snacks', 'regular side', 320, 1, 46, 14, 430, ['yuca', 'tropical pollo']),
  item('pollo-tropical-cilantro-garlic', 'Cilantro Garlic Sauce', 'Pollo Tropical', 'snacks', '1 oz', 160, 0, 2, 17, 170, ['dip', 'tropical pollo']),
  item('pollo-tropical-caribbean-soup', 'Caribbean Chicken Soup (bowl)', 'Pollo Tropical', 'lunch', '1 bowl', 300, 22, 41, 5, 1730, ['soup', 'tropical pollo']),
  item('pollo-tropical-flan', 'Flan', 'Pollo Tropical', 'snacks', '1 serving', 210, 8, 26, 9, 550, ['dessert', 'tropical pollo']),

  // Dave's Hot Chicken
  item('daves-hot-chicken-slider', 'Slider (1 tender on bun)', "Dave's Hot Chicken", 'sandwiches', '1 slider', 620, 32, 46, 34, 1700, ['nashville hot chicken']),
  item('daves-hot-chicken-tender', 'Tender (1 pc)', "Dave's Hot Chicken", 'dinner', '1 tender', 380, 30, 20, 20, 1130, ['nashville hot chicken']),
  item('daves-hot-chicken-fries', 'Fries (regular)', "Dave's Hot Chicken", 'snacks', 'regular', 410, 5, 50, 21, 660, ['french fries']),
  item('daves-hot-chicken-mac', 'Mac & Cheese', "Dave's Hot Chicken", 'snacks', '1 side', 380, 15, 34, 20, 820),

  // Seafood chains
  item('ljs-battered-fish', 'Battered Alaska Pollock (1 pc)', "Long John Silver's", 'dinner', '1 piece', 190, 9, 12, 12, 480, ['fish']),
  item('ljs-chicken-plank', 'Chicken Plank (1 pc)', "Long John Silver's", 'dinner', '1 piece', 140, 9, 9, 8, 480),
  item('ljs-hushpuppy', 'Hushpuppy', "Long John Silver's", 'snacks', '1 piece', 60, 1, 9, 2.5, 200),
  item('ljs-2pc-fish-meal', '2 pc Fish Meal (fries, 2 hushpuppies)', "Long John Silver's", 'dinner', '1 meal', 770, 22, 82, 40, 1600, ['fish and chips']),
  item('captain-ds-batter-fish', 'Batter-Dipped Fish (1 pc)', "Captain D's", 'dinner', '1 piece', 170, 9, 11, 10, 510, ['fish']),
  item('captain-ds-fish-meal', 'Fish & Fries Meal (2 pc)', "Captain D's", 'dinner', '1 meal', 760, 22, 84, 37, 1700, ['fish and chips']),

  // Dessert, bakery & coffee chains
  item('cinnabon-classic-roll', 'Classic Roll', 'Cinnabon', 'snacks', '1 roll', 880, 13, 127, 37, 830, ['cinnamon roll', 'dessert']),
  item('cinnabon-minibon', 'MiniBon Classic Roll', 'Cinnabon', 'snacks', '1 roll', 350, 5, 49, 15, 330, ['cinnamon roll', 'dessert']),
  item('cinnabon-bonbites', 'Classic BonBites (4 pc)', 'Cinnabon', 'snacks', '4 pieces', 360, 5, 52, 15, 340, ['cinnamon roll', 'dessert']),
  item('baskin-robbins-chocolate', 'Chocolate Ice Cream (regular scoop)', 'Baskin-Robbins', 'snacks', '4 oz scoop', 280, 5, 33, 15, 140, ['dessert', 'ice cream']),
  item('baskin-robbins-pralines', "Pralines 'n Cream (regular scoop)", 'Baskin-Robbins', 'snacks', '4 oz scoop', 290, 4, 38, 14, 200, ['dessert', 'ice cream']),
  item('baskin-robbins-mint-chip', 'Mint Chocolate Chip (regular scoop)', 'Baskin-Robbins', 'snacks', '4 oz scoop', 290, 4, 32, 16, 120, ['dessert', 'ice cream']),
  item('crumbl-milk-chocolate-chip', 'Milk Chocolate Chip Cookie (whole)', 'Crumbl', 'snacks', '1 cookie', 720, 8, 96, 36, 560, ['dessert']),
  item('crumbl-pink-sugar', 'Classic Pink Sugar Cookie (whole)', 'Crumbl', 'snacks', '1 cookie', 680, 6, 104, 27, 480, ['dessert']),
  item('einstein-plain-bagel', 'Plain Bagel', 'Einstein Bros. Bagels', 'breakfast', '1 bagel', 270, 10, 56, 1, 470),
  item('einstein-asiago-bagel', 'Asiago Bagel', 'Einstein Bros. Bagels', 'breakfast', '1 bagel', 320, 13, 54, 6, 520),
  item('einstein-bacon-egg-cheese', 'Bacon, Egg & Cheese on Asiago Bagel', 'Einstein Bros. Bagels', 'breakfast', '1 sandwich', 590, 30, 56, 27, 1260),
  item('dutch-bros-golden-eagle', 'Golden Eagle Breve (medium)', 'Dutch Bros', 'snacks', '16 oz', 480, 10, 50, 27, 190, ['coffee', 'drink']),
  item('dutch-bros-rebel', 'Rebel Energy Drink (medium)', 'Dutch Bros', 'snacks', '16 oz', 270, 0, 68, 0, 220, ['drink']),

  // Smoothie chains
  item('smoothie-king-gladiator', 'Gladiator Strawberry (20 oz)', 'Smoothie King', 'snacks', '20 oz', 230, 45, 9, 2.5, 330, ['smoothie', 'protein shake', 'drink']),
  item('smoothie-king-angel-food', 'Angel Food (20 oz)', 'Smoothie King', 'snacks', '20 oz', 320, 11, 66, 1, 170, ['smoothie', 'drink']),
  item('smoothie-king-peanut-power', 'Peanut Power Plus Grape (20 oz)', 'Smoothie King', 'snacks', '20 oz', 690, 20, 100, 26, 300, ['smoothie', 'drink']),
  item('tropical-smoothie-sunrise-sunset', 'Sunrise Sunset Smoothie (24 oz)', 'Tropical Smoothie Cafe', 'snacks', '24 oz', 360, 2, 89, 0.5, 15, ['smoothie', 'drink']),
  item('tropical-smoothie-detox-green', 'Detox Island Green (24 oz)', 'Tropical Smoothie Cafe', 'snacks', '24 oz', 180, 3, 43, 0.5, 70, ['smoothie', 'drink']),
  item('tropical-smoothie-chicken-pesto', 'Chicken Pesto Flatbread', 'Tropical Smoothie Cafe', 'lunch', '1 flatbread', 530, 37, 39, 25, 1180),
  item('tropical-smoothie-buffalo-wrap', 'Buffalo Chicken Wrap', 'Tropical Smoothie Cafe', 'lunch', '1 wrap', 580, 35, 52, 25, 1820),
  item('jamba-strawberries-wild', 'Strawberries Wild (medium)', 'Jamba', 'snacks', 'medium', 280, 4, 64, 0.5, 105, ['smoothie', 'drink']),
  item('jamba-mango-a-go-go', 'Mango-a-go-go (medium)', 'Jamba', 'snacks', 'medium', 370, 3, 87, 1, 30, ['smoothie', 'drink']),
  item('jamba-acai-primo-bowl', 'Açaí Primo Bowl', 'Jamba', 'breakfast', '1 bowl', 510, 7, 102, 11, 40, ['acai']),

  // Regional burger & hot dog chains
  item('portillos-italian-beef', 'Italian Beef (regular)', "Portillo's", 'sandwiches', '1 sandwich', 610, 35, 56, 27, 1840),
  item('portillos-chicago-dog', 'Chicago-Style Hot Dog', "Portillo's", 'lunch', '1 hot dog', 330, 13, 32, 17, 1400, ['hot dog']),
  item('portillos-maxwell-polish', 'Maxwell Street Polish', "Portillo's", 'lunch', '1 sausage', 560, 20, 33, 39, 1680, ['hot dog', 'sausage']),
  item('portillos-chocolate-cake', 'Chocolate Cake (slice)', "Portillo's", 'snacks', '1 slice', 790, 7, 108, 38, 640, ['dessert']),
  item('freddys-double-steakburger', 'Original Double Steakburger', "Freddy's", 'sandwiches', '1 burger', 600, 34, 36, 36, 1340, ['burger']),
  item('freddys-california-double', 'California Style Double Steakburger', "Freddy's", 'sandwiches', '1 burger', 790, 38, 41, 52, 1550, ['burger']),
  item('freddys-fries', 'Shoestring Fries (regular)', "Freddy's", 'snacks', 'regular', 400, 4, 48, 21, 900, ['french fries']),
  item('habit-charburger-cheese', 'Charburger with Cheese', 'The Habit Burger Grill', 'sandwiches', '1 burger', 590, 27, 41, 35, 1130, ['burger']),
  item('habit-double-charburger', 'Double Charburger with Cheese', 'The Habit Burger Grill', 'sandwiches', '1 burger', 870, 47, 41, 58, 1530, ['burger']),
  item('habit-tempura-green-beans', 'Tempura Green Beans', 'The Habit Burger Grill', 'snacks', '1 order', 790, 8, 60, 58, 1400),
  item('aw-bacon-cheeseburger', 'Original Bacon Cheeseburger', 'A&W', 'sandwiches', '1 burger', 720, 36, 48, 43, 1530, ['burger']),
  item('aw-cheese-curds', 'Cheese Curds (regular)', 'A&W', 'snacks', 'regular', 570, 23, 37, 37, 1300),
  item('aw-root-beer-float', 'Root Beer Float (medium)', 'A&W', 'snacks', 'medium', 390, 4, 70, 11, 150, ['dessert', 'drink']),
  item('wienerschnitzel-chili-cheese-dog', 'Chili Cheese Dog', 'Wienerschnitzel', 'lunch', '1 hot dog', 330, 13, 26, 19, 980, ['hot dog']),
  item('wienerschnitzel-chili-dog', 'Original Chili Dog', 'Wienerschnitzel', 'lunch', '1 hot dog', 280, 10, 24, 16, 820, ['hot dog']),

  // Sit-down-style quick service
  item('boston-market-half-chicken', 'Half Rotisserie Chicken', 'Boston Market', 'dinner', '1/2 chicken', 590, 70, 2, 33, 1380),
  item('boston-market-quarter-white', '1/4 White Rotisserie Chicken', 'Boston Market', 'dinner', '1/4 chicken', 290, 45, 1, 12, 760),
  item('boston-market-mashed-potatoes', 'Mashed Potatoes (regular)', 'Boston Market', 'snacks', 'regular side', 270, 4, 32, 14, 670),
  item('boston-market-mac-cheese', 'Mac & Cheese (regular)', 'Boston Market', 'snacks', 'regular side', 300, 12, 33, 13, 900),
  item('boston-market-cornbread', 'Cornbread', 'Boston Market', 'snacks', '1 piece', 180, 2, 30, 6, 310),
  item('noodles-wisconsin-mac', 'Wisconsin Mac & Cheese (regular)', 'Noodles & Company', 'dinner', 'regular', 980, 38, 106, 44, 1500, ['pasta']),
  item('noodles-japanese-pan', 'Japanese Pan Noodles (regular)', 'Noodles & Company', 'dinner', 'regular', 650, 18, 120, 11, 1950),
  item('noodles-pesto-cavatappi', 'Pesto Cavatappi (regular)', 'Noodles & Company', 'dinner', 'regular', 810, 25, 99, 34, 1450, ['pasta']),
  item('potbelly-wreck', 'A Wreck (original)', 'Potbelly', 'sandwiches', 'original', 530, 34, 46, 23, 1880, ['sub']),
  item('potbelly-turkey', 'Turkey Breast (original)', 'Potbelly', 'sandwiches', 'original', 400, 28, 49, 10, 1220, ['sub']),
  item('potbelly-oatmeal-cookie', 'Oatmeal Chocolate Chip Cookie', 'Potbelly', 'snacks', '1 cookie', 440, 6, 64, 18, 330, ['dessert']),
  item('torchys-trailer-park', 'Trailer Park Taco', "Torchy's Tacos", 'lunch', '1 taco', 410, 18, 30, 24, 950),
  item('torchys-democrat', 'Democrat Taco (barbacoa)', "Torchy's Tacos", 'lunch', '1 taco', 300, 18, 21, 16, 640),
  item('torchys-green-chile-queso', 'Green Chile Queso & Chips', "Torchy's Tacos", 'snacks', '1 order', 840, 23, 74, 50, 1700),
  item('wawa-turkey-shorti', 'Turkey Shorti Hoagie (classic)', 'Wawa', 'sandwiches', 'shorti', 460, 28, 60, 12, 1500, ['sub', 'hoagie']),
  item('wawa-bacon-egg-cheese-sizzli', 'Bacon, Egg & Cheese Sizzli (croissant)', 'Wawa', 'breakfast', '1 sandwich', 430, 17, 25, 29, 860),

  // Wing & pizza chains
  item('bww-traditional-wings-6', 'Traditional Wings (6, no sauce)', 'Buffalo Wild Wings', 'dinner', '6 wings', 430, 43, 0, 28, 160),
  item('bww-boneless-wings-6', 'Boneless Wings (6, no sauce)', 'Buffalo Wild Wings', 'dinner', '6 wings', 360, 23, 28, 17, 1070),
  item('bww-fries', 'French Fries (regular)', 'Buffalo Wild Wings', 'snacks', 'regular', 420, 6, 55, 20, 980),
  item('bww-cheese-curds', 'Cheese Curds', 'Buffalo Wild Wings', 'snacks', '1 order', 830, 30, 52, 55, 1960),
  item('marcos-pepperoni-slice', 'Pepperoni Pizza (large, original crust)', "Marco's Pizza", 'dinner', '1 slice', 320, 13, 30, 16, 690, ['pizza']),
  item('marcos-cheezybread', 'CheezyBread', "Marco's Pizza", 'snacks', '1 piece', 120, 5, 11, 6, 230),
  item('dominos-cheese-medium-slice', 'Cheese Pizza (medium, hand tossed)', "Domino's", 'dinner', '1 slice', 200, 8, 25, 8, 380, ['pizza']),
  item('dominos-chicken-alfredo', 'Chicken Alfredo Pasta', "Domino's", 'dinner', '1 dish', 600, 27, 61, 28, 1300),
  item('dominos-boneless-chicken-8', 'Boneless Chicken (8 pc, plain)', "Domino's", 'dinner', '8 pieces', 480, 32, 40, 22, 1600, ['wings']),
  item('dominos-cinnamon-twists', 'Cinnamon Bread Twists (2)', "Domino's", 'snacks', '2 twists', 250, 4, 30, 13, 180, ['dessert']),
  item('papa-johns-garlic-sauce', 'Special Garlic Dipping Sauce', "Papa John's", 'snacks', '1 cup', 150, 0, 0, 17, 310, ['dip']),
  item('papa-johns-breadstick', 'Breadstick', "Papa John's", 'snacks', '1 stick', 140, 4, 26, 2, 260),
  item('pizzahut-meat-lovers-slice', "Meat Lover's Pizza (large, hand tossed)", 'Pizza Hut', 'dinner', '1 slice', 380, 17, 30, 21, 980, ['pizza']),
  item('pizzahut-buffalo-wings-4', 'Bone-In Wings, Buffalo Medium (4)', 'Pizza Hut', 'dinner', '4 wings', 320, 28, 2, 22, 1280),
  item('little-caesars-deep-dish-slice', 'Detroit-Style Deep Dish Pepperoni', 'Little Caesars', 'dinner', '1 slice', 370, 16, 32, 20, 650, ['pizza']),
  item('little-caesars-wings-8', 'Caesar Wings, Oven Roasted (8)', 'Little Caesars', 'dinner', '8 wings', 560, 48, 2, 40, 1520),
  item('wingstop-lemon-pepper-6', 'Classic Wings, Lemon Pepper (6)', 'Wingstop', 'dinner', '6 wings', 660, 48, 0, 51, 1230),
  item('wingstop-chicken-sandwich', 'Chicken Sandwich (Original Hot)', 'Wingstop', 'sandwiches', '1 sandwich', 690, 34, 60, 35, 2100),
  item('wingstop-ranch', 'Ranch Dip', 'Wingstop', 'snacks', '1 cup (3.25 oz)', 310, 1, 3, 33, 500, ['dip']),

  // More from chains already listed
  item('carls-spicy-chicken', 'Spicy Chicken Sandwich', "Carl's Jr.", 'sandwiches', '1 sandwich', 470, 14, 49, 24, 900),
  item('carls-fries-medium', 'Natural-Cut Fries (medium)', "Carl's Jr.", 'snacks', 'medium', 430, 6, 56, 20, 690, ['french fries']),
  item('krispy-kreme-raspberry-filled', 'Glazed Raspberry Filled Doughnut', 'Krispy Kreme', 'snacks', '1 doughnut', 300, 4, 39, 15, 150, ['donut']),
  item('krispy-kreme-kreme-filled', 'Original Filled Original Kreme', 'Krispy Kreme', 'snacks', '1 doughnut', 350, 4, 39, 20, 140, ['donut']),
  item('sweetgreen-guacamole-greens', 'Guacamole Greens', 'Sweetgreen', 'lunch', '1 bowl', 540, 32, 37, 31, 990, ['salad']),
  item('sweetgreen-chicken-pesto-parm', 'Chicken Pesto Parm', 'Sweetgreen', 'lunch', '1 bowl', 530, 41, 41, 23, 1360, ['salad']),
  item('sweetgreen-shroomami', 'Shroomami', 'Sweetgreen', 'lunch', '1 bowl', 640, 26, 54, 37, 950, ['salad', 'vegetarian']),
  item('bojangles-supremes-4', 'Chicken Supremes (4 pc)', 'Bojangles', 'dinner', '4 pieces', 600, 40, 31, 34, 1620, ['tenders']),
  item('bojangles-sausage-biscuit', 'Sausage Biscuit', 'Bojangles', 'breakfast', '1 biscuit', 470, 13, 34, 31, 1180),
  item('bojangles-seasoned-fries', 'Seasoned Fries (small)', 'Bojangles', 'snacks', 'small', 340, 4, 37, 19, 730, ['french fries']),
  item('bojangles-dirty-rice', 'Dirty Rice (individual)', 'Bojangles', 'snacks', 'individual', 170, 5, 26, 5, 590),
  item('bojangles-cajun-pintos', 'Cajun Pintos (individual)', 'Bojangles', 'snacks', 'individual', 110, 6, 18, 0.5, 520, ['beans']),
  item('panera-mac-cheese', 'Mac & Cheese (large)', 'Panera Bread', 'dinner', 'large', 960, 38, 76, 56, 2300),
  item('panera-frontega', 'Frontega Chicken Sandwich (whole)', 'Panera Bread', 'sandwiches', 'whole', 830, 46, 76, 38, 2010, ['panini']),
  item('panera-bacon-turkey-bravo', 'Bacon Turkey Bravo (whole)', 'Panera Bread', 'sandwiches', 'whole', 950, 53, 106, 35, 3050),
  item('panera-caesar-chicken', 'Caesar Salad with Chicken (whole)', 'Panera Bread', 'lunch', 'whole', 470, 39, 22, 26, 860, ['salad']),
  item('panera-fuji-apple-chicken', 'Fuji Apple Salad with Chicken (whole)', 'Panera Bread', 'lunch', 'whole', 570, 34, 32, 35, 670, ['salad']),
  item('panera-plain-bagel', 'Plain Bagel', 'Panera Bread', 'breakfast', '1 bagel', 280, 10, 56, 1.5, 460),
  item('jersey-mikes-9-club-supreme', "#9 Club Supreme (regular, Mike's Way)", "Jersey Mike's", 'sandwiches', 'regular sub', 820, 47, 52, 47, 2200, ['sub']),
  item('jersey-mikes-43-chipotle-steak', '#43 Chipotle Cheese Steak (regular)', "Jersey Mike's", 'sandwiches', 'regular sub', 880, 44, 56, 54, 1610, ['sub', 'cheesesteak']),
  item('jimmy-johns-9-italian-night-club', '#9 Italian Night Club (8")', "Jimmy John's", 'sandwiches', '8-inch sub', 880, 38, 55, 56, 2300, ['sub']),
  item('jimmy-johns-12-beach-club', '#12 Beach Club (8")', "Jimmy John's", 'sandwiches', '8-inch sub', 710, 36, 52, 40, 1500, ['sub', 'turkey']),
  item('culvers-vanilla-custard', 'Fresh Frozen Custard, Vanilla (1 scoop)', "Culver's", 'snacks', '1 scoop dish', 340, 6, 31, 20, 160, ['dessert', 'ice cream']),
  item('culvers-chicken-tenders-4', 'Chicken Tenders (4 pc)', "Culver's", 'dinner', '4 tenders', 480, 39, 30, 22, 1440),
  item('dq-reeses-blizzard-medium', "Reese's Peanut Butter Cup Blizzard (medium)", 'Dairy Queen', 'snacks', 'medium', 790, 18, 99, 34, 470, ['dessert', 'ice cream']),
  item('dq-original-cheeseburger', 'Original Cheeseburger', 'Dairy Queen', 'sandwiches', '1 burger', 400, 22, 34, 19, 920, ['burger']),
  item('shake-shack-chocolate-shake', 'Chocolate Shake', 'Shake Shack', 'snacks', '1 shake', 750, 16, 79, 41, 470, ['dessert', 'drink']),
  item('shake-shack-cheese-fries', 'Cheese Fries', 'Shake Shack', 'snacks', '1 order', 710, 12, 64, 45, 1150),
  item('sonic-cherry-limeade', 'Cherry Limeade (medium)', 'Sonic', 'snacks', 'medium', 260, 0, 70, 0, 50, ['drink']),
  item('sonic-oreo-blast', 'Oreo Sonic Blast (medium)', 'Sonic', 'snacks', 'medium', 950, 15, 117, 46, 560, ['dessert', 'ice cream']),
  item('whataburger-fries-medium', 'French Fries (medium)', 'Whataburger', 'snacks', 'medium', 420, 5, 52, 21, 270),
  item('whataburger-whatachickn', "Whatachick'n Sandwich", 'Whataburger', 'sandwiches', '1 sandwich', 580, 30, 61, 24, 1400),
  item('whataburger-honey-bbq-strip', 'Honey BBQ Chicken Strip Sandwich', 'Whataburger', 'sandwiches', '1 sandwich', 1050, 46, 101, 50, 2590),
  item('whataburger-breakfast-on-bun', 'Breakfast on a Bun (sausage)', 'Whataburger', 'breakfast', '1 sandwich', 550, 22, 32, 37, 1040),
  item('jitb-curly-fries-medium', 'Seasoned Curly Fries (medium)', 'Jack in the Box', 'snacks', 'medium', 410, 6, 47, 23, 1140),
  item('jitb-ultimate-cheeseburger', 'Ultimate Cheeseburger', 'Jack in the Box', 'sandwiches', '1 burger', 930, 50, 47, 60, 1690, ['burger']),
  item('canes-sauce', "Cane's Sauce", "Raising Cane's", 'snacks', '1 cup', 190, 0, 4, 19, 360, ['dip']),
  item('canes-caniac-combo', 'The Caniac Combo (6 fingers, fries, 2 toast, slaw, 2 sauces)', "Raising Cane's", 'dinner', '1 combo', 1880, 84, 167, 96, 3340),
  item('sbux-latte-grande', 'Caffè Latte (grande, 2% milk)', 'Starbucks', 'breakfast', '16 oz', 190, 13, 19, 7, 170, ['coffee', 'drink']),
  item('sbux-caramel-frappuccino', 'Caramel Frappuccino (grande, whipped cream)', 'Starbucks', 'snacks', '16 oz', 380, 4, 54, 16, 230, ['coffee', 'drink']),
  item('sbux-pink-drink', 'Pink Drink (grande)', 'Starbucks', 'snacks', '16 oz', 140, 1, 27, 2.5, 65, ['drink']),
  item('sbux-brown-sugar-shaken-espresso', 'Iced Brown Sugar Oatmilk Shaken Espresso (grande)', 'Starbucks', 'breakfast', '16 oz', 120, 1, 20, 3, 105, ['coffee', 'drink']),
  item('dunkin-iced-coffee-cream-sugar', 'Iced Coffee with Cream & Sugar (medium)', "Dunkin'", 'breakfast', 'medium', 260, 2, 41, 10, 50, ['coffee', 'drink']),
  item('dunkin-hot-coffee-cream-sugar', 'Hot Coffee with Cream & Sugar (medium)', "Dunkin'", 'breakfast', 'medium', 200, 2, 30, 8, 45, ['coffee', 'drink']),

  // IHOP
  item('ihop-buttermilk-pancakes-3', 'Original Buttermilk Pancakes (3)', 'IHOP', 'breakfast', '3 pancakes', 430, 12, 64, 14, 980, ['pancakes']),
  item('ihop-belgian-waffle', 'Belgian Waffle', 'IHOP', 'breakfast', '1 waffle', 590, 10, 72, 28, 780, ['waffle']),
  item('ihop-chicken-and-waffles', 'Chicken & Waffles', 'IHOP', 'breakfast', '1 platter', 1160, 37, 85, 71, 2140, ['waffle', 'fried chicken']),
  item('ihop-breakfast-sandwich', 'Bacon, Egg & Cheese Breakfast Sandwich', 'IHOP', 'breakfast', '1 sandwich', 540, 24, 38, 32, 1280),
  item('ihop-hash-browns', 'Hash Browns', 'IHOP', 'breakfast', '1 order', 220, 3, 24, 13, 430),
  item('ihop-big-steak-omelette', 'Big Steak Omelette', 'IHOP', 'breakfast', '1 omelette', 1060, 58, 22, 82, 2180),

  // Denny's
  item('dennys-grand-slam', 'Original Grand Slam', "Denny's", 'breakfast', '1 platter', 880, 46, 56, 51, 2160, ['eggs', 'pancakes']),
  item('dennys-moons-over-my-hammy', 'Moons Over My Hammy', "Denny's", 'breakfast', '1 sandwich', 1170, 57, 70, 70, 2890),
  item('dennys-super-bird', 'Super Bird', "Denny's", 'sandwiches', '1 sandwich', 640, 41, 48, 32, 1860, ['turkey']),
  item('dennys-pancake-puppies-5', 'Pancake Puppies (5)', "Denny's", 'snacks', '5 pieces', 380, 6, 54, 16, 430, ['dessert']),
  item('dennys-fit-slam', 'Fit Slam', "Denny's", 'breakfast', '1 platter', 390, 32, 31, 15, 980),

  // Waffle House
  item('waffle-house-classic-waffle', 'Classic Waffle', 'Waffle House', 'breakfast', '1 waffle', 410, 8, 48, 22, 690, ['waffle']),
  item('waffle-house-all-star', 'All-Star Special', 'Waffle House', 'breakfast', '1 platter', 1010, 42, 78, 58, 2140, ['waffle', 'eggs']),
  item('waffle-house-hashbrowns', 'Hashbrowns (scattered)', 'Waffle House', 'breakfast', '1 order', 190, 3, 23, 10, 360),
  item('waffle-house-cheesesteak', 'Cheesesteak Melt', 'Waffle House', 'sandwiches', '1 sandwich', 680, 32, 42, 41, 1620),
  item('waffle-house-bacon-egg-cheese', 'Bacon, Egg & Cheese Sandwich', 'Waffle House', 'breakfast', '1 sandwich', 430, 19, 28, 26, 980),

  // Olive Garden
  item('olive-garden-breadstick', 'Breadstick', 'Olive Garden', 'snacks', '1 stick', 140, 4, 25, 2.5, 400),
  item('olive-garden-house-salad', 'House Salad with Signature Italian Dressing', 'Olive Garden', 'lunch', '1 salad', 350, 6, 21, 27, 1110, ['salad']),
  item('olive-garden-fettuccine-alfredo', 'Fettuccine Alfredo', 'Olive Garden', 'dinner', '1 entrée', 1220, 32, 96, 75, 1350, ['pasta']),
  item('olive-garden-chicken-alfredo', 'Chicken Alfredo', 'Olive Garden', 'dinner', '1 entrée', 1480, 81, 96, 88, 2010, ['pasta']),
  item('olive-garden-lasagna', 'Lasagna Classico', 'Olive Garden', 'dinner', '1 entrée', 940, 58, 65, 53, 1990, ['pasta']),
  item('olive-garden-chicken-parm', 'Chicken Parmigiana', 'Olive Garden', 'dinner', '1 entrée', 1060, 65, 79, 52, 2940),
  item('olive-garden-zuppa-toscana', 'Zuppa Toscana (bowl)', 'Olive Garden', 'lunch', '1 bowl', 220, 7, 15, 15, 790, ['soup']),

  // Chili's
  item('chilis-classic-bacon-burger', 'Classic Bacon Burger', "Chili's", 'sandwiches', '1 burger', 1410, 64, 55, 104, 2210, ['burger']),
  item('chilis-baby-back-ribs-full', 'Original Baby Back Ribs (full rack)', "Chili's", 'dinner', 'full rack', 1610, 107, 46, 109, 4130, ['ribs']),
  item('chilis-chicken-crispers', 'Crispy Chicken Crispers', "Chili's", 'dinner', '1 order', 1130, 52, 76, 68, 2680, ['tenders']),
  item('chilis-southwestern-eggrolls', 'Southwestern Eggrolls', "Chili's", 'snacks', '1 order', 800, 26, 78, 42, 1860),
  item('chilis-quesadilla-explosion', 'Quesadilla Explosion Salad', "Chili's", 'lunch', '1 salad', 1270, 63, 64, 87, 2230, ['salad']),
  item('chilis-molten-cake', 'Molten Chocolate Cake', "Chili's", 'snacks', '1 cake', 1160, 12, 145, 61, 530, ['dessert']),

  // Applebee's
  item('applebees-neighborhood-nachos', 'Neighborhood Nachos with Chicken', "Applebee's", 'dinner', '1 order', 1450, 72, 104, 82, 3320, ['nachos']),
  item('applebees-bourbon-street', 'Bourbon Street Chicken & Shrimp', "Applebee's", 'dinner', '1 entrée', 620, 45, 48, 27, 2320),
  item('applebees-boneless-wings-8', 'Boneless Wings (8, classic buffalo)', "Applebee's", 'dinner', '8 wings', 620, 36, 38, 34, 2480, ['chicken wings']),
  item('applebees-classic-combo', 'Classic Combo (ribs & chicken tenders)', "Applebee's", 'dinner', '1 combo', 1390, 70, 86, 82, 3480),
  item('applebees-brew-pub-pretzels', 'Brew Pub Pretzels & Beer Cheese Dip', "Applebee's", 'snacks', '1 order', 1090, 32, 109, 58, 3010),

  // The Cheesecake Factory
  item('cheesecake-factory-original', 'Original Cheesecake (slice)', 'The Cheesecake Factory', 'snacks', '1 slice', 830, 13, 66, 57, 560, ['dessert']),
  item('cheesecake-factory-avocado-rolls', 'Avocado Egg Rolls', 'The Cheesecake Factory', 'snacks', '1 order', 930, 12, 73, 66, 980),
  item('cheesecake-factory-burger', 'The Factory Burger', 'The Cheesecake Factory', 'sandwiches', '1 burger', 1440, 62, 69, 104, 1860, ['burger']),
  item('cheesecake-factory-chicken-madeira', 'Chicken Madeira', 'The Cheesecake Factory', 'dinner', '1 entrée', 1240, 78, 48, 80, 1680),
  item('cheesecake-factory-caesar', 'Caesar Salad', 'The Cheesecake Factory', 'lunch', '1 salad', 860, 16, 28, 76, 1320, ['salad']),

  // Cook Out
  item('cookout-regular-burger', 'Regular Burger', 'Cook Out', 'sandwiches', '1 burger', 330, 17, 30, 16, 580, ['burger']),
  item('cookout-style-burger', 'Cook Out Style Burger', 'Cook Out', 'sandwiches', '1 burger', 530, 24, 32, 35, 980, ['burger']),
  item('cookout-bbq-sandwich', 'Barbecue Sandwich', 'Cook Out', 'sandwiches', '1 sandwich', 380, 22, 42, 13, 920),
  item('cookout-nuggets-5', 'Chicken Nuggets (5 pc)', 'Cook Out', 'lunch', '5 pieces', 240, 13, 14, 14, 480, ['nuggets']),
  item('cookout-cajun-fries', 'Cajun Fries (regular)', 'Cook Out', 'snacks', 'regular', 280, 4, 36, 13, 620, ['french fries']),
  item('cookout-huge-milkshake', 'Huge Milkshake (chocolate)', 'Cook Out', 'snacks', 'huge', 760, 14, 112, 28, 380, ['dessert', 'shake']),

  // The Halal Guys
  item('halal-guys-chicken-over-rice', 'Chicken Over Rice (regular)', 'The Halal Guys', 'lunch', '1 platter', 860, 42, 82, 38, 1860, ['halal', 'gyro']),
  item('halal-guys-gyro-over-rice', 'Gyro Over Rice (regular)', 'The Halal Guys', 'lunch', '1 platter', 890, 38, 82, 43, 1940, ['halal', 'gyro']),
  item('halal-guys-falafel-sandwich', 'Falafel Sandwich', 'The Halal Guys', 'sandwiches', '1 sandwich', 700, 18, 92, 28, 1280, ['halal', 'vegetarian']),
  item('halal-guys-white-sauce', 'White Sauce (2 oz)', 'The Halal Guys', 'snacks', '2 oz', 180, 1, 3, 18, 240, ['dip']),

  // Smashburger
  item('smashburger-classic', 'Classic Smashburger', 'Smashburger', 'sandwiches', '1 burger', 570, 29, 37, 34, 1210, ['burger']),
  item('smashburger-spicy-baja', 'Spicy Baja Burger', 'Smashburger', 'sandwiches', '1 burger', 680, 32, 39, 43, 1480, ['burger']),
  item('smashburger-smashfries', 'Smashfries', 'Smashburger', 'snacks', '1 order', 450, 5, 52, 24, 780, ['french fries']),

  // MOD Pizza
  item('mod-pizza-cheese-medium', 'Create Your Own Cheese Pizza (medium)', 'MOD Pizza', 'dinner', '1 pizza', 720, 32, 84, 28, 1560, ['pizza']),
  item('mod-pizza-pepperoni-medium', 'Pepperoni Madness (medium)', 'MOD Pizza', 'dinner', '1 pizza', 880, 40, 84, 42, 2140, ['pizza']),
  item('mod-pizza-caesar', 'Caesar Salad', 'MOD Pizza', 'lunch', '1 salad', 410, 10, 16, 34, 820, ['salad']),

  // McAlister's Deli
  item('mcalisters-club', "McAlister's Club", "McAlister's Deli", 'sandwiches', '1 sandwich', 870, 48, 68, 44, 2140, ['club']),
  item('mcalisters-sweet-tea-32', 'Famous Sweet Tea (32 oz)', "McAlister's Deli", 'snacks', '32 oz', 280, 0, 72, 0, 15, ['drink', 'tea']),
  item('mcalisters-spud-soup', 'Spud Soup (bowl)', "McAlister's Deli", 'lunch', '1 bowl', 440, 10, 38, 27, 1180, ['soup']),
  item('mcalisters-garden-salad', 'Garden Salad', "McAlister's Deli", 'lunch', '1 salad', 80, 4, 12, 2, 160, ['salad']),

  // Jason's Deli
  item('jasons-deli-club', 'Club Sandwich', "Jason's Deli", 'sandwiches', '1 sandwich', 780, 46, 58, 38, 1860, ['club']),
  item('jasons-deli-turkey-wrap', 'Turkey Wrap', "Jason's Deli", 'sandwiches', '1 wrap', 520, 32, 48, 20, 1420),
  item('jasons-deli-veggie-soup', 'Organic Vegetable Soup (cup)', "Jason's Deli", 'lunch', '1 cup', 90, 3, 16, 1.5, 640, ['soup']),

  // La Granja (Peruvian pollo a la brasa; also searched as Lagrandra / La Granja)
  // Chain does not publish a nutrition PDF; values are typical for these platters (USDA rotisserie chicken + common sides).
  item('la-granja-quarter-chicken', '1/4 Chicken (Pollo a la Brasa)', 'La Granja', 'dinner', '1/4 chicken', 320, 35, 1, 19, 720, ['lagrandra', 'lagranja', 'pollo a la brasa', 'peruvian', 'rotisserie chicken']),
  item('la-granja-quarter-rice-beans', '1/4 Chicken with Rice & Beans', 'La Granja', 'lunch', '1 platter', 700, 48, 68, 27, 1540, ['lagrandra', 'lagranja', 'pollo a la brasa', 'peruvian', 'lunch special']),
  item('la-granja-quarter-special', '1/4 Chicken Special (rice, beans, plantains)', 'La Granja', 'lunch', '1 platter', 930, 50, 111, 32, 1540, ['lagrandra', 'lagranja', 'pollo a la brasa', 'peruvian']),
  item('la-granja-half-chicken', '1/2 Chicken (Pollo a la Brasa)', 'La Granja', 'dinner', '1/2 chicken', 640, 67, 1, 38, 1160, ['lagrandra', 'lagranja', 'pollo a la brasa', 'peruvian']),
  item('la-granja-half-special', '1/2 Chicken Special (rice, beans, plantains)', 'La Granja', 'dinner', '1 platter', 1250, 82, 111, 51, 1980, ['lagrandra', 'lagranja', 'pollo a la brasa', 'peruvian']),
  item('la-granja-whole-chicken', 'Whole Chicken (Pollo a la Brasa)', 'La Granja', 'dinner', '1 whole chicken', 1280, 134, 2, 76, 2320, ['lagrandra', 'lagranja', 'pollo a la brasa', 'peruvian']),
  item('la-granja-boneless-plate', 'Grilled Boneless Chicken (rice, beans, plantains)', 'La Granja', 'dinner', '1 platter', 850, 74, 120, 19, 1680, ['lagrandra', 'lagranja', 'peruvian']),
  item('la-granja-chicken-bowl', 'Chicken Super Bowl (rice, beans, corn, plantains)', 'La Granja', 'lunch', '1 bowl', 780, 46, 92, 24, 1620, ['lagrandra', 'lagranja', 'peruvian', 'bowl']),
  item('la-granja-aji-de-gallina', 'Aji de Gallina', 'La Granja', 'dinner', '1 plate', 680, 38, 52, 32, 1240, ['lagrandra', 'lagranja', 'peruvian']),
  item('la-granja-popcorn-chicken', 'Popcorn Chicken (Chicharrón de Pollo)', 'La Granja', 'lunch', '1 order', 410, 32, 22, 22, 980, ['lagrandra', 'lagranja', 'peruvian', 'chicharron']),
  item('la-granja-chicken-wrap', 'Chicken Wrap with Rice & Beans', 'La Granja', 'lunch', '1 wrap + side', 720, 38, 78, 26, 1680, ['lagrandra', 'lagranja', 'peruvian']),
  item('la-granja-wings', 'Chicken Wings', 'La Granja', 'dinner', '1 order', 520, 38, 8, 36, 1420, ['lagrandra', 'lagranja', 'chicken wings', 'peruvian']),
  item('la-granja-churrasco', 'Grilled Steak, 1/2 lb (Churrasco)', 'La Granja', 'dinner', '1/2 lb', 480, 42, 2, 32, 780, ['lagrandra', 'lagranja', 'peruvian', 'steak']),
  item('la-granja-white-rice', 'White Rice', 'La Granja', 'snacks', '1 side', 200, 4, 40, 3, 420, ['lagrandra', 'lagranja', 'peruvian']),
  item('la-granja-black-beans', 'Black Beans', 'La Granja', 'snacks', '1 side', 180, 9, 27, 5, 400, ['lagrandra', 'lagranja', 'peruvian']),
  item('la-granja-plantains', 'Sweet Plantains (Maduros)', 'La Granja', 'snacks', '1 side', 230, 2, 43, 5, 10, ['lagrandra', 'lagranja', 'maduros', 'peruvian']),
  item('la-granja-tostones', 'Tostones', 'La Granja', 'snacks', '1 side', 280, 2, 38, 14, 220, ['lagrandra', 'lagranja', 'plantains', 'peruvian']),
  item('la-granja-fries', 'French Fries', 'La Granja', 'snacks', '1 side', 360, 4, 46, 18, 480, ['lagrandra', 'lagranja', 'french fries']),
];
