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
                    border-class="border border-gray-300" textColor="text-primary-700" :text-shadow="false">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                            <path fill-rule="evenodd"
                                d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
                                clip-rule="evenodd" />
                        </svg>
                        {{ t('files.upload') }}
                    </div>
                </AppButton>
                <AppButton v-if="!readOnly" @click="emit('createFolder')" rounded="rounded-xl" color="green">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                            <path fill-rule="evenodd"
                                d="M19.5 21a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-5.379a.75.75 0 0 1-.53-.22L11.47 3.66A2.25 2.25 0 0 0 9.879 3H4.5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h15Zm-6.75-10.5a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V10.5Z"
                                clip-rule="evenodd" />
                        </svg>
                        {{ t('files.newFolder') }}
                    </div>
                </AppButton>
            </div>

            <!-- Column Toggle -->
            <div v-if="hasItems || breadcrumbs.length > 1" class="relative z-20 float-right">
                <AppButton @click="showColumnMenu = !showColumnMenu" rounded="rounded-xl" variant="white" class="px-3!">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="size-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z" />
                    </svg>
                </AppButton>

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
