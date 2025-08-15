// Temporary placeholder to prevent import errors
export function useAuth() {
  return {
    user: null,
    isLoading: false,
    refetch: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    supabase: null
  };
}