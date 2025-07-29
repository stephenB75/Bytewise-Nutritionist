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
    sm: '0.9rem',     
    md: '1.05rem',     
    lg: '1.2rem'      
  };

  const taglineSpacing = {
    sm: '-mt-2',
    md: '-mt-3', 
    lg: '-mt-4'
  };

  // Character-based alignment using textIndent
  const getTaglineIndent = () => {
    switch (size) {
      case 'sm':
        return '2.5ch';
      case 'md':
        return '2.8ch';
      case 'lg':
        return '3.1ch';
      default:
        return '2.8ch';
    }
  };

  return (
    <div className={`brand-logo relative ${className}`}>
      {/* Main logo text */}
      <div 
        className={`${sizeClasses[size]} font-bold leading-none brand-text-primary`}
      >
        bytewise
      </div>
      
      {/* Tagline positioned so 'N' aligns under 't' of "bytewise" */}
      <div 
        className={`font-medium ${taglineSpacing[size]} leading-none brand-text-secondary`}
        style={{ 
          fontSize: taglineSizes[size],
          letterSpacing: '0.2em',
          textIndent: getTaglineIndent()
        }}
      >
        Nutritionist
      </div>
    </div>
  );
}

// Standard brand component for headers and main branding
interface BrandStandardProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandStandard({ size = 'md', className = '' }: BrandStandardProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <LogoBrand size={size} />
    </div>
  );
}

// Compact logo for small spaces like navigation
export function BrandCompact({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-xl font-bold brand-text-primary">
        bytewise
      </span>
    </div>
  );
}