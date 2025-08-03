/**
 * Bytewise Logo Brand Component
 * 
 * Pure CSS-based logo implementation following brand guidelines
 * Features character-based alignment system for precise positioning
 * of "Nutritionist" tagline under "bytewise" main text
 */

import React from 'react';

interface LogoBrandProps {
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

export function LogoBrand({ 
  size = 'md', 
  clickable = false, 
  onClick, 
  className = '' 
}: LogoBrandProps) {
  const Component = clickable ? 'button' : 'div';
  
  // Increased size classes
  const baseClasses = `bytewise-logo bytewise-logo-${size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'xl'}`;
  const clickableClasses = clickable 
    ? 'hover:scale-102 transition-transform duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg'
    : '';
  
  return (
    <Component 
      className={`${baseClasses} ${clickableClasses} ${className}`}
      onClick={clickable ? onClick : undefined}
      aria-label={clickable ? "Go to Dashboard" : undefined}
      type={clickable ? "button" : undefined}
    >
      <div className="bytewise-logo-main"></div>
      <div className="bytewise-logo-tagline"></div>
    </Component>
  );
}