import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Dedicated dessert chains still missing from the catalog.
 * Nothing Bundt Cakes — May 2025 nutrition page (Bundtlets listed as whole cake = 2 servings).
 * Insomnia Cookies — published classic-cookie nutrition (57 g classics unless noted).
 * Yogurtland — Mar 2026 nutrition PDF (4 wt oz scoop).
 * Menchie's — chain flavor cards (4 wt oz typical scoop).
 * Andy's Frozen Custard — AFC nutritional PDF (custom concretes are base custard).
 * Duck Donuts — Aug 2023 / 2026 nutrition data.
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

export const DESSERT_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // Nothing Bundt Cakes — Bundtinis (1 serving) + whole Bundtlets (2 servings)
  item('nbc-vanilla-bundtini', 'Classic Vanilla Bundtini', 'Nothing Bundt Cakes', 'snacks', '1 bundtini', 210, 2, 29, 9, 180, ['cake', 'dessert', 'bundt']),
  item('nbc-chocolate-bundtini', 'Chocolate Chocolate Chip Bundtini', 'Nothing Bundt Cakes', 'snacks', '1 bundtini', 210, 2, 32, 9, 260, ['cake', 'dessert', 'chocolate']),
  item('nbc-red-velvet-bundtini', 'Red Velvet Bundtini', 'Nothing Bundt Cakes', 'snacks', '1 bundtini', 210, 2, 29, 10, 160, ['cake', 'dessert']),
  item('nbc-lemon-bundtini', 'Lemon Bundtini', 'Nothing Bundt Cakes', 'snacks', '1 bundtini', 220, 2, 33, 9, 230, ['cake', 'dessert']),
  item('nbc-confetti-bundtini', 'Confetti Bundtini', 'Nothing Bundt Cakes', 'snacks', '1 bundtini', 220, 1, 31, 10, 150, ['cake', 'dessert']),
  item('nbc-oreo-bundtini', 'OREO Cookies & Cream Bundtini', 'Nothing Bundt Cakes', 'snacks', '1 bundtini', 190, 2, 28, 9, 160, ['cake', 'dessert', 'oreo']),
  item('nbc-strawberry-bundtini', 'Strawberries and Cream Bundtini', 'Nothing Bundt Cakes', 'snacks', '1 bundtini', 220, 2, 30, 10, 170, ['cake', 'dessert']),
  item('nbc-vanilla-bundtlet', 'Classic Vanilla Bundtlet (whole)', 'Nothing Bundt Cakes', 'snacks', '1 bundtlet', 560, 4, 80, 26, 520, ['cake', 'dessert', 'bundt']),
  item('nbc-chocolate-bundtlet', 'Chocolate Chocolate Chip Bundtlet (whole)', 'Nothing Bundt Cakes', 'snacks', '1 bundtlet', 660, 6, 102, 26, 980, ['cake', 'dessert', 'chocolate']),
  item('nbc-red-velvet-bundtlet', 'Red Velvet Bundtlet (whole)', 'Nothing Bundt Cakes', 'snacks', '1 bundtlet', 620, 6, 86, 30, 500, ['cake', 'dessert']),
  item('nbc-lemon-bundtlet', 'Lemon Bundtlet (whole)', 'Nothing Bundt Cakes', 'snacks', '1 bundtlet', 640, 4, 100, 26, 720, ['cake', 'dessert']),
  item('nbc-confetti-bundtlet', 'Confetti Bundtlet (whole)', 'Nothing Bundt Cakes', 'snacks', '1 bundtlet', 600, 6, 88, 26, 540, ['cake', 'dessert']),
  item('nbc-carrot-bundtlet', 'Carrot Bundtlet (whole)', 'Nothing Bundt Cakes', 'snacks', '1 bundtlet', 660, 6, 104, 26, 480, ['cake', 'dessert']),
  item('nbc-wcr-bundtlet', 'White Chocolate Raspberry Bundtlet (whole)', 'Nothing Bundt Cakes', 'snacks', '1 bundtlet', 620, 6, 86, 28, 500, ['cake', 'dessert']),

  // Insomnia Cookies — classic cookies
  item('insomnia-choc-chunk', 'Chocolate Chunk Cookie', 'Insomnia Cookies', 'snacks', '1 cookie', 240, 3, 32, 12, 140, ['cookie', 'dessert']),
  item('insomnia-double-choc', 'Double Chocolate Chunk Cookie', 'Insomnia Cookies', 'snacks', '1 cookie', 250, 3, 35, 12, 150, ['cookie', 'dessert', 'chocolate']),
  item('insomnia-mm', "Classic Cookie with M&M's", 'Insomnia Cookies', 'snacks', '1 cookie', 260, 3, 36, 12, 150, ['cookie', 'dessert']),
  item('insomnia-oatmeal', 'Oatmeal Raisin Cookie', 'Insomnia Cookies', 'snacks', '1 cookie', 210, 3, 30, 9, 140, ['cookie', 'dessert']),
  item('insomnia-sugar', 'Sugar Cookie', 'Insomnia Cookies', 'snacks', '1 cookie (43 g)', 190, 2, 24, 10, 140, ['cookie', 'dessert']),
  item('insomnia-snickerdoodle', 'Snickerdoodle Cookie', 'Insomnia Cookies', 'snacks', '1 cookie', 230, 2, 32, 11, 150, ['cookie', 'dessert']),
  item('insomnia-birthday', 'Birthday Cake Cookie (vegan)', 'Insomnia Cookies', 'snacks', '1 cookie', 240, 3, 36, 10, 120, ['cookie', 'dessert', 'vegan']),
  item('insomnia-smores', "Deluxe S'mores Cookie", 'Insomnia Cookies', 'snacks', '1 deluxe cookie', 380, 4, 52, 18, 220, ['cookie', 'dessert']),
  item('insomnia-confetti', 'Deluxe Confetti Cookie', 'Insomnia Cookies', 'snacks', '1 deluxe cookie', 360, 4, 51, 16, 200, ['cookie', 'dessert']),
  item('insomnia-macadamia', 'White Chocolate Macadamia Cookie', 'Insomnia Cookies', 'snacks', '1 cookie', 260, 3, 32, 14, 150, ['cookie', 'dessert']),

  // Yogurtland — 4 wt oz (Mar 2026 PDF)
  item('yl-plain-tart', 'Plain Tart Frozen Yogurt (4 oz)', 'Yogurtland', 'snacks', '4 wt oz', 120, 3, 26, 0, 25, ['froyo', 'dessert', 'yogurt']),
  item('yl-strawberry', 'Fresh Strawberry Frozen Yogurt (4 oz)', 'Yogurtland', 'snacks', '4 wt oz', 130, 4, 30, 0, 80, ['froyo', 'dessert']),
  item('yl-cookies-cream', 'Classic Cookies & Cream (4 oz)', 'Yogurtland', 'snacks', '4 wt oz', 150, 5, 30, 5, 100, ['froyo', 'dessert']),
  item('yl-cheesecake', 'Cheesecake Frozen Yogurt (4 oz)', 'Yogurtland', 'snacks', '4 wt oz', 140, 4, 29, 0, 95, ['froyo', 'dessert']),
  item('yl-mango', 'Alphonso Mango Tart (4 oz)', 'Yogurtland', 'snacks', '4 wt oz', 130, 3, 28, 0, 40, ['froyo', 'dessert']),
  item('yl-ube', 'Ube Frozen Yogurt (4 oz)', 'Yogurtland', 'snacks', '4 wt oz', 130, 4, 28, 0, 90, ['froyo', 'dessert']),
  item('yl-vanilla-ic', 'Creamy Vanilla Ice Cream (4 oz)', 'Yogurtland', 'snacks', '4 wt oz', 220, 3, 28, 11, 100, ['ice cream', 'dessert']),
  item('yl-lemon-sorbet', 'Lemon Sorbet (4 oz)', 'Yogurtland', 'snacks', '4 wt oz', 110, 0, 28, 0, 15, ['sorbet', 'dessert']),
  item('yl-pistachio', 'Pistachio Frozen Yogurt (4 oz)', 'Yogurtland', 'snacks', '4 wt oz', 140, 4, 30, 0, 100, ['froyo', 'dessert']),
  item('yl-coffee', 'Sumatra Coffee Frozen Yogurt (4 oz)', 'Yogurtland', 'snacks', '4 wt oz', 130, 4, 28, 0, 90, ['froyo', 'dessert']),
  item('yl-typical-cup', 'Typical Cup (8 oz plain tart)', 'Yogurtland', 'snacks', '8 wt oz', 240, 6, 52, 0, 50, ['froyo', 'dessert']),

  // Menchie's — flavor cards (per wt oz × 4 oz scoop)
  item('menchies-original-tart', 'Original Tart (4 oz)', "Menchie's", 'snacks', '4 wt oz', 120, 2, 24, 0, 140, ['froyo', 'dessert', 'yogurt']),
  item('menchies-vanilla', 'Vanilla Snow (4 oz)', "Menchie's", 'snacks', '4 wt oz', 140, 4, 28, 0, 100, ['froyo', 'dessert']),
  item('menchies-chocolate', "Chip's Chocolate (4 oz)", "Menchie's", 'snacks', '4 wt oz', 140, 4, 28, 2, 100, ['froyo', 'dessert', 'chocolate']),
  item('menchies-cake-batter', 'Takes the Cake Batter (4 oz)', "Menchie's", 'snacks', '4 wt oz', 150, 4, 30, 0, 110, ['froyo', 'dessert']),
  item('menchies-typical-cup', 'Typical Cup (8 oz original tart)', "Menchie's", 'snacks', '8 wt oz', 240, 4, 48, 0, 280, ['froyo', 'dessert']),

  // Andy's Frozen Custard — AFC nutrition PDF
  item('andys-vanilla-concrete-s', "Vanilla Custom Concrete (small)", "Andy's Frozen Custard", 'snacks', 'small', 525, 11, 55, 26, 197, ['concrete', 'custard', 'dessert']),
  item('andys-vanilla-concrete-m', "Vanilla Custom Concrete (medium)", "Andy's Frozen Custard", 'snacks', 'medium', 725, 15, 76, 36, 272, ['concrete', 'custard', 'dessert']),
  item('andys-vanilla-concrete-l', "Vanilla Custom Concrete (large)", "Andy's Frozen Custard", 'snacks', 'large', 1050, 21, 110, 53, 394, ['concrete', 'custard', 'dessert']),
  item('andys-chocolate-concrete-s', "Chocolate Custom Concrete (small)", "Andy's Frozen Custard", 'snacks', 'small', 557, 13, 60, 26, 184, ['concrete', 'custard', 'chocolate']),
  item('andys-bootdaddy-s', 'BootDaddy Concrete (small)', "Andy's Frozen Custard", 'snacks', 'small', 793, 15, 122, 37, 449, ['concrete', 'custard', 'oreo']),
  item('andys-triple-choc-s', 'Triple Chocolate Concrete (small)', "Andy's Frozen Custard", 'snacks', 'small', 818, 16, 97, 39, 317, ['concrete', 'custard', 'chocolate']),
  item('andys-snowmonster-s', 'Snowmonster Concrete (small)', "Andy's Frozen Custard", 'snacks', 'small', 693, 11, 85, 33, 202, ['concrete', 'custard', 'strawberry']),
  item('andys-butter-pecan-s', 'Butter Pecan Concrete (small)', "Andy's Frozen Custard", 'snacks', 'small', 794, 13, 79, 46, 346, ['concrete', 'custard']),

  // Duck Donuts — nutrition data
  item('duck-bare', 'Bare Donut', 'Duck Donuts', 'snacks', '1 donut', 220, 3, 25, 12, 360, ['donut', 'doughnut', 'dessert']),
  item('duck-glazed', 'Glazed Donut', 'Duck Donuts', 'snacks', '1 donut', 240, 3, 36, 12, 390, ['donut', 'doughnut', 'dessert']),
  item('duck-cinnamon', 'Cinnamon Sugar Donut', 'Duck Donuts', 'snacks', '1 donut', 230, 3, 30, 13, 360, ['donut', 'doughnut', 'dessert']),
  item('duck-powdered', 'Powdered Sugar Donut', 'Duck Donuts', 'snacks', '1 donut', 220, 3, 29, 13, 360, ['donut', 'doughnut', 'dessert']),
  item('duck-chocolate-icing', 'Chocolate Iced Donut', 'Duck Donuts', 'snacks', '1 donut', 270, 3, 36, 13, 390, ['donut', 'doughnut', 'dessert']),
  item('duck-vanilla-icing', 'Vanilla Iced Donut', 'Duck Donuts', 'snacks', '1 donut', 270, 3, 36, 13, 390, ['donut', 'doughnut', 'dessert']),
  item('duck-maple-bacon', 'Maple Icing & Bacon Donut', 'Duck Donuts', 'snacks', '1 donut', 310, 5, 36, 16, 520, ['donut', 'doughnut', 'dessert', 'bacon']),
  item('duck-peanut-butter', 'Peanut Butter Iced Donut', 'Duck Donuts', 'snacks', '1 donut', 300, 5, 34, 16, 420, ['donut', 'doughnut', 'dessert']),
  item('duck-sundae', 'Donut Sundae (typical)', 'Duck Donuts', 'snacks', '1 sundae', 520, 7, 70, 26, 480, ['donut', 'ice cream', 'dessert']),
  item('duck-ice-cream-sandwich', 'Ice Cream Sandwich', 'Duck Donuts', 'snacks', '1 sandwich', 450, 7, 53, 22, 420, ['ice cream', 'dessert']),
];
