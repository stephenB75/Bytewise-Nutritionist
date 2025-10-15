/**
 * Bytewise Logo Brand Component - Exact CSS Recreation
 * 
 * Perfect recreation of the bytewise logo using CSS
 * Matches the provided image with exact colors, spacing, and typography
 */

import React from 'react';

interface NewLogoBrandProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

export function NewLogoBrand({ 
  size = 'md', 
  clickable = false, 
  onClick, 
  className = '' 
}: NewLogoBrandProps) {
  const Component = clickable ? 'button' : 'div';
  
  // Size configurations for the new logo
  const sizeConfig = {
    xs: {
      mainSize: '1.125rem',    // 18px
      taglineSize: '0.5rem',   // 8px
      taglineSpacing: '0.05rem'
    },
    sm: {
      mainSize: '1.5rem',      // 24px
      taglineSize: '0.625rem', // 10px
      taglineSpacing: '0.0625rem'
    },
    md: {
      mainSize: '2.25rem',     // 36px
      taglineSize: '0.875rem', // 14px
      taglineSpacing: '0.125rem'
    },
    lg: {
      mainSize: '3rem',        // 48px
      taglineSize: '1.125rem', // 18px
      taglineSpacing: '0.1875rem'
    },
    xl: {
      mainSize: '4rem',        // 64px
      taglineSize: '1.5rem',   // 24px
      taglineSpacing: '0.25rem'
    }
  };

  const config = sizeConfig[size];
  
  const clickableClasses = clickable 
    ? 'hover:scale-102 transition-transform duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-lg'
    : '';
  
  return (
    <Component 
      className={`new-bytewise-logo ${clickableClasses} ${className}`}
      onClick={clickable ? onClick : undefined}
      aria-label={clickable ? "Go to Dashboard" : undefined}
      type={clickable ? "button" : undefined}
      style={{
        display: 'inline-block',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* Main "bytewise" text */}
      <div 
        className="new-bytewise-main"
        style={{
          fontFamily: "'League Spartan', 'Arial Black', sans-serif",
          fontSize: config.mainSize,
          fontWeight: '800',
          color: '#7dd3fc', // Light blue matching the image
          lineHeight: '1',
          letterSpacing: '-0.025em',
          margin: '0',
          padding: '0',
          textTransform: 'lowercase'
        }}
      >
        bytewise
      </div>
      
      {/* "Nutritionist" tagline */}
      <div 
        className="new-bytewise-tagline"
        style={{
          fontFamily: "'League Spartan', 'Arial', sans-serif",
          fontSize: config.taglineSize,
          fontWeight: '400',
          color: '#374151', // Dark gray matching the image
          lineHeight: '1',
          letterSpacing: '0.2em',
          margin: '0',
          padding: '0',
          marginTop: config.taglineSpacing,
          textTransform: 'uppercase',
          textAlign: 'center' as const
        }}
      >
        Nutritionist
      </div>
    </Component>
  );
}