import type { FileItem } from '~/types/file'

export function useFileSelection() {
  const selectedFiles = ref<Set<string>>(new Set())

  const isAllSelected = (items: FileItem[]) => {
    return items.length > 0 && selectedFiles.value.size === items.length
  }

  const isIndeterminate = (items: FileItem[]) => {
    return selectedFiles.value.size > 0 && selectedFiles.value.size < items.length
  }

  const toggleSelection = (id: string) => {
    if (selectedFiles.value.has(id)) {
      selectedFiles.value.delete(id)
    } else {
      selectedFiles.value.add(id)
    }
  }

  const toggleSelectAll = (items: FileItem[]) => {
    if (isAllSelected(items)) {
      selectedFiles.value.clear()
    } else {
      items.forEach(item => selectedFiles.value.add(item.id))
    }
  }

  const clearSelection = () => {
    selectedFiles.value.clear()
  }

  return {
    selectedFiles,
    isAllSelected,
    isIndeterminate,
    toggleSelection,
    toggleSelectAll,
    clearSelection
  }
}
