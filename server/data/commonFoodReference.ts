/**
 * Everyday foods with reference nutrition and real portion weights.
 *
 * Values are per 100 g of the food as eaten (cooked grains, beans and meats; raw fruit).
 * Sources: USDA FoodData Central (SR Legacy / FNDDS) unless marked 'label' (the US package
 * label of the leading product) or 'recipe' (a standard build from USDA ingredients).
 */

type Source = 'usda' | 'label' | 'recipe';
// calories, protein, carbs, fat, fiber, sugar
type Macros = [number, number, number, number, number?, number?];

export interface CommonFood {
  name: string;
  aliases: string[];
  per100g: { calories: number; protein: number; carbs: number; fat: number; fiber?: number; sugar?: number };
  /** Grams for one of each unit. "each" is used for a bare count ("2 eggs"). */
  portions: Record<string, number>;
  /** Shown for a bare count, e.g. "2 large" for eggs. */
  eachLabel?: string;
  liquid?: boolean;
  source: Source;
}

function food(
  name: string,
  aliases: string[],
  [calories, protein, carbs, fat, fiber, sugar]: Macros,
  portions: Record<string, number>,
  options: { eachLabel?: string; liquid?: boolean; source?: Source } = {},
): CommonFood {
  return {
    name,
    aliases: [name.toLowerCase(), ...aliases],
    per100g: { calories, protein, carbs, fat, ...(fiber !== undefined ? { fiber } : {}), ...(sugar !== undefined ? { sugar } : {}) },
    portions,
    eachLabel: options.eachLabel,
    liquid: options.liquid,
    source: options.source || 'usda',
  };
}

const drink = (options: { source?: Source } = {}) => ({ liquid: true, ...options });
const SODA_PORTIONS = { can: 355, bottle: 591, cup: 240, glass: 240, serving: 355, small: 473, medium: 621, large: 887 };
const COFFEE_DRINK_PORTIONS = { each: 355, cup: 240, mug: 355, small: 355, medium: 473, large: 591, serving: 355 };
const NUT_PORTIONS = { serving: 28.35, handful: 28.35 };

