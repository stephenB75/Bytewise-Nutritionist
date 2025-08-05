/**
 * Enhanced Rotating Food Background Hook
 * Uses high-quality food images with preloading for instant switching
 * Optimized timing for responsive page transitions
 */

import { useState, useEffect } from 'react';

// Food images - using high-quality Unsplash images for consistent loading
const foodImages = [
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', // Fresh salad
  'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80', // Burgers
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80', // Pancakes
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2081&q=80', // Pizza
  'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80', // Chicken
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2053&q=80', // Fresh vegetables
  'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2067&q=80', // Fruits
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80', // Healthy bowl
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2110&q=80', // Food prep
  'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80', // Pasta
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80', // Grilled steak
  'https://images.unsplash.com/photo-1539906942308-c8f5d84b5f4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80', // Sandwich
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', // Food variety
  'https://images.unsplash.com/photo-1587736756492-dfc9d2b8d473?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80', // Desserts
  'https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80', // Breakfast
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2078&q=80', // Seafood
  'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2087&q=80', // Chocolate
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2089&q=80', // Baked goods
  'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', // Fresh apple
  'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80', // Berries
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
  
  // Enhanced preloading for better performance
  useEffect(() => {
    const preloadImages = () => {
      // Preload first 10 images for immediate switching
      foodImages.forEach((src, index) => {
        if (index < 10) {
          const img = new Image();
          img.src = src;
          // Add image to cache when loaded
          img.onload = () => {
            console.log(`Preloaded image ${index + 1}/10`);
          };
        }
      });
    };
    
    // Use requestIdleCallback for non-blocking preloading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadImages);
    } else {
      setTimeout(preloadImages, 100);
    }
  }, []);

  // Change background only when page/tab changes
  useEffect(() => {
    // Get page-specific images or use sequential rotation
    const pageImages = pageImageMap[activeTab] || [0, 1, 2];
    const randomPageImage = pageImages[Math.floor(Math.random() * pageImages.length)];
    
    // Only change if it's different from current
    if (randomPageImage !== currentImageIndex) {
      setIsTransitioning(true);
      
      // Preload the new image for faster display
      const newImage = new Image();
      newImage.src = foodImages[randomPageImage];
      
      // Smooth transition with preloaded image
      newImage.onload = () => {
        // Use requestAnimationFrame for optimal timing
        requestAnimationFrame(() => {
          setCurrentImageIndex(randomPageImage);
          setBackgroundImage(foodImages[randomPageImage]);
          setTimeout(() => setIsTransitioning(false), 100); // Allow 100ms for transition
        });
      };
      
      // Fallback if image fails to load
      newImage.onerror = () => {
        requestAnimationFrame(() => {
          setCurrentImageIndex(randomPageImage);
          setBackgroundImage(foodImages[randomPageImage]);
          setTimeout(() => setIsTransitioning(false), 100);
        });
      };
    }
  }, [activeTab]); // Only triggers on tab change

  return {
    backgroundImage,
    currentImageIndex,
    totalImages: foodImages.length,
    isTransitioning
  };
}