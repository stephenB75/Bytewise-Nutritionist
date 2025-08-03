/**
 * Food Image Clipping Component
 * Creates visually appealing clipped food images with modern design
 */

import React from 'react';

interface FoodImageClippingProps {
  src: string;
  alt: string;
  clipPath?: 'circle' | 'hexagon' | 'organic' | 'wave';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  overlay?: boolean;
}

const clipPaths = {
  circle: 'circle(50% at 50% 50%)',
  hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  organic: 'polygon(50% 0%, 80% 20%, 100% 60%, 80% 100%, 20% 100%, 0% 60%, 20% 20%)',
  wave: 'polygon(0% 20%, 60% 0%, 100% 20%, 100% 80%, 40% 100%, 0% 80%)'
};

const sizes = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48'
};

export function FoodImageClipping({ 
  src, 
  alt, 
  clipPath = 'organic', 
  size = 'md', 
  className = '', 
  overlay = true 
}: FoodImageClippingProps) {
  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      <div
        className="w-full h-full bg-cover bg-center transition-transform duration-300 hover:scale-105"
        style={{
          backgroundImage: `url(${src})`,
          clipPath: clipPaths[clipPath]
        }}
        role="img"
        aria-label={alt}
      >
        {overlay && (
          <div 
            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
            style={{ clipPath: clipPaths[clipPath] }}
          />
        )}
      </div>
    </div>
  );
}