export const COMMON_FOODS: CommonFood[] = [
  // ---------- Fruit (raw) ----------
  food('Apple', ['apples', 'red apple', 'green apple', 'gala apple', 'fuji apple', 'honeycrisp apple', 'granny smith apple'], [52, 0.3, 13.8, 0.2, 2.4, 10.4], { each: 182, small: 149, large: 223, cup: 109, slice: 14 }, { eachLabel: 'medium' }),
  food('Banana', ['bananas'], [89, 1.1, 22.8, 0.3, 2.6, 12.2], { each: 118, small: 101, large: 136, 'extra large': 152, cup: 150 }, { eachLabel: 'medium' }),
  food('Orange', ['oranges', 'navel orange'], [47, 0.9, 11.8, 0.1, 2.4, 9.4], { each: 131, small: 96, large: 184, cup: 180 }, { eachLabel: 'medium' }),
  food('Clementine', ['clementines', 'cutie', 'cuties', 'halo', 'halos'], [47, 0.9, 12, 0.2, 1.7, 9.2], { each: 74 }),
  food('Tangerine', ['tangerines', 'mandarin', 'mandarins', 'mandarin orange'], [53, 0.8, 13.3, 0.3, 1.8, 10.6], { each: 88, cup: 195 }),
  food('Grapefruit', ['grapefruits', 'pink grapefruit'], [42, 0.8, 10.7, 0.1, 1.6, 6.9], { each: 246, half: 123, cup: 230 }),
  food('Pear', ['pears'], [57, 0.4, 15.2, 0.1, 3.1, 9.8], { each: 178, small: 148, large: 230, cup: 140 }, { eachLabel: 'medium' }),
  food('Peach', ['peaches'], [39, 0.9, 9.5, 0.3, 1.5, 8.4], { each: 150, small: 130, large: 175, cup: 154 }, { eachLabel: 'medium' }),
  food('Plum', ['plums'], [46, 0.7, 11.4, 0.3, 1.4, 9.9], { each: 66, cup: 165 }),
  food('Nectarine', ['nectarines'], [44, 1.1, 10.6, 0.3, 1.7, 7.9], { each: 142, cup: 143 }, { eachLabel: 'medium' }),
  food('Kiwi', ['kiwis', 'kiwifruit', 'kiwi fruit'], [61, 1.1, 14.7, 0.5, 3, 9], { each: 69, cup: 180 }),
  food('Mango', ['mangos', 'mangoes'], [60, 0.8, 15, 0.4, 1.6, 13.7], { each: 336, cup: 165, slice: 40 }),
  food('Pineapple', ['pineapple chunks'], [50, 0.5, 13.1, 0.1, 1.4, 9.9], { cup: 165, slice: 84, serving: 165 }),
  food('Watermelon', [], [30, 0.6, 7.6, 0.2, 0.4, 6.2], { cup: 152, wedge: 286, slice: 286, serving: 152 }),
  food('Cantaloupe', ['cantaloupe melon'], [34, 0.8, 8.2, 0.2, 0.9, 7.9], { cup: 160, wedge: 69, half: 276, each: 552, serving: 160 }),
  food('Honeydew', ['honeydew melon'], [36, 0.5, 9.1, 0.1, 0.8, 8.1], { cup: 170, wedge: 125, serving: 170 }),
  food('Strawberries', ['strawberry'], [32, 0.7, 7.7, 0.3, 2, 4.9], { each: 12, small: 7, large: 18, cup: 152, serving: 152, handful: 85 }),
  food('Blueberries', ['blueberry'], [57, 0.7, 14.5, 0.3, 2.4, 10], { cup: 148, serving: 148, handful: 40, each: 1.4 }),
  food('Raspberries', ['raspberry'], [52, 1.2, 11.9, 0.7, 6.5, 4.4], { cup: 123, serving: 123, handful: 40, each: 2 }),
  food('Blackberries', ['blackberry'], [43, 1.4, 9.6, 0.5, 5.3, 4.9], { cup: 144, serving: 144, handful: 45, each: 5 }),
  food('Grapes', ['grape', 'red grapes', 'green grapes', 'seedless grapes'], [69, 0.7, 18.1, 0.2, 0.9, 15.5], { cup: 151, serving: 151, handful: 50, each: 5 }),
  food('Cherries', ['cherry', 'sweet cherries'], [63, 1.1, 16, 0.2, 2.1, 12.8], { cup: 138, serving: 138, handful: 50, each: 8 }),
  food('Avocado', ['avocados', 'hass avocado'], [160, 2, 8.5, 14.7, 6.7, 0.7], { each: 150, half: 75, small: 136, large: 201, cup: 150, slice: 15, tbsp: 15 }),
  food('Medjool Dates', ['dates', 'date', 'medjool date'], [277, 1.8, 75, 0.2, 6.7, 66], { each: 24, cup: 147 }),
  food('Raisins', ['raisin'], [299, 3.1, 79.2, 0.5, 3.7, 59.2], { cup: 145, tbsp: 9, box: 43, package: 43, serving: 40, handful: 40 }),
  food('Applesauce', ['unsweetened applesauce', 'apple sauce'], [42, 0.2, 11.3, 0.1, 1.1, 9.4], { cup: 244, container: 113, serving: 122 }),

  // ---------- Vegetables ----------
  food('Broccoli', ['steamed broccoli', 'cooked broccoli', 'boiled broccoli', 'broccoli florets'], [35, 2.4, 7.2, 0.4, 3.3, 1.4], { cup: 156, spear: 37, serving: 78 }),
  food('Raw Broccoli', [], [34, 2.8, 6.6, 0.4, 2.6, 1.7], { cup: 91, spear: 31, serving: 91 }),
  food('Carrot', ['carrots', 'raw carrots', 'raw carrot', 'carrot sticks'], [41, 0.9, 9.6, 0.2, 2.8, 4.7], { each: 61, small: 50, large: 72, cup: 128, serving: 128 }, { eachLabel: 'medium' }),
  food('Baby Carrots', ['baby carrot'], [35, 0.6, 8.2, 0.1, 2.9, 4.8], { each: 10, cup: 128, serving: 85, handful: 50 }),
  food('Cooked Carrots', ['steamed carrots', 'boiled carrots', 'roasted carrots'], [35, 0.8, 8.2, 0.2, 3, 3.5], { cup: 156, serving: 78 }),
  food('Spinach', ['raw spinach', 'baby spinach', 'fresh spinach'], [23, 2.9, 3.6, 0.4, 2.2, 0.4], { cup: 30, serving: 30, handful: 30 }),
  food('Cooked Spinach', ['steamed spinach', 'boiled spinach', 'sauteed spinach'], [23, 3, 3.8, 0.3, 2.4, 0.4], { cup: 180, serving: 90 }),
  food('Lettuce', ['romaine', 'romaine lettuce', 'iceberg lettuce', 'iceberg', 'green leaf lettuce'], [17, 1.2, 3.3, 0.3, 2.1, 1.2], { cup: 47, leaf: 6, serving: 47 }),
  food('Kale', ['raw kale'], [35, 2.9, 4.4, 1.5, 4.1, 1], { cup: 21, serving: 21 }),
  food('Tomato', ['tomatoes', 'roma tomato'], [18, 0.9, 3.9, 0.2, 1.2, 2.6], { each: 123, small: 91, large: 182, cup: 180, slice: 20 }, { eachLabel: 'medium' }),
  food('Cherry Tomatoes', ['grape tomatoes', 'cherry tomato'], [18, 0.9, 3.9, 0.2, 1.2, 2.6], { each: 17, cup: 149, serving: 149 }),
  food('Cucumber', ['cucumbers'], [15, 0.7, 3.6, 0.1, 0.5, 1.7], { each: 301, cup: 104, slice: 7, half: 150 }),
  food('Onion', ['onions', 'yellow onion', 'white onion', 'red onion'], [40, 1.1, 9.3, 0.1, 1.7, 4.2], { each: 110, cup: 160, slice: 14, tbsp: 10 }, { eachLabel: 'medium' }),
  food('Bell Pepper', ['bell peppers', 'red bell pepper', 'green bell pepper', 'yellow bell pepper', 'green pepper', 'sweet pepper'], [26, 1, 6, 0.3, 2.1, 4.2], { each: 119, cup: 149, slice: 10 }, { eachLabel: 'medium' }),
  food('Corn', ['sweet corn', 'corn on the cob', 'corn on cob', 'corn kernels', 'ear of corn'], [96, 3.4, 21, 1.5, 2.4, 4.5], { ear: 90, each: 90, cup: 164, serving: 82 }),
  food('Green Beans', ['string beans', 'snap beans'], [35, 1.9, 7.9, 0.3, 3.2, 3.6], { cup: 125, serving: 125 }),
  food('Peas', ['green peas', 'sweet peas'], [84, 5.4, 15.6, 0.2, 5.5, 5.9], { cup: 160, serving: 80 }),
  food('Cauliflower', [], [23, 1.8, 4.1, 0.5, 2.3, 2.1], { cup: 124, serving: 124 }),
  food('Zucchini', ['courgette'], [17, 1.2, 3.1, 0.3, 1, 2.5], { each: 196, cup: 124 }),
  food('Mushrooms', ['mushroom', 'white mushrooms', 'button mushrooms'], [22, 3.1, 3.3, 0.3, 1, 2], { each: 18, cup: 70 }),
  food('Asparagus', [], [22, 2.4, 4.1, 0.2, 2, 1.3], { spear: 15, each: 15, cup: 180, serving: 90 }),
  food('Cabbage', ['green cabbage'], [25, 1.3, 5.8, 0.1, 2.5, 3.2], { cup: 89, serving: 89 }),
  food('Celery', ['celery stick', 'celery sticks'], [14, 0.7, 3, 0.2, 1.6, 1.3], { stalk: 40, each: 40, cup: 101 }),
  food('Edamame', [], [121, 11.9, 8.9, 5.2, 5.2, 2.2], { cup: 155, serving: 78 }),
  food('Sweet Potato', ['sweet potatoes', 'baked sweet potato', 'roasted sweet potato'], [90, 2, 20.7, 0.2, 3.3, 6.5], { each: 114, small: 60, large: 180, cup: 200 }, { eachLabel: 'medium' }),
  food('Baked Potato', ['potato', 'potatoes', 'white potato', 'russet potato', 'jacket potato'], [93, 2.5, 21.2, 0.1, 2.2, 1.2], { each: 173, small: 138, large: 299, cup: 122 }, { eachLabel: 'medium' }),
  food('Boiled Potatoes', ['boiled potato', 'red potatoes'], [87, 1.9, 20.1, 0.1, 1.8, 0.9], { each: 136, cup: 156 }, { eachLabel: 'medium' }),
  food('Mashed Potatoes', ['mashed potato', 'mash'], [113, 1.9, 16.8, 4.2, 1.5, 1.4], { cup: 210, serving: 210, scoop: 105 }),

  // ---------- Grains, bread, breakfast ----------
  food('White Rice', ['rice', 'steamed rice', 'cooked rice', 'cooked white rice', 'jasmine rice', 'basmati rice', 'long grain rice'], [130, 2.7, 28.2, 0.3, 0.4, 0.1], { cup: 158, serving: 158, bowl: 237, scoop: 79 }),
  food('Brown Rice', ['cooked brown rice'], [112, 2.3, 23.5, 0.8, 1.8, 0.4], { cup: 195, serving: 195, bowl: 290 }),
  food('Pasta', ['spaghetti', 'penne', 'macaroni', 'elbow macaroni', 'linguine', 'fettuccine', 'rigatoni', 'rotini', 'fusilli', 'farfalle', 'bow tie pasta', 'angel hair', 'angel hair pasta', 'ziti', 'orzo', 'noodles', 'cooked pasta', 'cooked spaghetti', 'plain pasta'], [158, 5.8, 30.9, 0.9, 1.8, 0.6], { cup: 140, serving: 140, bowl: 280 }),
  food('Whole Wheat Pasta', ['whole wheat spaghetti', 'whole grain pasta', 'wheat pasta'], [124, 5.3, 26.5, 0.5, 4.5, 0.8], { cup: 140, serving: 140, bowl: 280 }),
  food('Egg Noodles', ['egg noodle'], [138, 4.5, 25.2, 2.1, 1.2, 0.4], { cup: 160, serving: 160 }),
  food('Oatmeal', ['porridge', 'cooked oatmeal', 'cooked oats', 'oatmeal with water', 'steel cut oatmeal'], [71, 2.5, 12, 1.5, 1.7, 0.3], { cup: 234, bowl: 234, serving: 234 }),
  food('Rolled Oats', ['oats', 'dry oats', 'old fashioned oats', 'quick oats', 'uncooked oats'], [379, 13.2, 67.7, 6.5, 10.1, 1], { cup: 81, serving: 40, tbsp: 5 }),
  food('Quinoa', ['cooked quinoa'], [120, 4.4, 21.3, 1.9, 2.8, 0.9], { cup: 185, serving: 185 }),
  food('Couscous', ['cooked couscous'], [112, 3.8, 23.2, 0.2, 1.4, 0.1], { cup: 157, serving: 157 }),
  food('White Bread', ['bread', 'toast', 'white toast', 'sandwich bread', 'slice of bread'], [266, 7.6, 50.6, 3.3, 2.4, 5.7], { slice: 27, each: 27, serving: 54 }, { eachLabel: 'slice' }),
  food('Whole Wheat Bread', ['wheat bread', 'whole wheat toast', 'wheat toast', 'whole grain bread', 'multigrain bread'], [252, 12.4, 42.7, 3.5, 6, 4.4], { slice: 32, each: 32, serving: 64 }, { eachLabel: 'slice' }),
  food('Bagel', ['bagels', 'plain bagel'], [257, 10, 50.5, 1.6, 2.1, 5.1], { each: 105, small: 69, large: 131, half: 52 }),
  food('English Muffin', ['english muffins'], [227, 8.9, 44.2, 1.7, 3.5, 3.5], { each: 57, half: 28 }),
  food('Croissant', ['croissants', 'butter croissant'], [406, 8.2, 45.8, 21, 2.6, 11.3], { each: 57, small: 42, large: 67 }, { eachLabel: 'medium' }),
  food('Flour Tortilla', ['tortilla', 'flour tortillas', 'wrap tortilla'], [304, 8.2, 49.4, 7.9, 3.4, 2.4], { each: 45, small: 32, large: 72 }, { eachLabel: 'medium (8")' }),
  food('Corn Tortilla', ['corn tortillas'], [218, 5.7, 44.6, 2.9, 6.3, 0.9], { each: 26 }),
  food('Pita Bread', ['pita'], [275, 9.1, 55.7, 1.2, 2.2, 1.3], { each: 60, small: 28, half: 30 }),
  food('Hamburger Bun', ['bun', 'hot dog bun', 'burger bun'], [279, 9.5, 49.4, 4.3, 2, 6.9], { each: 44 }),
  food('Pancakes', ['pancake', 'buttermilk pancakes', 'hotcakes'], [227, 6.4, 28.3, 9.7, 0.9, 5], { each: 77, small: 38, large: 110, serving: 154 }, { eachLabel: '6-inch' }),
  food('Waffle', ['waffles', 'belgian waffle'], [291, 7.9, 32.9, 14.1, 1.7, 6], { each: 75, small: 35, large: 100 }),
  food('French Toast', [], [229, 7.7, 25, 10.8, 1, 5], { slice: 65, each: 65, serving: 130 }, { eachLabel: 'slice' }),
  food('Granola', [], [471, 10, 64, 20, 5, 20], { cup: 122, serving: 61, tbsp: 8 }),
  food('Cereal With Milk', ['cereal and milk', 'bowl of cereal'], [107, 4.7, 17.3, 2.9, 1.5, 6], { bowl: 225, cup: 150, serving: 150 }, { source: 'recipe' }),
  food('Cheerios', ['plain cheerios'], [359, 12.8, 74.4, 6.4, 10.3, 3.6], { cup: 26, serving: 39, bowl: 39 }, { source: 'label' }),
  food('Honey Nut Cheerios', [], [378, 8.1, 78.4, 5.4, 8.1, 32.4], { cup: 37, serving: 37, bowl: 55 }, { source: 'label' }),
  food('Corn Flakes', ['cornflakes'], [357, 7.1, 85.7, 0, 3.6, 10.7], { cup: 28, serving: 28, bowl: 42 }, { source: 'label' }),
  food('Frosted Flakes', [], [385, 5.1, 89.7, 0, 2.6, 30.8], { cup: 29, serving: 39, bowl: 44 }, { source: 'label' }),
  food('Raisin Bran', [], [322, 8.5, 78, 1.7, 11.9, 30.5], { cup: 59, serving: 59, bowl: 59 }, { source: 'label' }),
  food('Rice Krispies', [], [375, 5, 87.5, 0, 0, 10], { cup: 27, serving: 40, bowl: 40 }, { source: 'label' }),
  food('Froot Loops', ['fruit loops'], [385, 5.1, 87.2, 3.8, 7.7, 30.8], { cup: 29, serving: 39, bowl: 44 }, { source: 'label' }),
  food('Lucky Charms', [], [389, 8.3, 80.6, 4.2, 5.6, 33.3], { cup: 36, serving: 36, bowl: 54 }, { source: 'label' }),
  food('Cinnamon Toast Crunch', [], [415, 4.9, 80.5, 9.8, 4.9, 29.3], { cup: 41, serving: 41, bowl: 62 }, { source: 'label' }),
  food('Popcorn', ['air popped popcorn', 'plain popcorn'], [387, 12.9, 77.8, 4.5, 14.5, 0.9], { cup: 8, serving: 24, bag: 24 }),

  // ---------- Eggs, meat, fish, plant protein ----------
  food('Egg', ['eggs', 'whole egg', 'large egg', 'raw egg', 'poached egg', 'poached eggs'], [143, 12.6, 0.7, 9.5, 0, 0.4], { each: 50, small: 38, medium: 44, large: 50, 'extra large': 56, jumbo: 63 }, { eachLabel: 'large' }),
  food('Boiled Egg', ['boiled eggs', 'hard boiled egg', 'hard boiled eggs', 'hardboiled egg', 'hardboiled eggs', 'soft boiled egg', 'soft boiled eggs'], [155, 12.6, 1.1, 10.6, 0, 1.1], { each: 50, large: 50, medium: 44, small: 38 }, { eachLabel: 'large' }),
  food('Fried Egg', ['fried eggs', 'sunny side up egg', 'sunny side up eggs', 'over easy egg', 'over easy eggs'], [196, 13.6, 0.8, 14.8, 0, 0.4], { each: 46, large: 46 }, { eachLabel: 'large' }),
  food('Scrambled Eggs', ['scrambled egg'], [149, 10, 1.6, 11, 0, 1.4], { each: 61, large: 61, cup: 220, serving: 122 }, { eachLabel: 'large egg' }),
  food('Egg Whites', ['egg white', 'liquid egg whites'], [52, 10.9, 0.7, 0.2, 0, 0.7], { each: 33, cup: 243, tbsp: 15, serving: 99 }, { eachLabel: 'large' }),
  food('Chicken Breast', ['chicken', 'grilled chicken', 'grilled chicken breast', 'baked chicken', 'baked chicken breast', 'roasted chicken breast', 'chicken breasts', 'boneless skinless chicken breast', 'skinless chicken breast'], [165, 31, 0, 3.6], { each: 172, breast: 172, half: 86, cup: 140, serving: 113, piece: 85 }, { eachLabel: 'breast' }),
  food('Chicken Thigh', ['chicken thighs', 'boneless chicken thigh', 'boneless chicken thighs', 'skinless chicken thigh'], [209, 26, 0, 10.9], { each: 52, thigh: 52, serving: 113 }, { eachLabel: 'thigh' }),
  food('Chicken Wings', ['chicken wing', 'wings', 'wing'], [290, 26.9, 0, 19.5], { each: 34, wing: 34, serving: 136 }, { eachLabel: 'wing' }),
  food('Chicken Drumstick', ['chicken drumsticks', 'drumstick', 'drumsticks'], [216, 27, 0, 11.2], { each: 52, drumstick: 52, serving: 104 }, { eachLabel: 'drumstick' }),
  food('Chicken Nuggets', ['chicken nugget', 'nuggets', 'nugget'], [296, 15, 15, 19, 1, 0.5], { each: 16, serving: 96 }, { eachLabel: 'nugget' }),
  food('Ground Beef', ['hamburger meat', 'ground beef 80/20', 'cooked ground beef', 'hamburger patty', 'burger patty'], [254, 25.8, 0, 16.4], { patty: 85, each: 85, cup: 115, serving: 85 }, { eachLabel: 'patty (1/4 lb raw)' }),
  food('Lean Ground Beef', ['90 10 ground beef', '93 7 ground beef', 'extra lean ground beef'], [217, 26.1, 0, 11.7], { patty: 85, each: 85, cup: 115, serving: 85 }, { eachLabel: 'patty (1/4 lb raw)' }),
  food('Ground Turkey', ['cooked ground turkey'], [203, 27.1, 0, 10.4], { patty: 85, each: 85, cup: 115, serving: 85 }, { eachLabel: 'patty' }),
  food('Turkey Breast', ['turkey', 'roast turkey', 'roasted turkey', 'sliced turkey'], [147, 30, 0, 2.1], { slice: 28, serving: 85, cup: 140 }),
  food('Steak', ['beef steak', 'grilled steak'], [250, 26, 0, 15.5], { each: 227, serving: 170 }, { eachLabel: 'steak (8 oz)' }),
  food('Sirloin Steak', ['top sirloin', 'sirloin', 'top sirloin steak'], [207, 30, 0, 9], { each: 227, serving: 170 }, { eachLabel: 'steak (8 oz)' }),
  food('Ribeye Steak', ['ribeye', 'rib eye', 'rib eye steak'], [291, 24, 0, 21.8], { each: 283, serving: 170 }, { eachLabel: 'steak (10 oz)' }),
  food('Pork Chop', ['pork chops', 'pork loin chop'], [231, 25.7, 0, 13.5], { each: 100, chop: 100, serving: 100 }, { eachLabel: 'chop' }),
  food('Bacon', ['bacon strips', 'bacon slices', 'crispy bacon', 'pork bacon'], [541, 37, 1.4, 42, 0, 0], { slice: 8, each: 8, serving: 16 }, { eachLabel: 'slice' }),
  food('Turkey Bacon', [], [382, 29.6, 3.1, 27.9], { slice: 8, each: 8, serving: 16 }, { eachLabel: 'slice' }),
  food('Breakfast Sausage', ['sausage', 'sausage link', 'sausage links', 'sausage patty', 'sausage patties', 'pork sausage'], [325, 18.5, 1.4, 27.3], { link: 25, each: 25, patty: 27, serving: 50 }, { eachLabel: 'link' }),
  food('Salmon', ['baked salmon', 'grilled salmon', 'salmon fillet', 'salmon filet', 'atlantic salmon', 'cooked salmon'], [206, 22.1, 0, 12.4], { fillet: 170, each: 170, serving: 113 }, { eachLabel: 'fillet (6 oz)' }),
  food('Tuna', ['canned tuna', 'tuna in water', 'tuna fish', 'chunk light tuna'], [116, 25.5, 0, 0.8], { can: 113, serving: 85, cup: 154 }),
  food('Tilapia', ['tilapia fillet', 'baked tilapia'], [128, 26.2, 0, 2.7], { fillet: 87, each: 87, serving: 113 }, { eachLabel: 'fillet' }),
  food('Cod', ['cod fillet', 'baked cod'], [105, 22.8, 0, 0.9], { fillet: 180, each: 180, serving: 113 }, { eachLabel: 'fillet' }),
  food('Shrimp', ['prawns', 'grilled shrimp', 'boiled shrimp', 'steamed shrimp', 'cooked shrimp'], [99, 24, 0.2, 0.3], { each: 6, large: 6, jumbo: 12, small: 3, serving: 85, cup: 145 }, { eachLabel: 'large' }),
  food('Tofu', ['soft tofu', 'silken tofu'], [76, 8.1, 1.9, 4.8, 0.3, 0.6], { cup: 248, serving: 85, slice: 84 }),
  food('Firm Tofu', ['extra firm tofu'], [94, 9.4, 2.4, 5.3, 1.2, 0], { cup: 252, serving: 85, slice: 84 }, { source: 'label' }),
  food('Black Beans', ['black bean'], [132, 8.9, 23.7, 0.5, 8.7, 0.3], { cup: 172, serving: 86 }),
  food('Pinto Beans', ['pinto bean'], [143, 9, 26.2, 0.7, 9, 0.3], { cup: 171, serving: 86 }),
  food('Kidney Beans', ['red kidney beans', 'red beans'], [127, 8.7, 22.8, 0.5, 6.4, 0.3], { cup: 177, serving: 89 }),
  food('Chickpeas', ['chickpea', 'garbanzo beans', 'garbanzos'], [164, 8.9, 27.4, 2.6, 7.6, 4.8], { cup: 164, serving: 82 }),
  food('Lentils', ['lentil', 'cooked lentils'], [116, 9, 20.1, 0.4, 7.9, 1.8], { cup: 198, serving: 99 }),
  food('Hummus', ['houmous'], [166, 7.9, 14.3, 9.6, 6, 0.3], { tbsp: 15, cup: 246, serving: 30 }),
  food('Peanut Butter', ['creamy peanut butter', 'crunchy peanut butter'], [588, 25.1, 20, 50, 6, 9.2], { tbsp: 16, tsp: 5.3, serving: 32, cup: 258 }),
  food('Almond Butter', [], [614, 21, 18.8, 55.5, 10.3, 4.4], { tbsp: 16, tsp: 5.3, serving: 32 }),
  food('Almonds', ['almond', 'raw almonds', 'roasted almonds'], [579, 21.2, 21.6, 49.9, 12.5, 4.4], { each: 1.2, cup: 143, ...NUT_PORTIONS }),
  food('Walnuts', ['walnut'], [654, 15.2, 13.7, 65.2, 6.7, 2.6], { each: 4, cup: 117, ...NUT_PORTIONS }),
  food('Peanuts', ['peanut', 'roasted peanuts'], [585, 24.4, 21.5, 49.7, 8, 4.2], { each: 1, cup: 146, ...NUT_PORTIONS }),
  food('Cashews', ['cashew'], [574, 15.3, 32.7, 46.4, 3, 5], { each: 1.5, cup: 137, ...NUT_PORTIONS }),
  food('Pistachios', ['pistachio'], [560, 20.2, 27.2, 45.3, 10.6, 7.7], { each: 0.7, cup: 123, ...NUT_PORTIONS }),
  food('Chia Seeds', ['chia'], [486, 16.5, 42.1, 30.7, 34.4, 0], { tbsp: 12, tsp: 4, serving: 28 }),
  food('Protein Powder', ['whey protein', 'whey protein powder', 'protein scoop'], [387, 77, 13, 3.2, 0, 6.5], { scoop: 31, serving: 31, tbsp: 8 }, { source: 'label' }),

  // ---------- Dairy, fats, condiments ----------
  food('2% Milk', ['milk', '2 percent milk', 'reduced fat milk', 'glass of milk'], [50, 3.3, 4.8, 2, 0, 5.1], { cup: 244, glass: 244, serving: 244, tbsp: 15, pint: 488 }, drink()),
  food('Whole Milk', ['whole milk', 'vitamin d milk', 'full fat milk'], [61, 3.2, 4.8, 3.3, 0, 5.1], { cup: 244, glass: 244, serving: 244, tbsp: 15, pint: 488 }, drink()),
  food('1% Milk', ['1 percent milk', 'low fat milk', 'lowfat milk'], [42, 3.4, 5, 1, 0, 5.2], { cup: 244, glass: 244, serving: 244, tbsp: 15 }, drink()),
  food('Skim Milk', ['nonfat milk', 'fat free milk'], [34, 3.4, 5, 0.1, 0, 5.1], { cup: 245, glass: 245, serving: 245, tbsp: 15 }, drink()),
  food('Chocolate Milk', ['lowfat chocolate milk'], [76, 3.2, 12, 1.9, 0.7, 10], { cup: 250, glass: 250, serving: 250, carton: 236 }, drink()),
  food('Almond Milk', ['unsweetened almond milk'], [15, 0.6, 0.3, 1.2, 0.2, 0], { cup: 240, glass: 240, serving: 240 }, drink({ source: 'label' })),
  food('Oat Milk', ['oatly'], [50, 1.3, 6.7, 2.1, 0.8, 2.9], { cup: 240, glass: 240, serving: 240 }, drink({ source: 'label' })),
  food('Soy Milk', ['soymilk'], [45, 3.3, 3.7, 1.9, 0.8, 2.5], { cup: 243, glass: 243, serving: 243 }, drink({ source: 'label' })),
  food('Cheddar Cheese', ['cheddar', 'cheese', 'shredded cheddar', 'sharp cheddar', 'shredded cheese'], [403, 24.9, 1.3, 33.1, 0, 0.5], { slice: 28, cup: 113, tbsp: 7, serving: 28.35 }),
  food('Mozzarella', ['mozzarella cheese', 'shredded mozzarella', 'fresh mozzarella'], [300, 22.2, 2.2, 22.4, 0, 1], { slice: 28, cup: 112, serving: 28.35 }),
  food('String Cheese', ['cheese stick', 'mozzarella string cheese'], [286, 25, 3.6, 21.4, 0, 0], { each: 28, stick: 28 }, { source: 'label', eachLabel: 'stick' }),
  food('Swiss Cheese', ['swiss'], [380, 27, 5.4, 27.8, 0, 1.3], { slice: 28, serving: 28.35 }),
  food('Parmesan', ['parmesan cheese', 'grated parmesan', 'parmigiano'], [420, 28.4, 13.9, 27.8, 0, 0.9], { tbsp: 5, cup: 100, serving: 10 }),
  food('Feta', ['feta cheese', 'crumbled feta'], [264, 14.2, 4.1, 21.3, 0, 4.1], { cup: 150, tbsp: 9, serving: 28.35 }),
  food('Cream Cheese', [], [342, 5.9, 4.1, 34.2, 0, 3.2], { tbsp: 14.5, serving: 29 }),
  food('Cottage Cheese', ['4 percent cottage cheese'], [98, 11.1, 3.4, 4.3, 0, 2.7], { cup: 226, serving: 113, container: 113 }),
  food('Low Fat Cottage Cheese', ['lowfat cottage cheese', '2 percent cottage cheese', '1 percent cottage cheese'], [84, 11, 4.3, 2.3, 0, 4.1], { cup: 226, serving: 113, container: 113 }),
  food('Greek Yogurt', ['plain greek yogurt', 'nonfat greek yogurt', 'fat free greek yogurt', '0 percent greek yogurt', 'non fat greek yogurt'], [59, 10.3, 3.6, 0.4, 0, 3.2], { cup: 227, container: 170, serving: 170, tbsp: 15 }),
  food('Whole Milk Greek Yogurt', ['full fat greek yogurt'], [97, 9, 4, 5, 0, 4], { cup: 227, container: 170, serving: 170, tbsp: 15 }),
  food('Yogurt', ['plain yogurt', 'low fat yogurt', 'lowfat yogurt', 'natural yogurt'], [63, 5.3, 7, 1.6, 0, 7], { cup: 245, container: 170, serving: 170, tbsp: 15 }),
  food('Flavored Yogurt', ['vanilla yogurt', 'strawberry yogurt', 'fruit yogurt', 'blueberry yogurt', 'peach yogurt'], [85, 4.9, 13.8, 1.2, 0, 13.8], { cup: 245, container: 170, serving: 170 }),
  food('Butter', ['salted butter', 'unsalted butter'], [717, 0.9, 0.1, 81.1, 0, 0.1], { tbsp: 14.2, tsp: 4.7, pat: 5, stick: 113, serving: 14.2 }),
  food('Olive Oil', ['extra virgin olive oil', 'evoo'], [884, 0, 0, 100, 0, 0], { tbsp: 13.5, tsp: 4.5, cup: 216, serving: 13.5 }),
  food('Vegetable Oil', ['canola oil', 'cooking oil', 'oil', 'coconut oil', 'avocado oil'], [884, 0, 0, 100, 0, 0], { tbsp: 14, tsp: 4.7, cup: 218, serving: 14 }),
  food('Mayonnaise', ['mayo'], [680, 1, 0.6, 74.9, 0, 0.6], { tbsp: 13.8, tsp: 4.6, serving: 13.8 }),
  food('Sour Cream', [], [198, 2.4, 4.6, 19.4, 0, 3.4], { tbsp: 12, cup: 230, serving: 24 }),
  food('Heavy Cream', ['heavy whipping cream', 'whipping cream'], [340, 2.8, 2.7, 36.1, 0, 2.9], { tbsp: 15, cup: 238, serving: 15 }, drink()),
  food('Half and Half', [], [131, 3.1, 4.3, 11.5, 0, 4.1], { tbsp: 15, cup: 242, serving: 15 }, drink()),
  food('Coffee Creamer', ['creamer', 'french vanilla creamer', 'flavored creamer'], [233, 0, 33, 10, 0, 33], { tbsp: 15, serving: 15 }, drink({ source: 'label' })),
  food('Vanilla Ice Cream', ['ice cream', 'vanilla ice cream'], [207, 3.5, 23.6, 11, 0.7, 21.2], { cup: 132, scoop: 66, serving: 66 }),
  food('Honey', [], [304, 0.3, 82.4, 0, 0.2, 82.1], { tbsp: 21, tsp: 7, serving: 21 }),
  food('Sugar', ['white sugar', 'granulated sugar', 'cane sugar'], [387, 0, 100, 0, 0, 100], { tsp: 4.2, tbsp: 12.6, cup: 200, package: 3, cube: 4 }),
  food('Brown Sugar', [], [380, 0.1, 98.1, 0, 0, 97], { tsp: 4.6, tbsp: 13.8, cup: 220 }),
  food('Maple Syrup', ['pure maple syrup'], [260, 0, 67, 0.1, 0, 60.5], { tbsp: 20, tsp: 6.7, serving: 40 }),
  food('Jam', ['jelly', 'strawberry jam', 'grape jelly', 'preserves', 'fruit spread'], [278, 0.4, 68.9, 0.1, 1.1, 48.5], { tbsp: 20, tsp: 7, serving: 20 }),
  food('Ketchup', ['catsup'], [101, 1, 27.4, 0.1, 0.3, 22.8], { tbsp: 17, tsp: 6, package: 9, serving: 17 }),
  food('Mustard', ['yellow mustard'], [60, 3.7, 5.8, 3.3, 4, 0.9], { tsp: 5, tbsp: 15, package: 5, serving: 5 }),
  food('Ranch Dressing', ['ranch'], [433, 1, 6.7, 45, 0, 3.3], { tbsp: 15, serving: 30, cup: 240, package: 43 }, { source: 'label' }),
  food('Salsa', [], [36, 1.5, 7, 0.2, 1.9, 4], { tbsp: 16, cup: 259, serving: 32 }),
  food('Guacamole', ['guac'], [155, 1.9, 8.3, 13.9, 6.1, 1], { tbsp: 15, cup: 230, serving: 30 }),

  // ---------- Drinks ----------
  food('Orange Juice', ['oj', 'fresh orange juice'], [45, 0.7, 10.4, 0.2, 0.2, 8.4], { cup: 248, glass: 248, serving: 248, bottle: 355 }, drink()),
  food('Apple Juice', [], [46, 0.1, 11.3, 0.1, 0.2, 9.6], { cup: 248, glass: 248, serving: 248, box: 200 }, drink()),
  food('Grape Juice', [], [60, 0.4, 14.8, 0.1, 0.2, 14.2], { cup: 253, glass: 253, serving: 253 }, drink()),
  food('Coca-Cola', ['coke', 'coca cola', 'coca cola classic', 'cola', 'soda', 'pop', 'soft drink', 'pepsi', 'sprite', 'dr pepper', 'root beer', '7 up', '7up', 'ginger ale', 'fanta'], [39, 0, 11, 0, 0, 11], SODA_PORTIONS, drink({ source: 'label' })),
  food('Mountain Dew', [], [48, 0, 13, 0, 0, 13], SODA_PORTIONS, drink({ source: 'label' })),
  food('Beer', ['regular beer', 'lager', 'ale'], [43, 0.5, 3.6, 0, 0, 0], { can: 355, bottle: 355, pint: 473, glass: 355, cup: 240, serving: 355 }, drink()),
  food('Light Beer', ['lite beer', 'bud light', 'coors light', 'miller lite', 'michelob ultra'], [29, 0.2, 1.6, 0, 0, 0], { can: 355, bottle: 355, pint: 473, glass: 355, serving: 355 }, drink()),
  food('Red Wine', ['wine', 'glass of wine', 'cabernet', 'merlot', 'pinot noir'], [85, 0.1, 2.6, 0, 0, 0.6], { glass: 147, serving: 147, bottle: 750, cup: 240 }, drink()),
  food('White Wine', ['chardonnay', 'pinot grigio', 'sauvignon blanc', 'rose'], [82, 0.1, 2.6, 0, 0, 1], { glass: 147, serving: 147, bottle: 750, cup: 240 }, drink()),
  food('Latte', ['cafe latte', 'caffe latte', 'coffee latte'], [40, 2.7, 4, 1.5, 0, 3.8], COFFEE_DRINK_PORTIONS, drink({ source: 'recipe' })),
  food('Cappuccino', [], [30, 2, 3, 1.1, 0, 2.8], COFFEE_DRINK_PORTIONS, drink({ source: 'recipe' })),
  food('Coffee With Milk', ['coffee and milk'], [10, 0.5, 0.8, 0.5, 0, 0.8], COFFEE_DRINK_PORTIONS, drink({ source: 'recipe' })),
  food('Coffee With Cream', ['coffee and cream', 'coffee with half and half', 'coffee with creamer'], [15, 0.3, 0.5, 1.3, 0, 0.5], COFFEE_DRINK_PORTIONS, drink({ source: 'recipe' })),
  food('Coffee With Milk and Sugar', ['coffee with sugar and milk'], [17, 0.5, 3.4, 0.5, 0, 3.4], COFFEE_DRINK_PORTIONS, drink({ source: 'recipe' })),
  food('Coffee With Cream and Sugar', ['coffee with sugar and cream'], [26, 0.3, 3.1, 1.3, 0, 3.1], COFFEE_DRINK_PORTIONS, drink({ source: 'recipe' })),
  food('Sweet Tea', ['sweetened iced tea', 'southern sweet tea'], [35, 0, 9, 0, 0, 9], { cup: 240, glass: 355, serving: 355, small: 473, medium: 621, large: 887 }, drink()),
  food('Gatorade', ['sports drink', 'powerade'], [23, 0, 6, 0, 0, 5.7], { bottle: 591, cup: 240, serving: 355 }, drink({ source: 'label' })),
  food('Red Bull', [], [44, 0.4, 11, 0, 0, 11], { can: 250, serving: 250 }, drink({ source: 'label' })),
  food('Monster Energy', ['monster', 'monster energy drink'], [44, 0, 11, 0, 0, 11], { can: 473, serving: 473 }, drink({ source: 'label' })),
  food('Coconut Water', [], [19, 0.7, 3.7, 0.2, 1.1, 2.6], { cup: 240, box: 330, serving: 330 }, drink()),

  // ---------- Snacks and sweets ----------
  food('Potato Chips', ['chips', 'plain potato chips'], [536, 7, 53, 34.6, 4.4, 0.3], { serving: 28.35, bag: 28.35, each: 2, cup: 14, handful: 14 }),
  food('Tortilla Chips', ['corn chips'], [489, 7, 63, 23, 5, 1], { serving: 28.35, bag: 28.35, each: 2.5, cup: 26, handful: 20 }),
  food('Pretzels', ['pretzel', 'hard pretzels', 'pretzel twists'], [380, 10.3, 79.8, 2.6, 2.8, 2.8], { serving: 28.35, each: 6, handful: 28.35 }),
  food('Dark Chocolate', ['dark chocolate bar'], [598, 7.8, 45.9, 42.6, 10.9, 24], { square: 10, each: 10, serving: 28, bar: 100 }, { eachLabel: 'square' }),
  food('Glazed Donut', ['donut', 'doughnut', 'glazed doughnut', 'donuts', 'doughnuts'], [403, 6.4, 51, 19, 1.5, 21], { each: 60 }),
  food('Blueberry Muffin', ['muffin', 'muffins', 'blueberry muffins'], [377, 4.4, 54, 16, 1.4, 27], { each: 113, small: 57, large: 139 }),

  // ---------- Everyday dishes (built from USDA ingredients) ----------
  food('Hamburger', ['burger', 'plain burger', 'hamburger sandwich'], [223, 16.5, 15.8, 10, 0.9, 3], { each: 159, serving: 159 }, { source: 'recipe', eachLabel: 'burger (1/4 lb)' }),
  food('Cheeseburger', ['cheese burger'], [233, 16.5, 14.9, 11.8, 0.8, 3], { each: 180, serving: 180 }, { source: 'recipe', eachLabel: 'burger (1/4 lb)' }),
  food('Hot Dog', ['hotdog', 'hot dog on a bun', 'hot dog with bun'], [265, 9.7, 24.5, 14.3, 1, 4], { each: 98, serving: 98 }, { source: 'recipe', eachLabel: 'hot dog on a bun' }),
  food('Hot Dog Frank', ['frank', 'frankfurter', 'wiener', 'beef frank', 'hot dog without bun', 'hot dog no bun'], [290, 11, 4, 26, 0, 2], { each: 45, link: 45 }, { source: 'label', eachLabel: 'frank' }),
  food('Chicken Noodle Soup', [], [25, 1.3, 3.3, 0.8, 0.3, 0.4], { cup: 241, bowl: 362, can: 603, serving: 241 }, { source: 'label' }),
  food('Tomato Soup', ['cream of tomato soup'], [37, 0.8, 8, 0.3, 0.6, 4.9], { cup: 244, bowl: 366, can: 610, serving: 244 }, { source: 'label' }),
  // 3 cups romaine, 1/2 cup croutons, 2 tbsp parmesan, 2 tbsp Caesar dressing
  food('Caesar Salad', ['caesar', 'side caesar salad'], [145, 4, 7.9, 11, 1.4, 1.5], { each: 196, serving: 196, bowl: 196, cup: 65, small: 98, large: 294 }, { source: 'recipe', eachLabel: 'salad' }),
  // Caesar salad plus 4 oz grilled chicken breast
  food('Chicken Caesar Salad', ['grilled chicken caesar salad', 'caesar salad with chicken'], [152, 13.9, 5, 8.3, 0.9, 1], { each: 309, serving: 309, bowl: 309, cup: 70 }, { source: 'recipe', eachLabel: 'salad' }),
];

