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
};

export const FOOD_IMAGE_LIST = Object.values(FOOD_IMAGES);

// Component-specific image mappings
export const COMPONENT_IMAGES = {
  calculator: FOOD_IMAGES.blueberries,
  logger: FOOD_IMAGES.pancakes,
  dashboard: FOOD_IMAGES.vegetable,
  profile: FOOD_IMAGES.grapes,
  login: FOOD_IMAGES.spaghetti,
  meals: FOOD_IMAGES.tomatoes,
  recipes: FOOD_IMAGES.chocolate,
  planning: FOOD_IMAGES.macarons,
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
    return Math.random() > 0.5 ? FOOD_IMAGES.pancakes : FOOD_IMAGES.blueberries;
  } else if (hour >= 10 && hour < 15) {
    // Lunch: savory foods
    return Math.random() > 0.5 ? FOOD_IMAGES.spaghetti : FOOD_IMAGES.tomatoes;
  } else if (hour >= 15 && hour < 19) {
    // Afternoon: snacks
    return Math.random() > 0.5 ? FOOD_IMAGES.fries : FOOD_IMAGES.grapes;
  } else if (hour >= 19 && hour < 22) {
    // Dinner: main dishes
    return Math.random() > 0.5 ? FOOD_IMAGES.spaghetti2 : FOOD_IMAGES.vegetable;
  } else {
    // Late night: desserts
    return Math.random() > 0.5 ? FOOD_IMAGES.chocolate : FOOD_IMAGES.cupcakes;
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