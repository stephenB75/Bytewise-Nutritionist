/**
 * Hook for rotating background images
 * Similar to hero components but for authentication screens
 */

import { useState, useEffect } from 'react';

// Use static paths for reliable image loading
const appleImage = '/assets/apple-3313209_1920_1753859530078-BJW4vFlt.jpg';
const blueberriesImage = '/assets/blueberries-9450130_1920_1753859477806-DQeN0M4j.jpg';
const bowlImage = '/assets/bowl-1842294_1920_1753859477806-bRUsOvIC.jpg';
const burgersImage = '/assets/burgers-5590503_1920_1753859530083-I99DUxaH.jpg';
const dishImage = '/assets/food-3262796_1920_1753859530086-BeFn5V1r.jpg';

const BACKGROUND_IMAGES = [
  {
    src: appleImage,
    alt: 'Fresh red apple',
    theme: 'fresh-fruits'
  },
  {
    src: blueberriesImage,
    alt: 'Fresh blueberries',
    theme: 'berries'
  },
  {
    src: bowlImage,
    alt: 'Healthy bowl',
    theme: 'healthy-meals'
  },
  {
    src: burgersImage,
    alt: 'Gourmet burgers',
    theme: 'comfort-food'
  },
  {
    src: dishImage,
    alt: 'Delicious dish',
    theme: 'fine-dining'
  }
];

export function useRotatingBackground() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get stored index or generate new one
    const getNextImageIndex = () => {
      const stored = localStorage.getItem('bytewise_bg_index');
      const lastIndex = stored ? parseInt(stored, 10) : -1;
      const nextIndex = (lastIndex + 1) % BACKGROUND_IMAGES.length;
      
      // Store the new index
      localStorage.setItem('bytewise_bg_index', nextIndex.toString());
      
      return nextIndex;
    };

    const imageIndex = getNextImageIndex();
    setCurrentImageIndex(imageIndex);

    // Preload the current image
    const img = new Image();
    img.onload = () => setIsLoading(false);
    img.src = BACKGROUND_IMAGES[imageIndex].src;
  }, []);

  const currentImage = BACKGROUND_IMAGES[currentImageIndex];
  
  return {
    currentImage: currentImage.src,
    currentTheme: currentImage.theme,
    currentAlt: currentImage.alt,
    isLoading,
    totalImages: BACKGROUND_IMAGES.length
  };
}

// Utility function to get random image for other components
export function getRandomFoodImage() {
  const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
  return BACKGROUND_IMAGES[randomIndex];
}