// ---------- Matching ----------

function singular(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (/(oes|ches|shes|sses|xes)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us')) return word.slice(0, -1);
  return word;
}

export function normalizeFoodText(text: string): string {
  return text
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/%/g, ' percent ')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const keyOf = (text: string) => normalizeFoodText(text).split(' ').filter(Boolean).map(singular).join(' ');

const BY_ALIAS = new Map<string, CommonFood>();
for (const entry of COMMON_FOODS) {
  for (const alias of entry.aliases) {
    const key = keyOf(alias);
    if (!BY_ALIAS.has(key)) BY_ALIAS.set(key, entry);
  }
}

// How the food was prepared or sold, which doesn't change which entry it is.
const NEUTRAL_WORDS = new Set(['fresh', 'plain', 'organic', 'regular', 'cooked', 'steamed', 'boiled', 'baked', 'grilled', 'roasted', 'broiled', 'sliced', 'chopped', 'diced', 'cubed', 'shredded', 'homemade', 'home', 'made', 'leftover', 'raw']);
const LEADING_FILLER = /^(?:a|an|the|some|my|of)\s+/;

function editDistance(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
    }
  }
  return rows[a.length][b.length];
}

/** Finds the entry for a food name: exact alias, then without prep words, then a one-letter typo. */
export function findCommonFood(name: string): CommonFood | null {
  let key = keyOf(name);
  while (LEADING_FILLER.test(key)) key = key.replace(LEADING_FILLER, '');
  if (!key) return null;
  const exact = BY_ALIAS.get(key);
  if (exact) return exact;

  const stripped = key.split(' ').filter((word) => !NEUTRAL_WORDS.has(word)).join(' ');
  if (stripped && stripped !== key) {
    const hit = BY_ALIAS.get(stripped);
    if (hit) return hit;
  }

  const target = stripped || key;
  if (target.length < 5) return null;
  let best: { entry: CommonFood; distance: number } | null = null;
  let tie = false;
  BY_ALIAS.forEach((entry, alias) => {
    if (alias[0] !== target[0] || Math.abs(alias.length - target.length) > 2) return;
    const distance = editDistance(alias, target);
    const allowed = target.length >= 10 ? 2 : 1;
    if (distance > allowed) return;
    if (!best || distance < best.distance) {
      best = { entry, distance };
      tie = false;
    } else if (distance === best.distance && best.entry !== entry) {
      tie = true;
    }
  });
  const found = best as { entry: CommonFood; distance: number } | null;
  return found && !tie ? found.entry : null;
}

