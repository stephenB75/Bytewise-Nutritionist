/**
 * Enhanced Rotating Food Background Hook
 * Uses uploaded food images and changes only on page transitions with smooth animations
 */

import { useState, useEffect } from 'react';

// Uploaded food images from assets directory - using direct paths
const foodImages = [
  '/assets/salad-6948004_1920_1753859530085-1zwSa4Vt.jpg',         // Fresh salad
  '/assets/burgers-5590503_1920_1753859530083-I99DUxaH.jpg',       // Burgers
  '/assets/pancakes-2291908_1920_1753859477805-FMeaELmV.jpg',      // Pancakes
  '/assets/pizza-2068272_1920_1753859530080-DhVI5ZGb.jpg',         // Pizza
  '/assets/chicken-2443901_1920_1753859530084-CTPERNUZ.jpg',       // Chicken
  '/assets/vegetable-2924245_1920_1753859477807-CZELXr6Z.jpg',     // Fresh vegetables
  '/assets/strawberry-7224875_1920_1753859477810-CXpGW8lN.jpg',    // Fruits
  '/assets/bowl-1842294_1920_1753859477806-bRUsOvIC.jpg',          // Healthy bowl
  '/assets/food-993457_1920_1753859794688-oWnyu60z.jpg',           // Food prep
  '/assets/spaghetti-1392266_1920_1753859477805-HAisuHs3.jpg',     // Pasta
  '/assets/steak-6278031_1920_1753859530081-BukNuh5v.jpg',         // Grilled steak
  '/assets/sandwich-6935938_1920_1753859794687-CXrSzbzE.jpg',      // Sandwich
  '/assets/variety-5044809_1920_1753859530087-C7xAS9wM.jpg',       // Food variety
  '/assets/macarons-2179198_1920_1753859477809-B5cbwbKS.jpg',      // Desserts
  '/assets/oatmeal-1839515_1920_1753859530080-Cf--RV4v.jpg',       // Breakfast
  '/assets/fried-prawn-1737593_1920_1753859794686-DkxziorZ.jpg',   // Seafood
  '/assets/chocolate-1927921_1920_1753859477802-D-SPQY8I.jpg',     // Chocolate
  '/assets/cupcakes-813078_1920_1753859477803-D9uLIWdp.jpg',       // Baked goods
  '/assets/apple-3313209_1920_1753859530078-BJW4vFlt.jpg',         // Fresh apple
  '/assets/blueberries-9450130_1920_1753859477806-DQeN0M4j.jpg',   // Berries
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

  // Change background only when page/tab changes
  useEffect(() => {
    // Get page-specific images or use sequential rotation
    const pageImages = pageImageMap[activeTab] || [0, 1, 2];
    const randomPageImage = pageImages[Math.floor(Math.random() * pageImages.length)];
    
    // Only change if it's different from current
    if (randomPageImage !== currentImageIndex) {
      setIsTransitioning(true);
      
      // Smooth transition with animation
      setTimeout(() => {
        setCurrentImageIndex(randomPageImage);
        setBackgroundImage(foodImages[randomPageImage]);
        setIsTransitioning(false);
      }, 300); // 300ms fade transition
    }
  }, [activeTab]); // Only triggers on tab change

  return {
    backgroundImage,
    currentImageIndex,
    totalImages: foodImages.length,
    isTransitioning
  };
}