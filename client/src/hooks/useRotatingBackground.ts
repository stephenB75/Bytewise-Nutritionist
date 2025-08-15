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
];

// Food-themed page mappings for thematic consistency
const pageImageMap: Record<string, number[]> = {
  'home': [0, 2, 10, 22, 31], // Healthy foods (apple, bowl, food, salad, variety)
  'nutrition': [3, 4, 5, 6, 11, 23], // Proteins and main dishes
  'daily': [3, 19, 26, 27], // Meals (burgers, pizza, steaks)
  'profile': [7, 9, 14, 28], // Desserts and treats
  'tracking': [1, 12, 17, 21], // Breakfast and healthy options
  'achievements': [0, 8, 13, 15, 16, 20], // Fruits and colorful foods (added mango)
  'signin': [18, 25, 31, 32], // Welcoming foods (pancakes, pasta, variety)
  'calculator': [11, 24, 29], // Cooking ingredients and prep
  'search': [2, 10, 22, 31], // Variety and discovery
  'data': [13, 15, 16, 20, 30, 32] // Fresh produce and analytics (added mango)
};

export function useRotatingBackground(activeTab: string) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(foodImages[0]);
  const [animationKey, setAnimationKey] = useState(0);
  
  // Change background when page/tab changes
  useEffect(() => {
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
    
    setCurrentImageIndex(randomPageImage);
    setBackgroundImage(foodImages[randomPageImage]);
    setAnimationKey(prev => prev + 1);
  }, [activeTab]); // Remove currentImageIndex dependency to avoid infinite loops

  return {
    backgroundImage,
    animationKey
  };
}