// ---------- Amounts ----------

const WORD_NUMBERS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, dozen: 12, half: 0.5, quarter: 0.25, couple: 2, few: 3,
};
const UNICODE_FRACTIONS: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125 };

const UNIT_WORDS: Record<string, string> = {
  g: 'g', gram: 'g', grams: 'g', gr: 'g', kg: 'kg', kilogram: 'kg', kilograms: 'kg',
  oz: 'oz', ounce: 'oz', ounces: 'oz', lb: 'lb', lbs: 'lb', pound: 'lb', pounds: 'lb',
  ml: 'ml', milliliter: 'ml', milliliters: 'ml', millilitre: 'ml', millilitres: 'ml', l: 'l', liter: 'l', liters: 'l', litre: 'l', litres: 'l',
  cup: 'cup', cups: 'cup', c: 'cup', glass: 'glass', glasses: 'glass', mug: 'mug', mugs: 'mug',
  tbsp: 'tbsp', tbs: 'tbsp', tbl: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp',
  tsp: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp',
  slice: 'slice', slices: 'slice', strip: 'slice', strips: 'slice',
  piece: 'each', pieces: 'each', pc: 'each', pcs: 'each', each: 'each', whole: 'each', item: 'each', items: 'each', unit: 'each', units: 'each',
  can: 'can', cans: 'can', bottle: 'bottle', bottles: 'bottle', box: 'box', boxes: 'box', carton: 'carton', cartons: 'carton',
  pint: 'pint', pints: 'pint', container: 'container', containers: 'container',
  packet: 'package', packets: 'package', package: 'package', packages: 'package', pack: 'package', packs: 'package', bag: 'bag', bags: 'bag', pouch: 'package',
  scoop: 'scoop', scoops: 'scoop', link: 'link', links: 'link', patty: 'patty', patties: 'patty',
  fillet: 'fillet', fillets: 'fillet', filet: 'fillet', filets: 'fillet', ear: 'ear', ears: 'ear', stalk: 'stalk', stalks: 'stalk',
  spear: 'spear', spears: 'spear', handful: 'handful', handfuls: 'handful', bowl: 'bowl', bowls: 'bowl', plate: 'bowl', plates: 'bowl',
  serving: 'serving', servings: 'serving', portion: 'serving', portions: 'serving', helping: 'serving', helpings: 'serving',
  order: 'serving', orders: 'serving',
  wedge: 'wedge', wedges: 'wedge', square: 'square', squares: 'square', stick: 'stick', sticks: 'stick', pat: 'pat', pats: 'pat',
  leaf: 'leaf', leaves: 'leaf', cube: 'cube', cubes: 'cube',
  breast: 'breast', breasts: 'breast', thigh: 'thigh', thighs: 'thigh', wing: 'wing', wings: 'wing',
  drumstick: 'drumstick', drumsticks: 'drumstick', chop: 'chop', chops: 'chop', halves: 'half',
};
const SIZE_WORDS = ['extra large', 'jumbo', 'large', 'medium', 'small', 'mini', 'regular', 'big'];
const SIZE_FACTOR: Record<string, number> = { mini: 0.5, small: 0.75, medium: 1, regular: 1, large: 1.3, big: 1.3, 'extra large': 1.45, jumbo: 1.6 };

