import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Popular chains that were still missing after the cafe/steakhouse pass.
 * Red Lobster uses the June 2026 US nutrition PDF. First Watch uses firstwatch.com.
 * Carrabba's uses the May 2026 OSI nutrition PDF. BJ's uses the restaurant nutrition guide.
 * Famous Dave's uses the Summer/Farmhouse nutrition guide. CPK slice values are from cpk.com.
 * Bob Evans lunch items are from the FY26 lunch/dinner guide. Logan's uses the Oct 2025 PDF.
 * Ben & Jerry's servings are the official 2/3-cup pint serving on benjerry.com.
 * Twin Peaks — July 2026 nutrition & allergen PDF (burgers/sandwiches without fries unless named).
 * Mellow Mushroom — Nutritionix interactive menu (Apr 2026).
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

export const MORE_PLACES_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // Red Lobster — official US nutrition PDF (entrée without chosen side unless named)
  item('rl-cheddar-bay', 'Cheddar Bay Biscuit', 'Red Lobster', 'snacks', '1 biscuit', 160, 3, 16, 10, 380, ['biscuit', 'bread']),
  item('rl-shrimp-scampi', 'Garlic Shrimp Scampi', 'Red Lobster', 'dinner', '1 entrée add-on', 220, 12, 3, 18, 970, ['shrimp']),
  item('rl-shrimp-scampi-lunch', 'Garlic Shrimp Scampi (lunch)', 'Red Lobster', 'lunch', '1 lunch entrée', 440, 24, 7, 35, 1940, ['shrimp']),
  item('rl-coconut-shrimp', 'Parrot Isle Coconut Shrimp', 'Red Lobster', 'dinner', '1 entrée', 470, 13, 41, 29, 620, ['shrimp']),
  item('rl-walts-shrimp', "Walt's Favorite Shrimp", 'Red Lobster', 'dinner', '1 entrée', 260, 10, 31, 11, 1560, ['shrimp']),
  item('rl-shrimp-alfredo', 'Shrimp Linguini Alfredo', 'Red Lobster', 'dinner', '1 entrée', 620, 27, 56, 31, 1230, ['pasta', 'shrimp']),
  item('rl-lobster-bisque-cup', 'Lobster Bisque (cup)', 'Red Lobster', 'lunch', '1 cup', 340, 6, 17, 27, 800, ['soup']),
  item('rl-lobster-bisque-bowl', 'Lobster Bisque (bowl)', 'Red Lobster', 'lunch', '1 bowl', 630, 11, 27, 52, 1520, ['soup']),
  item('rl-maine-tail', 'Maine Lobster Tail', 'Red Lobster', 'dinner', '1 tail', 420, 14, 0, 37, 1020, ['lobster']),
  item('rl-grilled-salmon', 'Grilled Atlantic Salmon', 'Red Lobster', 'dinner', '1 entrée', 510, 47, 1, 34, 680, ['fish']),
  item('rl-filet-6', 'Steak, 6 oz Filet Mignon', 'Red Lobster', 'dinner', '6 oz', 260, 34, 1, 14, 850, ['steak']),
  item('rl-sirloin-7', 'Steak, 7 oz Sirloin', 'Red Lobster', 'dinner', '7 oz', 320, 46, 1, 15, 980, ['steak']),
  item('rl-surf-turf', 'Surf & Turf (lobster tail + 6 oz filet)', 'Red Lobster', 'dinner', '1 entrée', 680, 47, 2, 54, 1590, ['lobster', 'steak']),
  item('rl-house-salad', 'House Salad', 'Red Lobster', 'lunch', '1 salad', 160, 8, 12, 9, 230, ['salad']),
  item('rl-key-lime', 'Key Lime Pie', 'Red Lobster', 'snacks', '1 slice', 580, 10, 76, 27, 270, ['dessert']),
  item('rl-clam-chowder-cup', 'New England Clam Chowder (cup)', 'Red Lobster', 'lunch', '1 cup', 280, 8, 21, 17, 780, ['soup']),

  // First Watch — firstwatch.com nutrition
  item('fw-traditional', 'The Traditional Breakfast', 'First Watch', 'breakfast', '1 plate', 1000, 30, 81, 59, 2630, ['eggs', 'bacon']),
  item('fw-avocado-toast', 'Avocado Toast', 'First Watch', 'breakfast', '1 order', 580, 24, 38, 39, 1290, ['toast']),
  item('fw-chickichanga', 'Chickichanga', 'First Watch', 'breakfast', '1 burrito', 1150, 38, 81, 73, 3310, ['burrito']),
  item('fw-healthy-turkey', 'Healthy Turkey Omelet', 'First Watch', 'breakfast', '1 omelet', 480, 49, 47, 12, 1590, ['omelet']),
  item('fw-tri-athlete', 'Tri-Athlete', 'First Watch', 'breakfast', '1 omelet', 450, 31, 67, 8, 840, ['omelet']),
  item('fw-power-wrap', 'Power Wrap', 'First Watch', 'breakfast', '1 wrap', 500, 37, 63, 11, 950, ['wrap']),
  item('fw-classic-benedict', 'Classic Benedict', 'First Watch', 'breakfast', '1 order', 660, 42, 42, 35, 2035, ['eggs']),
  item('fw-french-toast', 'French Toast', 'First Watch', 'breakfast', '1 order', 740, 19, 103, 27, 650),
  item('fw-belgian-waffle', 'Belgian Waffle', 'First Watch', 'breakfast', '1 waffle', 590, 2, 96, 20, 1000),
  item('fw-superfoods', 'A.M. Superfoods Bowl', 'First Watch', 'breakfast', '1 bowl', 900, 22, 95, 52, 1085, ['bowl']),
  item('fw-million-bacon', 'Million Dollar Bacon', 'First Watch', 'snacks', '1 order', 250, 7, 22, 15, 380, ['bacon']),
  item('fw-kale-berry', 'Kale & Berry Salad', 'First Watch', 'lunch', '1 salad', 620, 30, 59, 32, 930, ['salad']),
  item('fw-pesto-bowl', 'Pesto Chicken Power Bowl', 'First Watch', 'lunch', '1 bowl', 650, 31, 52, 38, 1350, ['bowl']),

  // Carrabba's Italian Grill — May 2026 OSI PDF (entrée without side unless named)
  item('carrabbas-chicken-bryan', 'Chicken Bryan', "Carrabba's Italian Grill", 'dinner', '1 entrée', 490, 54, 12, 25, 1080, ['chicken']),
  item('carrabbas-chicken-marsala', 'Chicken Marsala', "Carrabba's Italian Grill", 'dinner', '1 entrée', 460, 56, 5, 23, 800, ['chicken']),
  item('carrabbas-tuscan-chicken', 'Tuscan-Grilled Chicken', "Carrabba's Italian Grill", 'dinner', '1 entrée', 270, 55, 0, 5, 450, ['chicken']),
  item('carrabbas-chicken-parm', 'Chicken Parmesan', "Carrabba's Italian Grill", 'dinner', '1 entrée', 760, 68, 19, 45, 1890, ['chicken']),
  item('carrabbas-pollo-rosa', 'Pollo Rosa Maria', "Carrabba's Italian Grill", 'dinner', '1 entrée', 550, 69, 6, 27, 1420, ['chicken']),
  item('carrabbas-lasagna', 'Lasagne', "Carrabba's Italian Grill", 'dinner', '1 entrée', 1030, 54, 72, 58, 2570, ['pasta']),
  item('carrabbas-spaghetti-meatballs', 'Spaghetti with Meatballs', "Carrabba's Italian Grill", 'dinner', '1 entrée', 1220, 56, 141, 46, 3230, ['pasta']),
  item('carrabbas-spaghetti-pomodoro', 'Spaghetti with Pomodoro Sauce', "Carrabba's Italian Grill", 'dinner', '1 entrée', 730, 24, 130, 12, 2070, ['pasta']),
  item('carrabbas-mama-mandola', "Mama Mandola's Sicilian Chicken Soup (bowl)", "Carrabba's Italian Grill", 'lunch', '1 bowl', 320, 24, 32, 11, 2430, ['soup']),
  item('carrabbas-minestrone', 'Minestrone Soup (bowl)', "Carrabba's Italian Grill", 'lunch', '1 bowl', 270, 9, 44, 9, 820, ['soup']),
  item('carrabbas-meatballs', 'Meatballs and Ricotta', "Carrabba's Italian Grill", 'snacks', '1 order', 480, 28, 17, 33, 1630, ['appetizer']),
  item('carrabbas-grilled-salmon', 'Simply Grilled Salmon', "Carrabba's Italian Grill", 'dinner', '1 entrée', 540, 45, 1, 39, 680, ['fish']),

  // BJ's Restaurant & Brewhouse — official nutrition guide
  item('bjs-pizookie-cnc', "Cookies 'n' Cream Pizookie", "BJ's Restaurant & Brewhouse", 'snacks', '1 dessert', 1170, 17, 177, 45, 839, ['dessert', 'pizookie']),
  item('bjs-pizookie-mini', "Mini Cookies 'n' Cream Pizookie", "BJ's Restaurant & Brewhouse", 'snacks', '1 mini dessert', 680, 9, 88, 33, 520, ['dessert', 'pizookie']),
  item('bjs-sals-chicken', "Sal's Brewhouse Chicken", "BJ's Restaurant & Brewhouse", 'dinner', '1 entrée', 1000, 54, 45, 67, 3014, ['chicken']),
  item('bjs-parm-chicken', 'Parmesan-Crusted Chicken', "BJ's Restaurant & Brewhouse", 'dinner', '1 entrée', 1330, 89, 70, 76, 2216, ['chicken']),
  item('bjs-enlightened-salmon', 'Enlightened Cherry Chipotle Glazed Salmon', "BJ's Restaurant & Brewhouse", 'dinner', '1 entrée', 580, 46, 40, 26, 889, ['fish']),
  item('bjs-protein-bowl-chicken', 'Brewhouse Protein Bowl with Oven-Roasted Chicken', "BJ's Restaurant & Brewhouse", 'lunch', '1 bowl', 710, 54, 59, 27, 2901, ['bowl']),
  item('bjs-deep-dish-pepperoni', 'Pepperoni Extreme Deep Dish Pizza (large slice)', "BJ's Restaurant & Brewhouse", 'dinner', '1 slice', 360, 12, 37, 17, 795, ['pizza']),

  // California Pizza Kitchen — cpk.com calories; BBQ chicken macros from published slice facts
  item('cpk-bbq-chicken-slice', 'The Original BBQ Chicken Pizza', 'California Pizza Kitchen', 'dinner', '1 slice', 190, 11, 25, 5, 480, ['pizza']),

  // Famous Dave's — official Summer/Farmhouse nutrition guide (meats without sides unless named)
  item('fd-brisket-sandwich', 'Texas Beef Brisket Sandwich', "Famous Dave's", 'sandwiches', '1 sandwich', 690, 52, 49, 33, 1450, ['bbq']),
  item('fd-pork-sandwich', 'Georgia Chopped Pork Sandwich', "Famous Dave's", 'sandwiches', '1 sandwich', 730, 49, 51, 38, 1660, ['bbq']),
  item('fd-pulled-chicken-sandwich', 'BBQ Pulled Chicken Sandwich', "Famous Dave's", 'sandwiches', '1 sandwich', 580, 31, 66, 23, 1520, ['bbq']),
  item('fd-ribs-4', 'St. Louis-Style Spareribs (4 bones, Rich & Sassy)', "Famous Dave's", 'dinner', '4 bones', 640, 47, 9, 46, 1300, ['ribs', 'bbq']),
  item('fd-ribs-6', 'St. Louis-Style Spareribs (6 bones, Rich & Sassy)', "Famous Dave's", 'dinner', '6 bones', 960, 71, 13, 69, 1940, ['ribs', 'bbq']),
  item('fd-baby-half', 'Half Baby Back Ribs (Sweet & Zesty)', "Famous Dave's", 'dinner', 'half rack', 560, 50, 7, 37, 1180, ['ribs', 'bbq']),
  item('fd-brisket-4oz', 'Texas Beef Brisket with Texas Toast (4 oz)', "Famous Dave's", 'dinner', '4 oz + toast', 490, 40, 26, 26, 970, ['bbq']),
  item('fd-burnt-ends', 'Burnt Ends (6 oz)', "Famous Dave's", 'dinner', '6 oz', 480, 45, 17, 25, 1340, ['bbq']),
  item('fd-corn-muffin', 'Corn Bread Muffin', "Famous Dave's", 'snacks', '1 muffin', 260, 4, 40, 10, 310, ['cornbread']),
  item('fd-fries', 'Famous Fries', "Famous Dave's", 'snacks', '1 side', 370, 5, 52, 16, 630, ['french fries']),
  item('fd-coleslaw', 'Creamy Coleslaw', "Famous Dave's", 'snacks', '1 side', 120, 1, 14, 7, 230),
  item('fd-mac', "Dave's Cheesy Mac & Cheese", "Famous Dave's", 'snacks', '1 side', 280, 12, 34, 11, 540),
  item('fd-chili', "Dave's Award-Winning Chili", "Famous Dave's", 'lunch', '1 bowl', 620, 31, 41, 36, 1330, ['chili']),

  // Bob Evans — FY26 lunch/dinner guide
  item('bob-evans-wildfire-salad', 'Wildfire Chicken Salad (grilled)', 'Bob Evans', 'lunch', '1 salad', 520, 45, 38, 21, 1290, ['salad']),
  item('bob-evans-tenders', 'Hand-Breaded Chicken Tenders (5)', 'Bob Evans', 'dinner', '5 tenders', 450, 52, 22, 17, 810, ['tenders']),
  item('bob-evans-country-fried', 'Down-Home Country Fried Steak', 'Bob Evans', 'dinner', '1 entrée', 730, 25, 58, 45, 1890, ['steak']),
  item('bob-evans-chicken-noodles', 'Chicken-N-Noodles (cup)', 'Bob Evans', 'lunch', '1 cup', 120, 9, 13, 5, 560, ['soup']),
  item('bob-evans-baked-potato', 'Cheddar Baked Potato', 'Bob Evans', 'snacks', '1 potato', 210, 9, 16, 12, 900),
  item('bob-evans-apple-pie', 'Double-Crust Apple Pie', 'Bob Evans', 'snacks', '1 slice', 580, 5, 80, 28, 250, ['dessert']),
  item('bob-evans-coleslaw', 'Signature Coleslaw', 'Bob Evans', 'snacks', '1 side', 170, 1, 16, 12, 210),

  // Logan's Roadhouse — Oct 2025 nutrition PDF
  item('logans-bbq-chicken', 'Cedar Plank 1/4 BBQ Chicken', "Logan's Roadhouse", 'dinner', '1/4 chicken', 574, 32, 22, 37, 2127, ['chicken', 'bbq']),
  item('logans-grilled-chicken', 'Wood-Grilled Chicken with Roadhouse Rice', "Logan's Roadhouse", 'dinner', '1 entrée', 820, 50, 30, 54, 1860, ['chicken']),
  item('logans-kickin-salad', "Kickin' Chicken Salad (blackened)", "Logan's Roadhouse", 'lunch', '1 salad', 770, 56, 25, 62, 2259, ['salad']),

  // Ben & Jerry's — official 2/3-cup pint serving
  item('bj-cherry-garcia', 'Cherry Garcia', "Ben & Jerry's", 'snacks', '2/3 cup', 250, 4, 29, 14, 40, ['ice cream', 'dessert']),
  item('bj-half-baked', 'Half Baked', "Ben & Jerry's", 'snacks', '2/3 cup', 270, 4, 34, 14, 85, ['ice cream', 'dessert']),
  item('bj-cookie-dough', 'Chocolate Chip Cookie Dough', "Ben & Jerry's", 'snacks', '2/3 cup', 270, 4, 32, 14, 75, ['ice cream', 'dessert']),
  item('bj-phish-food', 'Phish Food', "Ben & Jerry's", 'snacks', '2/3 cup', 280, 4, 36, 14, 75, ['ice cream', 'dessert']),

  // Twin Peaks — July 2026 nutrition PDF (no fries unless named)
  item('twin-peaks-cheeseburger', 'Cheeseburger with American (no fries)', 'Twin Peaks', 'sandwiches', '1 burger', 810, 31, 45, 55, 1430, ['burger']),
  item('twin-peaks-avocado-smash', 'Avocado Smash Burger (no fries)', 'Twin Peaks', 'sandwiches', '1 burger', 820, 33, 44, 56, 930, ['burger', 'avocado']),
  item('twin-peaks-billionaire', "Billionaire's Bacon Burger (no fries)", 'Twin Peaks', 'sandwiches', '1 burger', 1030, 37, 85, 60, 1490, ['burger', 'bacon']),
  item('twin-peaks-hangover', 'The Hangover (no fries)', 'Twin Peaks', 'sandwiches', '1 burger', 980, 41, 44, 68, 1350, ['burger']),
  item('twin-peaks-smokestack', 'The Smokestack (no fries)', 'Twin Peaks', 'sandwiches', '1 burger', 1150, 44, 57, 81, 1800, ['burger']),
  item('twin-peaks-wings-naked-6', 'Bone-In Naked Wings (6, no sauce)', 'Twin Peaks', 'lunch', '6 wings', 570, 53, 0, 38, 230, ['wings']),
  item('twin-peaks-wings-boneless-6', 'Boneless Wings (6, no sauce)', 'Twin Peaks', 'lunch', '6 wings', 500, 39, 35, 23, 930, ['wings']),
  item('twin-peaks-fries', 'French Fries with Ketchup', 'Twin Peaks', 'snacks', '1 entrée side', 400, 2, 54, 22, 1390, ['fries']),
  item('twin-peaks-chicken-ranch', 'Chicken Ranch Sandwich — Grilled (no fries)', 'Twin Peaks', 'sandwiches', '1 sandwich', 840, 48, 41, 52, 1620, ['chicken']),
  item('twin-peaks-nashville', 'Nashville Hot Chicken Sandwich (no fries)', 'Twin Peaks', 'sandwiches', '1 sandwich', 1310, 40, 97, 85, 3170, ['chicken', 'spicy']),
  item('twin-peaks-philly', 'Philly Cheesesteak (no fries)', 'Twin Peaks', 'sandwiches', '1 sandwich', 1200, 51, 69, 80, 2350, ['philly', 'cheesesteak']),
  item('twin-peaks-street-tacos', 'Street Tacos — Smoked Chicken (3)', 'Twin Peaks', 'lunch', '3 tacos', 610, 22, 45, 37, 1090, ['tacos']),
  item('twin-peaks-caesar', 'Chicken Caesar Salad (no dressing)', 'Twin Peaks', 'lunch', '1 salad', 440, 32, 15, 28, 1070, ['salad']),
  item('twin-peaks-pepperoni-flatbread', 'OG Pepperoni Flatbread', 'Twin Peaks', 'dinner', '1 flatbread', 1380, 52, 105, 83, 3560, ['pizza', 'flatbread']),

  // Mellow Mushroom — Nutritionix interactive menu (Apr 2026)
  item('mellow-cheese-bread', 'Cheese Bread', 'Mellow Mushroom', 'snacks', '1 order', 890, 38, 91, 46, 1740, ['bread', 'appetizer']),
  item('mellow-pretzel-bites', 'Pretzel Bites with Beer Cheese', 'Mellow Mushroom', 'snacks', '1 order', 1240, 45, 190, 34, 2850, ['pretzel']),
  item('mellow-spinach-dip', 'Spinach Artichoke Dip', 'Mellow Mushroom', 'snacks', '1 appetizer', 650, 24, 58, 37, 1330, ['dip']),
  item('mellow-wings-10', 'Wings (10, no sauce)', 'Mellow Mushroom', 'lunch', '10 wings', 1000, 91, 0, 67, 280, ['wings']),
  item('mellow-cheese-slice-lg', 'Cheese Pizza (large slice)', 'Mellow Mushroom', 'dinner', '1 slice', 430, 21, 61, 12, 1010, ['pizza']),
  item('mellow-mighty-meaty-lg', 'Mighty Meaty Pizza (large slice)', 'Mellow Mushroom', 'dinner', '1 slice', 530, 28, 61, 20, 1370, ['pizza']),
  item('mellow-kosmic-lg', 'Kosmic Karma Pizza (large slice)', 'Mellow Mushroom', 'dinner', '1 slice', 490, 22, 62, 18, 1070, ['pizza']),
  item('mellow-holy-shiitake-lg', 'Holy Shiitake Pie (large slice)', 'Mellow Mushroom', 'dinner', '1 slice', 530, 20, 59, 25, 870, ['pizza']),
  item('mellow-house-special-lg', 'House Special Pizza (large slice)', 'Mellow Mushroom', 'dinner', '1 slice', 510, 27, 62, 18, 1250, ['pizza']),
  item('mellow-smashburger', "Mel's All American Smashburger", 'Mellow Mushroom', 'sandwiches', '1 burger', 1660, 46, 97, 111, 2860, ['burger']),
  item('mellow-chicken-hoagie-half', 'Chicken & Cheese Hoagie (half)', 'Mellow Mushroom', 'sandwiches', 'half', 740, 41, 49, 40, 860, ['hoagie', 'chicken']),
  item('mellow-brownie', "Mary Jane's Triple Chocolate Brownie", 'Mellow Mushroom', 'snacks', '1 dessert', 510, 6, 68, 25, 170, ['dessert']),
];
