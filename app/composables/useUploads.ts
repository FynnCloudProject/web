import { useApiBase } from "./useApiBase";

export interface UploadItem {
  id: string;
  name: string;
  file: File;
  progress: number;
  speed?: number; // bytes per second
  status: "pending" | "uploading" | "processing" | "completed" | "error";
  error?: string;
  sessionID?: string; // For chunked uploads
  uploadedChunks?: number; // Track completed chunks
  totalChunks?: number; // Total number of chunks
}

const ERROR_MAP: Record<number, string> = {
  413: "upload.error.quotaExceeded",
  401: "upload.error.unauthorized",
  409: "upload.error.nameConflict",
};

const CHUNKED_UPLOAD_THRESHOLD = 30 * 1024 * 1024;
const MAX_RETRIES = 3;
const MAX_CONCURRENT_CHUNKS = 5;

export const useUploads = () => {
  const uploads = useState("uploads", () => [] as UploadItem[]);
  const apiBase = useApiBase();
  const { fetchQuota, usage, limit } = useQuota();
  const { fetchFiles, currentParentID } = useFiles();
  const route = useRoute();

  const addUpload = (file: File) => {
    const id = Math.random().toString(36).substring(7);
    uploads.value.push({
      id,
      name: file.name,
      file,
      progress: 0,
      speed: 0,
      status: "pending",
    });
    return id;
  };

  const updateUpload = (
    id: string,
    updates: Partial<Omit<UploadItem, "id">>,
  ) => {
    const index = uploads.value.findIndex((u: { id: string }) => u.id === id);
    if (index !== -1) {
      uploads.value[index] = {
        ...uploads.value[index],
        ...updates,
        id,
      } as UploadItem;
    }
  };

  const removeUpload = (id: string) => {
    uploads.value = uploads.value.filter((u: { id: string }) => u.id !== id);
  };

  const uploadFileSingleRequest = async (
    file: File,
    parentID: string | null = null,
  ) => {
    const id = addUpload(file);

    if (file.size > limit.value || usage.value + file.size > limit.value) {
      updateUpload(id, {
        status: "error",
        error: "upload.error.quotaExceeded",
      });
      return;
    }

    const url = new URL(`${apiBase}/api/files`);
    if (parentID) url.searchParams.append("parentID", parentID);
    url.searchParams.append("filename", file.name);
    url.searchParams.append(
      "contentType",
      file.type || "application/octet-stream",
    );
    url.searchParams.append("lastModified", file.lastModified.toString());

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url.toString(), true);
      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream",
      );

      let lastUpdate = 0;
      let lastLoaded = 0;
      let lastSpeedUpdate = 0;
      const THROTTLE_MS = 80;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const now = Date.now();
          const progress = Math.round((e.loaded * 100) / e.total);

          const timeDiff = now - lastSpeedUpdate;
          if (timeDiff > 500) {
            const loadedDiff = e.loaded - lastLoaded;
            const speed = (loadedDiff / timeDiff) * 1000; // bytes per second
            lastLoaded = e.loaded;
            lastSpeedUpdate = now;

            const current = uploads.value.find(
              (u: { id: string }) => u.id === id,
            );
            if (current) {
              updateUpload(id, { speed });
            }
          }

          if (now - lastUpdate > THROTTLE_MS || progress === 100) {
            lastUpdate = now;
            const current = uploads.value.find(
              (u: { id: string }) => u.id === id,
            );
            if (current && current.status !== "error") {
              updateUpload(id, {
                progress,
                status: progress >= 100 ? "processing" : "uploading",
              });
            }
          }
        }
      };

      xhr.onload = () => {
        if (xhr.status === 0) return;

        if (xhr.status >= 200 && xhr.status < 300) {
          updateUpload(id, { progress: 100, status: "completed" });
          fetchQuota();

          const isExplorerPage = ["index", "files-path"].includes(
            route.name as string,
          );
          if (isExplorerPage && currentParentID.value === parentID) {
            fetchFiles(parentID);
          }

          setTimeout(() => {
            removeUpload(id);
          }, 3000);

          resolve();
        } else {
          let errorKey = ERROR_MAP[xhr.status] || "upload.error.unknown";
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.localizationKey) {
              errorKey = response.localizationKey;
            }
          } catch (e) {}

          updateUpload(id, { status: "error", error: errorKey });
          reject(new Error(errorKey));
        }
      };

      xhr.onerror = () => {
        updateUpload(id, {
          status: "error",
          error: "upload.error.networkError",
        });
        reject(new Error("networkError"));
      };

      updateUpload(id, { status: "uploading" });
      xhr.send(file);
    });
  };

  const executeWithConcurrency = async <T>(
    tasks: Array<() => Promise<T>>,
    maxConcurrency: number,
  ): Promise<T[]> => {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const task of tasks) {
      const promise = task().then((result) => {
        results.push(result);
        const index = executing.indexOf(promise);
        if (index > -1) {
          executing.splice(index, 1);
        }
      });

      executing.push(promise);

      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
    return results;
  };

  const uploadFileChunked = async (
    file: File,
    parentID: string | null = null,
  ) => {
    const id = addUpload(file);

    if (file.size > limit.value || usage.value + file.size > limit.value) {
      updateUpload(id, {
        status: "error",
        error: "upload.error.quotaExceeded",
      });
      return;
    }

    let sessionID: string | undefined;
    let uploadToken: string | undefined; // Store JWT token

    try {
      const initiateResponse = await $fetch<{
        sessionID: string;
        fileID: string;
        uploadID: string;
        maxChunkSize: number;
        token: string; // JWT token from server
      }>(`${apiBase}/api/files/multipart/initiate`, {
        method: "POST",
        body: {
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          totalSize: file.size,
          parentID: parentID,
          lastModified: file.lastModified,
        },
      });

      sessionID = initiateResponse.sessionID;
      uploadToken = initiateResponse.token;
      const { maxChunkSize } = initiateResponse;
      const totalChunks = Math.ceil(file.size / maxChunkSize);

      updateUpload(id, {
        sessionID,
        totalChunks,
        uploadedChunks: 0,
        status: "uploading",
      });

      // Shared state for progress tracking across all chunks
      const progressState = {
        loadedByChunk: new Array(totalChunks).fill(0),
        lastTotalLoaded: 0,
        lastSpeedTime: Date.now(),
        lastUpdateTime: 0,
        updateInProgress: false,
      };

      const uploadedChunksCount = { value: 0 };
      const completedParts: Array<{
        partNumber: number;
        etag: string;
        size: number;
      }> = [];

      // Centralized progress update function with proper throttling
      const updateProgress = () => {
        if (progressState.updateInProgress) return;

        const now = Date.now();
        const timeSinceLastUpdate = now - progressState.lastUpdateTime;

        // Throttle updates to every 200ms
        if (timeSinceLastUpdate < 200) return;

        progressState.updateInProgress = true;

        try {
          const totalLoaded = progressState.loadedByChunk.reduce(
            (a, b) => a + b,
            0,
          );
          const timeDiff = now - progressState.lastSpeedTime;

          let speed = 0;
          if (timeDiff > 0) {
            const loadedDiff = totalLoaded - progressState.lastTotalLoaded;
            if (loadedDiff > 0) {
              speed = (loadedDiff / timeDiff) * 1000; // bytes per second
            }
          }

          // Calculate progress, cap at 99% until processing
          const progress = Math.min(
            Math.round((totalLoaded * 100) / file.size),
            99,
          );

          updateUpload(id, {
            speed: speed > 0 ? speed : undefined,
            progress,
          });

          progressState.lastTotalLoaded = totalLoaded;
          progressState.lastSpeedTime = now;
          progressState.lastUpdateTime = now;
        } finally {
          progressState.updateInProgress = false;
        }
      };

      const chunkTasks = Array.from({ length: totalChunks }, (_, index) => {
        const partNumber = index + 1;
        const start = index * maxChunkSize;
        const end = Math.min(start + maxChunkSize, file.size);
        const chunk = file.slice(start, end);

        return async () => {
          let retryCount = 0;
          let partInfo: {
            partNumber: number;
            etag: string;
            size: number;
          } | null = null;

          while (!partInfo && retryCount < MAX_RETRIES) {
            try {
              partInfo = await uploadChunk(
                sessionID!,
                partNumber,
                chunk,
                uploadToken!,
                (loaded) => {
                  // Update this chunk's loaded bytes
                  progressState.loadedByChunk[index] = loaded;
                  // Trigger centralized progress update
                  updateProgress();
                },
              );

              completedParts.push(partInfo);
              uploadedChunksCount.value++;

              updateUpload(id, {
                uploadedChunks: uploadedChunksCount.value,
                status: "uploading",
              });
            } catch (error) {
              retryCount++;
              if (retryCount >= MAX_RETRIES) {
                throw error;
              }
              await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, retryCount) * 1000),
              );
            }
          }

          return partInfo!;
        };
      });

      await executeWithConcurrency(chunkTasks, MAX_CONCURRENT_CHUNKS);

      updateUpload(id, { status: "processing" });

      const sortedParts = completedParts.sort(
        (a, b) => a.partNumber - b.partNumber,
      );

      await $fetch(`${apiBase}/api/files/multipart/${sessionID}/complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${uploadToken}`,
        },
        body: { parts: sortedParts },
      });

      updateUpload(id, { progress: 100, status: "completed" });
      fetchQuota();

      const isExplorerPage = ["index", "files-path"].includes(
        route.name as string,
      );
      if (isExplorerPage && currentParentID.value === parentID) {
        fetchFiles(parentID);
      }

      setTimeout(() => {
        removeUpload(id);
      }, 3000);
    } catch (error: any) {
      if (sessionID) {
        await abortUpload(sessionID).catch(() => {});
      }

      let errorKey = "upload.error.unknown";
      if (error.statusCode) {
        errorKey = ERROR_MAP[error.statusCode] || errorKey;
      }
      if (error.data?.localizationKey) {
        errorKey = error.data.localizationKey;
      }

      updateUpload(id, { status: "error", error: errorKey });
      throw error;
    }
  };

  const uploadChunk = async (
    sessionID: string,
    partNumber: number,
    chunk: Blob,
    token: string,
    onProgress?: (loaded: number) => void,
  ): Promise<{ partNumber: number; etag: string; size: number }> => {
    const url = `${apiBase}/api/files/multipart/${sessionID}/part/${partNumber}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Length", chunk.size.toString());
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            onProgress(e.loaded);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              partNumber: response.partNumber,
              etag: response.etag,
              size: response.size,
            });
          } catch (e) {
            reject(new Error("Failed to parse chunk upload response"));
          }
        } else {
          reject(new Error(`Chunk upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error during chunk upload"));
      };

      xhr.send(chunk);
    });
  };

  const abortUpload = async (sessionID: string): Promise<void> => {
    await $fetch(`${apiBase}/api/files/multipart/${sessionID}/abort`, {
      method: "DELETE",
    }).catch(() => {});
  };

  const uploadFile = async (file: File, parentID: string | null = null) => {
    if (file.size >= CHUNKED_UPLOAD_THRESHOLD) {
      console.log(
        `Using parallel chunked upload for ${file.name} (${file.size} bytes)`,
      );
      return uploadFileChunked(file, parentID);
    } else {
      console.log(
        `Using single-request upload for ${file.name} (${file.size} bytes)`,
      );
      return uploadFileSingleRequest(file, parentID);
    }
  };

  return {
    uploads,
    uploadFile,
    removeUpload,
  };
};
