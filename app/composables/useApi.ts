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

  return $fetch<T>(url, {
    ...params,
  }).catch(async (error) => {
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
