/**
 * Enhanced Rotating Food Background Hook
 * Uses high-quality food images with preloading for instant switching
 * Optimized timing for responsive page transitions
 */

import { useState, useEffect } from 'react';

// Food images - using local assets for optimal performance and reliability
import saladImage from '@assets/salad-6948004_1920_1753859530085-1zwSa4Vt.jpg';
import burgersImage from '@assets/burgers-5590503_1920_1753859530083-I99DUxaH.jpg';
import pancakesImage from '@assets/pancakes-2291908_1920_1753859477805-FMeaELmV.jpg';
import pizzaImage from '@assets/pizza-2068272_1920_1753859530080-DhVI5ZGb.jpg';
import chickenImage from '@assets/chicken-2443901_1920_1753859530084-CTPERNUZ.jpg';
import vegetableImage from '@assets/vegetable-2924245_1920_1753859477807-CZELXr6Z.jpg';
import grapeImage from '@assets/grapes-2032838_1920_1753859477808-CXmP7soY.jpg';
import bowlImage from '@assets/bowl-1842294_1920_1753859477806-bRUsOvIC.jpg';
import foodPrepImage from '@assets/food-993457_1920_1753859794688-oWnyu60z.jpg';
import spaghettiImage from '@assets/spaghetti-1392266_1920_1753859477805-HAisuHs3.jpg';
import steakImage from '@assets/steak-6278031_1920_1753859530081-BukNuh5v.jpg';
import sandwichImage from '@assets/sandwich-6935938_1920_1753859794687-CXrSzbzE.jpg';
import varietyImage from '@assets/variety-5044809_1920_1753859530087-C7xAS9wM.jpg';
import cupcakesImage from '@assets/cupcakes-813078_1920_1753859477803-D9uLIWdp.jpg';
import oatmealImage from '@assets/oatmeal-1839515_1920_1753859530080-Cf--RV4v.jpg';
import prawnImage from '@assets/fried-prawn-1737593_1920_1753859794686-DkxziorZ.jpg';
import chocolateImage from '@assets/chocolate-1927921_1920_1753859477802-D-SPQY8I.jpg';
import churrosImage from '@assets/churros-2188871_1920_1753859477808-BGqrIj5F.jpg';
import appleImage from '@assets/apple-3313209_1920_1753859530078-BJW4vFlt.jpg';
import blueberriesImage from '@assets/blueberries-9450130_1920_1753859477806-DQeN0M4j.jpg';

const foodImages = [
  saladImage,        // Fresh salad
  burgersImage,      // Burgers
  pancakesImage,     // Pancakes
  pizzaImage,        // Pizza
  chickenImage,      // Chicken
  vegetableImage,    // Fresh vegetables
  grapeImage,        // Fruits
  bowlImage,         // Healthy bowl
  foodPrepImage,     // Food prep
  spaghettiImage,    // Pasta
  steakImage,        // Grilled steak
  sandwichImage,     // Sandwich
  varietyImage,      // Food variety
  cupcakesImage,     // Desserts
  oatmealImage,      // Breakfast
  prawnImage,        // Seafood
  chocolateImage,    // Chocolate
  churrosImage,      // Baked goods
  appleImage,        // Fresh apple
  blueberriesImage,  // Berries
];

// Map specific pages to food categories for thematic consistency
const pageImageMap: Record<string, number[]> = {
  'home': [0, 12, 7],        // Salad, variety, healthy bowl
  'nutrition': [4, 9, 11],   // Chicken, pasta, sandwich
  'daily': [1, 3, 10],       // Burgers, pizza, steak
  'profile': [13, 16, 17],   // Macarons, chocolate, cupcakes
  'tracking': [14, 15, 8],   // Oatmeal, seafood, food prep
  'achievements': [18, 19, 6], // Apple, berries, fruits
  'signin': [2, 5, 12],      // Pancakes, vegetables, variety
  'calculator': [9, 11, 8],  // Pasta, sandwich, food prep
  'search': [0, 7, 12],      // Salad, healthy bowl, variety
  'data': [5, 18, 19]        // Vegetables, apple, berries
};

export function useRotatingBackground(activeTab: string) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(foodImages[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  
  // Local assets are already bundled - no preloading needed
  useEffect(() => {
    console.log(`Loaded ${foodImages.length} local food images`);
  }, []);

  // Change background only when page/tab changes
  useEffect(() => {
    // Get page-specific images or use sequential rotation
    const pageImages = pageImageMap[activeTab] || [0, 1, 2];
    const randomPageImage = pageImages[Math.floor(Math.random() * pageImages.length)];
    
    // Only change if it's different from current
    if (randomPageImage !== currentImageIndex) {
      setIsTransitioning(true);
      
      // Immediate update with animation trigger
      requestAnimationFrame(() => {
        setCurrentImageIndex(randomPageImage);
        setBackgroundImage(foodImages[randomPageImage]);
        setAnimationKey(prev => prev + 1); // Trigger re-animation
        // Reduced transition time for faster response
        setTimeout(() => setIsTransitioning(false), 50);
      });
    }
  }, [activeTab, currentImageIndex]); // Only triggers on tab change

  return {
    backgroundImage,
    currentImageIndex,
    totalImages: foodImages.length,
    isTransitioning,
    animationKey
  };
}