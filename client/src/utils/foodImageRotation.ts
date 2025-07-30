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

// New food images batch 3
import friedPrawnImg from "@assets/fried-prawn-1737593_1920_1753859794686.jpg";
import sandwichImg from "@assets/sandwich-6935938_1920_1753859794687.jpg";
import fishImg from "@assets/food-993457_1920_1753859794688.jpg";
import salmonImg from "@assets/new-years-eve-518032_1920_1753859794689.jpg";

// Additional food images batch 4
import chickenImg from "@assets/chicken-762531_1920_1753859530086.jpg";
import foodVarietyImg from "@assets/food-3262796_1920_1753859530086.jpg";
import varietyImg from "@assets/variety-5044809_1920_1753859530087.jpg";
import plumsImg from "@assets/plums-1898196_1920_1753859477809.jpg";
import strawberryImg from "@assets/strawberry-7224875_1920_1753859477810.jpg";

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
  // Latest additions
  friedPrawn: friedPrawnImg,
  sandwich: sandwichImg,
  fish: fishImg,
  salmon: salmonImg,
  // Additional variety
  chicken: chickenImg,
  foodVariety: foodVarietyImg,
  variety: varietyImg,
  plums: plumsImg,
  strawberry: strawberryImg,
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
 * Generate a rotation key based on app session and current date
 */
function getRotationKey(): string {
  const date = new Date();
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const sessionId = sessionStorage.getItem('app-session-id') || String(Date.now());
  
  // Store session ID if not exists
  if (!sessionStorage.getItem('app-session-id')) {
    sessionStorage.setItem('app-session-id', sessionId);
  }
  
  return `${dayOfYear}-${sessionId}`;
}

/**
 * Get rotation index based on app sessions and time
 */
function getRotationIndex(component: string): number {
  const rotationKey = getRotationKey();
  const hash = Array.from(rotationKey + component).reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return Math.abs(hash) % FOOD_IMAGE_LIST.length;
}

/**
 * Get a rotating food image for a specific component that changes each app session
 */
export function getComponentFoodImage(component: keyof typeof COMPONENT_IMAGES): string {
  // Check if we should use rotation or fixed mapping
  const useRotation = localStorage.getItem('food-image-rotation') !== 'false';
  
  if (!useRotation) {
    return COMPONENT_IMAGES[component] || FOOD_IMAGES.blueberries;
  }
  
  // Use rotation system - different image each app open/close cycle
  const rotationIndex = getRotationIndex(component);
  return FOOD_IMAGE_LIST[rotationIndex];
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
    const lunchFoods = [FOOD_IMAGES.pizza, FOOD_IMAGES.burgers, FOOD_IMAGES.salad, FOOD_IMAGES.spaghetti, FOOD_IMAGES.sandwich, FOOD_IMAGES.salmon];
    return lunchFoods[Math.floor(Math.random() * lunchFoods.length)];
  } else if (hour >= 15 && hour < 19) {
    // Afternoon: snacks & fruits
    const snackFoods = [FOOD_IMAGES.mango, FOOD_IMAGES.grapes, FOOD_IMAGES.apple, FOOD_IMAGES.chickenNuggets, FOOD_IMAGES.friedPrawn];
    return snackFoods[Math.floor(Math.random() * snackFoods.length)];
  } else if (hour >= 19 && hour < 22) {
    // Dinner: main dishes
    const dinnerFoods = [FOOD_IMAGES.steak, FOOD_IMAGES.steak2, FOOD_IMAGES.chicken2, FOOD_IMAGES.swedish, FOOD_IMAGES.fish, FOOD_IMAGES.salmon];
    return dinnerFoods[Math.floor(Math.random() * dinnerFoods.length)];
  } else {
    // Late night: desserts
    const dessertFoods = [FOOD_IMAGES.chocolate, FOOD_IMAGES.cupcakes, FOOD_IMAGES.churros, FOOD_IMAGES.macarons];
    return dessertFoods[Math.floor(Math.random() * dessertFoods.length)];
  }
}

/**
 * Reset rotation to get new images (triggered on app close/open)
 */
export function resetImageRotation(): void {
  sessionStorage.removeItem('app-session-id');
  // Trigger new session ID generation on next getComponentFoodImage call
}

/**
 * Enable/disable image rotation feature
 */
export function setImageRotation(enabled: boolean): void {
  localStorage.setItem('food-image-rotation', enabled ? 'true' : 'false');
}

/**
 * Get current rotation status
 */
export function isImageRotationEnabled(): boolean {
  return localStorage.getItem('food-image-rotation') !== 'false';
}

/**
 * Get the total number of available food images
 */
export function getFoodImageCount(): number {
  return FOOD_IMAGE_LIST.length;
}

/**
 * Get a preview of the next rotation images for all components
 */
export function getNextRotationPreview(): Record<string, string> {
  const preview: Record<string, string> = {};
  
  // Temporarily create a new session to preview next images
  const originalSessionId = sessionStorage.getItem('app-session-id');
  sessionStorage.setItem('app-session-id', String(Date.now() + 1000));
  
  Object.keys(COMPONENT_IMAGES).forEach(component => {
    preview[component] = getComponentFoodImage(component as keyof typeof COMPONENT_IMAGES);
  });
  
  // Restore original session
  if (originalSessionId) {
    sessionStorage.setItem('app-session-id', originalSessionId);
  } else {
    sessionStorage.removeItem('app-session-id');
  }
  
  return preview;
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