<script setup lang="ts">
import type { FileItem, ColumnDefinition } from '~/types/file'

const props = defineProps<{
    items: FileItem[]
    columns: ColumnDefinition[]
    sortField: keyof FileItem
    sortDirection: 'asc' | 'desc'
    selectedFiles: Set<string>
    dropTargetId: string | null
    isExternalDragging: boolean
    readOnly: boolean
}>()

const emit = defineEmits<{
    toggleSort: [field: keyof FileItem]
    toggleSelectAll: []
    toggleSelection: [id: string]
    contextmenu: [event: MouseEvent, item: FileItem]
    open: [item: FileItem]
    dragstart: [event: DragEvent, item: FileItem]
    dragover: [event: DragEvent, item: FileItem]
    dragleave: []
    drop: [event: DragEvent, item: FileItem]
}>()

const { t } = useI18n()

const isAllSelected = computed(() => props.items.length > 0 && props.selectedFiles.size === props.items.length)
const isIndeterminate = computed(() => props.selectedFiles.size > 0 && props.selectedFiles.size < props.items.length)
</script>

<template>
    <div class="w-full relative">
        <table v-if="items.length > 0"
            class="min-w-full divide-y-0 border-separate border-spacing-y-1 bg-white dark:bg-neutral-800/80 rounded-2xl px-2 pb-1.25">
            <thead>
                <tr>
                    <!-- Static columns -->
                    <th scope="col" class="px-6 py-2 text-left w-10">
                        <AppCheckbox :model-value="isAllSelected" :indeterminate="isIndeterminate"
                            @change="emit('toggleSelectAll')" />
                    </th>

                    <th scope="col"
                        class="px-6 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 group select-none transition-colors duration-200"
                        @click="emit('toggleSort', 'name')">
                        <div class="flex items-center space-x-1">
                            <span>{{ t('files.columns.name') }}</span>
                            <span v-if="sortField === 'name'" class="text-primary-500">
                                {{ sortDirection === 'asc' ? '↑' : '↓' }}
                            </span>
                            <span v-else class="text-gray-300 opacity-0 group-hover:opacity-100">↕︎</span>
                        </div>
                    </th>

                    <!-- Dynamic columns -->
                    <th v-for="col in columns" :key="col.key" scope="col"
                        class="px-6 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 group select-none transition-colors duration-200"
                        :class="col.class" @click="col.sortable && emit('toggleSort', col.key)">
                        <div class="flex items-center justify-end space-x-1">
                            <span>{{ t(col.label) }}</span>
                            <span v-if="sortField === col.key" class="text-primary-500">
                                {{ sortDirection === 'asc' ? '↑' : '↓' }}
                            </span>
                            <span v-else-if="col.sortable"
                                class="text-gray-300 opacity-0 group-hover:opacity-100">↕︎</span>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <FileRow v-for="(item, index) in items" :key="item.id" :item="item" :columns="columns"
                    :selected="selectedFiles.has(item.id)" :is-drop-target="dropTargetId === item.id"
                    :is-first="index === 0" :is-last="index === items.length - 1"
                    @dragstart="emit('dragstart', $event, item)" @dragover="emit('dragover', $event, item)"
                    @dragleave="emit('dragleave')" @drop="emit('drop', $event, item)"
                    @toggle-select="emit('toggleSelection', item.id)" @contextmenu="emit('contextmenu', $event, item)"
                    @open="emit('open', item)" />
            </tbody>
        </table>
        <div v-else class="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-16 h-16 mb-4 opacity-50">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            <p class="text-lg font-medium">{{ t('files.empty') }}</p>
            <p v-if="!readOnly" class="text-sm">{{ t('files.dragAndDropHint') }}</p>
        </div>
        <div v-if="isExternalDragging"
            class="absolute inset-0 z-50 bg-primary-50/25 border-2 border-primary-500 border-dashed rounded-xl flex flex-col items-center justify-center pointer-events-none backdrop-blur-xs max-h-[calc(100vh-10rem)]">
            <p class="text-xl font-semibold text-primary-700">{{ t('files.dragAndDrop') }}</p>
        </div>
    </div>
</template>
