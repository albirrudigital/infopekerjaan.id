import { QueryClient } from "@tanstack/react-query";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

type FetcherOptions = {
  on401?: "error" | "returnNull";
};

// Helper untuk fetch data
export const getQueryFn = (options: FetcherOptions = {}) => {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const path = queryKey[0]; // first element is the path
    const res = await fetch(path);

    if (res.status === 401) {
      if (options.on401 === "returnNull") {
        return null;
      }
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    return res.json();
  };
};

// Helper untuk operasi API
export async function apiRequest(
  method: string,
  path: string,
  body?: any
) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(path, options);

  if (!response.ok) {
    let error;
    try {
      const errorData = await response.json();
      error = new Error(errorData.message || "An error occurred");
    } catch {
      error = new Error(`HTTP error ${response.status}`);
    }
    throw error;
  }

  return response;
}