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
  
  // More precise positioning for better centering
  // Using exact percentages for 3x3 grid: 0%, 50%, 100% for col/row positions
  const positions = [0, 50, 100];
  const backgroundPositionX = positions[col];
  const backgroundPositionY = positions[row];

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center ${className}`}
      style={{
        backgroundImage: 'url(/profile-icons.jpg)',
        backgroundSize: '320% 320%', // Slightly larger to ensure icons fit fully within circle
        backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`,
        backgroundRepeat: 'no-repeat'
      }}
      data-testid={`profile-icon-${iconNumber}`}
    />
  );
};

// Helper function to get a random icon number for new users
export const getRandomIconNumber = (): number => {
  return Math.floor(Math.random() * 9) + 1; // Random number 1-9
};