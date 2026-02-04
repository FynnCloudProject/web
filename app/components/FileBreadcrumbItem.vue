<script setup lang="ts">
import { resolveComponent } from 'vue'
import type { BreadcrumbItem } from '~/types/file'

const props = withDefaults(defineProps<{
    item: BreadcrumbItem
    to?: any
    index: number
    isLast: boolean
    isDragOver: boolean
    preventNavigation?: boolean
}>(), {
    preventNavigation: false
})

const emit = defineEmits<{
    (e: 'click', event: MouseEvent): void
    (e: 'dragover', event: DragEvent): void
    (e: 'dragleave', event: DragEvent): void
    (e: 'drop', event: DragEvent): void
}>()

const { t } = useI18n()

// Helper to determine if we should show the icon-only version
const isIconOnly = computed(() => {
    return !props.item.id && ((!props.item.labelKey || props.item.labelKey === 'navigation.allFiles') || props.item.icon)
})

// Shared class computations
const wrapperClasses = computed(() => [
    'group relative inline-flex items-center justify-center transition-all duration-150 ease-out active:scale-[0.98] rounded-full border border-gray-200 dark:border-transparent',
    isIconOnly.value ? 'px-1.5 py-1.5' : 'px-2.5 py-1',
    props.preventNavigation ? 'cursor-pointer' : ''
])

const backgroundClasses = computed(() => [
    'absolute inset-0 bg-linear-to-b shadow-[inset_0_2px_2px_rgba(255,255,255,0.3),0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-150 ease-out rounded-full',
    props.isLast
        ? `from-${props.item.color ?? 'primary'}-500 to-${props.item.color ?? 'primary'}-700 group-active:from-${props.item.color ?? 'primary'}-600 group-active:to-${props.item.color ?? 'primary'}-800`
        : 'from-white to-gray-200 dark:from-zinc-700 dark:to-zinc-900 group-active:from-gray-100 group-active:to-gray-300 dark:group-active:from-zinc-800 dark:group-active:to-zinc-900',
    props.isDragOver ? 'ring-2 ring-primary-500' : ''
])

const contentClasses = computed(() => [
    'relative z-10 flex items-center justify-center gap-2 transition-transform duration-150 ease-out',
    props.isLast ? 'text-white' : 'text-gray-900 dark:text-zinc-100',
    !isIconOnly.value ? 'font-sans font-medium tracking-tight drop-shadow-md' : ''
])

const componentType = computed(() => props.preventNavigation ? 'div' : resolveComponent('NuxtLink'))

const handleDragover = (e: DragEvent) => emit('dragover', e)
const handleDragleave = (e: DragEvent) => emit('dragleave', e)
const handleDrop = (e: DragEvent) => emit('drop', e)
const handleClick = (e: MouseEvent) => emit('click', e)
</script>

<template>
    <component :is="componentType" :to="!preventNavigation ? to : undefined" :class="wrapperClasses"
        :title="isIconOnly ? t('navigation.allFiles') : undefined" :draggable="false" @dragover="handleDragover"
        @dragleave="handleDragleave" @drop="handleDrop" @click="handleClick">
        <div :class="backgroundClasses"></div>

        <div :class="contentClasses">
            <template v-if="isIconOnly">
                <template v-if="item.icon">
                    <svg v-if="item.icon === 'clock'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor" class="w-4 h-4 drop-shadow-md">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg v-else-if="item.icon === 'star'" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                        class="w-4 h-4 drop-shadow-md pb-px fill-white">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.563.044.8.77.388 1.141l-4.114 3.733a.563.563 0 00-.182.557l1.102 5.396c.122.592-.519 1.055-1.02.766L12.001 18.66l-4.707 2.68c-.5.289-1.142-.174-1.02-.766l1.102-5.396a.563.563 0 00-.182-.557l-4.114-3.733c-.412-.37-.175-1.096.388-1.141l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                    <svg v-else-if="item.icon === 'share'" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 drop-shadow-md pr-px">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.287.696.287 1.093s-.107.77-.287 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186z" />
                    </svg>
                    <svg v-else-if="item.icon === 'trash'" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 drop-shadow-md">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </template>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    class="w-4 h-4 drop-shadow-md">
                    <path fill-rule="evenodd"
                        d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                        clip-rule="evenodd" />
                </svg>
            </template>
            <template v-else>
                {{ item.labelKey ? t(item.labelKey) : item.name }}
            </template>
        </div>
    </component>
</template>