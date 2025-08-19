import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from './supabase';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get authentication headers for API requests
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  let accessToken = null;
  
  // Check for locally stored custom tokens first (same logic as useAuth)
  const storedSession = localStorage.getItem('supabase.auth.token');
  if (storedSession) {
    try {
      const parsedSession = JSON.parse(storedSession);
      if (parsedSession.access_token) {
        accessToken = parsedSession.access_token;
        console.log('🔍 apiRequest using custom token:', {
          hasToken: true,
          tokenLength: parsedSession.access_token.length,
          isCustomToken: parsedSession.access_token.startsWith('verified_')
        });
      }
    } catch (parseError) {
      console.log('⚠️ Failed to parse stored session in apiRequest:', parseError);
    }
  }
  
  // If no custom token, check Supabase session
  if (!accessToken) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      accessToken = session.access_token;
      console.log('🔍 apiRequest using Supabase token:', {
        hasToken: true,
        tokenLength: session.access_token.length
      });
    }
  }
  
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else {
    console.log('❌ No authentication token found for apiRequest');
  }
  
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  const headers = {
    ...authHeaders,
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const authHeaders = await getAuthHeaders();
    const url = queryKey.join("/") as string;
    
    console.log('🔍 getQueryFn making request:', {
      url,
      hasAuthHeaders: Object.keys(authHeaders).length > 0,
      headers: authHeaders
    });
    
    const res = await fetch(url, {
      headers: authHeaders,
      credentials: "include",
    });

    console.log('📡 getQueryFn response:', {
      url,
      status: res.status,
      ok: res.ok
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Enabled for production
      staleTime: 1000 * 60 * 2, // 2 minutes for real-time feel
      gcTime: 1000 * 60 * 15, // 15 minutes cache (TanStack Query v5)
      retry: 3, // Enable retries for production
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: 2, // Enable mutation retries
      retryDelay: 1000,
    },
  },
});
