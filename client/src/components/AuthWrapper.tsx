/**
 * Authentication Wrapper Component
 * 
 * Modern layout WITHOUT sign-on module
 * Direct access to app bypassing authentication
 */

interface AuthWrapperProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
}

export function AuthWrapper({ children, onNavigate }: AuthWrapperProps) {
  // Modern layout - direct access without authentication
  return <>{children}</>;
}