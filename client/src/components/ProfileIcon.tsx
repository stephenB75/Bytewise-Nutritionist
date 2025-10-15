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
    sm: 'w-8 h-8 min-w-[2rem] min-h-[2rem]',
    md: 'w-16 h-16 min-w-[4rem] min-h-[4rem]', 
    lg: 'w-24 h-24 min-w-[6rem] min-h-[6rem]'
  };

  // Determine which avatar to use based on iconNumber (ensure valid range)
  const validIconNumber = iconNumber === 2 ? 2 : 1; // Default to 1 if not 2
  const avatarSrc = validIconNumber === 2 ? '/avatar-female.png' : '/avatar-male.png';

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg ${className}`}
      data-testid={`profile-icon-${validIconNumber}`}
    >
      <img 
        src={avatarSrc}
        alt={`Profile avatar ${validIconNumber === 2 ? 'female' : 'male'}`}
        className="w-full h-full object-cover rounded-full"
        onError={(e) => {
          // Fallback to showing initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `<span class="text-gray-900 font-bold text-lg">${validIconNumber === 2 ? 'F' : 'M'}</span>`;
        }}
      />
    </div>
  );
};

// Helper function to get a random icon number for new users
export const getRandomIconNumber = (): number => {
  return Math.floor(Math.random() * 2) + 1; // Random number 1-2 (male or female avatar)
};