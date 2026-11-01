import type { FastFoodCategory, FastFoodItem } from './fastFoodMenu';

/**
 * Orlando Weekly 2026 readers' poll winners, Mills 50 / Mills Market counters and Pine Hills /
 * Kissimmee Caribbean and Haitian kitchens, and Flanigan's from South Florida.
 * None publish nutrition: values are Atwater-aligned estimates from USDA
 * analogs and typical portions, and every item carries the estimated keyword.
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

export const ORLANDO_FAVORITES_FAST_FOOD_ITEMS: FastFoodItem[] = [
  // ——— Caribbean & Haitian (Pine Hills, Kissimmee, south Orlando) ———
  item('340s-stew-chicken', 'Stew Chicken with rice & peas', '340s Caribbean Restaurant', 'dinner', '1 plate', 740, 44, 78, 28, 1380, ['virgin islands', 'caribbean']),
  item('340s-curry-goat', 'Curry Goat plate', '340s Caribbean Restaurant', 'dinner', '1 plate', 780, 46, 76, 32, 1280, ['curry', 'goat']),
  item('340s-saltfish-pate', 'Saltfish Pate', '340s Caribbean Restaurant', 'snacks', '1 pate', 320, 10, 34, 16, 620, ['pastry', 'virgin islands']),
  item('340s-johnny-cake', 'Johnny Cake', '340s Caribbean Restaurant', 'snacks', '1 piece', 230, 4, 32, 10, 320, ['fried bread']),

  item('belinda-oxtail', 'Oxtail with rice & peas', 'Belinda Take Out', 'dinner', '1 plate', 1010, 54, 78, 54, 1580, ['oxtail', 'jamaican']),
  item('belinda-brown-stew-chicken', 'Brown Stew Chicken plate', 'Belinda Take Out', 'dinner', '1 plate', 750, 44, 76, 30, 1480, ['jamaican']),
  item('belinda-escovitch-fish', 'Escovitch Fish plate', 'Belinda Take Out', 'dinner', '1 plate', 790, 50, 70, 34, 1380, ['fish', 'jamaican']),

  item('littlehaiti-pate-kode', 'Paté Kòde (beef)', 'Little Haiti Paté Kode', 'snacks', '1 pastry', 360, 10, 34, 20, 620, ['haitian', 'pate kode']),
  item('littlehaiti-griot', 'Griot with pikliz & bannann peze', 'Little Haiti Paté Kode', 'dinner', '1 plate', 840, 44, 62, 46, 1480, ['haitian', 'pork']),
  item('littlehaiti-diri-pwa', 'Diri ak Pwa with Legim', 'Little Haiti Paté Kode', 'lunch', '1 plate', 560, 16, 92, 14, 980, ['haitian', 'rice and beans']),

  item('maypen-jerk-chicken', 'Jerk Chicken plate', 'May Pen Cuisine', 'dinner', '1 plate', 770, 50, 70, 32, 1680, ['jerk', 'jamaican']),
  item('maypen-curry-goat', 'Curry Goat plate', 'May Pen Cuisine', 'dinner', '1 plate', 780, 46, 76, 32, 1280, ['curry', 'goat']),
  item('maypen-festival', 'Festival (2)', 'May Pen Cuisine', 'snacks', '2 pieces', 300, 4, 44, 12, 360, ['fried dumpling', 'jamaican']),

  item('smokehouse876-jerk-pork', 'Smoked Jerk Pork', 'Smokehouse876', 'dinner', '1/2 lb', 570, 46, 10, 38, 1680, ['jerk', 'pork', 'smoked']),
  item('smokehouse876-jerk-chicken', 'Jerk Chicken quarter with festival', 'Smokehouse876', 'dinner', '1 plate', 610, 40, 46, 30, 1480, ['jerk', 'chicken']),

  item('jmhappy-oxtail', 'Oxtail with rice & peas', 'Jamaican Me Happy', 'dinner', '1 plate', 1010, 54, 78, 54, 1580, ['oxtail', 'jamaican']),
  item('jmhappy-jerk-wings', 'Jerk Chicken Wings', 'Jamaican Me Happy', 'snacks', '8 wings', 720, 58, 6, 52, 1780, ['wings', 'jerk']),
  item('jmhappy-beef-patty', 'Jamaican Beef Patty', 'Jamaican Me Happy', 'snacks', '1 patty', 390, 11, 38, 22, 620, ['patty']),

  item('bonappetit-griot', 'Griot plate with rice & beans', 'Bon Appetit Grill', 'dinner', '1 plate', 940, 46, 90, 44, 1580, ['haitian', 'pork']),
  item('bonappetit-poul-fri', 'Poul Fri (fried chicken) plate', 'Bon Appetit Grill', 'dinner', '1 plate', 900, 48, 88, 40, 1480, ['haitian', 'chicken']),
  item('bonappetit-bouillon', 'Bouillon', 'Bon Appetit Grill', 'lunch', '1 bowl', 400, 26, 46, 12, 1180, ['haitian', 'soup']),
  item('bonappetit-akasan', 'Akasan', 'Bon Appetit Grill', 'breakfast', '12 fl oz', 330, 8, 56, 8, 160, ['haitian', 'cornmeal drink']),
  item('bonappetit-pate-kode', 'Paté Kòde', 'Bon Appetit Grill', 'snacks', '1 pastry', 360, 10, 34, 20, 620, ['haitian', 'pate kode']),

  item('antilles-tassot-cabrit', 'Tassot Cabrit with plantains', 'Antilles Cuisine', 'dinner', '1 plate', 810, 48, 60, 42, 1380, ['haitian', 'goat']),
  item('antilles-lalo-crab', 'Lalo with Crab and rice', 'Antilles Cuisine', 'dinner', '1 plate', 630, 34, 82, 18, 1180, ['haitian', 'crab']),
  item('antilles-legumes', 'Legumes with rice', 'Antilles Cuisine', 'lunch', '1 plate', 570, 18, 88, 16, 1080, ['haitian', 'vegetable stew']),
  item('antilles-soup-joumou', 'Soup Joumou', 'Antilles Cuisine', 'lunch', '1 bowl', 360, 22, 40, 12, 980, ['haitian', 'soup']),

  item('flavorsjamaica-jerk-chicken', 'Jerk Chicken plate', 'Flavors of Jamaica', 'dinner', '1 plate', 770, 50, 70, 32, 1680, ['jerk', 'kissimmee']),
  item('flavorsjamaica-ackee', 'Ackee & Saltfish with fried dumplings', 'Flavors of Jamaica', 'breakfast', '1 plate', 720, 28, 62, 40, 1580, ['ackee', 'jamaican']),
  item('flavorsjamaica-patty', 'Jamaican Beef Patty', 'Flavors of Jamaica', 'snacks', '1 patty', 390, 11, 38, 22, 620, ['patty']),

  item('annies-oxtail', 'Oxtail with rice & peas', "Annie's Island Breeze", 'dinner', '1 plate', 1010, 54, 78, 54, 1580, ['oxtail', 'kissimmee']),
  item('annies-curry-chicken', 'Curry Chicken plate', "Annie's Island Breeze", 'dinner', '1 plate', 720, 44, 78, 26, 1380, ['curry']),
  item('annies-sorrel', 'Sorrel', "Annie's Island Breeze", 'snacks', '16 fl oz', 160, 0, 40, 0, 20, ['juice', 'drink']),

  item('vithyme-kallaloo', 'Kallaloo', 'Virgin Island Thyme', 'lunch', '1 bowl', 310, 28, 14, 16, 1180, ['virgin islands', 'soup']),
  item('vithyme-fish-fungi', 'Fish & Fungi', 'Virgin Island Thyme', 'dinner', '1 plate', 550, 42, 56, 18, 1080, ['virgin islands', 'fish']),
  item('vithyme-conch', 'Conch in Butter Sauce with rice', 'Virgin Island Thyme', 'dinner', '1 plate', 680, 36, 70, 28, 1280, ['conch', 'seafood']),
  item('vithyme-saltfish-pate', 'Saltfish Pate', 'Virgin Island Thyme', 'snacks', '1 pate', 320, 10, 34, 16, 620, ['pastry']),

  item('cilantrillo-mofongo', 'Mofongo with Chicharrón', 'El Cilantrillo Restaurant', 'dinner', '1 plate', 950, 30, 82, 56, 1480, ['puerto rican', 'plantain']),
  item('cilantrillo-pernil', 'Pernil with arroz con gandules', 'El Cilantrillo Restaurant', 'dinner', '1 plate', 800, 44, 80, 34, 1480, ['puerto rican', 'pork']),
  item('cilantrillo-alcapurria', 'Alcapurria', 'El Cilantrillo Restaurant', 'snacks', '1 piece', 280, 8, 26, 16, 520, ['puerto rican', 'fritter']),
  item('cilantrillo-tripleta', 'Tripleta Sandwich', 'El Cilantrillo Restaurant', 'sandwiches', '1 sandwich', 820, 46, 64, 42, 2080, ['puerto rican']),

  item('pisco-lomo-saltado', 'Lomo Saltado', 'Pisco Peruvian Gastrobar', 'dinner', '1 plate', 830, 44, 88, 34, 1680, ['peruvian', 'beef']),
  item('pisco-ceviche', 'Ceviche Clásico', 'Pisco Peruvian Gastrobar', 'lunch', '1 order', 290, 34, 26, 6, 880, ['peruvian', 'seafood']),
  item('pisco-aji-de-gallina', 'Ají de Gallina', 'Pisco Peruvian Gastrobar', 'dinner', '1 plate', 710, 36, 70, 32, 1180, ['peruvian', 'chicken']),

  // ——— Asian (Mills 50, Colonial, Mills Market) ———
  item('toritori-karaage', 'Chicken Karaage', 'Tori Tori', 'snacks', '1 order', 500, 34, 24, 30, 980, ['japanese', 'izakaya', 'bar food']),
  item('toritori-yakitori', 'Yakitori Skewers (4)', 'Tori Tori', 'snacks', '4 skewers', 340, 36, 12, 16, 1080, ['japanese', 'izakaya']),
  item('toritori-ramen', 'Tonkotsu Ramen', 'Tori Tori', 'dinner', '1 bowl', 810, 34, 82, 38, 2680, ['ramen', 'japanese']),

  item('chengdu-mapo-tofu', 'Mapo Tofu with rice', 'Taste of Chengdu', 'dinner', '1 plate', 650, 24, 70, 30, 1880, ['sichuan', 'chinese']),
  item('chengdu-chongqing-chicken', 'Chongqing Spicy Chicken', 'Taste of Chengdu', 'dinner', '1 order', 680, 40, 30, 44, 1980, ['sichuan', 'chinese']),
  item('chengdu-dan-dan', 'Dan Dan Noodles', 'Taste of Chengdu', 'lunch', '1 bowl', 670, 22, 78, 30, 1780, ['sichuan', 'noodles']),

  item('lams-general-tso', "General Tso's Chicken with rice", "Lam's Garden", 'dinner', '1 plate', 980, 40, 120, 38, 2280, ['chinese']),
  item('lams-beef-broccoli', 'Beef with Broccoli', "Lam's Garden", 'dinner', '1 order', 470, 36, 28, 24, 1680, ['chinese']),
  item('lams-pork-fried-rice', 'Pork Fried Rice', "Lam's Garden", 'lunch', '1 order', 690, 24, 100, 22, 1580, ['chinese', 'fried rice']),

  item('redpanda-beef-noodle', 'Hand-Pulled Beef Noodle Soup', 'Red Panda Noodle', 'lunch', '1 bowl', 680, 38, 88, 20, 2280, ['noodles', 'food truck', 'chinese']),
  item('redpanda-cumin-lamb', 'Spicy Cumin Lamb Noodles', 'Red Panda Noodle', 'lunch', '1 bowl', 790, 34, 92, 32, 1980, ['noodles', 'lamb']),

  item('surah-kfc', 'Korean Fried Chicken (half)', 'Surah', 'dinner', '1/2 chicken', 820, 54, 42, 48, 1880, ['korean', 'fried chicken']),
  item('surah-tteokbokki', 'Tteokbokki', 'Surah', 'snacks', '1 order', 520, 10, 92, 12, 1580, ['korean', 'rice cakes']),

  item('bulgogihouse-bulgogi', 'Bulgogi plate', 'Bulgogi House', 'dinner', '1 plate', 660, 40, 70, 24, 1480, ['korean', 'bbq']),
  item('bulgogihouse-pajeon', 'Seafood Pancake (Haemul Pajeon)', 'Bulgogi House', 'snacks', '1/2 pancake', 600, 22, 64, 28, 1180, ['korean']),

  item('koreahouse-bibimbap', 'Bibimbap', 'Korea House Orlando', 'lunch', '1 bowl', 700, 28, 92, 24, 1280, ['korean', 'rice bowl']),
  item('koreahouse-soondubu', 'Soondubu Jjigae', 'Korea House Orlando', 'lunch', '1 bowl', 340, 26, 14, 20, 1980, ['korean', 'tofu stew']),

  item('lineage-short-rib-bowl', 'Short Rib Rice Bowl', 'Lineage', 'dinner', '1 bowl', 840, 44, 76, 40, 1680, ['korean american']),
  item('lineage-kimchi-fried-rice', 'Kimchi Fried Rice', 'Lineage', 'dinner', '1 order', 670, 22, 82, 28, 1580, ['korean', 'fried rice']),

  item('kaya-kare-kare', 'Kare Kare with garlic rice', 'Kaya', 'dinner', '1 plate', 910, 46, 64, 52, 1380, ['filipino', 'oxtail']),
  item('kaya-kinilaw', 'Kinilaw', 'Kaya', 'snacks', '1 order', 190, 24, 10, 6, 620, ['filipino', 'seafood']),

  item('banhmiboy-pork-belly', 'Crispy Pork Belly Bánh Mì', 'Bánh Mì Boy', 'sandwiches', '1 sandwich', 690, 28, 64, 36, 1480, ['vietnamese', 'banh mi', 'mills market']),
  item('banhmiboy-french-dip', 'French Dip Bánh Mì with pho broth', 'Bánh Mì Boy', 'sandwiches', '1 sandwich', 610, 38, 66, 22, 1980, ['vietnamese', 'banh mi']),

  item('unigirl-chicken-onigiri', 'Fried Chicken Onigiri', 'UniGirl', 'snacks', '1 onigiri', 310, 12, 42, 10, 620, ['japanese', 'onigiri', 'mills market']),
  item('unigirl-unagi-onigiri', 'Unagi Onigiri', 'UniGirl', 'snacks', '1 onigiri', 290, 10, 46, 7, 580, ['japanese', 'onigiri', 'eel']),

  item('kaikai-char-siu', 'Char Siu with rice', 'Kai Kai BBQ & Dumplings', 'lunch', '1 plate', 680, 36, 80, 24, 1480, ['cantonese', 'bbq pork']),
  item('kaikai-soup-dumplings', 'Pork Soup Dumplings (6)', 'Kai Kai BBQ & Dumplings', 'snacks', '6 pieces', 360, 18, 36, 16, 880, ['dumplings', 'dim sum']),
  item('kaikai-roast-duck', 'Roast Duck with rice', 'Kai Kai BBQ & Dumplings', 'lunch', '1 plate', 820, 38, 78, 40, 1580, ['cantonese', 'duck']),

  item('tamarind-tikka-masala', 'Chicken Tikka Masala with rice', 'Tamarind Indian Cuisine', 'dinner', '1 plate', 820, 42, 82, 36, 1680, ['indian', 'curry']),
  item('tamarind-lamb-biryani', 'Lamb Biryani', 'Tamarind Indian Cuisine', 'dinner', '1 plate', 810, 38, 96, 30, 1480, ['indian', 'rice']),
  item('tamarind-garlic-naan', 'Garlic Naan', 'Tamarind Indian Cuisine', 'snacks', '1 naan', 330, 9, 52, 10, 580, ['indian', 'bread']),
  item('tamarind-samosas', 'Vegetable Samosas (2)', 'Tamarind Indian Cuisine', 'snacks', '2 pieces', 360, 6, 40, 20, 520, ['indian']),

  // ——— Greek & Middle Eastern ———
  item('greekcorner-gyro', 'Gyro Pita', 'The Greek Corner', 'sandwiches', '1 pita', 670, 30, 56, 36, 1480, ['greek', 'gyro']),
  item('greekcorner-moussaka', 'Moussaka', 'The Greek Corner', 'dinner', '1 portion', 620, 30, 36, 40, 1180, ['greek']),
  item('greekcorner-spanakopita', 'Spanakopita', 'The Greek Corner', 'snacks', '1 piece', 410, 12, 32, 26, 780, ['greek', 'spinach pie']),

  item('mykonos-lamb-souvlaki', 'Lamb Souvlaki Plate', 'Mykonos Authentic Greek Cuisine', 'dinner', '1 plate', 770, 46, 60, 38, 1380, ['greek', 'lamb']),
  item('mykonos-pastitsio', 'Pastitsio', 'Mykonos Authentic Greek Cuisine', 'dinner', '1 portion', 660, 32, 52, 36, 1080, ['greek', 'pasta']),

  item('theos-chicken-souvlaki', 'Chicken Souvlaki Pita', "Theo's Kitchen", 'sandwiches', '1 pita', 560, 36, 54, 22, 1180, ['greek']),
  item('theos-greek-salad', 'Greek Salad', "Theo's Kitchen", 'lunch', '1 salad', 350, 10, 14, 28, 980, ['greek', 'salad']),

  item('meddeli-shawarma', 'Chicken Shawarma Wrap', 'Mediterranean Deli', 'sandwiches', '1 wrap', 640, 38, 58, 28, 1480, ['shawarma', 'middle eastern']),
  item('meddeli-falafel', 'Falafel Wrap', 'Mediterranean Deli', 'sandwiches', '1 wrap', 600, 16, 70, 28, 1180, ['falafel', 'vegetarian']),
  item('meddeli-hummus', 'Hummus with pita', 'Mediterranean Deli', 'snacks', '1 order', 520, 14, 62, 24, 880, ['hummus']),

  item('cedars-mixed-grill', 'Mixed Grill Kabob plate', "Cedar's Restaurant", 'dinner', '1 plate', 840, 62, 66, 36, 1580, ['lebanese', 'kabob']),
  item('cedars-kibbeh', 'Kibbeh (3)', "Cedar's Restaurant", 'snacks', '3 pieces', 420, 20, 30, 24, 680, ['lebanese']),
  item('cedars-fattoush', 'Fattoush', "Cedar's Restaurant", 'lunch', '1 salad', 290, 5, 26, 18, 620, ['lebanese', 'salad']),

  // ——— Italian, Mexican & seafood ———
  item('antica-margherita', 'Margherita Pizza (half)', 'Antica Pizzeria and Market', 'lunch', '1/2 pizza', 600, 24, 76, 22, 1180, ['pizza', 'italian']),
  item('antica-italian-sub', 'Italian Sub', 'Antica Pizzeria and Market', 'sandwiches', '1 sub', 800, 40, 66, 42, 2380, ['sub', 'italian']),

  item('donjulio-carne-asada', 'Carne Asada plate', 'Don Julio Mexican Kitchen & Tequila Bar', 'dinner', '1 plate', 860, 54, 70, 40, 1780, ['mexican', 'steak']),
  item('donjulio-enchiladas-suizas', 'Enchiladas Suizas', 'Don Julio Mexican Kitchen & Tequila Bar', 'dinner', '1 plate', 760, 38, 62, 40, 1680, ['mexican', 'enchiladas']),

  item('reelfish-blackened-mahi', 'Blackened Mahi with sides', 'Reel Fish Coastal Kitchen + Bar', 'dinner', '1 plate', 550, 48, 40, 22, 1280, ['fish', 'seafood', 'winter park']),
  item('reelfish-shrimp-grits', 'Shrimp & Grits', 'Reel Fish Coastal Kitchen + Bar', 'dinner', '1 plate', 710, 36, 56, 38, 1680, ['shrimp', 'seafood']),
  item('reelfish-fish-tacos', 'Fish Tacos (2)', 'Reel Fish Coastal Kitchen + Bar', 'lunch', '2 tacos', 490, 28, 44, 22, 980, ['fish tacos']),

  item('flanigans-ribs', 'Baby Back Ribs (full rack)', "Flanigan's Seafood Bar & Grill", 'dinner', '1 rack', 1110, 76, 40, 72, 2480, ['ribs', 'bbq', 'bar']),
  item('flanigans-burger', "Flanigan's Burger with fries", "Flanigan's Seafood Bar & Grill", 'sandwiches', '1 burger', 1030, 46, 86, 56, 1880, ['burger', 'bar']),
  item('flanigans-fish-sandwich', 'Fried Fish Sandwich', "Flanigan's Seafood Bar & Grill", 'sandwiches', '1 sandwich', 710, 32, 70, 34, 1480, ['fish', 'seafood']),

  // ——— Breakfast, Southern & BBQ ———
  item('briarpatch-pancakes', 'Pancakes (3)', 'Briarpatch Restaurant', 'breakfast', '3 pancakes', 690, 14, 108, 22, 1280, ['pancakes', 'winter park']),
  item('briarpatch-benedict', 'Eggs Benedict', 'Briarpatch Restaurant', 'breakfast', '1 plate', 760, 30, 42, 52, 1680, ['eggs benedict', 'brunch']),
  item('briarpatch-cobb', 'Cobb Salad', 'Briarpatch Restaurant', 'lunch', '1 salad', 620, 38, 18, 44, 1380, ['salad']),

  item('johnnysdiner-two-egg', 'Two-Egg Breakfast with bacon & home fries', "Johnny's Diner", 'breakfast', '1 plate', 660, 30, 46, 40, 1380, ['diner', 'eggs']),
  item('johnnysdiner-patty-melt', 'Patty Melt with fries', "Johnny's Diner", 'sandwiches', '1 sandwich', 1030, 42, 80, 60, 1880, ['diner', 'burger']),

  item('hamiltons-shrimp-grits', 'Shrimp & Grits', "Hamilton's Kitchen", 'dinner', '1 plate', 710, 36, 56, 38, 1680, ['southern', 'winter park']),
  item('hamiltons-chicken-waffles', 'Fried Chicken & Waffles', "Hamilton's Kitchen", 'breakfast', '1 plate', 1020, 46, 92, 52, 1980, ['southern', 'brunch']),

  item('willieboys-brisket', 'Brisket Plate with 2 sides', "Willieboy's BBQ", 'dinner', '1 plate', 930, 54, 62, 52, 1980, ['bbq', 'brisket', 'food truck']),
  item('willieboys-pulled-pork', 'Pulled Pork Sandwich', "Willieboy's BBQ", 'sandwiches', '1 sandwich', 580, 34, 56, 24, 1280, ['bbq', 'pork']),

  // ——— Bagels & French bakeries ———
  item('jeffs-plain-bagel', 'Plain Bagel', "Jeff's Bagel Run", 'breakfast', '1 bagel', 290, 11, 58, 2, 520, ['bagel']),
  item('jeffs-bec', 'Bacon, Egg & Cheese Bagel', "Jeff's Bagel Run", 'breakfast', '1 sandwich', 590, 28, 60, 26, 1380, ['bagel', 'breakfast sandwich']),
  item('jeffs-cream-cheese', 'Bagel with Cream Cheese', "Jeff's Bagel Run", 'breakfast', '1 bagel', 400, 13, 60, 12, 640, ['bagel']),

  item('jadore-croissant', 'Butter Croissant', "J'adore the French Bakery", 'breakfast', '1 croissant', 270, 5, 28, 15, 280, ['croissant', 'french']),
  item('jadore-almond-croissant', 'Almond Croissant', "J'adore the French Bakery", 'breakfast', '1 croissant', 450, 9, 44, 26, 300, ['croissant', 'french']),
  item('jadore-croque-monsieur', 'Croque Monsieur', "J'adore the French Bakery", 'sandwiches', '1 sandwich', 600, 30, 44, 34, 1480, ['french', 'ham and cheese']),

  item('croissantgourmet-croissant', 'Butter Croissant', 'Croissant Gourmet', 'breakfast', '1 croissant', 270, 5, 28, 15, 280, ['croissant', 'french']),
  item('croissantgourmet-pain-chocolat', 'Pain au Chocolat', 'Croissant Gourmet', 'breakfast', '1 pastry', 320, 6, 34, 18, 240, ['french', 'pastry']),
  item('croissantgourmet-quiche', 'Quiche Lorraine (slice)', 'Croissant Gourmet', 'lunch', '1 slice', 460, 16, 26, 32, 680, ['french', 'quiche']),
];
