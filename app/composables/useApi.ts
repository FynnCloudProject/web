export const useApi = <T>(url: string, options: any = {}) => {
  const apiBase = useApiBase();

  const defaults = {
    baseURL: apiBase,
  };

  const params = {
    ...defaults,
    ...options,
    headers: {
      ...options.headers,
    },
  };

  const doFetch = async () => {
    if (import.meta.env.DEV) {
      const { networkDelay, forceError, simulate401 } = useDevConfig();

      if (networkDelay.value > 0) {
        await new Promise((resolve) => setTimeout(resolve, networkDelay.value));
      }

      if (forceError.value) {
        forceError.value = false;
        const err: any = new Error("Forced 500 Error from DevMenu");
        err.response = { status: 500 };
        throw err;
      }

      if (simulate401.value) {
        simulate401.value = false;
        const err: any = new Error("Simulated 401 from DevMenu");
        err.response = { status: 401 };
        throw err;
      }
    }
    return $fetch<T>(url, {
      ...params,
    });
  };

  const executeWithNetworkTracking = async () => {
    try {
      return await doFetch();
    } catch (error: any) {
      if (error.response?.status === 401) {
        if (url.includes("/api/auth/refresh")) {
          throw error;
        }

        const { handle401 } = useTokenRefresh();
        const refreshed = await handle401();

        if (refreshed) {
          return await $fetch<T>(url, params as any);
        }

        // Refresh failed — force redirect to login
        const user = useState<any | null>("user");
        user.value = null;
        await navigateTo("/auth/login");
        throw error;
      }

      throw error as Error;
    }
  };

  return executeWithNetworkTracking();
};

/** Returns true if the error is an abort error (user cancelled / request aborted) */
export const isAbortError = (error: any): boolean => {
  if (!error) return false;
  return (
    error.name === "AbortError" ||
    error.message?.toLowerCase().includes("abort") ||
    error.cause?.name === "AbortError" ||
    error.cause?.message?.toLowerCase().includes("abort")
  );
};

/** Returns true if the error indicates a network-level failure (not an HTTP error response) */
export const isNetworkError = (error: any): boolean => {
  if (isAbortError(error)) return false;

  // No response object means the request never reached the server
  if (!error.response && !error.status) {
    // Common network error indicators
    if (error.name === "TypeError" || error.name === "FetchError") return true;
    if (error.message?.includes("fetch")) return true;
    if (error.message?.includes("network")) return true;
    if (error.message?.includes("ECONNREFUSED")) return true;
    if (error.message?.includes("ETIMEDOUT")) return true;
    if (error.message?.includes("ENOTFOUND")) return true;
    if (error.cause?.code === "ECONNREFUSED") return true;
    if (error.cause?.code === "ETIMEDOUT") return true;
    // Timeout errors
    if (error.name === "AbortError") return false; // User-initiated abort
    return true;
  }
  // 502/503/504 indicate server is down or unreachable behind a proxy
  if ([502, 503, 504].includes(error.response?.status)) return true;
  return false;
};

