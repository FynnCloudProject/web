<script setup lang="ts">
const { uploads, removeUpload } = useUploads()
import FileIcon from './FileIcon.vue'

// Use local state for minimized/expanded view to be less intrusive
const isMinimized = ref(false)

// Ref for the content container to measure actual height
const contentRef = ref<HTMLElement | null>(null)
const contentHeight = ref(0)

// Computed property to only show uploads if there are any
const hasUploads = computed(() => uploads.value.length > 0)

const activeUploadsCount = computed(() => uploads.value.filter(u => u.status === 'uploading' || u.status === 'processing').length)
const summaryText = computed(() => {
    if (activeUploadsCount.value > 0) {
        return `Uploading ${activeUploadsCount.value} file${activeUploadsCount.value > 1 ? 's' : ''}...`
    }
    return 'Uploads completed'
})

const toggleMinimize = () => {
    isMinimized.value = !isMinimized.value
}

const updateHeight = () => {
    if (contentRef.value) {
        contentHeight.value = contentRef.value.scrollHeight
    }
}

// Watch for changes in uploads to update height
watch(uploads, () => {
    nextTick(updateHeight)
}, { deep: true })

onMounted(() => {
    nextTick(updateHeight)
})

const formatSpeed = (bytesPerSecond: number) => {
    if (bytesPerSecond === 0) return '0 B/s'
    const units = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(1024))
    return `${(bytesPerSecond / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}
</script>

<template>
    <Transition enter-active-class="transform transition ease-in-out duration-300"
        enter-from-class="translate-y-10 opacity-0 scale-95" enter-to-class="translate-y-0 opacity-100 scale-100"
        leave-active-class="transform transition ease-in-out duration-300"
        leave-from-class="translate-y-0 opacity-100 scale-100" leave-to-class="translate-y-10 opacity-0 scale-95">
        <div v-if="hasUploads"
            class="fixed bottom-6 right-6 w-96 backdrop-blur-xl bg-white/90 shadow-2xl rounded-2xl border border-gray-200 overflow-hidden z-100 dark:bg-zinc-900/95 dark:border-white/10 dark:shadow-black/50">

            <!-- Header -->
            <div class="px-4 py-3 border-b border-gray-100/50 flex justify-between items-center bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-colors dark:bg-zinc-800/50 dark:border-white/5 dark:hover:bg-zinc-800"
                @click="toggleMinimize">
                <div class="flex items-center gap-2.5">
                    <div
                        class="p-1.5 rounded-full bg-primary-50 text-primary-600 dark:bg-zinc-700 dark:text-primary-400">
                        <!-- Cloud Arrow Up Icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                            <path fill-rule="evenodd"
                                d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="font-semibold text-sm text-gray-900 leading-tight dark:text-gray-100">Uploads</h3>
                        <p v-if="isMinimized" class="text-xs text-gray-500 leading-tight dark:text-gray-400">{{
                            summaryText }}</p>
                    </div>
                </div>
                <button type="button"
                    class="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 transition-colors dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-zinc-700/50">
                    <svg v-if="!isMinimized" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                        class="w-5 h-5 transition-transform duration-300">
                        <path fill-rule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clip-rule="evenodd" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                        class="w-5 h-5 transition-transform duration-300">
                        <path fill-rule="evenodd"
                            d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>

            <!-- Upload List with improved height transition -->
            <div class="transition-all duration-300 ease-in-out overflow-hidden"
                :style="{ maxHeight: isMinimized ? '0px' : `${Math.min(contentHeight, 320)}px` }">
                <div ref="contentRef" class="overflow-y-scroll custom-scrollbar">
                    <TransitionGroup enter-active-class="transition ease-in-out duration-300"
                        enter-from-class="opacity-0 translate-x-4" enter-to-class="opacity-100 translate-x-0"
                        leave-active-class="transition ease-in-out duration-300"
                        leave-from-class="opacity-100 translate-x-0" leave-to-class="opacity-0 translate-x-4"
                        @after-enter="updateHeight" @after-leave="updateHeight">

                        <div v-for="item in uploads" :key="item.id"
                            class="p-4 border-b border-gray-100/50 last:border-0 hover:bg-gray-50/50 transition-colors group relative dark:border-white/5 dark:hover:bg-zinc-800/30">

                            <div class="flex justify-between items-start mb-2">
                                <div class="flex items-center gap-3 overflow-hidden">
                                    <!-- File Icon -->
                                    <div
                                        class="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 dark:bg-zinc-800 dark:border-zinc-700">
                                        <FileIcon :file-type="determineFileType(item.file)" />
                                    </div>
                                    <div class="min-w-0">
                                        <p class="text-sm font-medium text-gray-900 truncate dark:text-gray-200"
                                            :title="item.name">
                                            {{ item.name }}
                                        </p>
                                        <p class="text-xs transition-colors duration-300" :class="{
                                            'text-red-500 font-medium dark:text-red-400': item.status === 'error',
                                            'text-green-600 font-medium dark:text-green-400': item.status === 'completed',
                                            'text-primary-600 font-medium dark:text-primary-400': ['uploading', 'processing'].includes(item.status)
                                        }">
                                            <template v-if="item.status === 'error'">
                                                {{ $t(item.error || 'upload.error.unknown') }}
                                            </template>
                                            <template v-else>
                                                {{ $t(`upload.state.${item.status}`, { progress: item.progress }) }}
                                                <span
                                                    v-if="['uploading'].includes(item.status) && item.speed && item.speed > 0"
                                                    class="opacity-75">
                                                    • {{ formatSpeed(item.speed) }}
                                                </span>
                                            </template>
                                        </p>
                                    </div>
                                </div>

                                <button v-if="item.status === 'error' || item.status === 'completed'"
                                    @click.stop="removeUpload(item.id)"
                                    class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-zinc-700/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                        class="w-4 h-4">
                                        <path
                                            d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                    </svg>
                                </button>
                            </div>

                            <!-- Progress Bar -->
                            <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden dark:bg-zinc-800">
                                <div class="h-full rounded-full transition-all duration-300 ease-in-out relative"
                                    :class="{
                                        'bg-red-500 dark:bg-red-500': item.status === 'error',
                                        'bg-green-500 dark:bg-green-500': item.status === 'completed',
                                        'bg-gradient-to-r from-primary-400 to-primary-600': item.status === 'uploading' || item.status === 'processing'
                                    }" :style="{ width: `${item.progress}%` }">
                                    <div v-if="item.status === 'uploading' || item.status === 'processing'"
                                        class="absolute inset-0 bg-white/20 animate-pulse">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TransitionGroup>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
/* Optional: Improve scrollbar appearance locally for this component */
.custom-scrollbar::-webkit-scrollbar {
    width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.5);
}

@media (prefers-color-scheme: dark) {
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
}

:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
}

:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.2);
}
</style>