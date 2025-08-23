/**
 * Rotating Food Background Hook
 * Uses local assets for instant image switching with thematic page mapping
 */

import { useState, useEffect } from 'react';

// Food-only image collection - using only actual food photographs
const foodImages = [
  new URL('@assets/apple-3313209_1920_1753859530078-BJW4vFlt.jpg', import.meta.url).href,
  new URL('@assets/blueberries-9450130_1920_1753859477806-DQeN0M4j.jpg', import.meta.url).href,
  new URL('@assets/bowl-1842294_1920_1753859477806-bRUsOvIC.jpg', import.meta.url).href,
  new URL('@assets/burgers-5590503_1920_1753859530083-I99DUxaH.jpg', import.meta.url).href,
  new URL('@assets/chicken-2443901_1920_1753859530084-CTPERNUZ.jpg', import.meta.url).href,
  new URL('@assets/chicken-762531_1920_1753859530086-BwBmOm1s.jpg', import.meta.url).href,
  new URL('@assets/chicken-nuggets-1108_1920_1753859530084-DLWOOEId.jpg', import.meta.url).href,
  new URL('@assets/chocolate-1927921_1920_1753859477802-D-SPQY8I.jpg', import.meta.url).href,
  new URL('@assets/churros-2188871_1920_1753859477808-BGqrIj5F.jpg', import.meta.url).href,
  new URL('@assets/cupcakes-813078_1920_1753859477803-D9uLIWdp.jpg', import.meta.url).href,
  new URL('@assets/food-3262796_1920_1753859530086-BeFn5V1r.jpg', import.meta.url).href,
  new URL('@assets/food-993457_1920_1753859794688-oWnyu60z.jpg', import.meta.url).href,
  new URL('@assets/fried-prawn-1737593_1920_1753859794686-DkxziorZ.jpg', import.meta.url).href,
  new URL('@assets/grapes-2032838_1920_1753859477808-CXmP7soY.jpg', import.meta.url).href,
  new URL('@assets/macarons-2179198_1920_1753859477809-B5cbwbKS.jpg', import.meta.url).href,
  new URL('@assets/mango-1534061_1920_1753859530079-BEyrLl3D.jpg', import.meta.url).href,
  new URL('@assets/new-years-eve-518032_1920_1753859794689-DPPW0W6m.jpg', import.meta.url).href,
  new URL('@assets/oatmeal-1839515_1920_1753859530080-Cf--RV4v.jpg', import.meta.url).href,
  new URL('@assets/pancakes-2291908_1920_1753859477805-FMeaELmV.jpg', import.meta.url).href,
  new URL('@assets/pizza-2068272_1920_1753859530080-DhVI5ZGb.jpg', import.meta.url).href,
  new URL('@assets/plums-1898196_1920_1753859477809-C44a7c3I.jpg', import.meta.url).href,
  new URL('@assets/raw-chicken-6946604_1920_1753859530081-BqlbPNnB.jpg', import.meta.url).href,
  new URL('@assets/salad-6948004_1920_1753859530085-1zwSa4Vt.jpg', import.meta.url).href,
  new URL('@assets/sandwich-6935938_1920_1753859794687-CXrSzbzE.jpg', import.meta.url).href,
  new URL('@assets/spaghetti-1392266_1920_1753859477805-HAisuHs3.jpg', import.meta.url).href,
  new URL('@assets/spaghetti-2931846_1920_1753859477804-BSrB8P7y.jpg', import.meta.url).href,
  new URL('@assets/steak-6278031_1920_1753859530081-BukNuh5v.jpg', import.meta.url).href,
  new URL('@assets/steak-7423231_1920_1753859530082-DBBrmAYH.jpg', import.meta.url).href,
  new URL('@assets/strawberry-7224875_1920_1753859477810-CXpGW8lN.jpg', import.meta.url).href,
  new URL('@assets/swedish-6053292_1920_1753859530083-CbbGYA9Y.jpg', import.meta.url).href,
  new URL('@assets/tomatoes-1238255_1920_1753859477803-BBxmQtT1.jpg', import.meta.url).href,
  new URL('@assets/variety-5044809_1920_1753859530087-C7xAS9wM.jpg', import.meta.url).href,
  new URL('@assets/vegetable-2924245_1920_1753859477807-CZELXr6Z.jpg', import.meta.url).href,
  // New delicious food photos added
  new URL('@assets/sushi-5885530_1280_1755903678470.jpg', import.meta.url).href, // 33
  new URL('@assets/pizza-1317699_1280_1755903678471.jpg', import.meta.url).href, // 34
  new URL('@assets/cherries-1845053_1280_1755903678472.jpg', import.meta.url).href, // 35
  new URL('@assets/bread-1836411_1280_1755903678472.jpg', import.meta.url).href, // 36
  new URL('@assets/popcorn-4885565_1280_1755903678473.jpg', import.meta.url).href, // 37
  new URL('@assets/baked-goods-1846460_1280_1755903678474.jpg', import.meta.url).href, // 38
  new URL('@assets/cinnamon-roll-4719023_1280_1755903678474.jpg', import.meta.url).href, // 39
  new URL('@assets/blueberry-3357568_1280_1755903678475.jpg', import.meta.url).href, // 40
  new URL('@assets/pomegranates-7859172_1280_1755903678476.jpg', import.meta.url).href, // 41
  new URL('@assets/pretzels-3379552_1280_1755903678476.jpg', import.meta.url).href, // 42
  new URL('@assets/noodles-2150181_1280_1755903678477.jpg', import.meta.url).href, // 43
  new URL('@assets/fresh-pasta-5154248_1280_1755903678477.jpg', import.meta.url).href, // 44
  new URL('@assets/cookies-8668140_1280_1755903678478.jpg', import.meta.url).href, // 45
  new URL('@assets/chocolates-1737503_1280_1755903678479.jpg', import.meta.url).href, // 46
  new URL('@assets/white-chocolate-380702_1280_1755903678479.jpg', import.meta.url).href, // 47
  new URL('@assets/loaf-4957679_1280_1755903678480.jpg', import.meta.url).href, // 48
  new URL('@assets/mango-2360551_1280_1755903678481.jpg', import.meta.url).href, // 49
  new URL('@assets/mango-1534061_1280_1755903678481.jpg', import.meta.url).href, // 50
  new URL('@assets/strawberries-823782_1280_1755903678482.jpg', import.meta.url).href, // 51
  new URL('@assets/pistachios-3223610_1280_1755903678482.jpg', import.meta.url).href, // 52
];

