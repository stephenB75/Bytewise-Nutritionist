/**
 * Estimated micronutrients for foods that only come with calories and macros: restaurant items
 * (chains publish no vitamins) and the calculator's fallback estimates. Each food is matched to a
 * similar USDA SR Legacy food or food group (fast-food burger, latte, fruit, beans, ...) and that
 * food's micronutrients per calorie are scaled to the food's calories.
 * Values per 100 kcal: mg, except vitamin D, vitamin B12 and folate in µg.
 */

export interface MenuMicros {
  iron: number;
  calcium: number;
  zinc: number;
  magnesium: number;
  vitaminC: number;
  vitaminD: number;
  vitaminB12: number;
  folate: number;
}

const PROFILES: Array<[RegExp, MenuMicros]> = [
  // coffee drink
  [/\b(latte|cappuccino|macchiato|mocha|frappuccino|frappe|cold brew|iced coffee|coffee|chai|flat white|americano)\b/i, { iron: 0.077, calcium: 234.296, zinc: 0.949, magnesium: 44.706, vitaminC: 0.448, vitaminD: 2.337, vitaminB12: 1.032, folate: 10.029 }],
  // shake
  [/\b(shake|milkshake|malt|blizzard|mcflurry|frosty|concrete|custard|sundae|ice cream|cone|gelato)\b/i, { iron: 0.089, calcium: 130.357, zinc: 0.348, magnesium: 10.714, vitaminC: 0, vitaminD: 1.071, vitaminB12: 0.464, folate: 6.25 }],
  // smoothie
  [/\b(smoothie|acai|juice)\b/i, { iron: 0.403, calcium: 65.817, zinc: 0.442, magnesium: 31.184, vitaminC: 33.208, vitaminD: 0, vitaminB12: 0.168, folate: 29.085 }],
  // soda
  [/\b(soda|cola|coke|sprite|lemonade|sweet tea|iced tea|fountain drink|pepsi|dr pepper)\b/i, { iron: 0.048, calcium: 2.381, zinc: 0.214, magnesium: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0, folate: 0 }],
  // breakfast sandwich
  [/\b(mcmuffin|biscuit|croissan|bagel|wake-up wrap|breakfast (sandwich|burrito|wrap|crunchwrap)|egg (sandwich|bites|white)|benedict|omelet|omelette|scrambl)/i, { iron: 0.778, calcium: 45, zinc: 0.406, magnesium: 6.111, vitaminC: 0.204, vitaminD: 0.204, vitaminB12: 0.289, folate: 20.926 }],
  // pancakes
  [/\b(pancakes?|hotcakes|waffles?|french toast|crepes?)\b/i, { iron: 0.626, calcium: 83.733, zinc: 0.318, magnesium: 7.277, vitaminC: 0.103, vitaminD: 0, vitaminB12: 0.075, folate: 13.014 }],
  // fried chicken
  [/\b(fried chicken|tenders?|strips|nuggets?|mcnuggets|wings?|drumsticks?|thighs?|popcorn chicken|chicken bites)\b/i, { iron: 0.274, calcium: 11.842, zinc: 0.301, magnesium: 10.338, vitaminC: 0, vitaminD: 0.019, vitaminB12: 0.083, folate: 6.015 }],
  // chicken sandwich
  [/\bchicken\b.*\b(sandwich|burger|wrap|club|sub)\b|\b(mcchicken|mccrispy)\b/i, { iron: 0.62, calcium: 26.087, zinc: 0.225, magnesium: 7.246, vitaminC: 0.109, vitaminD: 0.072, vitaminB12: 0.12, folate: 10.507 }],
  // fish
  [/\b(fish|filet-o-fish|cod|tilapia|catfish|mahi|grouper|salmon|tuna)\b/i, { iron: 0.438, calcium: 11.919, zinc: 0.197, magnesium: 11.412, vitaminC: 1.082, vitaminD: 2.265, vitaminB12: 0.646, folate: 17.413 }],
  // shrimp
  [/\b(shrimp|scampi|lobster|crab|scallops?|seafood|clams?|calamari)\b/i, { iron: 0.321, calcium: 20.232, zinc: 0.447, magnesium: 11.23, vitaminC: 0, vitaminD: 0, vitaminB12: 0.142, folate: 11.497 }],
  // burger
  [/\b(burgers?|whopper|big mac|quarter pounder|baconator|cheeseburger|hamburger|patty melt|sliders?)\b/i, { iron: 0.833, calcium: 45.556, zinc: 0.819, magnesium: 8.519, vitaminC: 0.148, vitaminD: 0.037, vitaminB12: 0.485, folate: 9.63 }],
  // hot dog
  [/\b(hot ?dogs?|corn dog|bratwurst|sausage)\b/i, { iron: 0.816, calcium: 28.205, zinc: 0.462, magnesium: 5.597, vitaminC: 0.24, vitaminD: 0.151, vitaminB12: 0.254, folate: 18.837 }],
  // pizza
  [/\b(pizza|calzone|stromboli|flatbread)\b/i, { iron: 0.854, calcium: 58.942, zinc: 0.482, magnesium: 8.577, vitaminC: 0.529, vitaminD: 0, vitaminB12: 0.23, folate: 22.993 }],
  // taco
  [/\b(tacos?|chalupa|gordita|crunchwrap|quesadilla|tostada|enchiladas?|chimichanga|fajitas?)\b/i, { iron: 0.67, calcium: 50.843, zinc: 0.605, magnesium: 13.494, vitaminC: 0.145, vitaminD: 0.048, vitaminB12: 0.253, folate: 17.349 }],
  // burrito
  [/\b(burritos?|bowl|burrito bowl)\b.*|\b(chipotle|qdoba|moe)/i, { iron: 0.892, calcium: 38.017, zinc: 0.419, magnesium: 11.019, vitaminC: 0.518, vitaminD: 0.039, vitaminB12: 0.117, folate: 25.62 }],
  // nachos
  [/\b(nachos|chips (and|&) (salsa|queso|guac))\b/i, { iron: 0.461, calcium: 21.461, zinc: 0.479, magnesium: 15.068, vitaminC: 0, vitaminD: 0.046, vitaminB12: 0.142, folate: 6.393 }],
  // sub
  [/\b(subs?|hoagie|sandwich|panini|melt|club|blt|reuben|wrap|gyro|pita)\b/i, { iron: 1.014, calcium: 94.444, zinc: 0.475, magnesium: 11.944, vitaminC: 2.417, vitaminD: 0.056, vitaminB12: 0.094, folate: 36.667 }],
  // fries
  [/\b(fries|tots|hash browns?|potato wedges|curly)\b/i, { iron: 0.26, calcium: 5.769, zinc: 0.16, magnesium: 11.218, vitaminC: 1.506, vitaminD: 0, vitaminB12: 0, folate: 9.615 }],
  // onion rings
  [/\b(onion rings|fried pickles|mozzarella sticks|cheese curds)\b/i, { iron: 0.19, calcium: 27.981, zinc: 0.124, magnesium: 4.623, vitaminC: 0.341, vitaminD: 0, vitaminB12: 0, folate: 10.219 }],
  // salad
  [/\b(salad|greens|caesar)\b/i, { iron: 0.689, calcium: 36.632, zinc: 0.423, magnesium: 12.957, vitaminC: 1.182, vitaminD: 0.04, vitaminB12: 0.114, folate: 43.986 }],
  // steak
  [/\b(steak|sirloin|ribeye|filet|strip|prime rib|brisket|ribs?|pulled pork|pork|bbq|barbecue|beef)\b/i, { iron: 1.218, calcium: 7.28, zinc: 2.475, magnesium: 11.239, vitaminC: 1.226, vitaminD: 0.038, vitaminB12: 1.046, folate: 6.258 }],
  // pasta
  [/\b(pasta|spaghetti|fettuccine|alfredo|lasagna|ravioli|penne|linguine|mac (and|&|n) cheese|noodles?|lo mein|chow mein|pad thai|ramen|pho)\b/i, { iron: 0.655, calcium: 56.983, zinc: 0.519, magnesium: 11.65, vitaminC: 1.412, vitaminD: 0.03, vitaminB12: 0.125, folate: 34.727 }],
  // rice dish
  [/\b(rice|teriyaki|orange chicken|kung pao|general tso|curry|jerk|stir fry|bol|poke)\b/i, { iron: 0.541, calcium: 12.892, zinc: 0.523, magnesium: 12.474, vitaminC: 10.369, vitaminD: 0.021, vitaminB12: 0.071, folate: 17.979 }],
  // dessert
  [/\b(cookies?|cake|bundt|brownie|donuts?|doughnuts?|muffin|pie|cinnamon roll|churro|pastry|danish|scone|cupcake|dessert|cheesecake|crumbl|kreme)\b/i, { iron: 0.244, calcium: 11.183, zinc: 0.147, magnesium: 4.113, vitaminC: 0.129, vitaminD: 0.013, vitaminB12: 0.032, folate: 8.997 }],
  // sides
  [/\b(coleslaw|slaw|mashed|plantains?|yuca)\b/i, { iron: 0.912, calcium: 16.364, zinc: 0.619, magnesium: 35.671, vitaminC: 2.987, vitaminD: 0.052, vitaminB12: 0.018, folate: 59.654 }],
  // milk
  [/\b(milk|kefir|yogurt|yoghurt|lassi)\b/i, { iron: 0.071, calcium: 257.699, zinc: 1.119, magnesium: 23.748, vitaminC: 0.705, vitaminD: 1.558, vitaminB12: 1, folate: 12.616 }],
  // cheese
  [/\b(cheese|cheddar|mozzarella|paneer|ricotta|brie|gouda|queso)\b/i, { iron: 0.083, calcium: 173.077, zinc: 0.934, magnesium: 6.695, vitaminC: 0, vitaminD: 0.142, vitaminB12: 0.481, folate: 4.843 }],
  // egg
  [/\beggs?\b/i, { iron: 1.224, calcium: 39.161, zinc: 0.902, magnesium: 8.392, vitaminC: 0, vitaminD: 1.399, vitaminB12: 0.622, folate: 32.867 }],
  // fruit
  [/\b(fruit|berr(y|ies)|apples?|bananas?|oranges?|mangos?|mangoes|papaya|guava|pineapple|melon|grapes?|peach(es)?|pears?|plums?|cherr(y|ies)|kiwi|lychee|passion fruit|dragon fruit|figs?|dates|apricots?|pomegranate|citrus|lemon|lime|coconut)\b/i, { iron: 0.405, calcium: 30.455, zinc: 0.182, magnesium: 25, vitaminC: 56.955, vitaminD: 0, vitaminB12: 0, folate: 35 }],
  // vegetable
  [/\b(vegetables?|veggies?|broccoli|spinach|greens|kale|collard|callaloo|cabbage|carrots?|peppers?|squash|zucchini|tomato(es)?|okra|eggplant|cauliflower|lettuce|cucumber|asparagus|green beans|peas|mushrooms?|onions?)\b/i, { iron: 3.376, calcium: 155.556, zinc: 1.188, magnesium: 105.128, vitaminC: 96.239, vitaminD: 0, vitaminB12: 0, folate: 287.179 }],
  // beans
  [/\b(beans|lentils?|chickpeas?|dal|dhal|hummus|peas)\b/i, { iron: 2.19, calcium: 18.548, zinc: 0.964, magnesium: 42.742, vitaminC: 0.605, vitaminD: 0, vitaminB12: 0, folate: 133.065 }],
  // nuts
  [/\b(nuts?|almonds?|peanuts?|cashews?|walnuts?|pistachios?|pecans?|seeds?|nut butter)\b/i, { iron: 0.454, calcium: 28.045, zinc: 0.505, magnesium: 38.422, vitaminC: 0, vitaminD: 0, vitaminB12: 0, folate: 12.093 }],
  // seafood
  [/\b(fish|salmon|tuna|cod|tilapia|snapper|mackerel|sardines?|shrimp|prawns?|crab|lobster)\b/i, { iron: 0.279, calcium: 27.869, zinc: 0.679, magnesium: 22.623, vitaminC: 1.213, vitaminD: 4.295, vitaminB12: 0.918, folate: 11.148 }],
  // poultry
  [/\b(chicken|turkey|duck|poultry)\b/i, { iron: 0.63, calcium: 9.091, zinc: 0.606, magnesium: 17.576, vitaminC: 0, vitaminD: 0.061, vitaminB12: 0.206, folate: 2.424 }],
  // red meat
  [/\b(beef|pork|lamb|goat|mutton|veal|ham|meat)\b/i, { iron: 1.226, calcium: 6.087, zinc: 2.757, magnesium: 8.696, vitaminC: 0, vitaminD: 0.043, vitaminB12: 1.187, folate: 3.043 }],
  // grains
  [/\b(rice|oats?|oatmeal|porridge|grits|quinoa|barley|couscous|bread|toast|roll|bun|tortilla|roti|naan|chapati|cereal|crackers?|potato(es)?)\b/i, { iron: 1.254, calcium: 30.62, zinc: 0.312, magnesium: 12.837, vitaminC: 1.803, vitaminD: 0, vitaminB12: 0, folate: 40.639 }],
];

const DEFAULT_PROFILE: MenuMicros = { iron: 0.797, calcium: 39.326, zinc: 0.514, magnesium: 9.085, vitaminC: 0.274, vitaminD: 0.055, vitaminB12: 0.266, folate: 13.728 };

/** Estimated micronutrients for a food described by name, at the given calories. */
export function estimateMicrosForCalories(text: string, calories: number): MenuMicros {
  const profile = PROFILES.find(([pattern]) => pattern.test(text))?.[1] ?? DEFAULT_PROFILE;
  const factor = Math.max(0, calories) / 100;
  const scaled = {} as MenuMicros;
  for (const key of Object.keys(profile) as Array<keyof MenuMicros>) {
    scaled[key] = Math.round(profile[key] * factor * 100) / 100;
  }
  return scaled;
}

/** Micronutrients for one menu item at its published calories. */
export function estimateMenuMicros(item: { name: string; restaurant: string; calories: number; keywords?: string[] }): MenuMicros {
  return estimateMicrosForCalories(`${item.name} ${(item.keywords || []).join(' ')} ${item.restaurant}`, item.calories);
}
