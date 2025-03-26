import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse JSON response first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || 
          `Error ${res.status}: ${errorData.error || 'An unexpected error occurred'}`
        );
      }
      
      // Fall back to text response
      const text = await res.text();
      
      // Map common status codes to user-friendly messages
      const errorMessages: Record<number, string> = {
        400: 'Bad request. Please check your input.',
        401: 'Authentication required. Please log in.',
        403: 'You don\'t have permission to access this resource.',
        404: 'Resource not found.',
        429: 'Too many requests. Please try again later.',
        500: 'Server error. Please try again later or contact support.',
        503: 'Service unavailable. Please try again later.'
      };
      
      throw new Error(
        text || 
        errorMessages[res.status] || 
        `Error ${res.status}: ${res.statusText || 'An unexpected error occurred'}`
      );
    } catch (error) {
      // If error is already an Error instance (from above), just rethrow it
      if (error instanceof Error) throw error;
      
      // Otherwise create a generic error
      throw new Error(`${res.status}: An unexpected error occurred`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
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
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
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
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes - better for performance than Infinity while still maintaining freshness
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry 401 (unauthorized) or 404 (not found) errors
        if (error instanceof Error) {
          if (error.message.includes('401') || error.message.includes('404')) {
            return false;
          }
        }
        
        // Retry server errors or connection issues a few times
        return failureCount < 2; // Retry once
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    },
    mutations: {
      retry: (failureCount, error) => {
        // For AI requests, don't retry on 400-level errors as they're likely client-side issues
        // that won't be resolved by retrying (like invalid API keys)
        if (error instanceof Error) {
          if (error.message.includes('API key')) {
            return false;
          }
        }
        
        // For other mutations, retry once in case of network issues
        return failureCount < 1;
      },
      retryDelay: 1000, // Simple 1 second delay for mutations
    },
  },
});
