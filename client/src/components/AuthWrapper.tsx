/**
 * Authentication Wrapper Component
 * 
 * Simplified for modernlayout - bypasses all authentication
 * Restores to pre-sign-on module state
 */

interface AuthWrapperProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
}

export function AuthWrapper({ children, onNavigate }: AuthWrapperProps) {
  // Restored to modernlayout state - no authentication required
  // Direct access to app without sign-on module
  
  return <>{children}</>;
}