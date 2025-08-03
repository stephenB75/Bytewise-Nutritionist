import { useState, useEffect, useCallback } from 'react';

interface FoodImage {
  url: string;
  alt: string;
  theme: 'light' | 'dark';
  attribution?: string;
}

// High-quality food images for the rotating background
const FOOD_IMAGES: FoodImage[] = [
  {
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmZjNjZDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmZlMTk5O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkaWVudDEpIiAvPgogIDwhLS0gQWJzdHJhY3QgZm9vZCBzaGFwZXMgLS0+CiAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTUwIiByPSI0MCIgZmlsbD0iI2ZmNGQ0ZiIgb3BhY2l0eT0iMC4zIiAvPgogIDxlbGxpcHNlIGN4PSI2MDAiIGN5PSIzMDAiIHJ4PSI2MCIgcnk9IjMwIiBmaWxsPSIjZmY5NTAwIiBvcGFjaXR5PSIwLjMiIC8+CiAgPHJlY3QgeD0iMzAwIiB5PSI0MDAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI1MCIgZmlsbD0iIzAwYmE3YyIgb3BhY2l0eT0iMC4zIiAvPgogIDx0ZXh0IHg9IjQwMCIgeT0iNTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM0YjU1NjMiIG9wYWNpdHk9IjAuNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RnJlc2ggRm9vZCBWaWJlczwvdGV4dD4KPC9zdmc+',
    alt: 'Fresh fruits and vegetables composition',
    theme: 'light'
  },
  {
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iZ3JhZGllbnQyIiBjeD0iNTAlIiBjeT0iNTAlIiByPSI1MCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmZlY2I5O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZmQ1ODA7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L3JhZGlhbEdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWRpZW50MikiIC8+CiAgPCEtLSBBYnN0cmFjdCBmb29kIGVsZW1lbnRzIC0tPgogIDxwYXRoIGQ9Ik0yMDAsMjAwIEM0MDAsMTUwIDQ1MCwyNTAgMzAwLDMwMCBDMTUwLDM1MCAyMDAsMjAwIDIwMCwyMDAiIGZpbGw9IiNmZjZhODgiIG9wYWNpdHk9IjAuNCIgLz4KICA8Y2lyY2xlIGN4PSI1NTAiIGN5PSIyMDAiIHI9IjUwIiBmaWxsPSIjNGVjZGM0IiBvcGFjaXR5PSIwLjQiIC8+CiAgPHBvbHlnb24gcG9pbnRzPSI0MDAsMzUwIDQ1MiwzODAgNDAwLDQxMCAzNDgsNDEwIDMyNiwzODAgMzc4LDM1MCIgZmlsbD0iI2ZmYjc0NiIgb3BhY2l0eT0iMC40IiAvPgogIDx0ZXh0IHg9IjQwMCIgeT0iNTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM0YjU1NjMiIG9wYWNpdHk9IjAuNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TnV0cml0aW9uIE1hZGUgU2ltcGxlPC90ZXh0Pgo8L3N2Zz4=',
    alt: 'Healthy meal planning workspace',
    theme: 'light'
  },
  {
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQzIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2Y5ZmJmZjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZWZmNmZmO3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkaWVudDMpIiAvPgogIDwhLS0gQWJzdHJhY3QgZm9vZCBzaGFwZXMgLS0+CiAgPGVsbGlwc2UgY3g9IjE1MCIgY3k9IjE4MCIgcng9IjMwIiByeT0iNTAiIGZpbGw9IiNmNzc2MmYiIG9wYWNpdHk9IjAuMyIgLz4KICA8cmVjdCB4PSI1MDAiIHk9IjI1MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiByeD0iMTAiIGZpbGw9IiNlYWZiZjQiIG9wYWNpdHk9IjAuMyIgLz4KICA8Y2lyY2xlIGN4PSI2NzAiIGN5PSI0MDAiIHI9IjM1IiBmaWxsPSIjZjEzOWExIiBvcGFjaXR5PSIwLjMiIC8+CiAgPHBhdGggZD0iTTI1MCw0MDAgQzM1MCwzNzAgNDAwLDQyMCAzNTAsNDcwIEMyMDAsNTAwIDI1MCw0MDAgMjUwLDQwMCIgZmlsbD0iIzUzOWJkZiIgb3BhY2l0eT0iMC4zIiAvPgogIDx0ZXh0IHg9IjQwMCIgeT0iNTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM0YjU1NjMiIG9wYWNpdHk9IjAuNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SGVhbHRoeSBMaXZpbmc8L3RleHQ+Cjwvc3ZnPg==',
    alt: 'Colorful healthy ingredients',
    theme: 'light'
  },
  {
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iZ3JhZGllbnQ0IiBjeD0iNTAlIiBjeT0iNTAlIiByPSI3MCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmVmMGZmO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmYWU4ZmY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L3JhZGlhbEdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWRpZW50NCkiIC8+CiAgPCEtLSBBYnN0cmFjdCBmb29kIGVsZW1lbnRzIC0tPgogIDxlbGxpcHNlIGN4PSIzMDAiIGN5PSIxNTAiIHJ4PSI0NSIgcnk9IjI1IiBmaWxsPSIjZmI5MjMzIiBvcGFjaXR5PSIwLjQiIC8+CiAgPHBvbHlnb24gcG9pbnRzPSI1NTAsMjAwIDYwMCwyMzAgNTc1LDI4MCA1MjUsMjgwIDUwMCwyMzAiIGZpbGw9IiMxNGI4YTYiIG9wYWNpdHk9IjAuNCIgLz4KICA8Y2lyY2xlIGN4PSIyMDAiIGN5PSIzNTAiIHI9IjQwIiBmaWxsPSIjZWY0NDQ0IiBvcGFjaXR5PSIwLjQiIC8+CiAgPHJlY3QgeD0iNDUwIiB5PSIzODAiIHdpZHRoPSI3MCIgaGVpZ2h0PSI0MCIgcng9IjEwIiBmaWxsPSIjODE4Y2Y4IiBvcGFjaXR5PSIwLjQiIC8+CiAgPHRleHQgeD0iNDAwIiB5PSI1MDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzRiNTU2MyIgb3BhY2l0eT0iMC41IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Td2FydCBFYXRpbmc8L3RleHQ+Cjwvc3ZnPg==',
    alt: 'Gourmet cuisine preparation',
    theme: 'light'
  },
  {
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQ1IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmZjdlZDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmVmM2M3O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkaWVudDUpIiAvPgogIDwhLS0gQWJzdHJhY3QgZm9vZCBzaGFwZXMgLS0+CiAgPGNpcmNsZSBjeD0iMTgwIiBjeT0iMjIwIiByPSIzNSIgZmlsbD0iI2Y1OTdkMiIgb3BhY2l0eT0iMC4zNSIgLz4KICA8ZWxsaXBzZSBjeD0iNjIwIiBjeT0iMTgwIiByeD0iNTUiIHJ5PSIzMCIgZmlsbD0iIzM0ZDA0MSIgb3BhY2l0eT0iMC4zNSIgLz4KICA8cG9seWdvbiBwb2ludHM9IjM1MCwyODAgNDAwLDMxMCAzNzUsMzYwIDMyNSwzNjAgMzAwLDMxMCIgZmlsbD0iI2ZiOGMwNCIgb3BhY2l0eT0iMC4zNSIgLz4KICA8cmVjdCB4PSI0ODAiIHk9IjM3MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjUwIiByeD0iMTUiIGZpbGw9IiM2MzY2ZjEiIG9wYWNpdHk9IjAuMzUiIC8+CiAgPHRleHQgeD0iNDAwIiB5PSI1MDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzRiNTU2MyIgb3BhY2l0eT0iMC41IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CYWxhbmNlZCBOdXRyaXRpb248L3RleHQ+Cjwvc3ZnPg==',
    alt: 'Farm to table organic foods',
    theme: 'light'
  }
];

