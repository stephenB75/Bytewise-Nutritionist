/**
 * Food Image Rotation Utility
 * 
 * Manages cycling through the provided food images for backgrounds
 * Provides different images for different components and times
 */

import chocolateImg from "@assets/chocolate-1927921_1920_1753859477802.jpg";
import cupcakesImg from "@assets/cupcakes-813078_1920_1753859477803.jpg";
import tomatoesImg from "@assets/tomatoes-1238255_1920_1753859477803.jpg";
import spaghettiImg from "@assets/spaghetti-2931846_1920_1753859477804.jpg";
import spaghetti2Img from "@assets/spaghetti-1392266_1920_1753859477805.jpg";
import pancakesImg from "@assets/pancakes-2291908_1920_1753859477805.jpg";
import friesImg from "@assets/bowl-1842294_1920_1753859477806.jpg";
import blueberriesImg from "@assets/blueberries-9450130_1920_1753859477806.jpg";
import vegetableImg from "@assets/vegetable-2924245_1920_1753859477807.jpg";
import grapesImg from "@assets/grapes-2032838_1920_1753859477808.jpg";
import churrosImg from "@assets/churros-2188871_1920_1753859477808.jpg";
import macaronsImg from "@assets/macarons-2179198_1920_1753859477809.jpg";

// New food images batch 2
import appleImg from "@assets/apple-3313209_1920_1753859530078.jpg";
import mangoImg from "@assets/mango-1534061_1920_1753859530079.jpg";
import oatmealImg from "@assets/oatmeal-1839515_1920_1753859530080.jpg";
import pizzaImg from "@assets/pizza-2068272_1920_1753859530080.jpg";
import rawChickenImg from "@assets/raw-chicken-6946604_1920_1753859530081.jpg";
import steakImg from "@assets/steak-6278031_1920_1753859530081.jpg";
import steak2Img from "@assets/steak-7423231_1920_1753859530082.jpg";
import swedishImg from "@assets/swedish-6053292_1920_1753859530083.jpg";
import burgersImg from "@assets/burgers-5590503_1920_1753859530083.jpg";
import chicken2Img from "@assets/chicken-2443901_1920_1753859530084.jpg";
import chickenNuggetsImg from "@assets/chicken-nuggets-1108_1920_1753859530084.jpg";
import saladImg from "@assets/salad-6948004_1920_1753859530085.jpg";

export const FOOD_IMAGES = {
  chocolate: chocolateImg,
  cupcakes: cupcakesImg,
  tomatoes: tomatoesImg,
  spaghetti: spaghettiImg,
  spaghetti2: spaghetti2Img,
  pancakes: pancakesImg,
  fries: friesImg,
  blueberries: blueberriesImg,
  vegetable: vegetableImg,
  grapes: grapesImg,
  churros: churrosImg,
  macarons: macaronsImg,
  // New additions
  apple: appleImg,
  mango: mangoImg,
  oatmeal: oatmealImg,
  pizza: pizzaImg,
  rawChicken: rawChickenImg,
  steak: steakImg,
  steak2: steak2Img,
  swedish: swedishImg,
  burgers: burgersImg,
  chicken2: chicken2Img,
  chickenNuggets: chickenNuggetsImg,
  salad: saladImg,
};

export const FOOD_IMAGE_LIST = Object.values(FOOD_IMAGES);

// Component-specific image mappings
export const COMPONENT_IMAGES = {
  calculator: FOOD_IMAGES.blueberries,
  logger: FOOD_IMAGES.pancakes,
  dashboard: FOOD_IMAGES.salad,
  profile: FOOD_IMAGES.apple,
  login: FOOD_IMAGES.pizza,
  meals: FOOD_IMAGES.burgers,
  recipes: FOOD_IMAGES.chocolate,
  planning: FOOD_IMAGES.oatmeal,
};

/**
 * Get a food image for a specific component
 */
export function getComponentFoodImage(component: keyof typeof COMPONENT_IMAGES): string {
  return COMPONENT_IMAGES[component] || FOOD_IMAGES.blueberries;
}

/**
 * Get a random food image
 */
export function getRandomFoodImage(): string {
  return FOOD_IMAGE_LIST[Math.floor(Math.random() * FOOD_IMAGE_LIST.length)];
}

/**
 * Get food image based on time of day
 */
export function getTimeBasedFoodImage(): string {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 10) {
    // Morning: breakfast foods
    const morningFoods = [FOOD_IMAGES.pancakes, FOOD_IMAGES.oatmeal, FOOD_IMAGES.blueberries, FOOD_IMAGES.apple];
    return morningFoods[Math.floor(Math.random() * morningFoods.length)];
  } else if (hour >= 10 && hour < 15) {
    // Lunch: savory foods
    const lunchFoods = [FOOD_IMAGES.pizza, FOOD_IMAGES.burgers, FOOD_IMAGES.salad, FOOD_IMAGES.spaghetti];
    return lunchFoods[Math.floor(Math.random() * lunchFoods.length)];
  } else if (hour >= 15 && hour < 19) {
    // Afternoon: snacks & fruits
    const snackFoods = [FOOD_IMAGES.mango, FOOD_IMAGES.grapes, FOOD_IMAGES.apple, FOOD_IMAGES.chickenNuggets];
    return snackFoods[Math.floor(Math.random() * snackFoods.length)];
  } else if (hour >= 19 && hour < 22) {
    // Dinner: main dishes
    const dinnerFoods = [FOOD_IMAGES.steak, FOOD_IMAGES.steak2, FOOD_IMAGES.chicken2, FOOD_IMAGES.swedish];
    return dinnerFoods[Math.floor(Math.random() * dinnerFoods.length)];
  } else {
    // Late night: desserts
    const dessertFoods = [FOOD_IMAGES.chocolate, FOOD_IMAGES.cupcakes, FOOD_IMAGES.churros, FOOD_IMAGES.macarons];
    return dessertFoods[Math.floor(Math.random() * dessertFoods.length)];
  }
}

/**
 * Create background style with food image
 */
export function createFoodBackgroundStyle(
  imageSrc: string, 
  opacity: number = 0.85
): React.CSSProperties {
  return {
    backgroundImage: `linear-gradient(rgba(248, 250, 252, ${opacity}), rgba(248, 250, 252, ${opacity})), url("${imageSrc}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };
}