interface ParsedAmount { quantity: number; unit: string; size?: string; grams?: number; rest: string }

function readQuantity(text: string): { quantity: number; rest: string } | null {
  let match = text.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)\s*(.*)$/);
  if (match) return { quantity: Number(match[1]) + Number(match[2]) / Number(match[3]), rest: match[4] };
  match = text.match(/^(\d+)\s*\/\s*(\d+)\s*(.*)$/);
  if (match && Number(match[2]) > 0) return { quantity: Number(match[1]) / Number(match[2]), rest: match[3] };
  match = text.match(/^(\d*)([½¼¾⅓⅔⅛])\s*(.*)$/);
  if (match) return { quantity: (match[1] ? Number(match[1]) : 0) + UNICODE_FRACTIONS[match[2]], rest: match[3] };
  match = text.match(/^(\d*\.?\d+)\s*(?:-|to)\s*(\d*\.?\d+)\s*(.*)$/);
  if (match) return { quantity: (Number(match[1]) + Number(match[2])) / 2, rest: match[3] };
  match = text.match(/^(\d*\.?\d+)\s*(.*)$/);
  if (match) return { quantity: Number(match[1]), rest: match[2] };
  match = text.match(/^(a couple of|a couple|a few|half a|half an|a half|a quarter|[a-z]+)\b\s*(.*)$/);
  if (match) {
    const phrase = match[1];
    const value = phrase.startsWith('half') || phrase === 'a half' ? 0.5
      : phrase === 'a quarter' ? 0.25
      : phrase.startsWith('a couple') ? 2
      : phrase === 'a few' ? 3
      : WORD_NUMBERS[phrase];
    if (value !== undefined) {
      // "half a cup" / "half an avocado" keeps the next word; "half" alone halves one item.
      return { quantity: value, rest: match[2] };
    }
  }
  return null;
}

