/**
 * Rotating Background Hook
 * Manages rotating background images for the app
 */

import { useState, useEffect, useCallback } from 'react';

export function useRotatingBackground(activeTab: string, navigationTrigger: number, isTransitioning: boolean) {
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const backgroundImages = [
    '/assets/apple-3313209_1920_1753859530078-BJW4vFlt-BJW4vFlt.jpg',
    '/assets/bread-1836411_1280_1755903678472-DZ3_1WEe.jpg',
    '/assets/macarons-2179198_1920_1753859477809-B5cbwbKS-B5cbwbKS.jpg',
    '/assets/spaghetti-1392266_1920_1753859477805-HAisuHs3-HAisuHs3.jpg',
  ];

  const rotateBackground = useCallback(() => {
    setIsLoading(true);
    setImageLoaded(false);
    
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    const newImage = backgroundImages[randomIndex];
    
    setBackgroundImage(newImage);
    setAnimationKey(prev => prev + 1);
    
    // Simulate image loading
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageLoaded(true);
      setIsLoading(false);
    };
    img.src = newImage;
  }, [backgroundImages]);

  useEffect(() => {
    if (activeTab === 'redesigned' && !isTransitioning) {
      rotateBackground();
    }
  }, [activeTab, navigationTrigger, isTransitioning, rotateBackground]);

  return {
    backgroundImage,
    animationKey,
    isLoading,
    imageLoaded,
    rotateBackground,
  };
}
