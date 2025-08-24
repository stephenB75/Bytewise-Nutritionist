import React, { useState } from 'react'

// Simple CSS gradient fallbacks - no external dependencies
const GRADIENT_PLACEHOLDERS = [
  'linear-gradient(135deg, #ff6b6b 0%, #fef7cd 100%)', // Red to yellow
  'linear-gradient(135deg, #4ecdc4 0%, #fef7cd 100%)', // Teal to yellow  
  'linear-gradient(135deg, #45b7d1 0%, #a8dadc 100%)', // Blue gradient
  'linear-gradient(135deg, #f9ca24 0%, #fef7cd 100%)', // Yellow gradient
  'linear-gradient(135deg, #a8dadc 0%, #fef7cd 100%)', // Default pastel
];

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { src, alt, className, style, ...rest } = props

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // Get a consistent gradient based on the source URL
  const getGradientPlaceholder = () => {
    if (!src) return GRADIENT_PLACEHOLDERS[0];
    
    // Simple hash to get consistent gradient
    let hash = 0;
    for (let i = 0; i < src.length; i++) {
      const char = src.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const index = Math.abs(hash) % GRADIENT_PLACEHOLDERS.length;
    return GRADIENT_PLACEHOLDERS[index];
  }

  // If error occurred or no src, show gradient placeholder
  if (hasError || !src) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{
          ...style,
          background: getGradientPlaceholder(),
        }}
        {...rest}
      >
        {/* Optional: Add a simple icon or text */}
        <div className="text-gray-900 font-medium text-sm drop-shadow-sm">
          {alt?.substring(0, 2)?.toUpperCase() || '🍽'}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading state */}
      {isLoading && (
        <div 
          className={`absolute inset-0 animate-pulse ${className}`}
          style={{
            ...style,
            background: getGradientPlaceholder(),
            opacity: 0.5
          }}
        />
      )}
      
      {/* Actual image */}
      <img 
        src={src}
        alt={alt}
        className={className}
        style={{
          ...style,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}
        onError={handleError}
        onLoad={handleLoad}
        {...rest}
      />
    </div>
  );
}