import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Asian street-food and teriyaki chains that were missing from the catalog.
 * P.F. Chang's, Teriyaki Madness, WaBa Grill, Yoshinoya, Sarku Japan, Leeann Chin,
 * and Wow Bao use each chain's published nutrition. Hawkers does not publish a PDF;
 * those values are typical restaurant portions for the named dishes (rounded).
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

export const ASIAN_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // Hawkers Asian Street Fare
  item('hawkers-roti-canai', 'Roti Canai (2, with curry)', 'Hawkers', 'snacks', '2 breads', 420, 10, 52, 18, 780, ['roti prata', 'malaysian']),
  item('hawkers-pork-belly-bao', 'Pork Belly Bao', 'Hawkers', 'snacks', '1 bao', 380, 16, 36, 18, 720, ['bun']),
  item('hawkers-bbq-pork-bao', 'Chinese BBQ Pork Bao', 'Hawkers', 'snacks', '1 bao', 320, 14, 38, 12, 680, ['char siu', 'bun']),
  item('hawkers-seoul-chicken-bao', 'Seoul Hot Chicken Bao', 'Hawkers', 'snacks', '1 bao', 390, 18, 38, 18, 860, ['korean', 'bun']),
  item('hawkers-soup-dumplings', 'Soup Dumplings (4)', 'Hawkers', 'snacks', '4 pieces', 280, 14, 28, 12, 640, ['xiaolongbao']),
  item('hawkers-chicken-dumplings', "Yi-Yi's Chicken Dumplings (6)", 'Hawkers', 'snacks', '6 pieces', 320, 16, 32, 12, 780, ['potstickers']),
  item('hawkers-summer-rolls', 'Shrimp Summer Rolls (2)', 'Hawkers', 'snacks', '2 rolls', 200, 10, 28, 4, 480, ['fresh rolls']),
  item('hawkers-egg-rolls', 'Chicken Egg Rolls (2)', 'Hawkers', 'snacks', '2 rolls', 360, 12, 38, 18, 720),
  item('hawkers-spring-rolls', 'Spring Rolls (2)', 'Hawkers', 'snacks', '2 rolls', 240, 4, 28, 12, 420),
  item('hawkers-golden-wontons', 'Golden Wontons (6)', 'Hawkers', 'snacks', '6 pieces', 380, 16, 32, 20, 680),
  item('hawkers-chili-crisp-wontons', 'Chili Crisp Wontons (6)', 'Hawkers', 'snacks', '6 pieces', 340, 18, 30, 14, 820),
  item('hawkers-satay-chicken', 'Satay Chicken', 'Hawkers', 'lunch', '1 order', 380, 32, 14, 22, 920, ['peanut']),
  item('hawkers-bulgogi-steak', 'Bulgogi Steak', 'Hawkers', 'dinner', '1 order', 300, 25, 12, 16, 780, ['korean']),
  item('hawkers-korean-wings', 'Korean Twice Fried Wings (6)', 'Hawkers', 'dinner', '6 wings', 620, 36, 22, 42, 1480, ['korean fried chicken']),
  item('hawkers-pok-pok-wings', "Pok Pok Wings (6)", 'Hawkers', 'dinner', '6 wings', 600, 34, 24, 40, 1420),
  item('hawkers-coconut-shrimp', 'Coconut Shrimp', 'Hawkers', 'lunch', '1 order', 420, 18, 32, 24, 680),
  item('hawkers-pad-thai', 'Pad Thai (chicken & shrimp)', 'Hawkers', 'dinner', '1 entrée', 570, 27, 82, 14, 1540, ['noodles']),
  item('hawkers-curry-laksa', 'Curry Laksa', 'Hawkers', 'dinner', '1 bowl', 650, 28, 58, 32, 1680, ['soup', 'coconut']),
  item('hawkers-ckt', 'C.K.T. (Char Kway Teow)', 'Hawkers', 'dinner', '1 entrée', 780, 28, 86, 34, 1860, ['noodles', 'malaysian']),
  item('hawkers-mei-fun', 'Singapore Mei Fun', 'Hawkers', 'dinner', '1 entrée', 620, 24, 78, 22, 1420, ['rice noodles']),
  item('hawkers-yaki-udon', 'Yaki Udon (chicken)', 'Hawkers', 'dinner', '1 entrée', 680, 26, 82, 24, 1680, ['noodles']),
  item('hawkers-lo-mein', 'Lo Mein (chicken)', 'Hawkers', 'dinner', '1 entrée', 640, 28, 72, 24, 1540, ['noodles']),
  item('hawkers-haw-fun', 'Beef Haw Fun', 'Hawkers', 'dinner', '1 entrée', 720, 32, 78, 28, 1760, ['rice noodles']),
  item('hawkers-chow-faan', 'Chow Faan Fried Rice', 'Hawkers', 'dinner', '1 entrée', 720, 28, 86, 26, 1680, ['fried rice']),
  item('hawkers-kimchi-fried-rice', 'Steak and Kimchi Fried Rice', 'Hawkers', 'dinner', '1 entrée', 740, 30, 78, 30, 1720, ['korean']),
  item('hawkers-bibimbap', 'Bibimbap (steak)', 'Hawkers', 'dinner', '1 bowl', 680, 32, 78, 24, 1540, ['korean']),
  item('hawkers-curry', "Po Po Lo's Curry (chicken)", 'Hawkers', 'dinner', '1 entrée', 620, 32, 58, 26, 1480),
  item('hawkers-wonton-soup', 'Hong Kong Wonton Noodle Soup', 'Hawkers', 'dinner', '1 bowl', 480, 24, 48, 16, 1680, ['soup']),
  item('hawkers-delight', "Hawker's Delight (tofu)", 'Hawkers', 'dinner', '1 entrée', 420, 16, 58, 14, 980, ['vegetarian']),
  item('hawkers-goi-ga', 'Vietnamese Goi Ga Salad', 'Hawkers', 'lunch', '1 salad', 380, 28, 22, 18, 920, ['salad']),
  item('hawkers-edamame', 'Chili Garlic Edamame', 'Hawkers', 'snacks', '1 order', 180, 14, 12, 8, 520),
  item('hawkers-karaage', 'Chicken Karaage', 'Hawkers', 'lunch', '1 order', 440, 28, 22, 26, 860, ['japanese fried chicken']),
  item('hawkers-fries', 'Hawkers Fries', 'Hawkers', 'snacks', '1 order', 380, 5, 48, 18, 640, ['french fries']),
  item('hawkers-chili-vanilli', 'Chili Vanilli', 'Hawkers', 'snacks', '1 dessert', 480, 8, 52, 26, 280, ['dessert', 'roti']),

  // P.F. Chang's (to-go / dinner-special serving unless noted)
  item('pfc-lettuce-wraps', "Chang's Chicken Lettuce Wraps (1 serving)", "P.F. Chang's", 'lunch', '1 serving', 330, 19, 33, 13, 920, ['appetizer']),
  item('pfc-veggie-lettuce-wraps', 'Veggie Lettuce Wraps (1 serving)', "P.F. Chang's", 'lunch', '1 serving', 320, 7, 38, 17, 850, ['vegetarian']),
  item('pfc-mongolian-beef', 'Mongolian Beef', "P.F. Chang's", 'dinner', '1 entrée', 400, 31, 24, 20, 1390),
  item('pfc-spicy-chicken', "Chang's Spicy Chicken", "P.F. Chang's", 'dinner', '1 entrée', 610, 29, 34, 31, 1030),
  item('pfc-orange-chicken', 'Orange Chicken', "P.F. Chang's", 'dinner', '1 entrée', 760, 27, 71, 42, 830),
  item('pfc-sesame-chicken', 'Sesame Chicken', "P.F. Chang's", 'dinner', '1 entrée', 640, 30, 43, 31, 1350),
  item('pfc-kung-pao', 'Kung Pao Chicken', "P.F. Chang's", 'dinner', '1 entrée', 650, 33, 19, 43, 1320),
  item('pfc-beef-broccoli', 'Beef & Broccoli', "P.F. Chang's", 'dinner', '1 entrée', 430, 30, 35, 19, 1660),
  item('pfc-teriyaki-chicken', 'Teriyaki Chicken', "P.F. Chang's", 'dinner', '1 entrée', 670, 26, 52, 33, 1540),
  item('pfc-honey-chicken', 'Crispy Honey Chicken', "P.F. Chang's", 'dinner', '1 entrée', 790, 26, 73, 42, 610),
  item('pfc-miso-salmon', 'Miso Glazed Salmon', "P.F. Chang's", 'dinner', '1 entrée', 410, 26, 27, 22, 1100),
  item('pfc-firecracker-shrimp', 'Firecracker Shrimp', "P.F. Chang's", 'dinner', '1 entrée', 450, 26, 22, 30, 1650),
  item('pfc-chicken-pad-thai', 'Chicken Pad Thai (1 serving)', "P.F. Chang's", 'dinner', '1 serving', 740, 32, 97, 25, 1610, ['noodles']),
  item('pfc-pad-thai', 'Pad Thai (1 serving)', "P.F. Chang's", 'dinner', '1 serving', 660, 18, 97, 23, 1500, ['noodles']),
  item('pfc-white-rice', 'White Rice (8 oz)', "P.F. Chang's", 'dinner', '1 side', 290, 5, 65, 0, 0),
  item('pfc-brown-rice', 'Brown Rice (8 oz)', "P.F. Chang's", 'dinner', '1 side', 250, 5, 53, 2, 0),
  item('pfc-fried-rice', 'Fried Rice', "P.F. Chang's", 'dinner', '1 side', 500, 13, 76, 15, 800),
  item('pfc-lo-mein', 'Lo Mein Noodles', "P.F. Chang's", 'dinner', '1 side', 560, 15, 97, 12, 2280, ['noodles']),
  item('pfc-potstickers-6', 'Pork Potstickers (6)', "P.F. Chang's", 'snacks', '6 pieces', 540, 18, 42, 30, 1380),
  item('pfc-spring-roll', 'Vegetable Spring Roll', "P.F. Chang's", 'snacks', '1 roll', 310, 3, 44, 13, 450),
  item('pfc-egg-drop', 'Egg Drop Soup (cup)', "P.F. Chang's", 'snacks', '1 cup', 40, 1, 6, 1, 560, ['soup']),
  item('pfc-hot-sour', 'Hot & Sour Soup (cup)', "P.F. Chang's", 'snacks', '1 cup', 70, 4, 9, 2, 580, ['soup']),
  item('pfc-edamame', 'Edamame (1 serving)', "P.F. Chang's", 'snacks', '1 serving', 200, 18, 12, 8, 980),
  item('pfc-california-roll', 'California Roll', "P.F. Chang's", 'lunch', '1 roll', 400, 11, 58, 14, 1350, ['sushi']),

  // Teriyaki Madness
  item('tm-chicken-bowl', 'Chicken Teriyaki Bowl (regular)', 'Teriyaki Madness', 'dinner', '1 bowl', 660, 48, 87, 12, 1500, ['teriyaki']),
  item('tm-steak-bowl', 'Steak Teriyaki Bowl (regular)', 'Teriyaki Madness', 'dinner', '1 bowl', 780, 42, 90, 22, 1860, ['teriyaki']),
  item('tm-chicken-jr', 'Chicken Teriyaki Bowl (junior)', 'Teriyaki Madness', 'lunch', '1 bowl', 480, 36, 62, 10, 1120, ['teriyaki']),
  item('tm-white-rice', 'White Rice (8 oz)', 'Teriyaki Madness', 'dinner', '1 side', 240, 4, 53, 0, 10),
  item('tm-brown-rice', 'Brown Rice (8 oz)', 'Teriyaki Madness', 'dinner', '1 side', 220, 5, 46, 2, 10),
  item('tm-gyoza', 'Gyoza (6)', 'Teriyaki Madness', 'snacks', '6 pieces', 280, 12, 32, 10, 720, ['potstickers']),
  item('tm-edamame', 'Edamame', 'Teriyaki Madness', 'snacks', '1 order', 150, 12, 10, 6, 480),
  item('tm-salad', 'House Salad', 'Teriyaki Madness', 'lunch', '1 salad', 180, 6, 14, 10, 420, ['salad']),

  // WaBa Grill
  item('waba-chicken-bowl', 'Chicken Bowl', 'WaBa Grill', 'dinner', '1 bowl', 640, 38, 100, 11, 900, ['teriyaki']),
  item('waba-wm-chicken-bowl', 'White Meat Chicken Bowl', 'WaBa Grill', 'dinner', '1 bowl', 630, 46, 100, 5, 880),
  item('waba-steak-bowl', 'Rib-Eye Steak Bowl', 'WaBa Grill', 'dinner', '1 bowl', 720, 29, 110, 18, 1250),
  item('waba-combo-bowl', 'WaBa Bowl (chicken & steak)', 'WaBa Grill', 'dinner', '1 bowl', 710, 37, 100, 16, 1100),
  item('waba-spicy-chicken', 'Sweet & Spicy Chicken Bowl', 'WaBa Grill', 'dinner', '1 bowl', 680, 38, 120, 11, 2460),
  item('waba-chicken-veggie', 'Chicken Veggie Bowl', 'WaBa Grill', 'dinner', '1 bowl', 590, 39, 90, 11, 940),
  item('waba-shrimp-bowl', 'Shrimp Bowl', 'WaBa Grill', 'dinner', '1 bowl', 490, 28, 86, 6, 980),

  // Yoshinoya
  item('yoshi-beef-bowl', 'Beef Bowl (regular)', 'Yoshinoya', 'dinner', '1 bowl', 730, 30, 92, 27, 1520, ['gyudon']),
  item('yoshi-beef-bowl-lg', 'Beef Bowl (large)', 'Yoshinoya', 'dinner', '1 bowl', 1040, 43, 130, 38, 2140, ['gyudon']),
  item('yoshi-chicken-bowl', 'Teriyaki Chicken Bowl (regular)', 'Yoshinoya', 'dinner', '1 bowl', 790, 48, 109, 18, 1680),
  item('yoshi-steak-bowl', 'Angus Steak Bowl (regular)', 'Yoshinoya', 'dinner', '1 bowl', 570, 25, 88, 11, 1240),
  item('yoshi-beef-veg', 'Beef Bowl with Vegetables (regular)', 'Yoshinoya', 'dinner', '1 bowl', 650, 24, 86, 20, 1480),
  item('yoshi-wings-4', 'Asian BBQ Wings (4)', 'Yoshinoya', 'snacks', '4 wings', 410, 30, 12, 25, 980),

  // Sarku Japan
  item('sarku-chicken-rice', 'Chicken Teriyaki with White Rice', 'Sarku Japan', 'dinner', '1 plate', 640, 28, 79, 24, 870, ['teriyaki']),
  item('sarku-beef-rice', 'Beef Teriyaki with White Rice', 'Sarku Japan', 'dinner', '1 plate', 580, 30, 80, 16, 1220, ['teriyaki']),
  item('sarku-shrimp-rice', 'Shrimp Teriyaki with White Rice', 'Sarku Japan', 'dinner', '1 plate', 530, 27, 80, 12, 1200, ['teriyaki']),
  item('sarku-chicken-shrimp', 'Chicken & Shrimp Teriyaki with White Rice', 'Sarku Japan', 'dinner', '1 plate', 750, 40, 85, 29, 1450),
  item('sarku-chicken-bowl', 'Chicken Teriyaki Bowl', 'Sarku Japan', 'lunch', '1 bowl', 430, 19, 53, 16, 580),
  item('sarku-yakisoba', 'Chicken Teriyaki with Yakisoba', 'Sarku Japan', 'dinner', '1 plate', 870, 43, 105, 32, 1580, ['noodles']),

  // Leeann Chin
  item('lc-orange-chicken', 'Orange Chicken (6 oz)', 'Leeann Chin', 'dinner', '6 oz', 570, 18, 52, 32, 655),
  item('lc-sesame-chicken', 'Sesame Chicken (6 oz)', 'Leeann Chin', 'dinner', '6 oz', 670, 29, 49, 40, 540),
  item('lc-mongolian-chicken', 'Mongolian Chicken (6 oz)', 'Leeann Chin', 'dinner', '6 oz', 470, 20, 39, 21, 874),
  item('lc-bourbon-chicken', 'Bourbon Chicken (6 oz)', 'Leeann Chin', 'dinner', '6 oz', 360, 34, 28, 12, 991),
  item('lc-lemon-chicken', 'Lemon Chicken (6 oz)', 'Leeann Chin', 'dinner', '6 oz', 250, 17, 22, 11, 270),
  item('lc-sweet-sour', 'Sweet & Sour Chicken (6 oz)', 'Leeann Chin', 'dinner', '6 oz', 280, 17, 30, 11, 290),
  item('lc-beef-broccoli', 'Beef & Broccoli (6 oz)', 'Leeann Chin', 'dinner', '6 oz', 330, 15, 24, 19, 1200),
  item('lc-steamed-rice', 'Steamed Rice', 'Leeann Chin', 'dinner', '1 side', 210, 4, 46, 0, 5),
  item('lc-fried-rice', 'Fried Rice', 'Leeann Chin', 'dinner', '1 side', 380, 8, 58, 12, 780),

  // Wow Bao
  item('wowbao-teriyaki', 'Teriyaki Chicken Bao', 'Wow Bao', 'snacks', '1 bao', 180, 10, 27, 5, 250, ['bun']),
  item('wowbao-mongolian', 'Spicy Mongolian Beef Bao', 'Wow Bao', 'snacks', '1 bao', 210, 7, 25, 9, 290, ['bun']),
  item('wowbao-bbq-pork', 'BBQ Pork Bao', 'Wow Bao', 'snacks', '1 bao', 200, 8, 28, 6, 280, ['char siu', 'bun']),
  item('wowbao-veggie', 'Vegetable Bao', 'Wow Bao', 'snacks', '1 bao', 170, 5, 28, 4, 220, ['vegetarian', 'bun']),
  item('wowbao-potstickers', 'Potstickers (6)', 'Wow Bao', 'snacks', '6 pieces', 300, 12, 34, 12, 680),
  item('wowbao-rice', 'Steamed Rice', 'Wow Bao', 'dinner', '1 side', 280, 6, 60, 1, 10),

  // HuHot Mongolian Grill (named recipe bowls)
  item('huhot-chicken-teriyaki', 'Chicken Teriyaki Bowl', 'HuHot', 'dinner', '1 bowl', 570, 27, 49, 26, 3400, ['mongolian grill']),
  item('huhot-beef-bowl', 'Beef & Noodle Bowl', 'HuHot', 'dinner', '1 bowl', 640, 32, 58, 28, 2860, ['mongolian grill']),
  item('huhot-veggie-bowl', 'Vegetable Bowl', 'HuHot', 'dinner', '1 bowl', 380, 12, 48, 14, 1980, ['vegetarian']),

  // Manchu Wok
  item('manchu-orange', 'Orange Chicken', 'Manchu Wok', 'dinner', '1 entrée', 490, 18, 52, 24, 820),
  item('manchu-ginger-beef', 'Ginger Beef', 'Manchu Wok', 'dinner', '1 entrée', 520, 22, 48, 26, 980),
  item('manchu-fried-rice', 'Special Fried Rice', 'Manchu Wok', 'dinner', '1 side', 420, 10, 62, 14, 860),
  item('manchu-chow-mein', 'Chicken Chow Mein', 'Manchu Wok', 'dinner', '1 entrée', 400, 16, 52, 12, 920, ['noodles']),
  item('manchu-egg-roll', 'Egg Roll', 'Manchu Wok', 'snacks', '1 roll', 190, 6, 20, 9, 390),

  // Tokyo Joe's
  item('tj-chicken-bowl', 'Chicken Teriyaki Bowl', "Tokyo Joe's", 'dinner', '1 bowl', 580, 36, 78, 12, 1420, ['teriyaki']),
  item('tj-yuzu-salmon', 'Yuzu Salmon Bowl', "Tokyo Joe's", 'dinner', '1 bowl', 620, 34, 68, 20, 1280),
  item('tj-spicy-tuna', 'Spicy Ahi Poke Bowl', "Tokyo Joe's", 'lunch', '1 bowl', 540, 28, 62, 18, 1180, ['poke']),
  item('tj-gyoza', 'Gyoza (6)', "Tokyo Joe's", 'snacks', '6 pieces', 280, 12, 30, 12, 680),
];
