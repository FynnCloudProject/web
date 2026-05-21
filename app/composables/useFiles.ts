import { ref, onUnmounted } from "vue";
import type { FileItem, BreadcrumbItem, FileIndexDTO } from "~/types/file";
import { fileApi, mapFile, mapFiles } from "~/services/fileApi";

export type FileManager = ReturnType<typeof useFiles>;

export const useFiles = () => {
  const router = useRouter();
  const { fetchQuota } = useQuota();
  const { t } = useI18n();

  // Local isolated state for this instance
  const files = ref<FileItem[]>([]);
  const currentParentID = ref<string | null>(null);
  const breadcrumbs = ref<BreadcrumbItem[]>([]);

  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Scoped strictly to this instance of the composable
  let fetchController: AbortController | null = null;
  
  const lastFetch = ref<{ fn: () => Promise<FileIndexDTO>, fallbackBreadcrumbs?: BreadcrumbItem[] } | null>(null);

  const executeFetch = async (
    apiFn: () => Promise<FileIndexDTO>,
    fallbackBreadcrumbs?: BreadcrumbItem[],
    silent: boolean = false
  ) => {
    lastFetch.value = { fn: apiFn, fallbackBreadcrumbs };

    if (fetchController) {
      fetchController.abort();
    }
    fetchController = new AbortController();

    if (fallbackBreadcrumbs) {
      breadcrumbs.value = fallbackBreadcrumbs;
    }

    if (!silent) {
      isLoading.value = true;
    }
    error.value = null;

    try {
      const data = await apiFn();

      files.value = mapFiles(data.files);
      currentParentID.value = data.parentID || null;

      const fetchedBreadcrumbs = data.breadcrumbs || [];
      breadcrumbs.value = fetchedBreadcrumbs.length > 0 ? fetchedBreadcrumbs : (fallbackBreadcrumbs || []);

      return data;
    } catch (e: any) {
      if (e.name === "AbortError") return;
      error.value = e.data?.message || e.message || "An error occurred";
      const status = e.statusCode || e.response?.status;
      if (status === 404 || status === 403) router.push("/");
      throw e;
    } finally {
      if (fetchController?.signal.aborted === false) {
        isLoading.value = false;
      }
    }
  };

  onUnmounted(() => {
    if (fetchController) {
      fetchController.abort();
    }
  });

  const fetchFiles = (parentID: string | null = null, initialBreadcrumbs?: BreadcrumbItem[]) =>
    executeFetch(
      () => fileApi.fetchIndex({ parentID }, fetchController!.signal),
      !parentID && !initialBreadcrumbs ? [{ name: "Home", labelKey: "navigation.allFiles", path: "/", id: null }] : initialBreadcrumbs
    );

  const fetchRecent = () =>
    executeFetch(
      () => fileApi.fetchRecent(fetchController!.signal),
      [{ name: "Recent", labelKey: "navigation.recentFiles", icon: "clock", id: null, path: "/recent" }]
    );

  const fetchFavorites = () =>
    executeFetch(
      () => fileApi.fetchFavorites(fetchController!.signal),
      [{ name: "Favorites", labelKey: "navigation.favoriteFiles", icon: "star", id: null, path: "/favorites" }]
    );

  const fetchShared = () =>
    executeFetch(
      () => fileApi.fetchShared(fetchController!.signal),
      [{ name: "Shared", labelKey: "navigation.sharedFiles", icon: "share", id: null, path: "/shared" }]
    );

  const fetchTrash = (parentID: string | null = null, initialBreadcrumbs?: BreadcrumbItem[]) =>
    executeFetch(
      () => fileApi.fetchTrash({ parentID }, fetchController!.signal),
      !parentID && !initialBreadcrumbs ? [{ name: "Trash", labelKey: "navigation.trash", icon: "trash", path: "/trash", id: null }] : initialBreadcrumbs
    );

  const refresh = async () => {
    if (lastFetch.value) {
      return executeFetch(lastFetch.value.fn, lastFetch.value.fallbackBreadcrumbs, true);
    }
  };

  const updateFileInState = (updatedFile: FileItem) => {
    const index = files.value.findIndex((f) => f.id === updatedFile.id);
    if (index !== -1) {
      files.value[index] = updatedFile;
    }
  };

  const removeFileFromState = (id: string) => {
    files.value = files.value.filter((f) => f.id !== id);
  };

  const addFileToState = (newFile: FileItem) => {
    files.value.push(newFile);
  };

  const createFolder = async (
    name: string,
    parentID: string | null = currentParentID.value,
  ): Promise<FileItem> => {
    const apiFile = await fileApi.createFolder(name, parentID);
    const newFile = mapFile(apiFile);
    addFileToState(newFile);
    return newFile;
  };

  const deleteFile = async (id: string) => {
    await fileApi.deleteFile(id);
    removeFileFromState(id);
  };

  const deleteFiles = async (ids: string[]) => {
    await Promise.all(ids.map((id) => deleteFile(id)));
  };

  const deleteFilePermanently = async (id: string, shouldFetchQuota = true) => {
    await fileApi.deletePermanently(id);
    removeFileFromState(id);
    if (shouldFetchQuota) fetchQuota();
  };

  const deleteFilesPermanently = async (ids: string[]) => {
    await Promise.all(ids.map((id) => deleteFilePermanently(id, false)));
    fetchQuota();
  };

  const moveFile = async (
    fileID: string,
    targetParentID: string | null,
  ): Promise<FileItem> => {
    const apiFile = await fileApi.moveFile(fileID, targetParentID);
    const updatedFile = mapFile(apiFile);
    removeFileFromState(fileID);
    return updatedFile;
  };

  const renameFile = async (id: string, name: string): Promise<FileItem> => {
    const apiFile = await fileApi.renameFile(id, name);
    const updatedFile = mapFile(apiFile);
    updateFileInState(updatedFile);
    return updatedFile;
  };

  const restoreFile = async (id: string): Promise<FileItem> => {
    const apiFile = await fileApi.restoreFile(id);
    const restoredFile = mapFile(apiFile);
    removeFileFromState(id);
    return restoredFile;
  };

  const toggleFavorite = async (id: string): Promise<FileItem> => {
    const apiFile = await fileApi.toggleFavorite(id);
    const updatedFile = mapFile(apiFile);
    updateFileInState(updatedFile);
    return updatedFile;
  };

  const getDeleteDescription = (items: FileItem[], isTrash: boolean) => {
    const count = items.length;
    if (isTrash) {
      if (count === 1)
        return t("files.actions.deletePermanent.descriptionSingle", {
          name: items?.name,
        });
      return t("files.actions.deletePermanent.descriptionMultiple", { count });
    }
    if (count === 1)
      return t("files.actions.delete.descriptionSingle", {
        name: items?.name,
      });
    return t("files.actions.delete.descriptionMultiple", { count });
  };

  return {
    files,
    currentParentID,
    breadcrumbs,
    isLoading,
    error,

    fetchFiles,
    fetchRecent,
    fetchFavorites,
    fetchShared,
    fetchTrash,
    refresh,
    createFolder,
    deleteFile,
    deleteFiles,
    moveFile,
    renameFile,
    restoreFile,
    deleteFilePermanently,
    deleteFilesPermanently,
    toggleFavorite,

    getDeleteDescription,
  };
};
