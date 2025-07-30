/**
 * Enhanced Image Component with Fallback
 * 
 * Provides reliable image loading with graceful fallbacks
 * Optimized for hero sections and component backgrounds
 */

import React, { useState, useCallback } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackSrc,
  onLoad,
  onError
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
    onError?.();
  }, [hasError, fallbackSrc, onError]);

  const handleLoad = useCallback(() => {
    onLoad?.();
  }, [onLoad]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
}