import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Orlando-area independents from 2026 local guides and reader polls — Colombian, Brazilian and
 * Puerto Rican bakeries, cafes, Mills 50 Vietnamese and ramen, neighborhood pizza, Italian, taco,
 * steak and seafood spots. None publish nutrition: values are Atwater-aligned estimates from
 * USDA analogs and typical portions for each dish, and every item carries the estimated keyword.
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

export const ORLANDO_LOCALS_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // ——— The Bakery Cafe (Colombian; Avalon Park & UCF) ———
  item('tbc-pandebono', 'Pandebono', 'The Bakery Cafe', 'breakfast', '1 piece', 180, 6, 22, 8, 260, ['colombian', 'cheese bread']),
  item('tbc-croissant', 'Plain Croissant', 'The Bakery Cafe', 'breakfast', '1 croissant', 280, 5, 30, 16, 300, ['croissant']),
  item('tbc-ham-cheese-croissant', 'Ham & Cheese Croissant', 'The Bakery Cafe', 'breakfast', '1 croissant', 380, 15, 30, 22, 720, ['croissant']),
  item('tbc-chocolate-croissant', 'Chocolate Croissant', 'The Bakery Cafe', 'breakfast', '1 croissant', 340, 6, 36, 19, 260, ['croissant']),
  item('tbc-orejas', 'Orejas (palmier)', 'The Bakery Cafe', 'snacks', '1 pastry', 300, 3, 36, 16, 120, ['pastry']),
  item('tbc-guava-cheese', 'Guava & Cheese Pastry', 'The Bakery Cafe', 'snacks', '1 pastry', 320, 5, 38, 16, 240, ['pastry', 'guava']),
  item('tbc-quesito', 'Quesito', 'The Bakery Cafe', 'snacks', '1 pastry', 300, 6, 30, 17, 260, ['pastry']),
  item('tbc-empanada-carne', 'Empanada de Carne', 'The Bakery Cafe', 'snacks', '1 empanada', 230, 8, 22, 12, 380, ['empanada']),
  item('tbc-empanada-queso', 'Empanada de Queso', 'The Bakery Cafe', 'snacks', '1 empanada', 240, 8, 22, 13, 360, ['empanada']),
  item('tbc-papa-rellena', 'Papa Rellena', 'The Bakery Cafe', 'snacks', '1 piece', 340, 12, 36, 16, 620, ['potato']),
  item('tbc-chicharron-arepa', 'Chicharrón con Mini Arepa', 'The Bakery Cafe', 'lunch', '1 order', 620, 22, 30, 46, 980, ['arepa', 'pork belly']),
  item('tbc-arepa-huevos', 'Arepa Stuffed with Scrambled Eggs', 'The Bakery Cafe', 'breakfast', '1 arepa', 420, 16, 40, 22, 640, ['arepa', 'eggs']),
  item('tbc-arepa-pepiada', 'Arepa Pepiada', 'The Bakery Cafe', 'lunch', '1 arepa', 560, 30, 44, 30, 820, ['arepa', 'chicken', 'avocado']),
  item('tbc-mixed-arepa', 'Mixed Arepa with fries', 'The Bakery Cafe', 'lunch', '1 plate', 1080, 52, 96, 54, 1780, ['arepa', 'steak', 'chicken']),
  item('tbc-arepa-burger', 'Arepa Burger with fries', 'The Bakery Cafe', 'lunch', '1 plate', 1180, 48, 100, 64, 2080, ['burger', 'arepa']),
  item('tbc-salchipapa', 'Salchipapa', 'The Bakery Cafe', 'snacks', '1 order', 820, 22, 72, 50, 1680, ['fries', 'sausage']),
  item('tbc-ajiaco', 'Ajiaco', 'The Bakery Cafe', 'lunch', '1 bowl', 520, 32, 52, 20, 1380, ['soup', 'colombian']),
  item('tbc-caramel-latte', 'Caramel Latte (16 oz)', 'The Bakery Cafe', 'breakfast', '16 fl oz', 280, 10, 40, 9, 180, ['coffee', 'latte']),

  // ——— Orlando bakeries ———
  item('fortuna-pandebono', 'Pandebono', 'Fortuna Bakery & Coffee', 'breakfast', '1 piece', 180, 6, 22, 8, 260, ['colombian', 'cheese bread']),
  item('fortuna-bunuelo', 'Buñuelo', 'Fortuna Bakery & Coffee', 'snacks', '1 piece', 170, 4, 18, 9, 200, ['colombian']),
  item('fortuna-empanada', 'Chicken Empanada', 'Fortuna Bakery & Coffee', 'snacks', '1 empanada', 230, 9, 22, 12, 360, ['empanada']),
  item('fortuna-cafe-con-leche', 'Café con Leche (12 oz)', 'Fortuna Bakery & Coffee', 'breakfast', '12 fl oz', 160, 8, 16, 7, 110, ['coffee']),

  item('glassknife-glazed', 'Glazed Donut', 'The Glass Knife', 'breakfast', '1 donut', 260, 4, 30, 14, 220, ['donut']),
  item('glassknife-red-velvet', 'Red Velvet Cake (slice)', 'The Glass Knife', 'snacks', '1 slice', 640, 6, 82, 32, 480, ['cake']),
  item('glassknife-avocado-toast', 'Avocado Toast', 'The Glass Knife', 'breakfast', '1 toast', 420, 12, 40, 24, 620, ['avocado toast']),
  item('glassknife-chicken-salad', 'Chicken Salad Sandwich', 'The Glass Knife', 'lunch', '1 sandwich', 620, 28, 44, 36, 980, ['sandwich']),

  item('gideons-chocolate-chip', 'Original Chocolate Chip Cookie (½ lb)', "Gideon's Bakehouse", 'snacks', '1 cookie', 1100, 12, 136, 56, 640, ['cookie']),
  item('gideons-coffee-cake', 'Coffee Cake Cookie (½ lb)', "Gideon's Bakehouse", 'snacks', '1 cookie', 1050, 11, 134, 52, 620, ['cookie']),
  item('gideons-cake', 'Cake (slice)', "Gideon's Bakehouse", 'snacks', '1 slice', 720, 7, 92, 36, 480, ['cake']),

  item('charliesbakery-chocolate-cake', 'Chocolate Cake (slice)', "Charlie's Bakery & Creamery", 'snacks', '1 slice', 560, 6, 74, 28, 420, ['cake']),
  item('charliesbakery-key-lime', 'Key Lime Pie (slice)', "Charlie's Bakery & Creamery", 'snacks', '1 slice', 480, 7, 58, 25, 260, ['pie']),
  item('charliesbakery-ice-cream', 'Ice Cream (1 scoop)', "Charlie's Bakery & Creamery", 'snacks', '1 scoop', 280, 4, 30, 16, 90, ['ice cream']),

  item('buttermilk-croissant', 'Butter Croissant', 'Buttermilk Bakery', 'breakfast', '1 croissant', 300, 6, 32, 17, 320, ['croissant']),
  item('buttermilk-morning-bun', 'Morning Bun', 'Buttermilk Bakery', 'breakfast', '1 bun', 420, 6, 56, 19, 280, ['pastry']),
  item('buttermilk-breakfast-sandwich', 'Breakfast Sandwich', 'Buttermilk Bakery', 'breakfast', '1 sandwich', 560, 24, 40, 34, 1020, ['breakfast sandwich']),

  item('sisterhoneys-chocolate-cream', 'Chocolate Cream Pie (slice)', "Sister Honey's", 'snacks', '1 slice', 580, 7, 62, 34, 380, ['pie']),
  item('sisterhoneys-bourbon-pecan', 'Bourbon Pecan Pie (slice)', "Sister Honey's", 'snacks', '1 slice', 640, 7, 80, 33, 320, ['pie']),

  item('sodie-cake', 'Brazilian Cake (slice)', 'Sodiê Doces', 'snacks', '1 slice', 480, 6, 62, 23, 220, ['cake', 'brazilian']),
  item('sodie-brigadeiro', 'Brigadeiro', 'Sodiê Doces', 'snacks', '1 piece', 90, 1, 13, 4, 25, ['brazilian', 'chocolate']),
  item('sodie-coxinha', 'Coxinha', 'Sodiê Doces', 'snacks', '1 piece', 280, 10, 26, 15, 480, ['brazilian']),

  item('paogostoso-pao-de-queijo', 'Pão de Queijo (3)', 'Pão Gostoso Bakery', 'breakfast', '3 pieces', 270, 6, 30, 14, 420, ['brazilian', 'cheese bread']),
  item('paogostoso-coxinha', 'Coxinha', 'Pão Gostoso Bakery', 'snacks', '1 piece', 280, 10, 26, 15, 480, ['brazilian']),
  item('paogostoso-pastel', 'Pastel de Carne', 'Pão Gostoso Bakery', 'snacks', '1 pastel', 420, 14, 38, 23, 620, ['brazilian']),

  item('amorempedacos-cake', 'Brazilian Cake (slice)', 'Amor em Pedaços', 'snacks', '1 slice', 520, 6, 66, 26, 240, ['cake', 'brazilian']),
  item('amorempedacos-brigadeiro', 'Brigadeiro', 'Amor em Pedaços', 'snacks', '1 piece', 90, 1, 13, 4, 25, ['brazilian', 'chocolate']),

  item('cafedecolombia-pandebono', 'Pandebono', 'Cafe de Colombia Bakery', 'breakfast', '1 piece', 180, 6, 22, 8, 260, ['colombian', 'cheese bread']),
  item('cafedecolombia-pan-de-yuca', 'Pan de Yuca', 'Cafe de Colombia Bakery', 'breakfast', '1 piece', 160, 4, 20, 7, 240, ['colombian']),
  item('cafedecolombia-empanada', 'Beef Empanada', 'Cafe de Colombia Bakery', 'snacks', '1 empanada', 230, 8, 22, 12, 380, ['empanada']),

  item('ticos-tres-leches', 'Tres Leches (slice)', 'Ticos Bakery', 'snacks', '1 slice', 420, 9, 58, 17, 180, ['cake']),
  item('ticos-gallo-pinto', 'Gallo Pinto Breakfast', 'Ticos Bakery', 'breakfast', '1 plate', 640, 26, 72, 28, 1180, ['costa rican', 'rice and beans']),

  item('lafuente-bandeja-paisa', 'Bandeja Paisa', 'La Fuente Bakery & Restaurant', 'dinner', '1 plate', 1480, 72, 128, 74, 2880, ['colombian']),
  item('lafuente-tequenos', 'Tequeños (4)', 'La Fuente Bakery & Restaurant', 'snacks', '4 pieces', 520, 18, 44, 30, 880, ['venezuelan']),
  item('lafuente-pandebono', 'Pandebono', 'La Fuente Bakery & Restaurant', 'breakfast', '1 piece', 180, 6, 22, 8, 260, ['colombian', 'cheese bread']),

  item('benjamin-croissant', 'Butter Croissant', 'Benjamin French Bakery & Cafe', 'breakfast', '1 croissant', 300, 6, 32, 17, 320, ['croissant', 'french']),
  item('benjamin-quiche', 'Quiche Lorraine (slice)', 'Benjamin French Bakery & Cafe', 'lunch', '1 slice', 520, 18, 28, 38, 780, ['quiche', 'french']),
  item('benjamin-croque-monsieur', 'Croque Monsieur', 'Benjamin French Bakery & Cafe', 'lunch', '1 sandwich', 680, 34, 44, 40, 1680, ['sandwich', 'french']),

  item('icafedeparis-nutella-crepe', 'Nutella Crêpe', 'iCafe de Paris', 'snacks', '1 crêpe', 520, 9, 66, 25, 200, ['crepe', 'french']),
  item('icafedeparis-croissant', 'Butter Croissant', 'iCafe de Paris', 'breakfast', '1 croissant', 300, 6, 32, 17, 320, ['croissant', 'french']),

  item('bagelking-everything', 'Everything Bagel with cream cheese', 'Bagel King', 'breakfast', '1 bagel', 460, 14, 66, 15, 780, ['bagel']),
  item('bagelking-bec', 'Bacon, Egg & Cheese Bagel', 'Bagel King', 'breakfast', '1 bagel', 620, 28, 62, 28, 1380, ['bagel', 'breakfast sandwich']),

  item('yalaha-strudel', 'Apple Strudel (slice)', 'Yalaha Bakery', 'snacks', '1 slice', 420, 5, 56, 20, 260, ['german', 'pastry']),
  item('yalaha-bratwurst', 'Bratwurst Sandwich', 'Yalaha Bakery', 'lunch', '1 sandwich', 680, 26, 52, 40, 1680, ['german']),

  // ——— Puerto Rican, Cuban & Colombian restaurants ———
  item('tainos-cubano', 'Cuban Sandwich', "Taino's Bakery & Deli", 'sandwiches', '1 sandwich', 720, 38, 58, 36, 1980, ['cuban sandwich', 'puerto rican']),
  item('tainos-pastelillo', 'Pastelillo de Carne', "Taino's Bakery & Deli", 'snacks', '1 pastelillo', 320, 10, 30, 18, 520, ['puerto rican']),
  item('tainos-alcapurria', 'Alcapurria', "Taino's Bakery & Deli", 'snacks', '1 piece', 300, 8, 28, 17, 520, ['puerto rican']),
  item('tainos-mallorca', 'Mallorca', "Taino's Bakery & Deli", 'breakfast', '1 roll', 380, 7, 52, 16, 280, ['puerto rican', 'pastry']),
  item('tainos-pernil', 'Pernil with rice & beans', "Taino's Bakery & Deli", 'dinner', '1 plate', 980, 48, 104, 38, 1880, ['puerto rican', 'pork']),

  item('elcafetal-mallorca', 'Mallorca with ham & cheese', 'Panadería El Cafetal', 'breakfast', '1 sandwich', 520, 20, 56, 24, 1080, ['puerto rican']),
  item('elcafetal-tripleta', 'Tripleta Sandwich', 'Panadería El Cafetal', 'sandwiches', '1 sandwich', 880, 44, 66, 48, 2280, ['puerto rican']),
  item('elcafetal-cafe-con-leche', 'Café con Leche (12 oz)', 'Panadería El Cafetal', 'breakfast', '12 fl oz', 160, 8, 16, 7, 110, ['coffee']),

  item('melao-quesito', 'Quesito', 'Melao Bakery', 'snacks', '1 pastry', 300, 6, 30, 17, 260, ['puerto rican', 'pastry']),
  item('melao-cubano', 'Cuban Sandwich', 'Melao Bakery', 'sandwiches', '1 sandwich', 720, 38, 58, 36, 1980, ['cuban sandwich']),
  item('melao-mofongo', 'Mofongo with pernil', 'Melao Bakery', 'dinner', '1 plate', 980, 40, 84, 54, 1680, ['puerto rican', 'mofongo']),

  item('cubansontherun-cubano', 'Cuban Sandwich', 'Cubans on the Run', 'sandwiches', '1 sandwich', 720, 38, 58, 36, 1980, ['cuban sandwich']),
  item('cubansontherun-croquetas', 'Ham Croquetas (3)', 'Cubans on the Run', 'snacks', '3 croquetas', 330, 12, 24, 21, 720, ['cuban']),

  item('quebueno-bandeja-paisa', 'Bandeja Paisa', 'Oh! Que Bueno', 'dinner', '1 plate', 1480, 72, 128, 74, 2880, ['colombian']),
  item('quebueno-arepa-queso', 'Arepa con Queso', 'Oh! Que Bueno', 'snacks', '1 arepa', 360, 12, 40, 17, 620, ['colombian', 'arepa']),

  item('piopio-pollo-brasa', 'Pollo a la Brasa (¼ dark) with rice & beans', 'Pio Pio Restaurant', 'dinner', '1 plate', 1080, 52, 110, 46, 2180, ['rotisserie chicken', 'colombian']),

  item('jerkman-jerk-chicken', 'Jerk Chicken Plate', 'Jerkman BBQ', 'dinner', '1 plate', 960, 58, 86, 40, 2180, ['jamaican', 'jerk']),

  // ——— Mills 50 Vietnamese, ramen & Asian ———
  item('domu-tonkotsu', 'Domu Ramen (tonkotsu)', 'DOMU', 'dinner', '1 bowl', 980, 40, 96, 46, 3600, ['ramen']),
  item('domu-spicy', 'Spicy Tonkotsu Ramen', 'DOMU', 'dinner', '1 bowl', 1020, 40, 98, 50, 3800, ['ramen']),
  item('domu-pork-bao', 'Pork Belly Bao (2)', 'DOMU', 'snacks', '2 buns', 520, 20, 48, 28, 980, ['bao']),

  item('jinya-tonkotsu-black', 'JINYA Tonkotsu Black', 'JINYA Ramen Bar', 'dinner', '1 bowl', 980, 40, 90, 48, 3880, ['ramen']),
  item('jinya-chicken-ramen', 'Chicken Ramen', 'JINYA Ramen Bar', 'dinner', '1 bowl', 760, 38, 80, 30, 3200, ['ramen']),

  item('pho88-pho-tai', 'Phở Tái (large)', 'Pho 88', 'dinner', '1 large bowl', 640, 40, 80, 14, 2400, ['pho', 'vietnamese']),
  item('pho88-spring-rolls', 'Fresh Spring Rolls (2)', 'Pho 88', 'snacks', '2 rolls', 220, 10, 30, 6, 420, ['spring rolls', 'vietnamese']),

  item('kingbao-pork-belly', 'Pork Belly Bao', 'King Bao', 'snacks', '1 bun', 300, 10, 30, 15, 520, ['bao']),
  item('kingbao-fried-chicken', 'Fried Chicken Bao', 'King Bao', 'snacks', '1 bun', 320, 13, 32, 15, 640, ['bao']),

  item('stickyrice-papaya-salad', 'Papaya Salad', 'Sticky Rice Lao Street Food', 'lunch', '1 salad', 160, 4, 32, 2, 1280, ['lao', 'thai']),
  item('stickyrice-lao-sausage', 'Lao Sausage with sticky rice', 'Sticky Rice Lao Street Food', 'lunch', '1 plate', 680, 24, 72, 32, 1380, ['lao']),

  item('anhhong-bun-thit-nuong', 'Bún Thịt Nướng', 'Anh Hong', 'lunch', '1 bowl', 640, 30, 82, 20, 1380, ['vietnamese', 'vermicelli']),

  item('saigonnoodle-pho-dac-biet', 'Phở Đặc Biệt', 'Saigon Noodle & Grill', 'dinner', '1 bowl', 680, 44, 80, 18, 2600, ['pho', 'vietnamese']),

  item('vietnomz-banh-mi', 'Grilled Pork Bánh Mì', 'Viet-Nomz', 'sandwiches', '1 sandwich', 560, 26, 62, 22, 1280, ['banh mi', 'vietnamese']),
  item('vietnomz-pho', 'Beef Phở', 'Viet-Nomz', 'dinner', '1 bowl', 640, 40, 80, 14, 2400, ['pho', 'vietnamese']),

  item('parisbanhmi-grilled-pork', 'Grilled Pork Bánh Mì', 'Paris Banh Mi', 'sandwiches', '1 sandwich', 520, 24, 64, 18, 1280, ['banh mi', 'vietnamese']),
  item('parisbanhmi-thai-tea', 'Thai Tea with boba', 'Paris Banh Mi', 'snacks', '1 drink', 380, 3, 72, 9, 120, ['boba', 'thai tea']),

  item('kabooki-signature-roll', 'Signature Roll', 'Kabooki Sushi', 'dinner', '8 pieces', 480, 18, 62, 16, 1180, ['sushi']),

  item('bombaystreet-butter-chicken', 'Butter Chicken with rice', 'Bombay Street Kitchen', 'dinner', '1 plate', 980, 44, 96, 46, 1880, ['indian']),

  item('tabla-tikka-masala', 'Chicken Tikka Masala with rice', 'Tabla Indian Restaurant', 'dinner', '1 plate', 920, 44, 94, 40, 1780, ['indian']),

  // ——— Tacos & Mexican ———
  item('hungerstreet-suadero', 'Suadero Taco', 'Hunger Street Tacos', 'lunch', '1 taco', 230, 12, 16, 13, 380, ['taco']),
  item('hungerstreet-al-pastor', 'Al Pastor Taco', 'Hunger Street Tacos', 'lunch', '1 taco', 210, 11, 18, 10, 420, ['taco']),

  item('tacosmyguey-birria', 'Birria Tacos (3) with consomé', 'Tacos My Guey', 'lunch', '3 tacos', 780, 44, 54, 42, 1680, ['birria', 'taco']),

  item('talkintacos-birria', 'Birria Tacos (3) with consomé', "Talkin' Tacos", 'lunch', '3 tacos', 760, 42, 52, 42, 1580, ['birria', 'taco']),

  item('lascarretas-fajitas', 'Chicken Fajitas', 'Las Carretas', 'dinner', '1 order', 980, 64, 82, 42, 2680, ['fajitas']),
  item('lascarretas-burrito', 'Burrito', 'Las Carretas', 'lunch', '1 burrito', 1020, 46, 108, 44, 2280, ['burrito']),

  item('agaveazul-enchiladas', 'Enchiladas (3)', 'Agave Azul Cocina Mexicana', 'dinner', '1 plate', 860, 40, 72, 44, 2080, ['enchiladas']),

  item('reyes-mole-enchiladas', 'Mole Enchiladas', 'Reyes Mezcaleria', 'dinner', '1 entrée', 820, 38, 76, 40, 1880, ['mole', 'enchiladas']),
  item('reyes-al-pastor', 'Tacos al Pastor (3)', 'Reyes Mezcaleria', 'dinner', '3 tacos', 620, 30, 54, 30, 1280, ['taco']),

  // ——— Pizza & Italian ———
  item('pizzabruno-margherita', 'Margherita Pizza (¼ pie)', 'Pizza Bruno', 'dinner', '2 slices', 420, 17, 50, 16, 880, ['pizza']),
  item('pizzabruno-pepperoni', 'Pepperoni Pizza (¼ pie)', 'Pizza Bruno', 'dinner', '2 slices', 520, 22, 50, 25, 1180, ['pizza']),

  item('sodough-detroit-slice', 'Detroit-Style Square (pepperoni)', 'SoDough Square', 'dinner', '1 square', 420, 16, 40, 22, 920, ['pizza', 'detroit']),

  item('fd-margherita', 'Margherita Pizza (12 in)', 'F&D Woodfired Italian Kitchen', 'dinner', '1 pizza', 980, 40, 120, 36, 2080, ['pizza']),
  item('fd-lasagna', 'Lasagna', 'F&D Woodfired Italian Kitchen', 'dinner', '1 entrée', 920, 48, 62, 52, 2180, ['pasta']),

  item('nonnos-chicken-parm', 'Chicken Parmigiana with spaghetti', "Nonno's Italian Restaurant", 'dinner', '1 entrée', 1280, 72, 112, 58, 2880, ['pasta', 'chicken parm']),

  item('francescos-spaghetti-meatballs', 'Spaghetti & Meatballs', "Francesco's Ristorante & Pizzeria", 'dinner', '1 entrée', 1080, 44, 124, 44, 2180, ['pasta']),

  item('enzos-alfredo', 'Fettuccine Alfredo', "Enzo's on the Lake", 'dinner', '1 entrée', 1120, 28, 98, 68, 1480, ['pasta', 'alfredo']),

  item('antonios-veal-piccata', 'Veal Piccata', "Antonio's", 'dinner', '1 entrée', 780, 52, 34, 46, 1380, ['veal']),

  item('stasios-italian-sub', 'Italian Sub', "Stasio's Italian Deli & Market", 'sandwiches', '1 sub', 880, 42, 72, 46, 2880, ['sub', 'italian']),

  item('turci-cacio-e-pepe', 'Cacio e Pepe', 'Turci Pasta', 'dinner', '1 bowl', 780, 28, 92, 32, 980, ['pasta']),

  item('prato-margherita', 'Margherita Pizza', 'Prato', 'dinner', '1 pizza', 900, 36, 112, 32, 1880, ['pizza']),

  // ——— Brazilian & steakhouses ———
  item('boteco-picanha', 'Picanha Plate', 'Boteco', 'dinner', '1 plate', 1080, 64, 70, 58, 1680, ['brazilian', 'picanha']),
  item('boteco-coxinha', 'Coxinha (2)', 'Boteco', 'snacks', '2 pieces', 560, 20, 52, 30, 960, ['brazilian']),

  item('camilas-buffet', 'Buffet Plate (by weight)', "Camila's Brazilian Restaurant", 'dinner', '1 lb', 880, 48, 80, 40, 1780, ['brazilian', 'buffet']),

  item('cafemineiro-picanha', 'Picanha (8 oz)', 'Cafe Mineiro Brazilian Steakhouse', 'dinner', '8 oz', 620, 50, 0, 46, 520, ['brazilian', 'picanha', 'steak']),
  item('cafemineiro-feijoada', 'Feijoada', 'Cafe Mineiro Brazilian Steakhouse', 'dinner', '1 bowl', 720, 38, 58, 36, 1880, ['brazilian']),

  item('christners-filet', 'Filet Mignon (8 oz)', "Christner's Prime Steak & Lobster", 'dinner', '8 oz', 560, 58, 0, 36, 480, ['steak', 'filet']),

  item('kres-ribeye', 'Ribeye (14 oz)', 'Kres Chophouse', 'dinner', '14 oz', 1080, 82, 0, 84, 880, ['steak', 'ribeye']),

  item('charleys-filet', 'Filet Mignon (10 oz)', "Charley's Steak House", 'dinner', '10 oz', 680, 70, 0, 44, 640, ['steak', 'filet']),

  // ——— Chicken, BBQ & burgers ———
  item('chickenfire-hot-sandwich', 'Hot Chicken Sandwich', 'Chicken Fire', 'sandwiches', '1 sandwich', 880, 44, 72, 46, 2080, ['hot chicken']),
  item('chickenfire-tenders', 'Chicken Tenders (3)', 'Chicken Fire', 'lunch', '3 tenders', 520, 40, 28, 28, 1480, ['chicken tenders']),

  item('smokemade-brisket', 'Brisket (½ lb)', 'Smokemade Meats + Eats', 'dinner', '½ lb', 720, 56, 2, 54, 1680, ['brisket']),
  item('smokemade-brisket-sandwich', 'Brisket Sandwich', 'Smokemade Meats + Eats', 'sandwiches', '1 sandwich', 780, 44, 62, 40, 1980, ['brisket']),

  item('cecils-rib-plate', 'Rib Plate with 2 sides', "Cecil's Texas Style Bar-B-Q", 'dinner', '1 plate', 1080, 58, 72, 62, 2380, ['ribs']),

  item('yellowdog-pulled-pork', 'Rufus Pulled Pork Sandwich', 'Yellow Dog Eats', 'sandwiches', '1 sandwich', 920, 44, 82, 44, 2180, ['pulled pork']),

  item('dubsdread-burger', 'Dubsdread Burger', 'The Tap Room at Dubsdread', 'lunch', '1 burger', 1080, 52, 58, 70, 1780, ['burger']),

  item('maxines-burger', 'Burger', "Maxine's on Shine", 'lunch', '1 burger', 920, 46, 48, 60, 1580, ['burger']),

  item('ravenouspig-pub-burger', 'Pub Burger', 'The Ravenous Pig', 'lunch', '1 burger', 1080, 54, 52, 72, 1680, ['burger']),

  item('hangrybison-bison-burger', 'Bison Burger', 'The Hangry Bison', 'lunch', '1 burger', 920, 48, 52, 56, 1580, ['burger', 'bison']),

  item('teak-burger', 'Teak Burger', 'Teak Neighborhood Grill', 'lunch', '1 burger', 980, 48, 56, 62, 1680, ['burger']),
  item('teak-wings', 'Wings (10)', 'Teak Neighborhood Grill', 'dinner', '10 wings', 900, 72, 4, 66, 2480, ['wings']),

  item('gnarlybarley-burger', 'Gnarly Burger', 'Gnarly Barley', 'lunch', '1 burger', 880, 44, 50, 54, 1580, ['burger']),

  item('nonablue-burger', 'Nona Blue Burger', 'Nona Blue Modern Tavern', 'lunch', '1 burger', 1020, 50, 56, 66, 1780, ['burger']),

  item('osprey-burger', 'Wagyu Burger', 'The Osprey Tavern', 'lunch', '1 burger', 1020, 52, 50, 68, 1580, ['burger']),

  item('hotdogheaven-chicago-dog', 'Chicago Dog', 'Hot Dog Heaven', 'lunch', '1 hot dog', 380, 14, 38, 19, 1280, ['hot dog']),

  // ——— Seafood & New Orleans ———
  item('hightide-shrimp-basket', 'Fried Shrimp Basket', "High Tide Harry's", 'dinner', '1 basket', 880, 34, 82, 44, 2080, ['shrimp']),
  item('hightide-oysters', 'Raw Oysters (dozen)', "High Tide Harry's", 'snacks', '12 oysters', 170, 20, 9, 6, 500, ['oysters']),

  item('fishbones-salmon', 'Grilled Salmon', 'FishBones', 'dinner', '1 entrée', 680, 52, 24, 40, 1080, ['salmon']),

  item('fishonfire-fish-tacos', 'Fish Tacos (2)', 'Fish On Fire', 'lunch', '2 tacos', 620, 30, 52, 32, 1280, ['fish tacos']),

  item('tibbys-shrimp-poboy', "Shrimp Po' Boy", "Tibby's New Orleans Kitchen", 'sandwiches', '1 sandwich', 880, 32, 82, 46, 2080, ['po boy', 'cajun']),
  item('tibbys-gumbo', 'Gumbo (cup)', "Tibby's New Orleans Kitchen", 'lunch', '1 cup', 420, 24, 30, 22, 1680, ['gumbo', 'cajun']),

  // ——— Mediterranean & tapas ———
  item('bosphorous-lavas-hummus', 'Lavas Bread with Hummus', 'Bosphorous Turkish Cuisine', 'snacks', '1 order', 680, 18, 96, 26, 1380, ['turkish', 'hummus']),
  item('bosphorous-adana', 'Adana Kebab Plate', 'Bosphorous Turkish Cuisine', 'dinner', '1 plate', 880, 48, 64, 48, 1880, ['turkish', 'kebab']),

  item('tututango-spring-rolls', 'Cuban Spring Rolls', 'Cafe Tu Tu Tango', 'snacks', '1 tapas plate', 480, 20, 40, 26, 1180, ['tapas']),

  // ——— Cafes, delis & vegan ———
  item('whitewolf-chicken-salad', 'Chicken Salad Croissant', 'White Wolf Cafe', 'lunch', '1 sandwich', 640, 26, 40, 42, 980, ['chicken salad']),
  item('whitewolf-grilled-cheese', 'Grilled Cheese & Tomato Soup', 'White Wolf Cafe', 'lunch', '1 combo', 780, 26, 64, 46, 1820, ['grilled cheese', 'soup']),

  item('craftcommon-latte', 'Latte (16 oz)', 'Craft & Common', 'breakfast', '16 fl oz', 190, 10, 18, 8, 150, ['coffee', 'latte']),
  item('craftcommon-avocado-toast', 'Avocado Toast', 'Craft & Common', 'breakfast', '1 toast', 420, 12, 40, 24, 620, ['avocado toast']),

  item('foxtail-honey-lavender', 'Honey Lavender Latte (16 oz)', 'Foxtail Coffee Co.', 'breakfast', '16 fl oz', 260, 10, 36, 8, 150, ['coffee', 'latte']),

  item('kellys-ice-cream', 'Ice Cream (1 scoop)', "Kelly's Homemade Ice Cream", 'snacks', '1 scoop', 300, 5, 32, 17, 110, ['ice cream']),

  item('maiko-matcha-soft-serve', 'Matcha Soft Serve (cup)', 'Matcha Cafe Maiko', 'snacks', '1 cup', 280, 6, 44, 9, 120, ['matcha', 'ice cream']),
  item('maiko-matcha-latte', 'Matcha Latte', 'Matcha Cafe Maiko', 'breakfast', '16 fl oz', 230, 9, 30, 8, 130, ['matcha']),

  item('jabal-adeni-chai', 'Adeni Chai', 'Jabal Coffee House', 'breakfast', '12 fl oz', 200, 6, 28, 7, 90, ['chai', 'yemeni']),
  item('jabal-honey-cake', 'Honey Cake (Bint al Sahn)', 'Jabal Coffee House', 'snacks', '1 slice', 480, 8, 52, 27, 320, ['yemeni', 'dessert']),

  item('pompoms-thanksgiving', 'Thanksgiving Sandwich', "Pom Pom's Teahouse & Sandwicheria", 'sandwiches', '1 sandwich', 760, 36, 82, 30, 1680, ['sandwich', 'turkey']),

  item('kappys-cheesesteak', 'Cheesesteak', "Kappy's Subs", 'sandwiches', '1 sub', 720, 40, 60, 34, 1780, ['cheesesteak', 'sub']),

  item('badass-sandwich', 'Signature Sandwich', "Bad As's Sandwich", 'sandwiches', '1 sandwich', 880, 42, 72, 46, 2280, ['sandwich']),

  item('pickles-reuben', 'Reuben', 'Pickles NY Deli', 'sandwiches', '1 sandwich', 980, 52, 56, 58, 3280, ['reuben', 'deli']),

  item('hinckleys-sandwich', 'Deli Sandwich', "Hinckley's Fancy Meats", 'sandwiches', '1 sandwich', 820, 42, 60, 44, 2080, ['sandwich']),

  item('skybird-juice', 'Cold-Pressed Juice (16 oz)', 'Skybird Juicery', 'snacks', '16 fl oz', 140, 3, 32, 0, 120, ['juice']),

  item('shakers-pancakes', 'Pancakes (3)', 'Shakers American Café', 'breakfast', '3 pancakes', 720, 16, 110, 24, 1480, ['pancakes']),
  item('shakers-benedict', 'Eggs Benedict', 'Shakers American Café', 'breakfast', '1 plate', 820, 32, 44, 56, 1880, ['eggs benedict']),

  item('hollerbachs-schnitzel', 'Schnitzel with sides', "Hollerbach's Willow Tree Café", 'dinner', '1 plate', 1080, 52, 72, 62, 1880, ['german', 'schnitzel']),

  item('sanctum-bowl', 'Signature Bowl', 'The Sanctum Cafe', 'lunch', '1 bowl', 620, 22, 82, 22, 980, ['vegan', 'bowl']),

  item('ethos-shepherds-pie', "Vegan Shepherd's Pie", 'Ethos Vegan Kitchen', 'dinner', '1 entrée', 680, 22, 82, 28, 1380, ['vegan']),

  item('dandelion-chili', 'Giddyup Chili', 'Dandelion Communitea Café', 'lunch', '1 bowl', 420, 18, 56, 14, 1080, ['vegan', 'chili']),
];