/** "2 large", "1 1/2 cups", "a glass of", "3 eggs", "1 medium (~118g)". */
function parseAmount(raw: string): ParsedAmount {
  let text = raw.toLowerCase().trim();
  let grams: number | undefined;
  const parenGrams = text.match(/\(\s*~?\s*(\d+(?:\.\d+)?)\s*(g|grams?|ml)\s*\)/);
  if (parenGrams) grams = Number(parenGrams[1]);
  text = text.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();

  const q = readQuantity(text);
  let quantity = q ? q.quantity : 1;
  text = (q ? q.rest : text).trim();
  // "1 x 16 oz" / "2 × cups"
  text = text.replace(/^(x|×)\s*/, '');
  const nested = readQuantity(text);
  if (q && nested && /^\d/.test(text)) {
    quantity *= nested.quantity;
    text = nested.rest.trim();
  }

  let size: string | undefined;
  for (const word of SIZE_WORDS) {
    if (text === word || text.startsWith(`${word} `)) {
      size = word;
      text = text.slice(word.length).trim();
      break;
    }
  }

  let unit = '';
  if (/^fl\.?\s*oz\b|^fluid ounces?\b/.test(text)) {
    unit = 'floz';
    text = text.replace(/^fl\.?\s*oz\.?|^fluid ounces?/, '').trim();
  } else {
    const word = text.match(/^([a-z]+)\.?\b/)?.[1];
    if (word && UNIT_WORDS[word]) {
      unit = UNIT_WORDS[word];
      text = text.slice(word.length).replace(/^\./, '').trim();
    }
  }
  text = text.replace(/^of\s+/, '').trim();
  return { quantity, unit, size, grams, rest: text };
}

