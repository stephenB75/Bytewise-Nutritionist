import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Bagel shops missing from Places (Einstein Bros. already catalogued elsewhere).
 * H&H Bagels — product labels / EatThisMuch (NYC).
 * Bruegger's Bagels — June 2026 nutrition guide PDF.
 * Noah's New York Bagels — 2026 nutrition guide PDF.
 * Manhattan Bagel — Aug 2025 nutrition guide PDF.
 * Ess-a-Bagel — published bagel nutrition (plain verified; other flavors size-scaled / Atwater-aligned).
 * PopUp Bagels — published sample macros + typical schmear estimates.
 * Brooklyn Water Bagels — official nutritional information PDF (bagels, flagels, sandwiches).
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

export const BAGEL_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // ——— H&H Bagels ———
  item('hh-plain', 'Plain Bagel', 'H&H Bagels', 'breakfast', '1 bagel', 320, 13, 67, 0, 300, ['bagel']),
  item('hh-everything', 'Everything Bagel', 'H&H Bagels', 'breakfast', '1 bagel', 330, 13, 64, 2, 1200, ['bagel', 'everything']),
  item('hh-sesame', 'Sesame Bagel', 'H&H Bagels', 'breakfast', '1 bagel', 310, 12, 61, 6, 230, ['bagel', 'sesame']),
  item('hh-whole-wheat', 'Whole Wheat Everything Bagel', 'H&H Bagels', 'breakfast', '1 bagel', 320, 12, 64, 1, 460, ['bagel', 'whole wheat']),
  item('hh-cinnamon-raisin', 'Cinnamon Raisin Bagel', 'H&H Bagels', 'breakfast', '1 bagel', 330, 12, 68, 1, 420, ['bagel', 'cinnamon']),
  item('hh-onion', 'Onion Bagel', 'H&H Bagels', 'breakfast', '1 bagel', 320, 13, 66, 1, 480, ['bagel', 'onion']),
  item('hh-poppy', 'Poppy Seed Bagel', 'H&H Bagels', 'breakfast', '1 bagel', 320, 13, 65, 2, 450, ['bagel']),
  item('hh-pumpernickel', 'Pumpernickel Bagel', 'H&H Bagels', 'breakfast', '1 bagel', 300, 12, 62, 1, 400, ['bagel']),
  item('hh-plain-cc', 'Plain Bagel with Plain Cream Cheese', 'H&H Bagels', 'breakfast', '1 bagel + spread', 440, 15, 69, 12, 420, ['bagel', 'cream cheese']),
  item('hh-everything-cc', 'Everything Bagel with Scallion Cream Cheese', 'H&H Bagels', 'breakfast', '1 bagel + spread', 450, 15, 66, 14, 1320, ['bagel', 'cream cheese']),
  item('hh-nova', 'Everything Bagel with Nova & Cream Cheese', 'H&H Bagels', 'breakfast', '1 sandwich', 550, 27, 66, 20, 1850, ['bagel', 'lox', 'salmon', 'nova']),
  item('hh-egg-cheese', 'Bacon, Egg & Cheese on Plain Bagel', 'H&H Bagels', 'breakfast', '1 sandwich', 580, 28, 68, 22, 1180, ['bagel', 'egg', 'bacon']),

  // ——— Bruegger's Bagels (2026 guide) ———
  item('bru-plain', 'Plain Bagel', "Bruegger's Bagels", 'breakfast', '1 bagel', 290, 11, 59, 1, 610, ['bagel']),
  item('bru-everything', 'Everything Bagel', "Bruegger's Bagels", 'breakfast', '1 bagel', 330, 12, 64, 3, 790, ['bagel', 'everything']),
  item('bru-asiago', 'Asiago Parmesan Bagel', "Bruegger's Bagels", 'breakfast', '1 bagel', 320, 14, 59, 3, 720, ['bagel', 'asiago']),
  item('bru-blueberry', 'Blueberry Bagel', "Bruegger's Bagels", 'breakfast', '1 bagel', 310, 10, 65, 1, 520, ['bagel', 'blueberry']),
  item('bru-sesame', 'Sesame Bagel', "Bruegger's Bagels", 'breakfast', '1 bagel', 380, 14, 61, 9, 620, ['bagel', 'sesame']),
  item('bru-egg', 'Egg Bagel', "Bruegger's Bagels", 'breakfast', '1 bagel', 300, 11, 61, 1.5, 610, ['bagel', 'egg']),
  item('bru-ww-everything', 'Everything Whole Wheat Bagel', "Bruegger's Bagels", 'breakfast', '1 bagel', 330, 13, 64, 3, 800, ['bagel', 'whole wheat']),
  item('bru-plain-cc', 'Plain Cream Cheese (1.5 oz)', "Bruegger's Bagels", 'snacks', '1.5 oz', 110, 3, 3, 10, 140, ['cream cheese', 'shmear']),
  item('bru-light-cc', 'Light Plain Cream Cheese (1.5 oz)', "Bruegger's Bagels", 'snacks', '1.5 oz', 80, 3, 3, 7, 220, ['cream cheese', 'shmear']),
  item('bru-egg-cheese', 'Egg & Cheese on Bagel', "Bruegger's Bagels", 'breakfast', '1 sandwich', 430, 21, 60, 11, 840, ['bagel', 'egg']),
  item('bru-bec', 'Bacon, Egg & Cheese on Bagel', "Bruegger's Bagels", 'breakfast', '1 sandwich', 530, 28, 62, 19, 1200, ['bagel', 'bacon', 'egg']),
  item('bru-ham-egg', 'Ham, Egg & Cheese on Bagel', "Bruegger's Bagels", 'breakfast', '1 sandwich', 470, 26, 62, 13, 1330, ['bagel', 'ham', 'egg']),
  item('bru-sausage-egg', 'Pork Sausage, Egg & Cheese on Bagel', "Bruegger's Bagels", 'breakfast', '1 sandwich', 610, 27, 60, 28, 1120, ['bagel', 'sausage', 'egg']),
  item('bru-turkey-sausage', 'Turkey Sausage, Egg & Cheese on Bagel', "Bruegger's Bagels", 'breakfast', '1 sandwich', 520, 28, 60, 18, 1120, ['bagel', 'turkey', 'egg']),
  item('bru-salmon', 'Smoked Salmon on Plain Bagel', "Bruegger's Bagels", 'breakfast', '1 sandwich', 510, 26, 65, 17, 1470, ['bagel', 'salmon', 'lox']),
  item('bru-farmhouse', 'Farmhouse Egg Sandwich', "Bruegger's Bagels", 'breakfast', '1 sandwich', 730, 37, 66, 36, 1790, ['bagel', 'egg']),
  item('bru-blt', 'BLT on Bagel', "Bruegger's Bagels", 'sandwiches', '1 sandwich', 540, 22, 64, 23, 1140, ['bagel', 'blt']),
  item('bru-turkey', 'Turkey Deli Sandwich on Bagel', "Bruegger's Bagels", 'sandwiches', '1 sandwich', 450, 30, 71, 8, 1360, ['bagel', 'turkey']),

  // ——— Noah's New York Bagels (2026 guide) ———
  item('noah-plain', 'Plain Bagel', "Noah's New York Bagels", 'breakfast', '1 bagel', 270, 10, 54, 1, 610, ['bagel']),
  item('noah-everything', 'Everything Bagel', "Noah's New York Bagels", 'breakfast', '1 bagel', 280, 10, 55, 1.5, 670, ['bagel', 'everything']),
  item('noah-asiago', 'Asiago Bagel', "Noah's New York Bagels", 'breakfast', '1 bagel', 310, 13, 54, 4, 750, ['bagel', 'asiago']),
  item('noah-sesame', 'Sesame Seed Bagel', "Noah's New York Bagels", 'breakfast', '1 bagel', 290, 11, 54, 2.5, 610, ['bagel', 'sesame']),
  item('noah-cinnamon-raisin', 'Cinnamon Raisin Bagel', "Noah's New York Bagels", 'breakfast', '1 bagel', 270, 10, 57, 1, 460, ['bagel', 'cinnamon']),
  item('noah-honey-ww', 'Honey Whole Wheat Bagel', "Noah's New York Bagels", 'breakfast', '1 bagel', 270, 12, 49, 3, 440, ['bagel', 'whole wheat']),
  item('noah-pumpernickel', 'Pumpernickel Bagel', "Noah's New York Bagels", 'breakfast', '1 bagel', 260, 10, 53, 1, 420, ['bagel']),
  item('noah-six-cheese', 'Six-Cheese Bagel', "Noah's New York Bagels", 'breakfast', '1 bagel', 350, 17, 51, 8, 720, ['bagel', 'cheese']),
  item('noah-plain-shmear', 'Plain Whipped Cream Cheese Shmear', "Noah's New York Bagels", 'snacks', '1.2 oz', 120, 2, 2, 12, 120, ['cream cheese', 'shmear']),
  item('noah-onion-shmear', 'Onion & Chive Cream Cheese Shmear', "Noah's New York Bagels", 'snacks', '1.2 oz', 110, 2, 4, 10, 105, ['cream cheese', 'shmear']),
  item('noah-bec', 'Bacon & Cheddar Egg Sandwich on Plain', "Noah's New York Bagels", 'breakfast', '1 sandwich', 450, 23, 55, 15, 1000, ['bagel', 'bacon', 'egg']),
  item('noah-ham-swiss', 'Ham & Swiss Egg Sandwich on Plain', "Noah's New York Bagels", 'breakfast', '1 sandwich', 440, 29, 56, 12, 1300, ['bagel', 'ham', 'egg']),
  item('noah-turkey-sausage', 'Turkey Sausage & Cheddar Egg Sandwich', "Noah's New York Bagels", 'breakfast', '1 sandwich', 500, 27, 55, 18, 1120, ['bagel', 'turkey', 'egg']),
  item('noah-farmhouse', 'Farmhouse 6 Cheese Egg Sandwich', "Noah's New York Bagels", 'breakfast', '1 sandwich', 650, 38, 57, 30, 1790, ['bagel', 'egg']),
  item('noah-nova', 'Nova Lox on Plain Bagel', "Noah's New York Bagels", 'breakfast', '1 sandwich', 500, 24, 60, 19, 1410, ['bagel', 'lox', 'salmon', 'nova']),
  item('noah-bagel-dog', 'Original Bagel Dog', "Noah's New York Bagels", 'lunch', '1 dog', 540, 20, 57, 26, 1380, ['bagel', 'hot dog']),
  item('noah-pastrami', 'Hot Pastrami on Everything', "Noah's New York Bagels", 'sandwiches', '1 sandwich', 690, 43, 59, 31, 2100, ['bagel', 'pastrami']),
  item('noah-pizza', 'Cheese Pizza Bagel', "Noah's New York Bagels", 'lunch', '1 bagel', 440, 24, 58, 14, 1080, ['bagel', 'pizza']),

  // ——— Manhattan Bagel (2025 guide) ———
  item('mb-plain', 'Plain Bagel', 'Manhattan Bagel', 'breakfast', '1 bagel', 300, 11, 60, 1, 610, ['bagel']),
  item('mb-everything', 'Everything Bagel', 'Manhattan Bagel', 'breakfast', '1 bagel', 330, 12, 62, 2.5, 1040, ['bagel', 'everything']),
  item('mb-asiago', 'Asiago Bagel', 'Manhattan Bagel', 'breakfast', '1 bagel', 340, 15, 60, 4, 750, ['bagel', 'asiago']),
  item('mb-sesame', 'Sesame Seed Bagel', 'Manhattan Bagel', 'breakfast', '1 bagel', 340, 13, 60, 5, 610, ['bagel', 'sesame']),
  item('mb-cinnamon-raisin', 'Cinnamon Raisin Bagel', 'Manhattan Bagel', 'breakfast', '1 bagel', 310, 11, 63, 1, 550, ['bagel', 'cinnamon']),
  item('mb-egg', 'Egg Bagel', 'Manhattan Bagel', 'breakfast', '1 bagel', 310, 11, 63, 1.5, 780, ['bagel', 'egg']),
  item('mb-multigrain', 'Multigrain Bagel', 'Manhattan Bagel', 'breakfast', '1 bagel', 330, 12, 68, 2.5, 670, ['bagel']),
  item('mb-bialy', 'Bialy', 'Manhattan Bagel', 'breakfast', '1 bialy', 310, 10, 54, 5, 860, ['bialy', 'bagel']),
  item('mb-plain-cc', 'Plain Cream Cheese', 'Manhattan Bagel', 'snacks', '1.2 oz', 120, 2, 2, 12, 120, ['cream cheese', 'shmear']),
  item('mb-onion-cc', 'Onion & Chive Cream Cheese', 'Manhattan Bagel', 'snacks', '1.2 oz', 110, 2, 4, 10, 105, ['cream cheese', 'shmear']),
  item('mb-bagel-classic-cheese', 'Bagel Classic Egg & Cheese on Plain', 'Manhattan Bagel', 'breakfast', '1 sandwich', 490, 24, 65, 15, 1280, ['bagel', 'egg']),
  item('mb-farmhouse', 'Farmhouse Egg Sandwich', 'Manhattan Bagel', 'breakfast', '1 sandwich', 660, 38, 67, 26, 1930, ['bagel', 'egg']),
  item('mb-all-american', 'All-American Egg Sandwich', 'Manhattan Bagel', 'breakfast', '1 sandwich', 840, 35, 69, 48, 2310, ['bagel', 'egg']),
  item('mb-nova', 'Nova Lox Sandwich', 'Manhattan Bagel', 'breakfast', '1 sandwich', 680, 28, 65, 35, 1610, ['bagel', 'lox', 'salmon', 'nova']),
  item('mb-avocado-egg-white', 'Avocado Egg White Sandwich', 'Manhattan Bagel', 'breakfast', '1 sandwich', 520, 24, 72, 15, 1330, ['bagel', 'egg white', 'avocado']),
  item('mb-brisket-egg', 'Brisket & Egg Sandwich', 'Manhattan Bagel', 'breakfast', '1 sandwich', 830, 35, 65, 48, 1620, ['bagel', 'brisket', 'egg']),

  // ——— Ess-a-Bagel ———
  item('ess-plain', 'Plain Bagel', 'Ess-a-Bagel', 'breakfast', '1 bagel (5.43 oz)', 390, 15, 81, 1, 420, ['bagel']),
  item('ess-everything', 'Everything Bagel', 'Ess-a-Bagel', 'breakfast', '1 bagel (6.625 oz)', 470, 17, 96, 3, 980, ['bagel', 'everything']),
  item('ess-sesame', 'Sesame Bagel', 'Ess-a-Bagel', 'breakfast', '1 bagel (6.625 oz)', 460, 16, 92, 5, 520, ['bagel', 'sesame']),
  item('ess-cinnamon-raisin', 'Cinnamon Raisin Bagel', 'Ess-a-Bagel', 'breakfast', '1 bagel (6.625 oz)', 480, 14, 100, 2, 480, ['bagel', 'cinnamon']),
  item('ess-onion', 'Onion Bagel', 'Ess-a-Bagel', 'breakfast', '1 bagel (6 oz)', 430, 15, 88, 2, 560, ['bagel', 'onion']),
  item('ess-whole-wheat', 'Whole Wheat Bagel', 'Ess-a-Bagel', 'breakfast', '1 bagel (5.43 oz)', 370, 16, 74, 2, 400, ['bagel', 'whole wheat']),
  item('ess-pumpernickel', 'Pumpernickel Bagel', 'Ess-a-Bagel', 'breakfast', '1 bagel (5.43 oz)', 380, 14, 78, 2, 440, ['bagel']),
  item('ess-poppy', 'Poppy Bagel', 'Ess-a-Bagel', 'breakfast', '1 bagel', 400, 15, 82, 2, 450, ['bagel']),
  item('ess-plain-cc', 'Plain Bagel with Cream Cheese', 'Ess-a-Bagel', 'breakfast', '1 bagel + spread', 530, 17, 83, 14, 560, ['bagel', 'cream cheese']),
  item('ess-everything-cc', 'Everything Bagel with Cream Cheese', 'Ess-a-Bagel', 'breakfast', '1 bagel + spread', 610, 19, 98, 16, 1120, ['bagel', 'cream cheese']),
  item('ess-nova', 'Everything Bagel with Nova & Cream Cheese', 'Ess-a-Bagel', 'breakfast', '1 sandwich', 710, 31, 98, 22, 1770, ['bagel', 'lox', 'salmon', 'nova']),
  item('ess-egg-cheese', 'Egg & Cheese on Plain Bagel', 'Ess-a-Bagel', 'breakfast', '1 sandwich', 560, 27, 82, 16, 980, ['bagel', 'egg']),

  // ——— PopUp Bagels ———
  item('popup-plain', 'Plain Bagel', 'PopUp Bagels', 'breakfast', '1 bagel', 270, 10, 58, 1, 480, ['bagel']),
  item('popup-everything', 'Everything Bagel', 'PopUp Bagels', 'breakfast', '1 bagel', 280, 10, 57, 2, 620, ['bagel', 'everything']),
  item('popup-cinnamon-raisin', 'Cinnamon Raisin Bagel', 'PopUp Bagels', 'breakfast', '1 bagel', 290, 9, 62, 1, 420, ['bagel', 'cinnamon']),
  item('popup-sesame', 'Sesame Bagel', 'PopUp Bagels', 'breakfast', '1 bagel', 280, 10, 56, 3, 500, ['bagel', 'sesame']),
  item('popup-plain-schmear', 'Plain Bagel with Plain Schmear', 'PopUp Bagels', 'breakfast', '1 bagel + schmear', 390, 12, 60, 13, 600, ['bagel', 'schmear', 'cream cheese']),
  item('popup-scallion', 'Everything Bagel with Scallion Schmear', 'PopUp Bagels', 'breakfast', '1 bagel + schmear', 400, 12, 59, 14, 740, ['bagel', 'schmear', 'cream cheese']),
  item('popup-egg-cheese', 'Classic Egg & Cheese Sandwich', 'PopUp Bagels', 'breakfast', '1 sandwich', 450, 20, 45, 18, 980, ['bagel', 'egg']),
  item('popup-salmon', 'Everything Bagel with Smoked Salmon & Schmear', 'PopUp Bagels', 'breakfast', '1 sandwich', 500, 24, 59, 20, 1280, ['bagel', 'salmon', 'lox']),

  // ——— Brooklyn Water Bagels (official nutrition PDF) ———
  item('bwb-plain', 'Plain Bagel', 'Brooklyn Water Bagels', 'breakfast', '1 bagel', 370, 14, 77, 0, 750, ['bagel']),
  item('bwb-everything', 'Everything Bagel', 'Brooklyn Water Bagels', 'breakfast', '1 bagel', 430, 16, 82, 4, 1120, ['bagel', 'everything']),
  item('bwb-asiago', 'Asiago Bagel', 'Brooklyn Water Bagels', 'breakfast', '1 bagel', 420, 19, 74, 6, 970, ['bagel', 'asiago']),
  item('bwb-sesame', 'Sesame Bagel', 'Brooklyn Water Bagels', 'breakfast', '1 bagel', 480, 18, 79, 12, 760, ['bagel', 'sesame']),
  item('bwb-cinnamon-raisin', 'Cinnamon Raisin Bagel', 'Brooklyn Water Bagels', 'breakfast', '1 bagel', 370, 14, 80, 0, 700, ['bagel', 'cinnamon']),
  item('bwb-onion', 'Onion Bagel', 'Brooklyn Water Bagels', 'breakfast', '1 bagel', 390, 15, 82, 0, 750, ['bagel', 'onion']),
  item('bwb-poppy', 'Poppy Bagel', 'Brooklyn Water Bagels', 'breakfast', '1 bagel', 460, 17, 82, 7, 750, ['bagel']),
  item('bwb-egg', 'Egg Bagel', 'Brooklyn Water Bagels', 'breakfast', '1 bagel', 370, 15, 76, 0, 750, ['bagel', 'egg']),
  item('bwb-ww-everything', 'Whole Wheat Everything Bagel', 'Brooklyn Water Bagels', 'breakfast', '1 bagel', 440, 16, 85, 4.5, 1040, ['bagel', 'whole wheat']),
  item('bwb-bialy', 'Bialy', 'Brooklyn Water Bagels', 'breakfast', '1 bialy', 220, 8, 46, 0, 490, ['bialy', 'bagel']),
  item('bwb-plain-flagel', 'Plain Flagel', 'Brooklyn Water Bagels', 'breakfast', '1 flagel', 370, 14, 77, 0, 750, ['flagel', 'bagel']),
  item('bwb-everything-flagel', 'Everything Flagel', 'Brooklyn Water Bagels', 'breakfast', '1 flagel', 430, 16, 82, 4, 1120, ['flagel', 'bagel', 'everything']),
  item('bwb-plain-cc', 'Plain Cream Cheese (2 oz)', 'Brooklyn Water Bagels', 'snacks', '2 oz', 190, 3, 2, 20, 210, ['cream cheese', 'shmear']),
  item('bwb-scallion-cc', 'Scallion Cream Cheese (2 oz)', 'Brooklyn Water Bagels', 'snacks', '2 oz', 180, 3, 2, 18, 200, ['cream cheese', 'shmear']),
  item('bwb-veggie-cc', 'Vegetable Cream Cheese (2 oz)', 'Brooklyn Water Bagels', 'snacks', '2 oz', 150, 4, 2, 14, 170, ['cream cheese', 'shmear']),
  item('bwb-plain-with-cc', 'Plain Bagel with Plain Cream Cheese', 'Brooklyn Water Bagels', 'breakfast', '1 bagel + 2 oz', 560, 17, 79, 20, 960, ['bagel', 'cream cheese']),
  item('bwb-egg-cheese', 'Egg & Cheese Sandwich', 'Brooklyn Water Bagels', 'breakfast', '1 sandwich', 660, 35, 81, 21, 1400, ['bagel', 'egg']),
  item('bwb-brooklyn', 'The Brooklyn Sandwich', 'Brooklyn Water Bagels', 'sandwiches', '1 sandwich', 970, 54, 85, 45, 2560, ['bagel']),
  item('bwb-williamsburg', 'The Williamsburg Sandwich', 'Brooklyn Water Bagels', 'sandwiches', '1 sandwich', 640, 29, 83, 22, 2090, ['bagel']),
  item('bwb-jersey-boy', 'The Jersey Boy Sandwich', 'Brooklyn Water Bagels', 'sandwiches', '1 sandwich', 800, 42, 82, 33, 1850, ['bagel', 'taylor ham']),
  item('bwb-greenpoint', 'The Greenpoint Sandwich', 'Brooklyn Water Bagels', 'sandwiches', '1 sandwich', 490, 37, 60, 11, 1100, ['bagel']),
  item('bwb-turkey-swiss', 'Roasted Turkey & Swiss Sandwich', 'Brooklyn Water Bagels', 'sandwiches', '1 sandwich', 640, 57, 81, 10, 1380, ['bagel', 'turkey']),
  item('bwb-tuna', 'Tuna Salad Sandwich', 'Brooklyn Water Bagels', 'sandwiches', '1 sandwich', 880, 43, 84, 42, 1590, ['bagel', 'tuna']),
  item('bwb-whitefish', 'Whitefish Salad Sandwich', 'Brooklyn Water Bagels', 'sandwiches', '1 sandwich', 810, 33, 89, 36, 1630, ['bagel', 'whitefish']),
];
