/**
 * Rotating Food Background Hook
 * Cycles themed food photos for the active tab with preloading.
 */

import { useEffect, useMemo, useState } from 'react';

const ROTATION_MS = 8000;

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
  new URL('@assets/sushi-5885530_1280_1755903678470.jpg', import.meta.url).href,
  new URL('@assets/pizza-1317699_1280_1755903678471.jpg', import.meta.url).href,
  new URL('@assets/cherries-1845053_1280_1755903678472.jpg', import.meta.url).href,
  new URL('@assets/bread-1836411_1280_1755903678472.jpg', import.meta.url).href,
  new URL('@assets/popcorn-4885565_1280_1755903678473.jpg', import.meta.url).href,
  new URL('@assets/baked-goods-1846460_1280_1755903678474.jpg', import.meta.url).href,
  new URL('@assets/cinnamon-roll-4719023_1280_1755903678474.jpg', import.meta.url).href,
  new URL('@assets/blueberry-3357568_1280_1755903678475.jpg', import.meta.url).href,
  new URL('@assets/pomegranates-7859172_1280_1755903678476.jpg', import.meta.url).href,
  new URL('@assets/pretzels-3379552_1280_1755903678476.jpg', import.meta.url).href,
  new URL('@assets/noodles-2150181_1280_1755903678477.jpg', import.meta.url).href,
  new URL('@assets/fresh-pasta-5154248_1280_1755903678477.jpg', import.meta.url).href,
  new URL('@assets/cookies-8668140_1280_1755903678478.jpg', import.meta.url).href,
  new URL('@assets/chocolates-1737503_1280_1755903678479.jpg', import.meta.url).href,
  new URL('@assets/white-chocolate-380702_1280_1755903678479.jpg', import.meta.url).href,
  new URL('@assets/loaf-4957679_1280_1755903678480.jpg', import.meta.url).href,
  new URL('@assets/mango-2360551_1280_1755903678481.jpg', import.meta.url).href,
  new URL('@assets/mango-1534061_1280_1755903678481.jpg', import.meta.url).href,
  new URL('@assets/strawberries-823782_1280_1755903678482.jpg', import.meta.url).href,
  new URL('@assets/pistachios-3223610_1280_1755903678482.jpg', import.meta.url).href,
];

const pageImageMap: Record<string, number[]> = {
  home: [0, 2, 13, 15, 21, 22, 27, 29, 30, 31, 35, 38, 39, 40, 42, 43, 44, 46, 47, 48],
  nutrition: [3, 4, 5, 6, 10, 11, 12, 16, 17, 18, 22, 23, 24, 25, 26, 31, 35, 36, 37, 45],
  daily: [3, 4, 5, 6, 16, 17, 18, 19, 25, 26, 40, 41],
  profile: [7, 8, 9, 14, 23, 24, 25, 35, 36, 37, 42, 43, 44],
  tracking: [1, 13, 15, 17, 20, 21, 25, 27, 45, 48, 49],
  achievements: [0, 7, 8, 13, 14, 15, 20, 25, 27, 28, 29, 38, 39, 40, 42, 43, 44, 46, 47, 48],
  signin: [8, 15, 21, 22, 35, 36, 37, 45],
  calculator: [11, 14, 19, 40, 41, 49],
  search: [1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 20, 30, 31, 34, 39],
  fasting: [3, 4, 5, 16, 25, 26],
  data: [7, 13, 14, 15, 16, 17, 18, 20, 21, 25, 27, 28, 29, 38, 39, 40, 42, 49],
};

function getTabImages(activeTab: string): string[] {
  const ids = pageImageMap[activeTab] || pageImageMap.home;
  return ids.map((id) => foodImages[id]).filter(Boolean);
}

function preloadImage(src: string) {
  const img = new Image();
  img.src = src;
}

export function useRotatingBackground(activeTab: string) {
  const images = useMemo(() => getTabImages(activeTab), [activeTab]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    // Only fetch what's on screen; the next image is preloaded one rotation ahead below.
    if (images[0]) preloadImage(images[0]);
  }, [images]);

  useEffect(() => {
    if (images.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [images]);

  useEffect(() => {
    const next = images[(index + 1) % images.length];
    if (next) preloadImage(next);
  }, [index, images]);

  const backgroundImage = images[index] || foodImages[0];

  return { backgroundImage };
}
