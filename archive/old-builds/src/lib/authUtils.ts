/**
 * Authentication Utilities
 * 
 * Helper functions for handling authentication errors and states
 */

export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function handleAuthError(error: Error, toast?: any) {
  if (isUnauthorizedError(error)) {
    if (toast) {
      toast({
        title: "Session Expired",
        description: "Please sign in again to continue",
        variant: "destructive",
      });
    }
    
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 1000);
    return true;
  }
  return false;
}