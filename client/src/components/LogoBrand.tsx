interface LogoBrandProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  clickable?: boolean;
}

export function LogoBrand({ size = 'md', className = '', clickable = false }: LogoBrandProps) {
  const Component = clickable ? 'button' : 'div';
  
  return (
    <Component 
      className={`bytewise-logo bytewise-logo-${size} ${className} ${clickable ? 'transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2' : ''}`}
      {...(clickable && { onClick: () => window.location.href = '/' })}
    >
      <div className="bytewise-logo-main">bytewise</div>
      <div className="bytewise-logo-tagline">Nutritionist</div>
    </Component>
  );
}