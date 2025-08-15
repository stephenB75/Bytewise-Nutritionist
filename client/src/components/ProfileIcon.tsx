import React from 'react';

interface ProfileIconProps {
  iconNumber: number; // 1-9 for the 9 different icons in the pack
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProfileIcon: React.FC<ProfileIconProps> = ({ 
  iconNumber, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24'
  };

  // Calculate position for the specific icon in the sprite sheet
  // The icons are arranged in a 3x3 grid
  const row = Math.floor((iconNumber - 1) / 3);
  const col = (iconNumber - 1) % 3;
  
  // Precise positioning for perfect centering within circular container
  // For a 3x3 grid, we need to center each icon within its cell
  // Using more precise positioning calculations
  const backgroundPositionX = col * 50; // 0%, 50%, 100%
  const backgroundPositionY = row * 50; // 0%, 50%, 100%

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center ${className}`}
      style={{
        backgroundImage: 'url(/profile-icons.jpg)',
        backgroundSize: '300% 300%', // Optimized size for better icon centering
        backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`,
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'transparent',
        mixBlendMode: 'multiply',
        filter: 'contrast(1.1) saturate(1.2)'
      }}
      data-testid={`profile-icon-${iconNumber}`}
    />
  );
};

// Helper function to get a random icon number for new users
export const getRandomIconNumber = (): number => {
  return Math.floor(Math.random() * 9) + 1; // Random number 1-9
};