const isGeneric = (measurement: string) => !measurement.trim() || /^(1|one|a)?\s*(servings?|portions?)?$/i.test(measurement.trim());

function gramsForUnit(entry: CommonFood, unit: string, size?: string): number | null {
  const p = entry.portions;
  const liquid = !!entry.liquid;
  switch (unit) {
    case 'g': return 1;
    case 'kg': return 1000;
    case 'oz': return liquid ? 29.57 : 28.35;
    case 'floz': return 29.57;
    case 'lb': return 453.6;
    case 'ml': return 1;
    case 'l': return 1000;
    case 'pint': return p.pint ?? (liquid ? 473 : null);
    case 'glass': return p.glass ?? p.cup ?? (liquid ? 240 : null);
    case 'mug': return p.mug ?? (liquid ? 355 : p.cup ?? null);
    case 'cup': return p.cup ?? (liquid ? 240 : null);
    case 'tbsp': return p.tbsp ?? (liquid ? 15 : null);
    case 'tsp': return p.tsp ?? (liquid ? 5 : null);
    case 'bowl': return p.bowl ?? (p.cup ? p.cup * 1.5 : null);
    case 'serving': return p.serving ?? p.each ?? p.cup ?? null;
    case 'half': return p.half ?? (p.each ? p.each / 2 : null);
    case 'carton': return p.carton ?? p.box ?? null;
    case 'each': {
      if (size && p[size]) return p[size];
      if (p.each) return p.each * (size ? SIZE_FACTOR[size] ?? 1 : 1);
      return p.serving ?? null;
    }
    default:
      return p[unit] ?? null;
  }
}

