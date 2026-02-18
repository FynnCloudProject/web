<script setup lang="ts">
import type { FileItem, BreadcrumbItem } from '~/types/file'

const props = withDefaults(defineProps<{
  path: string[]
  items?: FileItem[]
  readOnly?: boolean
  isTrash?: boolean | false
  refresh?: () => Promise<any>
  breadcrumbs?: BreadcrumbItem[]
}>(), {
  readOnly: false,
  isTrash: false,
  breadcrumbs: () => []
})

const { uploadFile } = useUploads()
const { openFile } = useFileHandlers()
const { createFolder, deleteFiles, deleteFilesPermanently, renameFile, moveFile, restoreFile, getDeleteDescription } = useFiles()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { toast } = useToast()


const currentItems = computed(() => Array.isArray(props.items) ? props.items : [])
const { selectedFiles, isAllSelected, isIndeterminate, toggleSelection, toggleSelectAll, clearSelection } = useFileSelection()
const { sortField, sortDirection, sortedItems, toggleSort } = useFileSorting(currentItems)
const { activeColumns } = useFileColumns(toRef(props, 'isTrash'))
const {
  dragGhostRef,
  isExternalDragging,
  ghostData,
  dropTargetId,
  onRowDragStart,
  onRowDragOver,
  onRowDrop,
  onGlobalDragEnter,
  onGlobalDragLeave,
  onGlobalDrop
} = useFileDragDrop(
  selectedFiles,
  async (sourceIds: string[], targetId: string) => {
    await handleMoveFile({ sourceIds, targetId })
  },
  async (files: File[]) => {
    await Promise.all(files.map(file => uploadFile(file, currentFolderID.value)))
    await refreshCurrentView()
  }
)


const activeItems = ref<FileItem[]>([])
const isDeleting = ref(false)


const showCreateFolderModal = ref(false)
const showDeleteConfirm = ref(false)
const showRenameModal = ref(false)
const showMoveDialog = ref(false)


const newFolderName = ref('')
const renameName = ref('')
const renameExtension = ref('')


const currentFolderID = computed(() => props.path[props.path.length - 1] || null)
const currentDirectory = computed(() => {
  const lastItem = props.breadcrumbs?.[props.breadcrumbs.length - 1]
  if (lastItem?.labelKey) return t(lastItem.labelKey)
  if (lastItem && !lastItem.id && !lastItem.labelKey) return t('navigation.allFiles')
  return lastItem?.name || t('navigation.allFiles')
})

const deleteDescription = computed(() => getDeleteDescription(activeItems.value, props.isTrash))
const deleteTitle = computed(() => props.isTrash ? t('files.actions.deletePermanent.title') : t('files.actions.delete.title'))
const deleteConfirmLabel = computed(() => props.isTrash ? t('files.actions.deletePermanent.button') : t('files.actions.delete.button'))

const refreshCurrentView = async () => props.refresh && await props.refresh()


const handleUploadFiles = async (files: File[]) => {
  await Promise.all(files.map(file => uploadFile(file, currentFolderID.value)))
  await refreshCurrentView()
}


const openCreateFolderModal = () => {
  newFolderName.value = ''
  showCreateFolderModal.value = true
}

const handleCreateFolder = async () => {
  if (!newFolderName.value) return
  try {
    await createFolder(newFolderName.value, currentFolderID.value)
    showCreateFolderModal.value = false
  } catch (e: any) {
    toast.error(
      e?.data?.localizationKey ? t(e.data.localizationKey) : t('files.alerts.createFolderFailed')
    )
  }
}


const openDeleteConfirm = (item?: FileItem) => {
  activeItems.value = item ? [item] : currentItems.value.filter(i => selectedFiles.value.has(i.id))
  if (activeItems.value.length > 0) showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  isDeleting.value = true
  try {
    const ids = activeItems.value.map(i => i.id)
    if (props.isTrash) {
      await deleteFilesPermanently(ids)
    } else {
      await deleteFiles(ids)
    }
    clearSelection()
    showDeleteConfirm.value = false
  } catch (e) {
    toast.error(t('files.error.deleteFailed'))
  } finally {
    isDeleting.value = false
    activeItems.value = []
  }
}


const startRename = async (item: FileItem) => {
  activeItems.value = [item]
  const parts = item.name.split('.')
  const isFolder = item.type === 'folder'
  renameExtension.value = (!isFolder && parts.length > 1) ? parts.pop()! : ''
  renameName.value = !isFolder ? parts.join('.') : item.name
  showRenameModal.value = true
}

const handleRename = async () => {
  const item = activeItems.value[0]
  if (!item || !renameName.value) return
  try {
    const fullName = renameExtension.value ? `${renameName.value}.${renameExtension.value}` : renameName.value
    await renameFile(item.id, fullName)
    showRenameModal.value = false
  } catch (e) {
    toast.error(t('files.alerts.renameFailed'))
  }
}


const handleRestore = async (item?: FileItem) => {
  const targets = item ? [item] : currentItems.value.filter(i => selectedFiles.value.has(i.id))
  try {
    await Promise.all(targets.map(t => restoreFile(t.id)))
    clearSelection()
  } catch (e) {
    toast.error(t('files.error.restoreFailed'))
  }
}