// Food-themed page mappings for thematic consistency - ALL 53 photos included
const pageImageMap: Record<string, number[]> = {
  'home': [0, 2, 10, 22, 31, 32, 35, 40, 41, 49, 50, 51], // Healthy foods and fresh produce
  'nutrition': [3, 4, 5, 6, 11, 21, 23, 26, 27, 33, 34, 36, 39, 48], // Proteins and main dishes
  'daily': [3, 19, 26, 27, 29, 34, 36, 37, 43, 44], // Daily meals and regular foods
  'profile': [7, 9, 14, 16, 24, 28, 38, 39, 42, 45, 46, 47], // Desserts, treats, and special foods
  'tracking': [1, 12, 17, 18, 21, 30, 36, 40, 48, 51, 52], // Breakfast and healthy tracking options
  'achievements': [0, 8, 13, 15, 16, 20, 25, 35, 40, 41, 49, 50, 51], // Colorful fruits and celebration foods
  'signin': [18, 25, 31, 32, 36, 38, 39, 48], // Welcoming foods
  'calculator': [11, 24, 29, 43, 44, 52], // Cooking ingredients and prep
  'search': [1, 2, 4, 6, 8, 9, 10, 22, 30, 31, 33, 37, 42], // Variety and discovery
  'data': [5, 13, 15, 16, 17, 19, 20, 30, 32, 35, 40, 41, 49, 50, 52] // Analytics and data visualization
};

export function useRotatingBackground(activeTab: string, navigationTrigger?: number) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(foodImages[0]);
  const [animationKey, setAnimationKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Preload image function
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = src;
    });
  };
  
  // Change background ONLY when user navigates via nav buttons
  useEffect(() => {
    // Skip if no navigation trigger (initial load or programmatic changes)
    if (!navigationTrigger) return;
    
    const pageImages = pageImageMap[activeTab] || [0, 1, 2];
    
    // Ensure we get a different image by filtering out current one
    let availableImages = pageImages;
    if (pageImages.length > 1) {
      availableImages = pageImages.filter(index => index !== currentImageIndex);
    }
    
    // If no different images available, use all page images
    if (availableImages.length === 0) {
      availableImages = pageImages;
    }
    
    const randomPageImage = availableImages[Math.floor(Math.random() * availableImages.length)];
    const newImageSrc = foodImages[randomPageImage];
    
    // Set loading state
    setIsLoading(true);
    setImageLoaded(false);
    
    // Preload the new image
    preloadImage(newImageSrc)
      .then(() => {
        // Immediate update for faster response
        setCurrentImageIndex(randomPageImage);
        setBackgroundImage(newImageSrc);
        setAnimationKey(prev => prev + 1);
        setIsLoading(false);
        // Quick fade-in trigger
        requestAnimationFrame(() => {
          setImageLoaded(true);
        });
      })
      .catch(() => {
        // If image fails to load, still update immediately
        setCurrentImageIndex(randomPageImage);
        setBackgroundImage(newImageSrc);
        setAnimationKey(prev => prev + 1);
        setIsLoading(false);
        setImageLoaded(false);
      });
  }, [navigationTrigger, activeTab]); // Only trigger on navigation events
  
  // Preload initial image on mount with smooth fade-in
  useEffect(() => {
    preloadImage(foodImages[0])
      .then(() => {
        setIsLoading(false);
        // Delay to allow for smooth initial fade-in
        setTimeout(() => {
          setImageLoaded(true);
        }, 300);
      })
      .catch(() => {
        setIsLoading(false);
        setImageLoaded(false);
      });
  }, []);

  return {
    backgroundImage,
    animationKey,
    isLoading,
    imageLoaded
  };
}