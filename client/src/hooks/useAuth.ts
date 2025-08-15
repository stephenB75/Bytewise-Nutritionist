// Minimal version to test React component context
export function useAuth() {
  // Return static data to test if component structure works
  return {
    user: null,
    isLoading: false,
    refetch: () => Promise.resolve(),
    signOut: () => Promise.resolve()
  };
}