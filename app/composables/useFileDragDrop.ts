import type { FileItem } from '~/types/file'

export function useFileDragDrop(
  selectedFiles: Ref<Set<string>>,
  onMoveFiles: (sourceIds: string[], targetId: string) => Promise<void>,
  onDropFiles: (files: File[]) => Promise<void>
) {
  const draggingIds = ref<string[]>([])
  const dropTargetId = ref<string | null>(null)
  const dragGhostRef = ref<HTMLElement | null>(null)
  const isExternalDragging = ref(false)
  let dragCounter = 0

  const ghostData = ref<{
    name: string
    count: number
    type: FileItem['type']
  }>({
    name: '',
    count: 1,
    type: 'file' as FileItem['type']
  })

  const onRowDragStart = (event: DragEvent, item: FileItem) => {
    if (!event.dataTransfer) return
    let ids = [item.id]
    if (selectedFiles.value.has(item.id)) {
      ids = Array.from(selectedFiles.value)
    }
    draggingIds.value = ids
    ghostData.value = { name: item.name, count: ids.length, type: item.type }

    const data = JSON.stringify(ids)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', data)
    event.dataTransfer.setData('text/plain', data)

    nextTick(() => {
      if (dragGhostRef.value && event.dataTransfer) {
        event.dataTransfer.setDragImage(dragGhostRef.value, 0, 0)
      }
    })
  }

  const onRowDragOver = (event: DragEvent, targetItem: FileItem) => {
    if (isExternalDragging.value) return
    if (targetItem.type === 'folder' && !draggingIds.value.includes(targetItem.id)) {
      event.preventDefault()
      dropTargetId.value = targetItem.id
    }
  }

  const onRowDrop = async (event: DragEvent, targetItem: FileItem) => {
    dropTargetId.value = null

    if (targetItem.type !== 'folder') return

    const rawData = event.dataTransfer?.getData('application/json')
    if (rawData) {
      try {
        const sourceIds = JSON.parse(rawData) as string[]

        if (sourceIds.includes(targetItem.id)) return

        await onMoveFiles(sourceIds, targetItem.id)
      } catch (e) {
        console.error("Drop failed", e)
      }
    }

    draggingIds.value = []
  }

  const onGlobalDragEnter = (e: DragEvent, readOnly: boolean) => {
    if (readOnly || !e.dataTransfer?.types.includes('Files')) return
    dragCounter++
    isExternalDragging.value = true
  }

  const onGlobalDragLeave = () => {
    dragCounter--
    if (dragCounter <= 0) {
      isExternalDragging.value = false
      dragCounter = 0
    }
  }

  const onGlobalDrop = async (e: DragEvent, readOnly: boolean) => {
    isExternalDragging.value = false
    dragCounter = 0
    if (readOnly || !e.dataTransfer?.files) return
    const files = Array.from(e.dataTransfer.files)
    await onDropFiles(files)
  }

  return {
    draggingIds,
    dropTargetId,
    dragGhostRef,
    isExternalDragging,
    ghostData,
    onRowDragStart,
    onRowDragOver,
    onRowDrop,
    onGlobalDragEnter,
    onGlobalDragLeave,
    onGlobalDrop
  }
}
