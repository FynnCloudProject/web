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

  return doFetch().catch(async (error) => {
    if (error.response?.status === 401) {
      if (url.includes("/api/auth/refresh")) {
        throw error;
      }

      const { handle401 } = useTokenRefresh();
      const refreshed = await handle401();

      if (refreshed) {
        return $fetch<T>(url, options as any);
      }
      throw error;
    }

    throw error as Error;
  });
};
