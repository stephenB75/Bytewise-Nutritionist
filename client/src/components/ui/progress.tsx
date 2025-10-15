/**
 * Progress Component
 * Reusable progress component
 */

import React from 'react';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  className?: string;
}

export function Progress({ value = 0, max = 100, className = '', ...props }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div
      className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className}`}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
}
