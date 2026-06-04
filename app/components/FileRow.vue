<script setup lang="ts">
import type { FileItem, ColumnDefinition } from '~/types/file'
import FileIcon from './FileIcon.vue'

const { t, d, locale } = useI18n()
const { showUUIDs } = useDevConfig()
const router = useRouter()

const props = defineProps<{
    item: FileItem
    selected: boolean
    isDropTarget?: boolean
    isFirst?: boolean
    isLast?: boolean
    columns: ColumnDefinition[]
}>()

const emit = defineEmits<{
    (e: 'click', event: MouseEvent): void
    (e: 'toggle-select'): void
    (e: 'open'): void
    (e: 'dblclick', event: MouseEvent): void
    (e: 'contextmenu', event: MouseEvent): void
    // Simplified Drag events
    (e: 'dragstart', event: DragEvent): void
    (e: 'dragover', event: DragEvent): void
    (e: 'dragleave', event: DragEvent): void
    (e: 'drop', event: DragEvent): void
}>()

const cornerClasses = computed(() => [
    props.isFirst ? 'first:rounded-tl-xl' : 'first:rounded-tl-md',
    props.isLast ? 'first:rounded-bl-xl' : 'first:rounded-bl-md',
    props.isFirst ? 'last:rounded-tr-xl' : 'last:rounded-tr-md',
    props.isLast ? 'last:rounded-br-xl' : 'last:rounded-br-md'
])

const apiBase = useApiBase()
const thumbnailUrl = computed(() => {
    if (!props.item.hasThumbnail) return undefined
    return `${apiBase}/api/files/${props.item.id}/thumbnail`
})

const handleRowClick = (event: MouseEvent) => {
    emit('click', event)
    emit('open')
}

const rowBackgroundClasses = computed(() => {
    if (props.selected) {
        return 'bg-linear-to-b from-primary-500 to-primary-700 border-primary-500 shadow-[inset_0_2px_2px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.2)] dark:from-primary-800 dark:to-primary-900 dark:border-primary-800 dark:shadow-[inset_0_2px_2px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.2)]'
    }
    if (props.isDropTarget) {
        return 'bg-primary-50 dark:bg-primary-900/10 !border-primary-500 !border-y-2 first:!border-l-2 last:!border-r-2'
    }
    return [
        'bg-linear-to-b from-white to-gray-50',
        'dark:from-zinc-900 dark:to-zinc-950',
        'border-gray-200 dark:border-zinc-800',
        'group-hover:from-gray-50 group-hover:to-gray-100',
        'dark:group-hover:from-zinc-700 dark:group-hover:to-zinc-800', // Lighter gradient
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none',
        'dark:group-hover:border-zinc-600' // Lighter border on hover
    ].join(' ')
})

const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    try {
        const datePart = new Intl.DateTimeFormat(locale.value, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date)
        const timePart = new Intl.DateTimeFormat(locale.value, {
            hour: '2-digit',
            minute: '2-digit',
        }).format(date)
        return `${datePart}, ${timePart}`
    } catch (e) {
        return date.toLocaleDateString()
    }
}

const formatDisplayPath = (path: string) => {
    const rootName = t('navigation.all')
    if (!path || path === '/') return rootName
    const segments = path.split('/').filter(Boolean)
    return [rootName, ...segments].join(' › ')
}

