<script setup lang="ts">
import type { BreadcrumbItem } from '~/types/file'
import FileBreadcrumbItem from './FileBreadcrumbItem.vue'

const props = defineProps<{
    items: BreadcrumbItem[]
    preventNavigation?: boolean
}>()

const emit = defineEmits<{
    (e: 'move', payload: { sourceIds: string[], targetId: string | null }): void
    (e: 'navigate', item: BreadcrumbItem): void
}>()

const handleClick = (event: MouseEvent, item: BreadcrumbItem) => {
    if (props.preventNavigation) {
        event.preventDefault()
        emit('navigate', item)
    }
}

const getPathForIndex = (index: number) => {
    if (index === 0) return undefined
    const path = props.items.slice(1, index + 1).map(item => item.name).join('/')
    return '/' + path
}

// Drag and Drop Logic
const dragOverIndex = ref<number | null>(null)

const onDragOver = (event: DragEvent, index: number) => {
    if (event.dataTransfer) {
        event.preventDefault()
        dragOverIndex.value = index
    }
}

const onDragLeave = (event: DragEvent) => {
    dragOverIndex.value = null
}

const onDrop = (event: DragEvent, item: BreadcrumbItem) => {
    dragOverIndex.value = null
    if (event.dataTransfer) {
        const rawData = event.dataTransfer.getData('text/plain')
        const targetId = item.id ?? null

        if (rawData) {
            let sourceIds: string[] = []
            try {
                const parsed = JSON.parse(rawData)
                if (Array.isArray(parsed)) {
                    sourceIds = parsed
                } else if (typeof parsed === 'string') {
                    sourceIds = [parsed]
                } else {
                    sourceIds = [rawData]
                }
            } catch (e) {
                sourceIds = [rawData]
            }

            if (targetId) {
                sourceIds = sourceIds.filter(id => id !== targetId);
            }

            if (sourceIds.length > 0) {
                emit('move', { sourceIds, targetId })
            }
        }
    }
}

const getItemTo = (item: BreadcrumbItem, index: number) => {
    if (!item.id && !item.path) return '/'
    return item.path
        ? item.path
        : { path: `/files/${item.id}`, query: { path: getPathForIndex(index) } }
}

// Auto-scroll logic
const scrollContainer = ref<HTMLElement | null>(null)

const scrollToEnd = () => {
    if (scrollContainer.value) {
        scrollContainer.value.scrollLeft = scrollContainer.value.scrollWidth
    }
}

watch(() => props.items, () => {
    nextTick(scrollToEnd)
}, { deep: true })

onMounted(() => {
    nextTick(scrollToEnd)
})
</script>

<template>
    <div ref="scrollContainer"
        class="flex flex-row items-center text-sm space-x-1.5 overflow-x-scroll overflow-y-hidden scrollbar-hide px-1 pb-2 max-w-full">
        <template v-for="(item, index) in items" :key="index">
            <!-- Separator -->
            <svg v-if="index > 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                class="w-3.5 h-3.5 text-gray-400 shrink-0">
                <path fill-rule="evenodd"
                    d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                    clip-rule="evenodd" />
            </svg>

            <!-- Refactored Item -->
            <FileBreadcrumbItem :item="item" :to="getItemTo(item, index)" :index="index"
                :is-last="items.length === index + 1 || (items.length === 1 && index === 0)"
                :is-drag-over="dragOverIndex === index" :prevent-navigation="preventNavigation" class="shrink-0"
                @dragover="onDragOver($event, index)" @dragleave="onDragLeave" @drop="onDrop($event, item)"
                @click="handleClick($event, item)" />
        </template>
    </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}
</style>
