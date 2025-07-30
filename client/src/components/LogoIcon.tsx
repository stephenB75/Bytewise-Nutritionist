/**
 * CSS Logo Icon Component
 * 
 * Pure CSS implementation of the Bytewise logo as an icon
 * Features geometric shapes and brand colors for a modern, scalable design
 */

import React from 'react';

interface LogoIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export function LogoIcon({ size = 'md', className = '', onClick }: LogoIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative inline-block`}>
      {/* Logo Icon Container */}
      <div className="w-full h-full relative">
        {/* Background Circle */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #a8dadc 0%, #457b9d 50%, #1d3557 100%)',
          }}
        />
        
        {/* Inner Design Elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Central "B" Shape */}
          <div className="relative">
            {/* Letter B structure using CSS */}
            <div 
              className="relative"
              style={{
                width: '14px',
                height: '20px',
              }}
            >
              {/* Left vertical bar */}
              <div 
                className="absolute left-0 top-0 bg-white rounded-sm"
                style={{
                  width: '3px',
                  height: '20px',
                }}
              />
              
              {/* Top horizontal bar */}
              <div 
                className="absolute left-0 top-0 bg-white rounded-sm"
                style={{
                  width: '10px',
                  height: '3px',
                }}
              />
              
              {/* Middle horizontal bar */}
              <div 
                className="absolute left-0 bg-white rounded-sm"
                style={{
                  width: '9px',
                  height: '3px',
                  top: '8.5px',
                }}
              />
              
              {/* Bottom horizontal bar */}
              <div 
                className="absolute left-0 bottom-0 bg-white rounded-sm"
                style={{
                  width: '10px',
                  height: '3px',
                }}
              />
              
              {/* Top right curve */}
              <div 
                className="absolute bg-white rounded-full"
                style={{
                  width: '6px',
                  height: '6px',
                  right: '-2px',
                  top: '1px',
                }}
              />
              
              {/* Bottom right curve */}
              <div 
                className="absolute bg-white rounded-full"
                style={{
                  width: '6px',
                  height: '6px',
                  right: '-2px',
                  bottom: '1px',
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Subtle highlight */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)',
          }}
        />
      </div>
    </div>
  );
}

// Alternative minimalist version
export function LogoIconMinimal({ size = 'md', className = '' }: LogoIconProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative inline-block`}>
      <div 
        className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold"
        style={{
          background: 'linear-gradient(135deg, #a8dadc 0%, #457b9d 100%)',
          fontSize: size === 'sm' ? '10px' : size === 'md' ? '12px' : size === 'lg' ? '16px' : '20px'
        }}
      >
        B
      </div>
    </div>
  );
}

// Geometric abstract version
export function LogoIconGeometric({ size = 'md', className = '', onClick }: LogoIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const Component = onClick ? 'button' : 'div';
  const clickableClasses = onClick ? 'cursor-pointer hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg' : '';

  return (
    <Component 
      className={`${sizeClasses[size]} ${className} ${clickableClasses} relative inline-block`}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      <div className="w-full h-full relative">
        {/* Main shape - hexagon */}
        <div 
          className="absolute inset-0 transform rotate-0"
          style={{
            background: 'linear-gradient(135deg, #a8dadc 0%, #457b9d 50%, #1d3557 100%)',
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
          }}
        />
        
        {/* Inner accent shapes */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Small circles representing bytes/data */}
            <div 
              className="absolute bg-white rounded-full opacity-90"
              style={{
                width: '3px',
                height: '3px',
                top: '-6px',
                left: '-1px',
              }}
            />
            <div 
              className="absolute bg-white rounded-full opacity-90"
              style={{
                width: '3px',
                height: '3px',
                top: '-2px',
                left: '3px',
              }}
            />
            <div 
              className="absolute bg-white rounded-full opacity-90"
              style={{
                width: '3px',
                height: '3px',
                top: '2px',
                left: '-1px',
              }}
            />
            <div 
              className="absolute bg-white rounded-full opacity-90"
              style={{
                width: '3px',
                height: '3px',
                top: '6px',
                left: '3px',
              }}
            />
          </div>
        </div>
      </div>
    </Component>
  );
}

export default LogoIcon;