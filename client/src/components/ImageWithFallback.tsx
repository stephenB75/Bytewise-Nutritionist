import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export function ImageWithFallback({ src, alt, className = '', fallbackSrc }: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    } else {
      // Use a gradient background as final fallback
      setHasError(true);
    }
  };

  if (hasError && !fallbackSrc) {
    return (
      <div 
        className={`bg-gradient-to-br from-primary/20 via-muted/30 to-accent/20 ${className}`}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}