import React from 'react';

interface ProfileIconProps {
  iconNumber: number; // 1-2 for the 2 different avatar types (1=male, 2=female)
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

  // Determine which avatar to use based on iconNumber
  const avatarSrc = iconNumber === 2 ? '/avatar-female.png' : '/avatar-male.png';

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center ${className}`}
      style={{
        backgroundImage: `url(${avatarSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      data-testid={`profile-icon-${iconNumber}`}
    />
  );
};

// Helper function to get a random icon number for new users
export const getRandomIconNumber = (): number => {
  return Math.floor(Math.random() * 2) + 1; // Random number 1-2 (male or female avatar)
};