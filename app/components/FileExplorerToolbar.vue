<script setup lang="ts">
import type { BreadcrumbItem, ColumnDefinition } from '~/types/file'

const props = defineProps<{
    currentDirectory: string
    breadcrumbs: BreadcrumbItem[]
    readOnly: boolean
    hasItems: boolean
    isTrash: boolean
}>()

const emit = defineEmits<{
    upload: [files: File[]]
    createFolder: []
    move: [payload: { sourceIds: string[], targetId: string | null }]
}>()

const { t } = useI18n()
const fileInput = ref<HTMLInputElement | null>(null)

const { availableColumns, activeColumns, showColumnMenu, toggleColumn } = useFileColumns(toRef(props, 'isTrash'))

const handleTriggerUpload = () => {
    fileInput.value?.click()
}

const onFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return
    const files = Array.from(input.files)
    emit('upload', files)
    input.value = ''
}

const handleMoveFile = (payload: { sourceIds: string[], targetId: string | null }) => {
    emit('move', payload)
}
</script>

<template>
    <div class="flex items-center justify-between">
        <div class="self-start min-w-0 flex-1 mr-4">
            <h1
                class="text-4xl font-medium text-gray-900 dark:text-gray-100 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {{ currentDirectory }}
            </h1>
            <FileBreadcrumbs :items="breadcrumbs" class="-ml-1 -mb-1.5" @move="handleMoveFile" />
        </div>
        <div class="flex flex-col items-end justify-end gap-2 self-end">
            <div class="flex flex-row items-center gap-2">
                <input ref="fileInput" type="file" multiple class="hidden" @change="onFileChange" />
                <AppButton v-if="!readOnly" @click="handleTriggerUpload" rounded="rounded-xl" variant="white"
                    border-class="border border-gray-300" textColor="text-primary-700" :text-shadow="false"
                    icon="heroicons:cloud-arrow-up-solid">
                    {{ t('files.upload') }}
                </AppButton>
                <AppButton v-if="!readOnly" @click="emit('createFolder')" rounded="rounded-xl" color="green"
                    icon="heroicons:folder-plus-solid">
                    {{ t('files.newFolder') }}
                </AppButton>
            </div>

            <!-- Column Toggle -->
            <div v-if="hasItems || breadcrumbs.length > 1" class="relative z-20 float-right">
                <AppButton @click="showColumnMenu = !showColumnMenu" rounded="rounded-xl" variant="white"
                    icon="lucide:columns-3-cog" />

                <div v-if="showColumnMenu"
                    class="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-700 p-2 origin-top-right transition-all"
                    @click.stop>
                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2 py-1.5">
                        {{ t('files.columns.title') }}
                    </div>
                    <label v-for="col in availableColumns" :key="col.key"
                        class="flex items-center px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-md cursor-pointer">
                        <AppCheckbox :model-value="activeColumns.some((c: ColumnDefinition) => c.key === col.key)"
                            class="mr-3" @change="toggleColumn(col)" />
                        <span class="text-sm text-gray-700 dark:text-gray-300">{{ t(col.label) }}</span>
                    </label>
                    <div class="fixed inset-0 -z-10" @click="showColumnMenu = false"></div>
                </div>
            </div>
        </div>
    </div>
</template>
