import { LogoBrand } from './LogoBrand';

interface BrandProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTagline?: boolean;
}

export function Brand({ size = 'md', className = '', showTagline = true }: BrandProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <LogoBrand size={size} />
      {showTagline && (
        <p 
          className="mt-3 text-center text-muted-foreground max-w-xs"
          style={{ fontFamily: 'Quicksand, sans-serif' }}
        >
          Track nutrition at the ingredient level with beautiful visual insights
        </p>
      )}
    </div>
  );
}

// Compact version for headers and navigation
export function BrandCompact({ size = 'sm', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <LogoBrand size={size} />
    </div>
  );
}

// Standardized branding format - preserves exact styling and positioning
export function BrandStandard({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <LogoBrand size={size} />
    </div>
  );
}

// Export LogoBrand directly for more flexible usage
export { LogoBrand };