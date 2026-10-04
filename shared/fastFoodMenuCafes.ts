import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Bolay, extra Firehouse / Texas Roadhouse, and coffee-house drinks.
 * Firehouse medium wheat values are the 2025 nutrition chart; fat is from Atwater
 * when the chart omits it. Texas Roadhouse uses the Nutritionix portal Texas Roadhouse
 * publishes. Bolay chef bols are summed from Bolay's published ingredient guide.
 * Scooter's and 7 Brew use each chain's official nutrition PDF. Peet's values are
 * the small sizes posted on peets.com.
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

export const CAFE_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // Bolay Fresh Bold Kitchen — chef bols summed from published ingredients
  item('bolay-lemon-chicken', 'Lemon Chicken Bol (standard)', 'Bolay', 'dinner', '1 chef bol', 840, 36, 86, 40, 2160, ['bowl', 'florida']),
  item('bolay-teriyaki-chicken', 'Teriyaki Chicken Bol (standard)', 'Bolay', 'dinner', '1 chef bol', 840, 29, 80, 43, 1720, ['bowl']),
  item('bolay-garlic-steak', 'Garlic Pepper Steak Bol (standard)', 'Bolay', 'dinner', '1 chef bol', 750, 40, 55, 42, 1400, ['bowl', 'steak']),
  item('bolay-salmon', 'Roasted Salmon Bol (standard)', 'Bolay', 'dinner', '1 chef bol', 730, 38, 63, 37, 1260, ['bowl', 'fish']),
  item('bolay-miso-tofu', 'Miso Tofu Bol (standard)', 'Bolay', 'dinner', '1 chef bol', 820, 19, 76, 46, 1840, ['bowl', 'vegetarian']),
  item('bolay-lemon-chicken-protein', 'Lemon Chicken (protein only)', 'Bolay', 'lunch', '1 serving', 180, 22, 0, 10, 450, ['add-on']),
  item('bolay-grilled-chicken', 'Simply Grilled Chicken (protein only)', 'Bolay', 'lunch', '1 serving', 250, 26, 0, 16, 510, ['add-on']),
  item('bolay-steak-protein', 'Signature Steak (protein only)', 'Bolay', 'lunch', '1 serving', 170, 24, 3, 7, 410, ['add-on', 'steak']),
  item('bolay-salmon-protein', 'Roasted Coho Salmon (protein only)', 'Bolay', 'lunch', '1 serving', 241, 25, 2, 15, 380, ['add-on', 'fish']),
  item('bolay-tofu-protein', 'Miso Glazed Tofu (protein only)', 'Bolay', 'lunch', '1 serving', 139, 12, 2, 6, 420, ['add-on', 'vegetarian']),
  item('bolay-jasmine-rice', 'Jasmine Rice (base)', 'Bolay', 'snacks', '1 base', 225, 5, 40, 5, 315, ['side']),
  item('bolay-pesto-noodles', 'Pesto Noodles (base)', 'Bolay', 'snacks', '1 base', 183, 3, 29, 6, 535, ['side', 'noodles']),
  item('bolay-black-rice', 'Forbidden Black Rice (base)', 'Bolay', 'snacks', '1 base', 160, 5, 24, 5, 430, ['side']),
  item('bolay-cauli-rice', 'Cauliflower Rice (base)', 'Bolay', 'snacks', '1 base', 90, 3, 7, 5, 360, ['side']),
  item('bolay-kale', 'Chopped Kale Salad (base)', 'Bolay', 'lunch', '1 base', 135, 2, 9, 10, 280, ['salad']),
  item('bolay-herb-pesto', 'Herb Pesto Sauce', 'Bolay', 'snacks', '1 sauce', 107, 1, 6, 9, 350, ['sauce']),
  item('bolay-ginger-turmeric', 'Ginger Turmeric Sauce', 'Bolay', 'snacks', '1 sauce', 220, 0, 10, 20, 390, ['sauce']),
  item('bolay-creamy-garlic', 'Creamy Garlic & Herb Sauce', 'Bolay', 'snacks', '1 sauce', 150, 0, 2, 16, 170, ['sauce']),
  item('bolay-avocado', 'Fresh Avocado', 'Bolay', 'snacks', '1 topping', 86, 1, 4, 8, 170, ['topping']),

  // Firehouse Subs — extra medium wheat items (2025 chart; fat from Atwater)
  item('firehouse-chicken', 'Chicken (medium, wheat)', 'Firehouse Subs', 'sandwiches', 'medium sub', 680, 37, 55, 35, 1840, ['sub']),
  item('firehouse-engine-company', 'Engine Company (medium, wheat)', 'Firehouse Subs', 'sandwiches', 'medium sub', 690, 36, 57, 35, 1840, ['sub']),
  item('firehouse-chicken-salad', 'Chicken Salad (medium, wheat)', 'Firehouse Subs', 'sandwiches', 'medium sub', 810, 34, 60, 48, 1460, ['sub']),
  item('firehouse-ham', 'Ham (medium, wheat)', 'Firehouse Subs', 'sandwiches', 'medium sub', 730, 37, 71, 33, 1720, ['sub']),
  item('firehouse-hero', 'Hero (medium, wheat)', 'Firehouse Subs', 'sandwiches', 'medium sub', 770, 48, 65, 35, 2260, ['sub']),
  item('firehouse-roast-beef', 'Roast Beef (medium, wheat)', 'Firehouse Subs', 'sandwiches', 'medium sub', 700, 39, 55, 36, 1910, ['sub']),
  item('firehouse-steak-cheese', 'Steak & Cheese (medium, wheat)', 'Firehouse Subs', 'sandwiches', 'medium sub', 760, 38, 56, 43, 1810, ['sub', 'philly']),
  item('firehouse-tuna', 'Tuna Salad (medium, wheat)', 'Firehouse Subs', 'sandwiches', 'medium sub', 990, 36, 67, 64, 1700, ['sub']),
  item('firehouse-turkey-bacon-ranch', 'Turkey Bacon Ranch (medium, wheat)', 'Firehouse Subs', 'sandwiches', 'medium sub', 840, 42, 60, 48, 2330, ['sub']),
  item('firehouse-veggie', 'Veggie (medium, wheat)', 'Firehouse Subs', 'sandwiches', 'medium sub', 710, 25, 60, 41, 1610, ['sub', 'vegetarian']),
  item('firehouse-hook-ladder-lg', 'Hook & Ladder (large, wheat)', 'Firehouse Subs', 'sandwiches', 'large sub', 1150, 64, 108, 51, 2810, ['sub']),
  item('firehouse-chief-chicken', "Chief's Salad with Chicken", 'Firehouse Subs', 'lunch', '1 salad', 370, 38, 17, 17, 1210, ['salad']),
  item('firehouse-chief-turkey', "Chief's Salad with Turkey", 'Firehouse Subs', 'lunch', '1 salad', 350, 38, 19, 14, 1230, ['salad']),
  item('firehouse-cookie-chip', 'Chocolate Chip Cookie', 'Firehouse Subs', 'snacks', '1 cookie', 290, 4, 52, 7, 160, ['dessert']),
  item('firehouse-chili', 'Chili', 'Firehouse Subs', 'lunch', '1 serving', 340, 20, 25, 18, 960, ['soup']),

  // Texas Roadhouse — Nutritionix portal (entrées without sides unless named)
  item('txrh-sirloin-8', 'USDA Choice Sirloin (8 oz)', 'Texas Roadhouse', 'dinner', '8 oz', 340, 61, 5, 8, 740, ['steak']),
  item('txrh-sirloin-11', 'USDA Choice Sirloin (11 oz)', 'Texas Roadhouse', 'dinner', '11 oz', 460, 84, 6, 11, 1020, ['steak']),
  item('txrh-ny-strip-12', 'New York Strip (12 oz)', 'Texas Roadhouse', 'dinner', '12 oz', 640, 85, 1, 33, 980, ['steak']),
  item('txrh-filet-6', 'Dallas Filet (6 oz)', 'Texas Roadhouse', 'dinner', '6 oz', 270, 45, 6, 10, 720, ['steak']),
  item('txrh-ribs-half', 'Fall-Off-The-Bone Ribs (half slab)', 'Texas Roadhouse', 'dinner', 'half slab', 900, 72, 9, 63, 1400, ['ribs', 'bbq']),
  item('txrh-country-fried-chicken', 'Country Fried Chicken', 'Texas Roadhouse', 'dinner', '1 entrée', 770, 48, 45, 44, 1460),
  item('txrh-salmon-8', 'Grilled Salmon (8 oz)', 'Texas Roadhouse', 'dinner', '8 oz', 560, 45, 2, 42, 950, ['fish']),
  item('txrh-cheeseburger', 'All-American Cheeseburger', 'Texas Roadhouse', 'sandwiches', '1 burger', 880, 50, 48, 55, 1970, ['burger']),
  item('txrh-bacon-cheeseburger', 'Bacon Cheeseburger', 'Texas Roadhouse', 'sandwiches', '1 burger', 980, 59, 48, 62, 2410, ['burger']),
  item('txrh-pulled-pork-sandwich', 'Pulled Pork Sandwich', 'Texas Roadhouse', 'sandwiches', '1 sandwich', 870, 68, 62, 40, 1220, ['bbq']),
  item('txrh-mashed', 'Mashed Potatoes', 'Texas Roadhouse', 'snacks', '1 side', 260, 3, 24, 17, 330),
  item('txrh-baked-potato', 'Baked Potato', 'Texas Roadhouse', 'snacks', '1 potato', 380, 7, 60, 13, 1950),
  item('txrh-mac-cheese', 'Mac and Cheese', 'Texas Roadhouse', 'snacks', '1 side', 380, 17, 37, 18, 450),
  item('txrh-green-beans', 'Green Beans', 'Texas Roadhouse', 'snacks', '1 side', 100, 6, 13, 3.5, 1070),
  item('txrh-sweet-potato', 'Sweet Potato', 'Texas Roadhouse', 'snacks', '1 potato', 350, 6, 62, 9, 105),
  item('txrh-seasoned-rice', 'Seasoned Rice', 'Texas Roadhouse', 'snacks', '1 side', 360, 6, 47, 15, 1430),
  item('txrh-cactus', 'Cactus Blossom', 'Texas Roadhouse', 'snacks', '1 appetizer', 2250, 25, 236, 135, 5000, ['appetizer']),
  item('txrh-rattlesnake', 'Rattlesnake Bites', 'Texas Roadhouse', 'snacks', '1 order', 560, 25, 34, 36, 1430, ['appetizer']),

  // Peet's Coffee — small sizes from peets.com
  item('peets-vanilla-latte', 'Vanilla Latte (small)', "Peet's Coffee", 'breakfast', 'small', 240, 11, 37, 5, 150, ['coffee', 'drink']),
  item('peets-iced-vanilla-latte', 'Iced Vanilla Latte (small)', "Peet's Coffee", 'breakfast', 'small', 160, 6, 27, 3, 80, ['coffee', 'drink']),
  item('peets-skinny-vanilla-latte', 'Skinny Vanilla Latte (small)', "Peet's Coffee", 'breakfast', 'small', 120, 11, 22, 4.5, 150, ['coffee', 'drink']),
  item('peets-drip', 'House Blend Coffee (medium)', "Peet's Coffee", 'breakfast', 'medium', 5, 0, 0, 0, 10, ['coffee', 'drink']),
  item('peets-cappuccino', 'Cappuccino (small)', "Peet's Coffee", 'breakfast', 'small', 80, 5, 8, 3, 70, ['coffee', 'drink']),
  item('peets-mocha', 'Caffè Mocha (small)', "Peet's Coffee", 'snacks', 'small', 280, 10, 40, 9, 140, ['coffee', 'drink']),

  // Scooter's Coffee — official nutrition PDF, medium 16 oz hot unless noted
  item('scooters-caramel-latte', 'Caramel Latte (medium, hot)', "Scooter's Coffee", 'breakfast', '16 oz', 260, 10, 39, 6, 150, ['coffee', 'drink']),
  item('scooters-vanilla-latte', 'Vanilla Latte (medium, hot)', "Scooter's Coffee", 'breakfast', '16 oz', 260, 10, 39, 6, 150, ['coffee', 'drink']),
  item('scooters-latte-small', 'Caramel Latte (small, hot)', "Scooter's Coffee", 'breakfast', '12 oz', 200, 8, 30, 5, 125, ['coffee', 'drink']),
  item('scooters-latte-large', 'Caramel Latte (large, hot)', "Scooter's Coffee", 'breakfast', '20 oz', 310, 12, 48, 7, 180, ['coffee', 'drink']),
  item('scooters-shooter', 'Scooter Shooter (medium)', "Scooter's Coffee", 'breakfast', '16 oz', 10, 1, 1, 0, 20, ['coffee', 'drink']),
  item('scooters-iced-chai', 'Chai Latte (small, iced)', "Scooter's Coffee", 'snacks', '16 oz', 230, 7, 41, 4, 105, ['tea', 'drink']),

  // 7 Brew — official nutrition-guide.pdf (medium iced unless noted)
  item('7brew-blondie-iced', 'Blondie Breve (medium, iced)', '7 Brew', 'snacks', 'medium iced', 480, 8, 44, 26, 150, ['coffee', 'drink']),
  item('7brew-blondie-hot', 'Blondie Breve (medium, hot)', '7 Brew', 'snacks', 'medium hot', 610, 10, 59, 32, 200, ['coffee', 'drink']),
  item('7brew-sf-blondie-iced', 'Sugar-Free Blondie Breve (medium, iced)', '7 Brew', 'snacks', 'medium iced', 400, 8, 28, 26, 170, ['coffee', 'drink']),
  item('7brew-americano', 'Americano (medium)', '7 Brew', 'breakfast', 'medium', 5, 0, 0, 0, 10, ['coffee', 'drink']),
  item('7brew-cold-brew', 'Cold Brew (medium)', '7 Brew', 'breakfast', 'medium', 20, 1, 2, 0, 15, ['coffee', 'drink']),
  item('7brew-brunette-iced', 'Brunette Mocha (medium, iced)', '7 Brew', 'snacks', 'medium iced', 370, 13, 58, 11, 170, ['coffee', 'drink']),

  // Caribou Coffee
  item('caribou-latte-small', 'Latte (small, hot)', 'Caribou Coffee', 'breakfast', 'small', 140, 10, 13, 5, 140, ['coffee', 'drink']),
  item('caribou-latte-medium', 'Latte (medium, hot)', 'Caribou Coffee', 'breakfast', 'medium', 190, 13, 18, 7, 180, ['coffee', 'drink']),
  item('caribou-mocha-medium', 'Mocha (medium, hot)', 'Caribou Coffee', 'snacks', 'medium', 330, 12, 48, 10, 180, ['coffee', 'drink']),
  item('caribou-cold-press', 'Cold Press (medium)', 'Caribou Coffee', 'breakfast', 'medium', 5, 0, 0, 0, 10, ['coffee', 'drink']),

  // The Coffee Bean & Tea Leaf
  item('cbtl-latte', 'Caffè Latte (medium)', 'The Coffee Bean & Tea Leaf', 'breakfast', '16 oz', 190, 10, 18, 7, 150, ['coffee', 'drink']),
  item('cbtl-ice-blended-mocha', 'Ice Blended Mocha (medium)', 'The Coffee Bean & Tea Leaf', 'snacks', '16 oz', 430, 8, 68, 14, 220, ['coffee', 'drink']),
  item('cbtl-ice-blended-vanilla', 'Ice Blended Vanilla (medium)', 'The Coffee Bean & Tea Leaf', 'snacks', '16 oz', 400, 6, 72, 10, 180, ['coffee', 'drink']),
  item('cbtl-chai', 'Chai Tea Latte (medium)', 'The Coffee Bean & Tea Leaf', 'breakfast', '16 oz', 240, 7, 42, 5, 120, ['tea', 'drink']),
];
