<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { FileItem, BreadcrumbItem, FileIndexDTO } from '~/types/file'
import AppDialog from './AppDialog.vue'

const props = defineProps<{
    modelValue: boolean
    items: FileItem[]
    initialFolderId?: string | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'close'): void
    (e: 'moved', payload: { sourceIds: string[], targetId: string | null }): void
}>()

const { t } = useI18n()
const config = useRuntimeConfig()

// Local state for the dialog's file explorer
const currentFolderId = ref<string | null>(null)
const folders = ref<FileItem[]>([])
const breadcrumbs = ref<BreadcrumbItem[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Computed
const canMoveHere = computed(() => {
    // Can't move into itself or children (simple check: if only one item and it matches current folder)
    // Check that were not in same directory as the items we want to move
    if (props.items.some(item => item.id === currentFolderId.value)) return false
    if (props.items.some(item => item.parent.id === currentFolderId.value)) return false
    return true
})

const currentFolderName = computed(() => {
    if (!currentFolderId.value) return t('navigation.allFiles') // "root"
    const last = breadcrumbs.value[breadcrumbs.value.length - 1]
    return last ? last.name : t('navigation.allFiles')
})

const moveButtonLabel = computed(() => {
    return t('files.actions.move.button') + ` (${props.items.length})`
})

// Fetch folders only
const fetchFolders = async (parentId: string | null) => {
    isLoading.value = true
    error.value = null
    try {
        const apiBase = useApiBase()
        const data = await useApi<FileIndexDTO>(`${apiBase}/api/files`, {
            params: { parentID: parentId }
        })

        // We only want folders
        folders.value = data.files.filter((f: any) => f.isDirectory).map((f: any) => ({
            owner: {
                id: f.owner.id,
            },
            parent: {
                id: f.parent.id,
            },
            id: f.id,
            name: f.filename,
            type: 'folder',
            sizeBytes: f.size,
            lastModified: f.lastModified ? new Date(f.lastModified) : null,
            updatedAt: new Date(f.updatedAt),
            createdAt: new Date(f.createdAt),
            deletedAt: f.deletedAt ? new Date(f.deletedAt) : null,
            isFavorite: f.isFavorite,
            isShared: f.isShared,
            isRecent: f.isRecent,
        }))

        breadcrumbs.value = data.breadcrumbs || []
        currentFolderId.value = data.parentID || null

    } catch (e: any) {
        error.value = e.message || 'Failed to load folders'
    } finally {
        isLoading.value = false
    }
}

// Watchers
watch(() => props.modelValue, (val) => {
    if (val) {
        // Start at the current folder + 0 (reload) or props.initialFolderId
        fetchFolders(props.initialFolderId || null)
    }
})

// Actions
const navigateTo = (folderId: string | null) => {
    fetchFolders(folderId)
}


const onBreadcrumbNavigate = (item: BreadcrumbItem) => {
    navigateTo(item.id || null)
}

const handleMove = async () => {
    if (!canMoveHere.value) return
    emit('moved', { sourceIds: props.items.map(i => i.id), targetId: currentFolderId.value })
    emit('update:modelValue', false)
}

const close = () => {
    emit('update:modelValue', false)
    emit('close')
}
</script>

<template>
    <AppDialog :model-value="modelValue"
        :title="(items.length === 1 && items[0]?.type === 'folder') ? t('files.actions.move.folderTitle', items.length) : t('files.actions.move.fileTitle', items.length)"
        @update:model-value="emit('update:modelValue', $event)" @close="emit('close')">
        <div class="h-96 flex flex-col relative">
            <!-- Header / Navigation -->
            <div class="flex items-center gap-2 mb-3 border-b border-gray-100 dark:border-neutral-800 shrink-0">

                <div class="flex-1 overflow-hidden -ml-3 -mr-3">
                    <FileBreadcrumbs :items="breadcrumbs" class="px-3" prevent-navigation
                        @navigate="onBreadcrumbNavigate" />
                </div>
            </div>

            <!-- Folder List -->
            <div class="flex-1 overflow-y-auto min-h-0 space-y-1 relative">
                <!-- Loading Overlay to prevent layout shifts -->
                <div v-if="isLoading"
                    class="absolute inset-0 bg-white/50 dark:bg-neutral-900/50 z-10 flex items-start justify-center pt-10 backdrop-blur-sm transition-opacity duration-200">
                    <svg class="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                </div>


                <button v-for="folder in folders" :key="folder.id" @click="navigateTo(folder.id)"
                    class="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-neutral-800 transition-colors text-left group"
                    :class="{ 'opacity-50 cursor-not-allowed': props.items.some(i => i.id === folder.id) }"
                    :disabled="props.items.some(i => i.id === folder.id)">
                    <div class="flex items-center justify-center">
                        <FileIcon :file-type="folder.type"
                            class="text-gray-400! group-hover:text-primary-500! transition-colors!" />
                    </div>
                    <span class="text-sm text-gray-700 dark:text-gray-200 truncate font-medium">{{ folder.name }}</span>
                </button>

            </div>

            <div v-if="error" class="mt-2 text-xs text-red-500 text-center shrink-0">
                {{ error }}
            </div>
        </div>

        <template #footer>
            <div class="flex gap-3 w-full sm:w-auto">
                <AppButton variant="secondary" rounded="rounded-md" @click="close"
                    class="flex-1 sm:flex-none justify-center">
                    {{ t('common.cancel') }}
                </AppButton>
                <AppButton variant="primary" rounded="rounded-md" @click="handleMove"
                    :disabled="!canMoveHere || isLoading" class="flex-1 sm:flex-none justify-center">
                    {{ moveButtonLabel }}
                </AppButton>
            </div>
        </template>
    </AppDialog>
</template>
