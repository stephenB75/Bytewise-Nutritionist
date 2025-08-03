/**
 * Authentication Wrapper Component
 * 
 * Simplified for visual redesign testing - bypasses auth
 */

interface AuthWrapperProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
}

export function AuthWrapper({ children, onNavigate }: AuthWrapperProps) {
  // Bypass authentication completely for visual redesign testing
  // AuthWrapper: Bypassing authentication for visual testing
  
  // Skip all auth logic and directly show children
  return <>{children}</>;
}