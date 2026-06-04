import { useStorage } from "@vueuse/core";

let reachabilityPromise: Promise<boolean> | null = null;

export const useBackEndConfig = () => {
  const { setPrimaryColor } = useTheme();
  const appName = useState("app-name", () => "FynnCloud");
  const maxFileSize = useState("max-file-size", () => 104857600); // Default 100MB
  const environment = useState("environment", () => "development");
  const appVersion = useState("app-version", () => "1.0.0");
  const isOffline = useState("is-offline", () => false);
  const hasBooted = useState("has-booted", () => false);
  const lastOnlineAt = useState<number | null>("last-online-at", () => null);
  const consecutiveFailures = useState("consecutive-failures", () => 0);

  interface InfoResponse {
    appName?: string;
    version?: string;
    maxFileSize?: number;
    environment?: string;
    primaryColor?: string;
    [key: string]: any;
  }

  const verifyServerReachability = async (): Promise<boolean> => {
    return !isOffline.value;
  };

  const reportNetworkSuccess = () => {
    consecutiveFailures.value = 0;
  };

  const reportNetworkError = (url: string, error: any) => {
    consecutiveFailures.value++;
  };

  const listenersRegistered = useState("listeners-registered", () => false);

  const initAppConfig = async () => {
    try {
      const info = await useApi<InfoResponse>("/api/info", {
        timeout: 5000,
        retry: 0,
      });
      isOffline.value = false;
      consecutiveFailures.value = 0;
      lastOnlineAt.value = Date.now();
      hasBooted.value = true;

      if (info?.appName) {
        appName.value = info.appName;
      }

      if (info?.version) appVersion.value = info.version;
      if (info?.maxFileSize) maxFileSize.value = info.maxFileSize;
      if (info?.environment) environment.value = info.environment;

      if (info?.primaryColor) {
        setPrimaryColor(info.primaryColor);
      }
    } catch (e: any) {
      consecutiveFailures.value++;
      hasBooted.value = true;
    }
  };

  return {
    appName,
    maxFileSize,
    environment,
    appVersion,
    isOffline,
    hasBooted,
    lastOnlineAt,
    consecutiveFailures,
    initAppConfig,
    reportNetworkSuccess,
    reportNetworkError,
    verifyServerReachability,
  };
};

