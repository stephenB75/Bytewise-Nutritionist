import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * More Orlando-area places to eat — Caribbean and Asian fusion, Korean BBQ, late-night tacos,
 * burger bars, sushi and I-Drive / Icon Park restaurant-bars. None publish nutrition: values are
 * Atwater-aligned estimates from USDA analogs and typical portions, and every item carries the
 * estimated keyword.
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
  keywords: string[] = [],
): FastFoodItem => ({ id, name, restaurant, category, serving, calories, protein, carbs, fat, sodium, keywords: [...keywords, 'estimated'] });

export const ORLANDO_EATS_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // ——— Legends Caribbean Shack (formerly Legends Resto & Lounge on I-Drive) ———
  item('legends-jerk-chicken', 'Jerk Chicken with rice & peas', 'Legends Caribbean Shack', 'dinner', '1 plate', 800, 52, 70, 34, 1680, ['jerk', 'caribbean', 'legends resto lounge']),
  item('legends-curry-chicken', 'Curry Chicken with white rice', 'Legends Caribbean Shack', 'dinner', '1 plate', 730, 46, 78, 26, 1380, ['curry', 'caribbean']),
  item('legends-curry-chicken-dhal-puri', 'Curry Chicken with Dhal Puri', 'Legends Caribbean Shack', 'dinner', '1 plate', 960, 50, 96, 42, 1580, ['curry', 'roti', 'trinidad']),
  item('legends-curry-goat', 'Curry Goat with white rice', 'Legends Caribbean Shack', 'dinner', '1 plate', 800, 48, 76, 34, 1280, ['curry', 'goat', 'caribbean']),
  item('legends-oxtails', 'Braised Oxtails with rice & peas', 'Legends Caribbean Shack', 'dinner', '1 plate', 1040, 56, 78, 56, 1580, ['oxtail', 'caribbean']),
  item('legends-jerk-pork', 'Jerk Pork with rice & peas', 'Legends Caribbean Shack', 'dinner', '1 plate', 860, 50, 70, 42, 1720, ['jerk', 'pork']),
  item('legends-fried-snapper', 'Fried Whole Snapper with one side', 'Legends Caribbean Shack', 'dinner', '1 fish', 890, 62, 58, 46, 1280, ['fish', 'snapper', 'seafood']),
  item('legends-stew-snapper-fillet', 'Stew Snapper Fillet with rice', 'Legends Caribbean Shack', 'dinner', '1 plate', 660, 44, 72, 22, 1180, ['fish', 'snapper', 'seafood']),
  item('legends-pepper-shrimp', 'Jumbo Pepper Shrimp', 'Legends Caribbean Shack', 'dinner', '1 order', 410, 34, 18, 22, 1580, ['shrimp', 'seafood']),
  item('legends-pepper-lamb', 'Pepper Lamb', 'Legends Caribbean Shack', 'dinner', '1 entrée', 750, 48, 28, 50, 1680, ['lamb']),
  item('legends-roast-duck', 'Roast Duck (half)', 'Legends Caribbean Shack', 'dinner', '1/2 duck', 1070, 62, 8, 88, 1580, ['duck', 'asian']),
  item('legends-house-fried-rice', 'House Special Fried Rice', 'Legends Caribbean Shack', 'lunch', '1 order', 1040, 48, 132, 36, 2380, ['fried rice', 'shrimp', 'asian']),
  item('legends-mixed-fried-rice', 'Mixed Fried Rice (shrimp, chicken, pork)', 'Legends Caribbean Shack', 'lunch', '1 order', 1060, 52, 128, 38, 2420, ['fried rice', 'asian']),
  item('legends-chicken-lo-mein', 'Chicken Lo Mein', 'Legends Caribbean Shack', 'lunch', '1 order', 900, 46, 112, 30, 2480, ['noodles', 'asian']),
  item('legends-jerk-wings', 'Jerk Wings', 'Legends Caribbean Shack', 'snacks', '8 wings', 750, 60, 6, 54, 1880, ['wings', 'jerk']),
  item('legends-sweet-chili-wings', 'Legend Sweet Chili Wings', 'Legends Caribbean Shack', 'snacks', '8 wings', 880, 56, 52, 50, 1980, ['wings']),
  item('legends-coconut-shrimp', 'Coconut Shrimp', 'Legends Caribbean Shack', 'snacks', '6 pieces', 520, 20, 44, 30, 880, ['shrimp', 'fried']),
  item('legends-shrimp-wonton', 'Shrimp Wontons', 'Legends Caribbean Shack', 'snacks', '6 pieces', 410, 16, 38, 22, 820, ['shrimp', 'wonton', 'asian']),
  item('legends-seafood-platter', 'Seafood Platter (shareable)', 'Legends Caribbean Shack', 'dinner', '1/2 platter', 1350, 62, 118, 70, 2680, ['seafood', 'shrimp', 'calamari']),
  item('legends-rice-and-peas', 'Rice and Peas', 'Legends Caribbean Shack', 'snacks', '1 side', 330, 9, 54, 9, 420, ['side', 'rice']),

  item('takocheena-bulgogi-taco', 'Korean BBQ Pork Taco', 'Tako Cheena', 'lunch', '1 taco', 250, 14, 22, 12, 560, ['taco', 'korean', 'asian']),
  item('takocheena-thai-peanut-taco', 'Thai Peanut Chicken Taco', 'Tako Cheena', 'lunch', '1 taco', 270, 16, 22, 13, 520, ['taco', 'thai', 'asian']),
  item('takocheena-curry-burrito', 'Japanese Curry Burrito', 'Tako Cheena', 'lunch', '1 burrito', 810, 30, 110, 28, 1680, ['burrito', 'curry', 'asian']),
  item('takocheena-empanada', 'Pork Empanada', 'Tako Cheena', 'snacks', '1 empanada', 300, 10, 28, 16, 480, ['empanada']),

  item('gringoslocos-steak-burrito', 'Steak Burrito', 'Gringos Locos', 'lunch', '1 burrito', 1030, 46, 112, 44, 2180, ['burrito', 'late night']),
  item('gringoslocos-nachos', 'Loaded Nachos', 'Gringos Locos', 'snacks', '1 order', 1430, 48, 120, 84, 2380, ['nachos', 'late night']),
  item('gringoslocos-quesadilla', 'Chicken Quesadilla', 'Gringos Locos', 'lunch', '1 quesadilla', 930, 54, 62, 52, 1980, ['quesadilla']),
  item('gringoslocos-tacos', 'Street Tacos (2)', 'Gringos Locos', 'lunch', '2 tacos', 450, 28, 40, 20, 880, ['taco']),

  item('dixiedharma-chickn-sandwich', "Vegan Fried Chick'n Sandwich", 'Dixie Dharma', 'sandwiches', '1 sandwich', 690, 28, 76, 30, 1480, ['vegan', 'southern']),
  item('dixiedharma-bbq-jackfruit', 'BBQ Jackfruit Sandwich', 'Dixie Dharma', 'sandwiches', '1 sandwich', 560, 8, 92, 18, 1280, ['vegan', 'bbq']),
  item('dixiedharma-mac', 'Vegan Mac & Cheese', 'Dixie Dharma', 'snacks', '1 side', 480, 14, 56, 22, 780, ['vegan', 'mac and cheese']),

  item('graffiti-burger', 'Signature Burger with fries', 'Graffiti Junktion', 'sandwiches', '1 burger', 1150, 52, 92, 64, 2080, ['burger', 'bar']),
  item('graffiti-wings', 'Wings', 'Graffiti Junktion', 'snacks', '10 wings', 840, 70, 4, 60, 2280, ['wings', 'bar']),
  item('graffiti-loaded-tots', 'Loaded Tots', 'Graffiti Junktion', 'snacks', '1 order', 670, 18, 60, 40, 1480, ['tots']),

  item('kai-poke-bowl', 'Poke Bowl', 'Kai Asian Street Fare', 'lunch', '1 bowl', 640, 32, 82, 20, 1380, ['poke', 'asian']),
  item('kai-pork-belly-bao', 'Pork Belly Bao (2)', 'Kai Asian Street Fare', 'snacks', '2 bao', 490, 16, 48, 26, 980, ['bao', 'asian']),
  item('kai-katsu-bowl', 'Chicken Katsu Bowl', 'Kai Asian Street Fare', 'lunch', '1 bowl', 810, 40, 96, 30, 1580, ['katsu', 'asian']),

  item('shinjung-bulgogi', 'Beef Bulgogi with rice', 'Shin Jung Korean BBQ', 'dinner', '1 plate', 660, 40, 70, 24, 1480, ['korean', 'bbq', 'asian']),
  item('shinjung-galbi', 'Galbi (marinated short ribs)', 'Shin Jung Korean BBQ', 'dinner', '1 order', 850, 52, 30, 58, 1880, ['korean', 'bbq']),
  item('shinjung-bibimbap', 'Dolsot Bibimbap', 'Shin Jung Korean BBQ', 'lunch', '1 bowl', 700, 28, 92, 24, 1280, ['korean', 'rice bowl']),
  item('shinjung-kimchi-jjigae', 'Kimchi Jjigae', 'Shin Jung Korean BBQ', 'lunch', '1 bowl', 370, 24, 18, 22, 2080, ['korean', 'stew']),

  item('hamburgermarys-burger', 'Signature Burger with fries', "Hamburger Mary's", 'sandwiches', '1 burger', 1230, 50, 100, 70, 2180, ['burger', 'bar']),
  item('hamburgermarys-fried-pickles', 'Fried Pickles', "Hamburger Mary's", 'snacks', '1 order', 490, 6, 48, 30, 1880, ['fried pickles']),

  item('beths-burger', "Beth's Burger", "Beth's Burger Bar", 'sandwiches', '1 burger', 840, 44, 48, 52, 1380, ['burger']),
  item('beths-fries', 'Fries', "Beth's Burger Bar", 'snacks', '1 order', 410, 5, 52, 20, 480, ['fries']),
  item('beths-shake', 'Milkshake', "Beth's Burger Bar", 'snacks', '16 fl oz', 750, 14, 98, 34, 420, ['shake']),

  item('swinesons-chicken-sandwich', 'Fried Chicken Sandwich', 'Swine & Sons', 'sandwiches', '1 sandwich', 750, 38, 68, 36, 1680, ['chicken sandwich']),
  item('swinesons-pork-sandwich', 'Smoked Pork Sandwich', 'Swine & Sons', 'sandwiches', '1 sandwich', 600, 36, 52, 28, 1380, ['bbq', 'pork']),

  item('olered-hot-chicken', 'Nashville Hot Chicken with fries', 'Ole Red Orlando', 'dinner', '1 plate', 1170, 56, 96, 62, 2580, ['hot chicken', 'bar', 'icon park']),
  item('olered-smash-burger', 'Smash Burger with fries', 'Ole Red Orlando', 'sandwiches', '1 burger', 1030, 44, 88, 56, 1880, ['burger', 'bar']),
  item('olered-nachos', 'Loaded Nachos', 'Ole Red Orlando', 'snacks', '1 order', 1330, 44, 108, 80, 2280, ['nachos', 'bar']),

  item('seito-spicy-tuna', 'Spicy Tuna Roll', 'Seito Sushi', 'lunch', '8 pieces', 360, 24, 38, 12, 780, ['sushi', 'asian']),
  item('seito-specialty-roll', 'Specialty Roll', 'Seito Sushi', 'dinner', '8 pieces', 560, 28, 62, 22, 1180, ['sushi', 'asian']),
  item('seito-sashimi', 'Sashimi (8 pieces)', 'Seito Sushi', 'dinner', '8 pieces', 230, 40, 0, 8, 120, ['sashimi', 'sushi']),

  item('fordsgarage-burger', 'Signature Burger with fries', "Ford's Garage", 'sandwiches', '1 burger', 1180, 50, 96, 66, 2180, ['burger', 'bar']),
  item('fordsgarage-fish-chips', 'Fish & Chips', "Ford's Garage", 'dinner', '1 plate', 1190, 44, 104, 66, 1980, ['fish', 'fried']),
  item('fordsgarage-mac', 'Mac & Cheese with chicken', "Ford's Garage", 'dinner', '1 entrée', 1060, 40, 100, 56, 2280, ['mac and cheese']),

  item('chroma-flatbread', 'Flatbread', 'Chroma Modern Bar + Kitchen', 'dinner', '1 flatbread', 850, 36, 96, 36, 1780, ['flatbread', 'bar', 'lake nona']),
  item('chroma-burger', 'Chroma Burger', 'Chroma Modern Bar + Kitchen', 'sandwiches', '1 burger', 980, 48, 62, 60, 1680, ['burger', 'bar']),

  item('roccos-guacamole', 'Tableside Guacamole with chips', "Rocco's Tacos & Tequila Bar", 'snacks', '1/2 order', 700, 8, 72, 42, 880, ['guacamole', 'bar']),
  item('roccos-tacos', 'Tacos (2)', "Rocco's Tacos & Tequila Bar", 'lunch', '2 tacos', 450, 26, 38, 22, 920, ['taco']),
  item('roccos-fajitas', 'Chicken Fajitas', "Rocco's Tacos & Tequila Bar", 'dinner', '1 plate', 1090, 64, 100, 48, 2380, ['fajitas']),

  item('cubalibre-ropa-vieja', 'Ropa Vieja', 'Cuba Libre Restaurant & Rum Bar', 'dinner', '1 plate', 840, 46, 92, 32, 1680, ['cuban', 'bar']),
  item('cubalibre-cuban-sandwich', 'Cuban Sandwich', 'Cuba Libre Restaurant & Rum Bar', 'sandwiches', '1 sandwich', 790, 44, 64, 40, 2080, ['cuban']),
  item('cubalibre-empanadas', 'Empanadas (2)', 'Cuba Libre Restaurant & Rum Bar', 'snacks', '2 empanadas', 470, 16, 44, 26, 780, ['empanada', 'cuban']),

  item('johnnys-burger', 'Burger with fries', "Johnny's Fillin' Station", 'sandwiches', '1 burger', 1120, 50, 90, 62, 1980, ['burger', 'bar']),
  item('johnnys-wings', 'Wings', "Johnny's Fillin' Station", 'snacks', '10 wings', 810, 68, 4, 58, 2180, ['wings', 'bar']),
];