export function useRotatingBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Rotate background every 5 seconds
  useEffect(() => {
    console.log('🖼️ Setting up rotating background interval');
    const interval = setInterval(() => {
      console.log('🔄 Auto-rotating background image');
      setIsLoading(true);
      
      // Small delay to create smooth transition effect
      setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % FOOD_IMAGES.length;
          console.log(`📸 Background changed to image ${newIndex + 1}/${FOOD_IMAGES.length}`);
          return newIndex;
        });
        setIsLoading(false);
      }, 300);
    }, 5000);

    return () => {
      console.log('🧹 Cleaning up background rotation interval');
      clearInterval(interval);
    };
  }, []);

  // Change image when user signs in or page changes
  const rotateImage = useCallback(() => {
    console.log('⚡ Manual background rotation triggered');
    setIsLoading(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % FOOD_IMAGES.length;
        console.log(`📸 Background manually changed to image ${newIndex + 1}/${FOOD_IMAGES.length}`);
        return newIndex;
      });
      setIsLoading(false);
    }, 300);
  }, []);

  const currentImage = FOOD_IMAGES[currentIndex];
  
  // Debug logging
  useEffect(() => {
    console.log(`🎨 Current background: ${currentImage.alt} (${currentIndex + 1}/${FOOD_IMAGES.length})`);
  }, [currentIndex, currentImage.alt]);

  return {
    currentImage: currentImage.url,
    currentTheme: currentImage.theme,
    currentAlt: currentImage.alt,
    isLoading,
    rotateImage,
    totalImages: FOOD_IMAGES.length,
    currentIndex
  };
}