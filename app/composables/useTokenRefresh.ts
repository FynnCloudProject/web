interface PendingRequest {
  resolve: (value?: void | PromiseLike<void>) => void;
  reject: (reason?: any) => void;
}

let isRefreshing = false;
let failedQueue: PendingRequest[] = [];

export const useTokenRefresh = () => {
  const apiBase = useApiBase();
  const route = useRoute();
  const user = useState<any | null>("user");

  const processQueue = (error: any = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve();
      }
    });
    failedQueue = [];
  };

  const handleLogout = async (error?: any) => {
    user.value = null;
    if (route.path !== "/auth/login") {
      await navigateTo("/auth/login");
    }
    if (error) throw error;
  };

  const refreshAuth = async (): Promise<void> => {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
    }

    isRefreshing = true;

    try {
      await $fetch(`${apiBase}/api/auth/refresh`, { method: "POST" });
      processQueue();
    } catch (err) {
      processQueue(err);
      await handleLogout(err);
    } finally {
      isRefreshing = false;
    }
  };

  // Helper to handle 401s in a standardized way
  // returns true if refreshed successfully, false if failed/logout
  const handle401 = async (): Promise<boolean> => {
    try {
      await refreshAuth();
      return true;
    } catch (e) {
      return false;
    }
  };

  return {
    refreshAuth,
    handle401,
    isRefreshing: computed(() => isRefreshing),
  };
};
