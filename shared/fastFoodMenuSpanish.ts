import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Spanish tapas / paella restaurants (Spain — not Latin Mexican).
 * None publish full nutrition PDFs; values are Atwater-aligned estimates from
 * typical tapa / personal-paella portions (menus: Bulla, Jaleo, Telefèric,
 * Barcelona Wine Bar, Boqueria).
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

export const SPANISH_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // ——— Bulla Gastrobar (FL: Miami / Winter Park) ———
  item('bulla-patatas', 'Patatas Bravas', 'Bulla Gastrobar', 'snacks', '1 tapa', 320, 4, 38, 15, 520, ['patatas', 'tapas', 'spanish', 'estimated']),
  item('bulla-huevos', "Huevos 'Bulla'", 'Bulla Gastrobar', 'breakfast', '1 tapa', 480, 22, 28, 32, 980, ['eggs', 'serrano', 'tapas', 'estimated']),
  item('bulla-dates', 'Chorizo Stuffed Dates', 'Bulla Gastrobar', 'snacks', '1 tapa', 380, 14, 32, 22, 720, ['dates', 'chorizo', 'tapas', 'estimated']),
  item('bulla-croquetas', 'Croquetas (order)', 'Bulla Gastrobar', 'snacks', '1 order', 420, 14, 28, 26, 780, ['croquetas', 'tapas', 'estimated']),
  item('bulla-octopus', 'Grilled Octopus', 'Bulla Gastrobar', 'dinner', '1 tapa', 280, 28, 12, 14, 820, ['octopus', 'pulpo', 'tapas', 'estimated']),
  item('bulla-gazpacho', 'Andalusian Gazpacho', 'Bulla Gastrobar', 'lunch', '1 cup', 120, 3, 18, 4, 480, ['gazpacho', 'soup', 'estimated']),
  item('bulla-kale-caesar', 'Kale Caesar', 'Bulla Gastrobar', 'lunch', '1 salad', 340, 12, 18, 26, 780, ['salad', 'caesar', 'estimated']),
  item('bulla-med-salad', 'Mediterranean Salad', 'Bulla Gastrobar', 'lunch', '1 salad', 280, 8, 24, 18, 620, ['salad', 'estimated']),
  item('bulla-albondigas', 'Albóndigas', 'Bulla Gastrobar', 'dinner', '1 tapa', 420, 28, 18, 26, 980, ['meatballs', 'tapas', 'estimated']),
  item('bulla-chicken-paella-bowl', 'Chicken Paella Bowl', 'Bulla Gastrobar', 'lunch', '1 bowl', 620, 36, 68, 18, 1280, ['paella', 'chicken', 'estimated']),
  item('bulla-mixta-bowl', 'Paella Mixta Bowl', 'Bulla Gastrobar', 'lunch', '1 bowl', 680, 38, 72, 20, 1420, ['paella', 'estimated']),
  item('bulla-seafood-paella', 'Seafood Paella (entrée share)', 'Bulla Gastrobar', 'dinner', '1 entrée', 720, 42, 82, 22, 1680, ['paella', 'seafood', 'estimated']),
  item('bulla-mixta-paella', 'Paella Mixta (entrée share)', 'Bulla Gastrobar', 'dinner', '1 entrée', 760, 40, 84, 26, 1580, ['paella', 'estimated']),
  item('bulla-pollo-chilindron', 'Pollo al Chilindrón', 'Bulla Gastrobar', 'dinner', '1 platter', 580, 48, 42, 22, 1320, ['chicken', 'estimated']),
  item('bulla-burger', "'Bulla' Burger with Patatas Bravas", 'Bulla Gastrobar', 'sandwiches', '1 burger + side', 920, 42, 68, 48, 1680, ['burger', 'estimated']),
  item('bulla-churros', 'Churros with Chocolate', 'Bulla Gastrobar', 'snacks', '1 order', 480, 6, 62, 22, 280, ['churros', 'dessert', 'estimated']),

  // ——— Jaleo by José Andrés (Disney Springs / DC / Vegas) ———
  item('jaleo-gambas', 'Gambas al Ajillo', 'Jaleo', 'snacks', '1 tapa', 220, 24, 4, 12, 680, ['shrimp', 'gambas', 'tapas', 'spanish', 'estimated']),
  item('jaleo-patatas', 'Patatas Bravas', 'Jaleo', 'snacks', '1 tapa', 340, 5, 40, 16, 560, ['patatas', 'tapas', 'estimated']),
  item('jaleo-pan-tomate', 'Pan con Tomate', 'Jaleo', 'snacks', '1 tapa', 180, 4, 28, 6, 420, ['bread', 'tomato', 'tapas', 'estimated']),
  item('jaleo-croquetas', 'Croquetas de Jamón', 'Jaleo', 'snacks', '1 order', 400, 14, 26, 26, 860, ['croquetas', 'jamon', 'tapas', 'estimated']),
  item('jaleo-piquillo', 'Piquillo Peppers with Goat Cheese', 'Jaleo', 'snacks', '1 tapa', 260, 10, 14, 18, 620, ['piquillo', 'tapas', 'estimated']),
  item('jaleo-pollo-ajillo', 'Pollo al Ajillo', 'Jaleo', 'dinner', '1 tapa', 380, 36, 6, 24, 780, ['chicken', 'tapas', 'estimated']),
  item('jaleo-butifarra', 'Butifarra with White Beans', 'Jaleo', 'dinner', '1 tapa', 480, 28, 22, 32, 980, ['sausage', 'tapas', 'estimated']),
  item('jaleo-ensalada', 'Ensalada Verde', 'Jaleo', 'lunch', '1 salad', 180, 4, 12, 14, 380, ['salad', 'estimated']),
  item('jaleo-arroz-pollo', 'Arroz con Pollo (plate)', 'Jaleo', 'dinner', '1 plate', 720, 38, 78, 22, 1480, ['paella', 'rice', 'chicken', 'estimated']),
  item('jaleo-arroz-mariscos', 'Arroz Meloso de Mariscos (plate)', 'Jaleo', 'dinner', '1 plate', 680, 40, 72, 18, 1620, ['paella', 'seafood', 'estimated']),
  item('jaleo-arroz-verduras', 'Arroz de Verduras (plate)', 'Jaleo', 'dinner', '1 plate', 520, 12, 82, 14, 980, ['paella', 'vegetarian', 'estimated']),
  item('jaleo-flan', 'Flan', 'Jaleo', 'snacks', '1 dessert', 320, 8, 42, 12, 160, ['flan', 'dessert', 'estimated']),

  // ——— Telefèric Barcelona (CA / AZ) ———
  item('tele-patatas', 'Patatas Bravas', 'Telefèric Barcelona', 'snacks', '1 tapa', 340, 5, 40, 16, 540, ['patatas', 'tapas', 'spanish', 'estimated']),
  item('tele-pan-tomate', 'Pan con Tomate', 'Telefèric Barcelona', 'snacks', '1 tapa', 200, 5, 30, 7, 440, ['bread', 'tomato', 'tapas', 'estimated']),
  item('tele-jamon', 'Jamón Ibérico (portion)', 'Telefèric Barcelona', 'snacks', '1 tapa', 280, 28, 0, 18, 1480, ['jamon', 'iberico', 'tapas', 'estimated']),
  item('tele-ham-croquetas', 'Ham Croquetas', 'Telefèric Barcelona', 'snacks', '6 pieces', 420, 16, 28, 26, 880, ['croquetas', 'tapas', 'estimated']),
  item('tele-crab-croquetas', 'Crab Croquetas', 'Telefèric Barcelona', 'snacks', '1 order', 440, 18, 26, 28, 920, ['croquetas', 'crab', 'tapas', 'estimated']),
  item('tele-pulpo', 'Pulpo Telefèric', 'Telefèric Barcelona', 'dinner', '1 tapa', 300, 30, 14, 14, 860, ['octopus', 'pulpo', 'tapas', 'estimated']),
  item('tele-gambas', 'Gambas al Ajillo', 'Telefèric Barcelona', 'snacks', '1 tapa', 240, 26, 4, 14, 720, ['shrimp', 'gambas', 'tapas', 'estimated']),
  item('tele-albondigas', 'Spanish Albóndigas', 'Telefèric Barcelona', 'dinner', '1 tapa', 440, 30, 20, 26, 1020, ['meatballs', 'tapas', 'estimated']),
  item('tele-empanadas', 'Wagyu Empanadas', 'Telefèric Barcelona', 'snacks', '1 order', 480, 22, 36, 26, 780, ['empanada', 'tapas', 'estimated']),
  item('tele-market-salad', 'Telefèric Market Salad', 'Telefèric Barcelona', 'lunch', '1 salad', 360, 10, 28, 24, 520, ['salad', 'estimated']),
  item('tele-tuna-salad', 'Mediterranean Fresh Tuna Salad', 'Telefèric Barcelona', 'lunch', '1 salad', 480, 36, 22, 28, 780, ['salad', 'tuna', 'estimated']),
  item('tele-paella-mixta', 'Paella Mixta (entrée share)', 'Telefèric Barcelona', 'dinner', '1 entrée', 740, 40, 86, 24, 1580, ['paella', 'estimated']),
  item('tele-paella-negra', 'Paella Negra (entrée share)', 'Telefèric Barcelona', 'dinner', '1 entrée', 680, 38, 84, 20, 1720, ['paella', 'seafood', 'estimated']),
  item('tele-paella-veggie', 'Veggie Paella (entrée share)', 'Telefèric Barcelona', 'dinner', '1 entrée', 560, 14, 88, 16, 1120, ['paella', 'vegetarian', 'estimated']),
  item('tele-paella-lobster', 'Lobster Paella (entrée share)', 'Telefèric Barcelona', 'dinner', '1 entrée', 800, 48, 82, 28, 1880, ['paella', 'lobster', 'estimated']),
  item('tele-churros', 'Churros with Chocolate', 'Telefèric Barcelona', 'snacks', '1 order', 520, 6, 68, 24, 300, ['churros', 'dessert', 'estimated']),
  item('tele-torrija', 'Torrija', 'Telefèric Barcelona', 'snacks', '1 dessert', 480, 8, 58, 24, 220, ['dessert', 'estimated']),

  // ——— Barcelona Wine Bar (East Coast + Wynwood) ———
  item('bwb-patatas', 'Patatas Bravas', 'Barcelona Wine Bar', 'snacks', '1 tapa', 320, 4, 38, 15, 420, ['patatas', 'tapas', 'spanish', 'estimated']),
  item('bwb-gambas', 'Gambas al Ajillo', 'Barcelona Wine Bar', 'snacks', '1 tapa', 200, 24, 3, 10, 480, ['shrimp', 'gambas', 'tapas', 'estimated']),
  item('bwb-pulpo', 'Charcoal Grilled Pulpo', 'Barcelona Wine Bar', 'dinner', '1 tapa', 220, 26, 5, 10, 580, ['octopus', 'pulpo', 'tapas', 'estimated']),
  item('bwb-chicken', 'Grilled Chicken Thigh', 'Barcelona Wine Bar', 'dinner', '1 tapa', 310, 32, 4, 18, 520, ['chicken', 'tapas', 'estimated']),
  item('bwb-tortilla', 'Potato Tortilla', 'Barcelona Wine Bar', 'snacks', '1 tapa', 280, 12, 22, 16, 480, ['tortilla', 'eggs', 'tapas', 'estimated']),
  item('bwb-croquetas', 'Jamón & Manchego Croquetas', 'Barcelona Wine Bar', 'snacks', '1 order', 400, 14, 26, 26, 860, ['croquetas', 'tapas', 'estimated']),
  item('bwb-empanadas', 'Spiced Beef Empanadas', 'Barcelona Wine Bar', 'snacks', '1 order', 420, 18, 34, 22, 720, ['empanada', 'tapas', 'estimated']),
  item('bwb-albondigas', 'Albóndigas', 'Barcelona Wine Bar', 'dinner', '1 tapa', 400, 26, 16, 26, 920, ['meatballs', 'tapas', 'estimated']),
  item('bwb-dates', 'Bacon Wrapped Dates', 'Barcelona Wine Bar', 'snacks', '1 tapa', 360, 12, 30, 20, 680, ['dates', 'bacon', 'tapas', 'estimated']),
  item('bwb-spinach', 'Spinach & Chickpea Cazuela', 'Barcelona Wine Bar', 'lunch', '1 tapa', 210, 9, 28, 7, 480, ['spinach', 'chickpea', 'tapas', 'estimated']),
  item('bwb-ensalada', 'Ensalada Mixta', 'Barcelona Wine Bar', 'lunch', '1 salad', 140, 4, 12, 8, 280, ['salad', 'estimated']),
  item('bwb-paella', 'Paella Mariscos (half)', 'Barcelona Wine Bar', 'dinner', '1/2 order', 680, 38, 82, 18, 940, ['paella', 'seafood', 'estimated']),
  item('bwb-chicken-pimientos', 'Chicken Pimientos', 'Barcelona Wine Bar', 'dinner', '1 plate', 520, 48, 22, 26, 720, ['chicken', 'estimated']),
  item('bwb-flan', 'Flan Catalán', 'Barcelona Wine Bar', 'snacks', '1 dessert', 300, 7, 40, 12, 150, ['flan', 'dessert', 'estimated']),

  // ——— Boqueria (NYC / DC / Chicago) ———
  item('boq-patatas', 'Patatas Bravas', 'Boqueria', 'snacks', '1 tapa', 330, 4, 39, 16, 500, ['patatas', 'tapas', 'spanish', 'estimated']),
  item('boq-pan-tomate', 'Pan con Tomate', 'Boqueria', 'snacks', '1 tapa', 190, 4, 28, 7, 400, ['bread', 'tomato', 'tapas', 'estimated']),
  item('boq-gambas', 'Gambas al Ajillo', 'Boqueria', 'snacks', '1 tapa', 230, 25, 3, 13, 700, ['shrimp', 'gambas', 'tapas', 'estimated']),
  item('boq-croquetas', 'Croquetas de Jamón', 'Boqueria', 'snacks', '1 order', 410, 15, 27, 26, 840, ['croquetas', 'tapas', 'estimated']),
  item('boq-pulpo', 'Pulpo a la Gallega', 'Boqueria', 'dinner', '1 tapa', 260, 28, 10, 12, 780, ['octopus', 'pulpo', 'tapas', 'estimated']),
  item('boq-tortilla', 'Tortilla Española', 'Boqueria', 'snacks', '1 tapa', 290, 12, 24, 16, 500, ['tortilla', 'eggs', 'tapas', 'estimated']),
  item('boq-albondigas', 'Albóndigas', 'Boqueria', 'dinner', '1 tapa', 420, 28, 18, 26, 960, ['meatballs', 'tapas', 'estimated']),
  item('boq-chorizo', 'Chorizo a la Sidra', 'Boqueria', 'snacks', '1 tapa', 380, 18, 8, 30, 980, ['chorizo', 'tapas', 'estimated']),
  item('boq-salad', 'Ensalada Mixta', 'Boqueria', 'lunch', '1 salad', 220, 6, 14, 16, 420, ['salad', 'estimated']),
  item('boq-paella-valenciana', 'Paella Valenciana (entrée share)', 'Boqueria', 'dinner', '1 entrée', 740, 36, 80, 22, 1520, ['paella', 'estimated']),
  item('boq-paella-mariscos', 'Paella de Mariscos (entrée share)', 'Boqueria', 'dinner', '1 entrée', 700, 40, 76, 18, 1680, ['paella', 'seafood', 'estimated']),
  item('boq-fideua', 'Fideuà (entrée share)', 'Boqueria', 'dinner', '1 entrée', 720, 34, 78, 24, 1480, ['fideua', 'noodles', 'estimated']),
  item('boq-churros', 'Churros with Chocolate', 'Boqueria', 'snacks', '1 order', 500, 6, 64, 24, 290, ['churros', 'dessert', 'estimated']),
];