export interface CommonFoodResult {
  ingredient: string;
  measurement: string;
  estimatedCalories: number;
  equivalentMeasurement: string;
  note: string;
  nutritionPer100g: CommonFood['per100g'];
  category: string;
  source: 'reference';
}

const SOURCE_NOTE: Record<Source, string> = {
  usda: 'From USDA FoodData Central reference values',
  label: 'From the leading US brand’s nutrition label',
  recipe: 'Estimated from a standard recipe using USDA ingredient values',
};

const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * Calories for an everyday food, or null when the food or the amount isn't one we know well,
 * so the caller can fall back to the broader databases.
 */
export function calculateCommonFood(foodText: string, measurement: string): CommonFoodResult | null {
  let entry = findCommonFood(foodText);
  let amount: ParsedAmount;

  if (entry) {
    amount = parseAmount(isGeneric(measurement) ? '' : measurement);
    if (isGeneric(measurement) && /serving|portion/i.test(measurement)) amount.unit = 'serving';
  } else {
    // "2 eggs", "a cup of rice", "large banana" typed into the food box.
    const fromFood = parseAmount(foodText);
    if (!fromFood.rest || fromFood.rest === normalizeFoodText(foodText)) {
      if (!fromFood.size) return null;
    }
    entry = findCommonFood(fromFood.rest);
    if (!entry) return null;
    amount = fromFood;
    if (!isGeneric(measurement)) {
      // Food box had a size ("large banana") and the amount box has the count ("2").
      const extra = parseAmount(measurement);
      if (extra.unit || extra.grams) return calculateCommonFood(fromFood.rest, measurement);
      amount.quantity *= extra.quantity;
    }
  }

  // A size or count inside the food name ("large egg") applies when the amount is just a number.
  if (!amount.size) {
    const sizeInName = SIZE_WORDS.find((word) => new RegExp(`\\b${word}\\b`).test(normalizeFoodText(foodText)));
    if (sizeInName && entry.portions[sizeInName]) amount.size = sizeInName;
  }

  let unit = amount.unit;
  if (!unit && amount.rest) {
    // "2 eggs" or "3 strawberries" as the amount: the unit is the food itself.
    const restKey = keyOf(amount.rest);
    const nameWords = new Set(entry.aliases.flatMap((alias) => keyOf(alias).split(' ')));
    if (restKey.split(' ').every((word) => nameWords.has(word) || word === 'of')) unit = 'each';
    else if (UNIT_WORDS[restKey]) unit = UNIT_WORDS[restKey];
    else return null;
  }
  if (!unit) unit = 'each';

  let gramsPerUnit = gramsForUnit(entry, unit, amount.size);
  if (gramsPerUnit === null && unit === 'each' && !amount.size) gramsPerUnit = gramsForUnit(entry, 'serving');
  if (gramsPerUnit === null && amount.size && entry.portions.each) {
    gramsPerUnit = entry.portions.each * (SIZE_FACTOR[amount.size] ?? 1);
  }
  if (gramsPerUnit === null && amount.grams === undefined) return null;

  const quantity = amount.quantity > 0 ? amount.quantity : 1;
  const grams = amount.grams ?? Math.round(quantity * (gramsPerUnit as number) * 10) / 10;
  if (!(grams > 0) || grams > 5000) return null;

  const per100g = entry.per100g;
  const estimatedCalories = Math.round((per100g.calories * grams) / 100);
  const qtyLabel = Number.isInteger(quantity) ? String(quantity) : String(round1(quantity));
  const unitLabel = unit === 'each'
    ? (amount.size || entry.eachLabel || 'each')
    : unit === 'floz' ? 'fl oz'
    : `${amount.size ? `${amount.size} ` : ''}${unit}`;

  return {
    ingredient: entry.name.toUpperCase(),
    measurement: `${qtyLabel} ${unitLabel} (~${Math.round(grams)}g)`,
    estimatedCalories,
    equivalentMeasurement: `100g ≈ ${per100g.calories} cal`,
    note: SOURCE_NOTE[entry.source],
    nutritionPer100g: per100g,
    category: 'reference',
    source: 'reference',
  };
}
