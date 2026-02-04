import type { FileItem, BreadcrumbItem, ApiFile, FileIndexDTO } from '~/types/file'

const mapFiles = (rawFiles: ApiFile[]): FileItem[] => {
  return rawFiles.map(f => ({
    id: f.id,
    name: f.filename,
    type: determineFileType(f),
    size: f.isDirectory ? undefined : formatSize(f.size),
    sizeBytes: f.size,
    updatedAt: new Date(f.updatedAt),
    createdAt: new Date(f.createdAt),
    deletedAt: f.deletedAt ? new Date(f.deletedAt) : undefined,
    isFavorite: f.isFavorite,
    isShared: f.isShared,
    isRecent: f.isRecent,
  }))
}

export const useFiles = () => {
  // const config = useRuntimeConfig()
  const router = useRouter()
  const { fetchQuota } = useQuota()

  // Shared State
  const files = useState<FileItem[]>('files_list', () => [])
  const currentParentID = useState<string | null>('files_currentParentID', () => null)
  const breadcrumbs = useState<BreadcrumbItem[]>('files_breadcrumbs', () => [])
  
  // Shared UI State
  const isLoading = useState<boolean>('files_isLoading', () => false)
  const error = useState<string | null>('files_error', () => null)

  const executeFetch = async (endpoint: string, params: any = {}, customBreadcrumbs?: BreadcrumbItem[]) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await useApi<FileIndexDTO>(endpoint, { params })
      
      files.value = mapFiles(data.files)
      console.log('useFiles: Fetched files', files.value)
      currentParentID.value = data.parentID || null
      breadcrumbs.value = customBreadcrumbs || data.breadcrumbs || []
      
      return data
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'An error occurred'
      const status = e.statusCode || e.response?.status
      if (status === 404 || status === 403) router.push('/')
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const fetchFiles = (parentID: string | null = null) => 
    executeFetch('/api/files', parentID ? { parentID } : {})

  const fetchRecent = () => 
    executeFetch('/api/files/recent', {}, [{ name: 'Recent', labelKey: 'navigation.recentFiles', icon: 'clock', id: null, path: '/recent' }])

  const fetchFavorites = () => 
    executeFetch('/api/files/favorites', {}, [{ name: 'Favorites', labelKey: 'navigation.favoriteFiles', icon: 'star', id: null, path: '/favorites' }])

  const fetchShared = () => 
    executeFetch('/api/files/shared', {}, [{ name: 'Shared', labelKey: 'navigation.sharedFiles', icon: 'share', id: null, path: '/shared' }])

  const fetchTrash = () => 
    executeFetch('/api/files/trash', {}, [{ name: 'Trash', labelKey: 'navigation.trash', icon: 'trash', color: 'red', id: null, path: '/trash' }])

  const createFolder = async (name: string, parentID: string | null = currentParentID.value) => {
    await useApi(`/api/files/create-directory`, {
      method: 'POST',
      body: { name, parentID }
    })
  }

  const deleteFile = async (id: string) => {
    await useApi(`/api/files/${id}`, { method: 'DELETE' })
  }

  const deleteFiles = async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteFile(id)))
  }

  const deleteFilePermanently = async (id: string, shouldFetchQuota = true) => {
    await useApi(`/api/files/${id}/permanent-delete`, { method: 'DELETE' })
    if (shouldFetchQuota) fetchQuota()
  }

  const deleteFilesPermanently = async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteFilePermanently(id, false)))
    fetchQuota()
  }

  const moveFile = async (fileID: string, targetParentID: string | null) => {
    await useApi(`/api/files/move-file`, {
      method: 'POST',
      body: { fileID, parentID: targetParentID }
    })
  }

  const renameFile = async (id: string, name: string) => {
    await useApi(`/api/files/${id}`, {
      method: 'PATCH',
      body: { name }
    })
  }

  const restoreFile = async (id: string) => {
    await useApi(`/api/files/${id}/restore`, { method: 'POST' })
  }

  const toggleFavorite = async (id: string) => {
    const apiBase = useApiBase()
    await useApi(`${apiBase}/api/files/${id}/favorite`, { method: 'POST' })
  }

  return {
    // State
    files,
    currentParentID,
    breadcrumbs,
    isLoading,
    error,
    
    // Actions
    fetchFiles,
    fetchRecent,
    fetchFavorites,
    fetchShared,
    fetchTrash,
    createFolder,
    deleteFile,
    deleteFiles,
    moveFile,
    renameFile,
    restoreFile,
    deleteFilePermanently,
    deleteFilesPermanently,
    toggleFavorite
  }
}