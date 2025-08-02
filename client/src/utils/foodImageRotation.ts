/**
 * Food Image Rotation Utility
 * 
 * Manages cycling through the provided food images for backgrounds
 * Provides different images for different components and times
 */

// Import reliable food images with fallbacks
const appleImg = "/assets/apple-3313209_1920_1753859530078-BJW4vFlt.jpg";
const mangoImg = "/assets/mango-1534061_1920_1753859530079-BEyrLl3D.jpg";
const pizzaImg = "/assets/pizza-2068272_1920_1753859530080-DhVI5ZGb.jpg";
const saladImg = "/assets/salad-6948004_1920_1753859530085-1zwSa4Vt.jpg";
const burgersImg = "/assets/burgers-5590503_1920_1753859530083-I99DUxaH.jpg";
const blueberriesImg = "/assets/blueberries-9450130_1920_1753859477806-DQeN0M4j.jpg";

export const FOOD_IMAGES = {
  apple: appleImg,
  mango: mangoImg,
  pizza: pizzaImg,
  salad: saladImg,
  burgers: burgersImg,
  blueberries: blueberriesImg
};

// Food image arrays for different components
export const HERO_FOOD_IMAGES = [
  FOOD_IMAGES.apple,
  FOOD_IMAGES.salad,
  FOOD_IMAGES.pizza,
  FOOD_IMAGES.mango
];

export const BACKGROUND_FOOD_IMAGES = [
  FOOD_IMAGES.blueberries,
  FOOD_IMAGES.burgers,
  FOOD_IMAGES.apple,
  FOOD_IMAGES.salad
];

export const CALCULATOR_FOOD_IMAGES = [
  FOOD_IMAGES.pizza,
  FOOD_IMAGES.mango,
  FOOD_IMAGES.burgers
];

/**
 * Get a rotating food image based on component and time
 */
export function getRotatingFoodImage(component: 'hero' | 'background' | 'calculator' = 'hero'): string {
  const imageArrays = {
    hero: HERO_FOOD_IMAGES,
    background: BACKGROUND_FOOD_IMAGES,
    calculator: CALCULATOR_FOOD_IMAGES
  };
  
  const images = imageArrays[component];
  const timeBasedIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 6)) % images.length; // Changes every 6 hours
  
  return images[timeBasedIndex];
}

/**
 * Get all available food images
 */
export function getAllFoodImages(): string[] {
  return Object.values(FOOD_IMAGES);
}

/**
 * Get a random food image
 */
export function getRandomFoodImage(): string {
  const images = getAllFoodImages();
  return images[Math.floor(Math.random() * images.length)];
}

/**
 * Check if image rotation is enabled (always true for this implementation)
 */
export function isImageRotationEnabled(): boolean {
  return true;
}

/**
 * Reset image rotation state (no-op for this implementation)
 */
export function resetImageRotation(): void {
  // No state to reset in this simplified implementation
}

/**
 * Set image rotation preference (no-op for this implementation)
 */
export function setImageRotation(enabled: boolean): void {
  // No state to set in this simplified implementation
}

/**
 * Get a food image for a specific component
 */
export function getComponentFoodImage(componentName: string): string {
  // Simple hash function to get consistent image for component
  const hash = componentName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const images = getAllFoodImages();
  const index = Math.abs(hash) % images.length;
  return images[index];
}

/**
 * Get the total count of available food images
 */
export function getFoodImageCount(): number {
  return getAllFoodImages().length;
}

/**
 * Create a background style object for food images
 */
export function createFoodBackgroundStyle(imageUrl: string, opacity: number = 1): React.CSSProperties {
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: opacity
  };
}