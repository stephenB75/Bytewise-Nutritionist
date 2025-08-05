/**
 * Rotating Food Background Hook
 * Uses local assets for instant image switching with thematic page mapping
 */

import { useState, useEffect } from 'react';

// Complete food image collection - ALL 106 available images from assets
const foodImages = [
  // Food JPG images
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
  // App interface PNG images for variety
  new URL('@assets/image_1754188910321.png', import.meta.url).href,
  new URL('@assets/image_1754188922168.png', import.meta.url).href,
  new URL('@assets/image_1754188944072.png', import.meta.url).href,
  new URL('@assets/image_1754188960456.png', import.meta.url).href,
  new URL('@assets/image_1754188992812.png', import.meta.url).href,
  new URL('@assets/image_1754189057791.png', import.meta.url).href,
  new URL('@assets/image_1754189101718.png', import.meta.url).href,
  new URL('@assets/image_1754189125471.png', import.meta.url).href,
  // All available app screenshots for maximum variety (showing food/nutrition interfaces)
  new URL('@assets/Screenshot 2025-08-02 at 10.05.19 PM_1754186726337.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-02 at 10.07.25 PM_1754186849852.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-02 at 10.08.34 PM_1754186917724.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-02 at 10.11.38 PM_1754187101314.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-02 at 10.13.47 PM_1754187230232.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-02 at 10.36.40 PM_1754188613514.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-02 at 10.36.40 PM_1754189777328.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-02 at 10.52.47 PM_1754189572983.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-02 at 11.28.40 PM_1754191723679.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-02 at 11.38.54 PM_1754192337932.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 12.52.37 AM_1754196761246.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 2.03.45 AM_1754201028518.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 2.15.14 AM_1754201717027.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 2.15.31 AM_1754201733570.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 2.17.35 AM_1754201858130.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 2.18.00 AM_1754201882395.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 2.45.30 AM_1754203533371.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 2.46.38 AM_1754203602534.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 2.47.44 AM_1754203667113.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 2.49.02 PM_1754246975308.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 2.50.25 AM_1754203828298.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 2.56.45 AM_1754204207890.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 3.05.44 AM_1754204748319.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 3.11.39 PM_1754248302363.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 3.14.19 PM_1754248463898.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 3.23.27 PM_1754249009708.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 4.01.29 PM_1754251292783.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 4.05.03 PM_1754251505195.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 4.07.02 PM_1754251624901.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 4.07.14 PM_1754251636917.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 4.07.32 PM_1754251655101.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 4.20.16 PM_1754252419915.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 4.29.14 PM_1754252957174.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 4.52.29 AM_1754211153723.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 5.04.32 PM_1754255074901.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 5.19.01 AM_1754212743678.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 5.20.38 AM_1754212840394.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 5.41.04 AM_1754214066387.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 5.46.54 AM_1754214417237.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 5.52.57 AM_1754214780196.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 6.15.08 AM_1754216110766.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 7.22.01 PM_1754263323225.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-03 at 7.26.49 PM_1754263612191.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 10.26.03 PM_1754360766559.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 10.40.55 PM_1754361658434.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 10.56.16 PM_1754362579609.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 10.56.26 PM_1754362588923.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 10.56.37 PM_1754362599798.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 10.57.01 PM_1754362624246.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 11.05.55 PM_1754363158408.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 11.06.05 PM_1754363167842.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 11.06.18 PM_1754363180766.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 11.06.28 PM_1754363190574.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 11.21.45 PM_1754364107604.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 11.26.30 PM_1754364393830.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 11.30.17 PM_1754364619590.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 11.35.03 PM_1754364905899.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 7.14.12 PM_1754349255831.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 7.17.51 PM_1754349474646.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 7.21.00 PM_1754349663898.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 7.23.04 PM_1754349787270.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 7.24.54 PM_1754349897449.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 7.26.27 PM_1754349990094.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 8.25.31 PM_1754353534066.png', import.meta.url).href,
  new URL('@assets/Screenshot 2025-08-04 at 9.18.24 PM_1754356708097.png', import.meta.url).href,
];

// Enhanced page mappings with full image collection access
const pageImageMap: Record<string, number[]> = {
  'home': [0, 2, 10, 22, 33, 42, 50, 63, 75, 88, 95], // Mix of food and interface
  'nutrition': [3, 4, 5, 6, 11, 23, 35, 45, 60, 72, 89], // Food prep and tracking
  'daily': [3, 19, 26, 27, 38, 48, 58, 68, 78, 90, 100], // Meals and daily views
  'profile': [7, 9, 14, 34, 44, 54, 64, 74, 84, 94, 104], // Personal and desserts
  'tracking': [1, 12, 17, 36, 46, 56, 66, 76, 86, 96], // Progress and data
  'achievements': [0, 8, 13, 28, 37, 47, 57, 67, 77, 87, 97], // Success and fruits
  'signin': [18, 25, 39, 49, 59, 69, 79, 89, 99], // Welcome screens
  'calculator': [11, 20, 24, 40, 50, 60, 70, 80, 90, 101], // Tools and calculations
  'search': [2, 10, 22, 41, 51, 61, 71, 81, 91, 102], // Discovery and variety
  'data': [15, 21, 29, 42, 52, 62, 72, 82, 92, 103] // Analytics and exports
};

export function useRotatingBackground(activeTab: string) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(foodImages[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  
  // Change background when page/tab changes
  useEffect(() => {
    const pageImages = pageImageMap[activeTab] || [0, 1, 2];
    const randomPageImage = pageImages[Math.floor(Math.random() * pageImages.length)];
    
    if (randomPageImage !== currentImageIndex) {
      setIsTransitioning(true);
      
      requestAnimationFrame(() => {
        setCurrentImageIndex(randomPageImage);
        setBackgroundImage(foodImages[randomPageImage]);
        setAnimationKey(prev => prev + 1);
        setTimeout(() => setIsTransitioning(false), 50);
      });
    }
  }, [activeTab, currentImageIndex]);

  return {
    backgroundImage,
    currentImageIndex,
    totalImages: foodImages.length,
    isTransitioning,
    animationKey
  };
}