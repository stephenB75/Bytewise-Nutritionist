import logoImage from "@assets/bytewise_1753643863668.png";

interface LogoBrandProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LogoBrand({ size = 'md', className = '' }: LogoBrandProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  const taglineSizes = {
    sm: '0.9rem',     // 20% increase from 0.75rem (text-xs)
    md: '1.05rem',    // 20% increase from 0.875rem (text-sm)  
    lg: '1.2rem'      // 20% increase from 1rem (text-base)
  };

  const taglineSpacing = {
    sm: '-mt-2',
    md: '-mt-3', 
    lg: '-mt-4'
  };

  // Character-based alignment - using textIndent for exact positioning
  const getTaglineIndent = () => {
    switch (size) {
      case 'sm':
        return '2.5ch'; // For text-2xl
      case 'md':
        return '2.8ch'; // For text-4xl
      case 'lg':
        return '3.1ch'; // For text-6xl
      default:
        return '2.8ch';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main logo text */}
      <div 
        className={`${sizeClasses[size]} font-bold leading-none`}
        style={{ 
          fontFamily: "'League Spartan', sans-serif",
          color: 'var(--pastel-blue)'
        }}
      >
        bytewise
      </div>
      
      {/* Tagline positioned so 'N' aligns under 't' of "bytewise" */}
      <div 
        className={`font-medium ${taglineSpacing[size]} leading-none`}
        style={{ 
          fontFamily: "'League Spartan', sans-serif",
          fontSize: taglineSizes[size],
          letterSpacing: '0.2em',
          color: '#1d1d1b',
          textIndent: getTaglineIndent()
        }}
      >
        Nutritionist
      </div>
    </div>
  );
}

// Logo image component for use in various contexts
interface LogoImageProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LogoImage({ size = 'md', className = '' }: LogoImageProps) {
  const sizeClasses = {
    sm: 'w-16 h-12',
    md: 'w-24 h-18',
    lg: 'w-32 h-24',
    xl: 'w-48 h-36'
  };

  return (
    <img 
      src={logoImage} 
      alt="ByteWise Nutritionist" 
      className={`object-contain ${sizeClasses[size]} ${className}`}
    />
  );
}

// Standard brand component for headers and main branding
interface BrandStandardProps {
  size?: 'sm' | 'md' | 'lg';
  showImage?: boolean;
  className?: string;
}

export function BrandStandard({ size = 'md', showImage = true, className = '' }: BrandStandardProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {showImage && (
        <LogoImage 
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'} 
          className="mb-4" 
        />
      )}
      <LogoBrand size={size} />
    </div>
  );
}

// Compact logo for small spaces like navigation
export function BrandCompact({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LogoImage size="sm" />
      <span 
        className="text-xl font-bold"
        style={{ 
          fontFamily: "'League Spartan', sans-serif",
          color: 'var(--pastel-blue)'
        }}
      >
        bytewise
      </span>
    </div>
  );
}