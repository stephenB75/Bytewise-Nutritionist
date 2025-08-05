/**
 * Rotating Food Background Hook
 * Uses local assets for instant image switching with thematic page mapping
 */

import { useState, useEffect } from 'react';

// Food images - expanded collection using local assets for optimal variety
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
// Additional food images for expanded variety
import chicken2Image from '@assets/chicken-762531_1920_1753859530086-BwBmOm1s.jpg';
import chickenNuggetsImage from '@assets/chicken-nuggets-1108_1920_1753859530084-DLWOOEId.jpg';
import food3Image from '@assets/food-3262796_1920_1753859530086-BeFn5V1r.jpg';
import macaronsImage from '@assets/macarons-2179198_1920_1753859477809-B5cbwbKS.jpg';
import mangoImage from '@assets/mango-1534061_1920_1753859530079-BEyrLl3D.jpg';
import newyearsImage from '@assets/new-years-eve-518032_1920_1753859794689-DPPW0W6m.jpg';
import plumsImage from '@assets/plums-1898196_1920_1753859477809-C44a7c3I.jpg';
import rawChickenImage from '@assets/raw-chicken-6946604_1920_1753859530081-BqlbPNnB.jpg';
import spaghetti2Image from '@assets/spaghetti-2931846_1920_1753859477804-BSrB8P7y.jpg';
import steak2Image from '@assets/steak-7423231_1920_1753859530082-DBBrmAYH.jpg';
import strawberryImage from '@assets/strawberry-7224875_1920_1753859477810-CXpGW8lN.jpg';
import swedishImage from '@assets/swedish-6053292_1920_1753859530083-CbbGYA9Y.jpg';
import tomatoesImage from '@assets/tomatoes-1238255_1920_1753859477803-BBxmQtT1.jpg';

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
  chicken2Image,     // Chicken variation
  chickenNuggetsImage, // Chicken nuggets
  food3Image,        // Mixed food
  macaronsImage,     // Macarons
  mangoImage,        // Mango
  newyearsImage,     // Party food
  plumsImage,        // Plums
  rawChickenImage,   // Raw chicken
  spaghetti2Image,   // Spaghetti variation
  steak2Image,       // Steak variation
  strawberryImage,   // Strawberry
  swedishImage,      // Swedish food
  tomatoesImage,     // Tomatoes
];

// Map specific pages to food categories for thematic consistency (expanded)
const pageImageMap: Record<string, number[]> = {
  'home': [0, 12, 7, 22, 24],        // Salad, variety, healthy bowl, mixed food, mango
  'nutrition': [4, 9, 11, 20, 21],   // Chicken variations, pasta, sandwich, nuggets
  'daily': [1, 3, 10, 29, 31],       // Burgers, pizza, steaks, swedish food
  'profile': [13, 16, 17, 23, 30],   // Desserts, chocolate, cupcakes, macarons, strawberry
  'tracking': [14, 15, 8, 25, 32],   // Oatmeal, seafood, food prep, party food, tomatoes
  'achievements': [18, 19, 6, 26, 24], // Apple, berries, fruits, plums, mango
  'signin': [2, 5, 12, 28, 22],      // Pancakes, vegetables, variety, spaghetti, mixed
  'calculator': [9, 11, 8, 20, 28],  // Pasta variations, sandwich, food prep, chicken
  'search': [0, 7, 12, 22, 32],      // Salad, healthy bowl, variety, mixed food, tomatoes
  'data': [5, 18, 19, 26, 30]        // Vegetables, apple, berries, plums, strawberry
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