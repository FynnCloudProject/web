import type { ApiFile, FileItem, FileIndexDTO, BreadcrumbItem } from '~/types/file'

// --- Mapping ---

export const mapFile = (f: ApiFile): FileItem => ({
  owner: f.owner,
  parent: f.parent,
  id: f.id,
  name: f.filename,
  type: determineFileType(f),
  size: f.isDirectory ? undefined : formatSize(f.size),
  sizeBytes: f.size,
  lastModified: f.lastModified ? new Date(f.lastModified) : null,
  updatedAt: new Date(f.updatedAt),
  createdAt: new Date(f.createdAt),
  deletedAt: f.deletedAt ? new Date(f.deletedAt) : null,
  isFavorite: f.isFavorite,
  isShared: f.isShared,
  isRecent: f.isRecent,
})

export const mapFiles = (rawFiles: ApiFile[]): FileItem[] => {
  return rawFiles.map(mapFile)
}

// --- API calls ---

export const fileApi = {
  async fetchIndex(params: { parentID?: string | null } = {}, signal?: AbortSignal): Promise<FileIndexDTO> {
    const queryParams: Record<string, string> = {}
    if (params.parentID) queryParams.parentID = params.parentID
    return useApi<FileIndexDTO>('/api/files', { params: queryParams, signal })
  },

  async fetchRecent(signal?: AbortSignal): Promise<FileIndexDTO> {
    return useApi<FileIndexDTO>('/api/files/recent', { signal })
  },

  async fetchFavorites(signal?: AbortSignal): Promise<FileIndexDTO> {
    return useApi<FileIndexDTO>('/api/files/favorites', { signal })
  },

  async fetchShared(signal?: AbortSignal): Promise<FileIndexDTO> {
    return useApi<FileIndexDTO>('/api/files/shared', { signal })
  },

  async fetchTrash(params: { parentID?: string | null } = {}, signal?: AbortSignal): Promise<FileIndexDTO> {
    const queryParams: Record<string, string> = {}
    if (params.parentID) queryParams.parentID = params.parentID
    return useApi<FileIndexDTO>('/api/files/trash', { params: queryParams, signal })
  },

  async createFolder(name: string, parentID: string | null): Promise<ApiFile> {
    return useApi<ApiFile>('/api/files/create-directory', {
      method: 'POST',
      body: { name, parentID },
    })
  },

  async deleteFile(id: string): Promise<void> {
    await useApi(`/api/files/${id}`, { method: 'DELETE' })
  },

  async deletePermanently(id: string): Promise<void> {
    await useApi(`/api/files/${id}/permanent-delete`, { method: 'DELETE' })
  },

  async moveFile(fileID: string, targetParentID: string | null): Promise<ApiFile> {
    return useApi<ApiFile>('/api/files/move-file', {
      method: 'POST',
      body: { fileID, parentID: targetParentID },
    })
  },

  async renameFile(id: string, name: string): Promise<ApiFile> {
    return useApi<ApiFile>(`/api/files/${id}`, {
      method: 'PATCH',
      body: { name },
    })
  },

  async restoreFile(id: string): Promise<ApiFile> {
    return useApi<ApiFile>(`/api/files/${id}/restore`, {
      method: 'POST',
    })
  },

  async toggleFavorite(id: string): Promise<ApiFile> {
    return useApi<ApiFile>(`/api/files/${id}/favorite`, {
      method: 'POST',
    })
  },
}
