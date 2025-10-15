/**
 * Query Client Configuration
 * React Query client for API state management
 */

import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// API request helper with authentication
export async function apiRequest(method: string, endpoint: string, body?: any) {
  const token = localStorage.getItem('auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid, clear auth
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expires_at');
      window.location.reload();
    }
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response;
}