const handlePathClick = (event: MouseEvent) => {
    event.stopPropagation()
    if (props.item.parent?.id) {
        router.push(`/files/${props.item.parent.id}`)
    } else {
        router.push('/files/')
    }
}
</script>
<template>
    <tr class="group transition-shadow duration-200 ease-out cursor-pointer relative"
        :class="{ 'drop-shadow-xs z-10': selected || isDropTarget, 'drop-shadow-xs hover:drop-shadow-sm': !selected }"
        draggable="true" @dragstart="emit('dragstart', $event)" @dragover="emit('dragover', $event)"
        @dragleave="emit('dragleave', $event)" @drop="emit('drop', $event)" @click="handleRowClick"
        @dblclick.prevent.stop="$emit('dblclick', $event)" @contextmenu.prevent.stop="$emit('contextmenu', $event)">

        <!-- Checkbox -->
        <td class="px-6 whitespace-nowrap w-10 transition-all duration-200 border-y first:border-l last:border-r"
            :class="[
                ...cornerClasses,
                rowBackgroundClasses,
                item.path ? 'py-2.5' : 'py-4'
            ]" @click.stop>
            <div class="flex items-center justify-center">
                <AppCheckbox size="md" :model-value="selected" :box-class="selected ? 'border-white' : ''"
                    class="relative z-10" @change="$emit('toggle-select')" />
            </div>
        </td>

        <!-- Name -->
        <td class="px-6 whitespace-nowrap transition-all duration-200 border-y first:border-l last:border-r" :class="[
            ...cornerClasses,
            rowBackgroundClasses,
            item.path ? 'py-2.5' : 'py-4'
        ]">
            <div class="flex items-center relative z-10">
                <div class="mr-4 shrink-0 transition-transform duration-200 flex items-center justify-center">
                    <FileIcon :file-type="item.type" :selected="selected" :thumbnail-url="thumbnailUrl" />
                </div>
                <div class="flex-1 min-w-0">
                    <span v-if="item.type === 'folder'" class="font-semibold truncate block text-base tracking-tight"
                        :class="selected ? 'text-white drop-shadow-md' : 'text-gray-800 dark:text-zinc-200 dark:group-hover:text-white'">
                        {{ item.name }}
                    </span>
                    <span v-else class="truncate block font-medium tracking-tight"
                        :class="selected ? 'text-primary-50 drop-shadow-md' : 'text-gray-700 dark:text-zinc-300 dark:group-hover:text-zinc-50'">
                        {{ item.name }}
                    </span>
                    <div v-if="item.path" class="flex items-center gap-1.5 mt-1 text-xs">
                        <span :class="selected ? 'text-primary-200' : 'text-gray-400 dark:text-zinc-500'"
                            class="font-normal select-none">in</span>
                        <div class="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all duration-200 cursor-pointer"
                            :class="selected
                                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                : 'bg-gray-150/60 dark:bg-zinc-800/60 border-gray-200/60 dark:border-zinc-700/60 text-gray-500 dark:text-zinc-400 hover:bg-gray-200/80 dark:hover:bg-zinc-700/80 hover:text-gray-700 dark:hover:text-zinc-200'"
                            @click="handlePathClick">
                            <span class="opacity-70 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                    class="w-3 h-3">
                                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                </svg>
                            </span>
                            <span class="truncate " :title="formatDisplayPath(item.path)">{{
                                formatDisplayPath(item.path) }}</span>
                        </div>
                    </div>
                    <span v-if="showUUIDs" class="truncate block text-[10px] font-mono opacity-60"
                        :class="selected ? 'text-primary-100' : 'text-gray-400 dark:text-zinc-500'">
                        {{ item.id }}
                    </span>
                </div>
            </div>
        </td>

        <!-- Dynamic Columns -->
        <td v-for="col in columns" :key="col.key"
            class="px-6 whitespace-nowrap text-sm text-right transition-all duration-300 border-y first:border-l last:border-r"
            :class="[
                col.class || '',
                ...cornerClasses,
                rowBackgroundClasses,
                selected ? 'text-primary-50' : 'text-gray-500  dark:group-hover:text-zinc-300',
                item.path ? 'py-2.5' : 'py-4'
            ]">
            <template v-if="col.type === 'size'">
                {{ item.type === 'folder' ? '-' : item.size }}
            </template>
            <template v-else-if="col.type === 'date'">
                {{ item[col.key] ? formatDate(item[col.key] as Date) : t('common.justNow') }}
            </template>
            <template v-else>
                {{ item[col.key] }}
            </template>
        </td>
    </tr>
</template>