const handleMoveFile = async (payload: { sourceIds: string[], targetId: string | null }) => {
  if (payload.sourceIds.length === 0) return
  try {
    await Promise.all(payload.sourceIds.map(id => moveFile(id, payload.targetId)))
    clearSelection()
  } catch (e) {
    toast.error(t('files.alerts.moveFailed'))
  }
}

const openMoveDialog = (item?: FileItem) => {
  activeItems.value = item ? [item] : currentItems.value.filter(i => selectedFiles.value.has(i.id))
  if (activeItems.value.length > 0) showMoveDialog.value = true
}


const handleDownloadFile = async (item: FileItem) => {
  try {
    const apiBase = useApiBase()
    const url = `${apiBase}/api/files/${item.id}/download`
    const link = document.createElement('a')
    link.href = url
    link.download = item.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (e) {
    toast.error(t('files.error.downloadFailed'))
  }
}


const contextMenuRef = ref()
const handleContextMenu = (event: MouseEvent, item: FileItem) => contextMenuRef.value?.open(event, item)

const handleContextMenuAction = (action: string, item: FileItem) => {
  if (!item) return
  switch (action) {
    case 'open': openFile(item, sortedItems.value); break
    case 'download': handleDownloadFile(item); break
    case 'move-to-recycle-bin': openDeleteConfirm(item); break
    case 'restore': handleRestore(item); break
    case 'delete-permanently': openDeleteConfirm(item); break
    case 'rename': startRename(item); break
    case 'move': openMoveDialog(item); break
  }
}


watch(() => props.breadcrumbs, (newVal) => {
  if (!newVal || newVal.length <= 1) return
  const pathString = '/' + newVal.filter(i => i.id !== null).map(i => i.name).join('/')
  if (route.query.path !== pathString) router.replace({ query: { ...route.query, path: pathString } })
}, { immediate: true })
</script>

<template>
  <div class="space-y-2 relative min-h-125 p-2" @dragenter.prevent="(e) => onGlobalDragEnter(e, readOnly)"
    @dragover.prevent @dragleave.prevent="onGlobalDragLeave" @drop.prevent="(e) => onGlobalDrop(e, readOnly)">

    <FileExplorerToolbar :current-directory="currentDirectory" :breadcrumbs="breadcrumbs" :read-only="readOnly"
      :has-items="currentItems.length > 0" :is-trash="isTrash" @upload="(files: File[]) => handleUploadFiles(files)"
      @create-folder="openCreateFolderModal" @move="handleMoveFile" />

    <FileExplorerTable :items="sortedItems" :columns="activeColumns" :sort-field="sortField"
      :sort-direction="sortDirection" :selected-files="selectedFiles" :drop-target-id="dropTargetId"
      :is-external-dragging="isExternalDragging" :read-only="readOnly" @toggle-sort="toggleSort"
      @toggle-select-all="toggleSelectAll(currentItems)" @toggle-selection="toggleSelection"
      @contextmenu="handleContextMenu" @open="handleContextMenuAction('open', $event)" @dragstart="onRowDragStart"
      @dragover="onRowDragOver" @dragleave="dropTargetId = null" @drop="onRowDrop" />


    <Teleport to="body">
      <div class="fixed -top-96 left-0 z-50 pointer-events-none p-3  shadow-lg">
        <div ref="dragGhostRef"
          class="flex items-center gap-3 bg-white dark:bg-neutral-800 dark:text-neutral-200 p-1 rounded-xl border border-black/5 dark:border-neutral-700 w-56">
          <div class="shrink-0 p-1.5 bg-primary-50 dark:bg-zinc-900 rounded-md">
            <div v-if="ghostData.count > 1"
              class="w-8 h-8 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded font-bold">
              {{ ghostData.count }}
            </div>
            <FileIcon v-else :file-type="ghostData.type" class="w-8 h-8" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-gray-900 dark:text-neutral-200 truncate">
              {{ ghostData.count > 1 ? t('files.drag.multiple', { count: ghostData.count }) : ghostData.name }}
            </p>
          </div>
        </div>
      </div>
    </Teleport>

    <FileExplorerModals v-model:show-create-folder="showCreateFolderModal" v-model:show-rename="showRenameModal"
      v-model:show-delete="showDeleteConfirm" v-model:show-move="showMoveDialog" v-model:new-folder-name="newFolderName"
      v-model:rename-name="renameName" :rename-extension="renameExtension" :delete-title="deleteTitle"
      :delete-description="deleteDescription" :delete-confirm-label="deleteConfirmLabel" :is-deleting="isDeleting"
      :active-items="activeItems" :current-folder-id="currentFolderID" @create-folder="handleCreateFolder"
      @rename="handleRename" @delete="confirmDelete" @moved="handleMoveFile" />

    <files-context-menu ref="contextMenuRef" @action="handleContextMenuAction" />

    <FileExplorerActionBar :selected-count="selectedFiles.size" :is-trash="isTrash" @restore="handleRestore()"
      @move="openMoveDialog()" @delete="openDeleteConfirm()" @clear-selection="clearSelection" />
  </div>
</template>
