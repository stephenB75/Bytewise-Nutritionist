/**
 * Image with Fallback Component
 * 
 * Handles image loading with fallback support for food images
 * Provides consistent image display across the app
 */

import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  width?: number;
  height?: number;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  className = '', 
  fallbackClassName = '',
  width,
  height 
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 ${fallbackClassName || className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <ImageOff className="w-8 h-8 text-gray-700 mx-auto mb-2" />
          <p className="text-xs text-gray-700">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 animate-pulse ${className}`}
          style={{ width, height }}
        >
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        width={width}
        height={height}
      />
    </div>
  );
}