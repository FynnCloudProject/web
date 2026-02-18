import { useStorage } from "@vueuse/core";

export const useBackEndConfig = () => {
  const { setPrimaryColor } = useTheme();
  const appName = useStorage("fynncloud-app-name", "FynnCloud");
  const maxFileSize = useState("max-file-size", () => 104857600); // Default 100MB
  const environment = useState("environment", () => "development");
  const appVersion = useState("app-version", () => "1.0.0");
  const isOffline = useState("is-offline", () => false);

  interface InfoResponse {
    appName?: string;
    version?: string;
    maxFileSize?: number;
    environment?: string;
    primaryColor?: string;
    [key: string]: any;
  }

  const initAppConfig = async () => {
    try {
      const info = await useApi<InfoResponse>("/api/info", {
        timeout: 3000,
        retry: 0,
      });
      console.log("AppConfig: Received info:", info);
      isOffline.value = false;

      if (info?.appName) {
        appName.value = info.appName;
        useHead({
          titleTemplate: (title) =>
            title ? `${title} - ${info.appName}` : info.appName || null,
        });
      }

      if (info?.version) appVersion.value = info.version;
      if (info?.maxFileSize) maxFileSize.value = info.maxFileSize;
      if (info?.environment) environment.value = info.environment;

      if (info?.primaryColor) {
        setPrimaryColor(info.primaryColor);
      }
    } catch (e) {
      console.error("Failed to fetch app config:", e);
      // If we can't reach the backend, we should probably set offline mode
      // But only if it's a network error or 5xx, maybe not 401
      isOffline.value = true;
    }
  };

  return {
    appName,
    maxFileSize,
    environment,
    appVersion,
    isOffline,
    initAppConfig,
  };
};
