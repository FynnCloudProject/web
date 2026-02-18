<script setup lang="ts">
const { uploads, removeUpload } = useUploads()
import FileIcon from './FileIcon.vue'

const isMinimized = ref(false)

const hasUploads = computed(() => uploads.value.length > 0)

const activeUploadsCount = computed(() =>
    uploads.value.filter(u => u.status === 'uploading' || u.status === 'processing').length
)
const completedCount = computed(() =>
    uploads.value.filter(u => u.status === 'completed').length
)
const errorCount = computed(() =>
    uploads.value.filter(u => u.status === 'error').length
)

const summaryText = computed(() => {
    if (activeUploadsCount.value > 0) {
        return `${activeUploadsCount.value} uploading`
    }
    const parts: string[] = []
    if (completedCount.value > 0) parts.push(`${completedCount.value} done`)
    if (errorCount.value > 0) parts.push(`${errorCount.value} failed`)
    return parts.join(' · ') || 'All complete'
})

const overallProgress = computed(() => {
    if (uploads.value.length === 0) return 0
    const total = uploads.value.filter(u => u.status !== 'error').reduce((sum, u) => sum + u.progress, 0)
    return Math.round(total / uploads.value.length)
})

const isAllComplete = computed(() =>
    uploads.value.length > 0 && uploads.value.every(u => u.status === 'completed' || u.status === 'error')
)

const toggleMinimize = () => {
    isMinimized.value = !isMinimized.value
}
</script>

<template>
    <Transition enter-active-class="transition ease-out duration-300" enter-from-class="translate-y-4 opacity-0"
        enter-to-class="translate-y-0 opacity-100" leave-active-class="transition ease-in duration-200"
        leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
        <div v-if="hasUploads" class="fixed bottom-5 right-5 w-95 rounded-xl overflow-hidden z-100
                   bg-white/90 backdrop-blur-xl
                   border border-black/6
                   shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)]
                   dark:bg-zinc-900/95 dark:border-white/[0.08]
                   dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]">
            <!-- Header -->
            <div class="px-3.5 py-2.5 flex justify-between items-center cursor-pointer select-none
                        hover:bg-black/2 dark:hover:bg-white/3 transition-colors duration-150" @click="toggleMinimize">
                <div class="flex items-center gap-2.5 min-w-0">
                    <Icon :name="isAllComplete ? 'heroicons:check-circle-solid' : 'heroicons:cloud-arrow-up-solid'"
                        class="shrink-0 w-5 h-5 transition-colors duration-200" :class="isAllComplete
                            ? 'text-emerald-500 dark:text-emerald-400'
                            : 'text-primary-500 dark:text-primary-400'" />
                    <div class="min-w-0">
                        <p class="text-[13px] font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                            {{ isAllComplete ? 'Uploads complete' : 'Uploading files' }}
                        </p>
                        <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5 tabular-nums">
                            {{ summaryText }}
                            <span v-if="!isAllComplete" class="text-gray-400 dark:text-gray-500">
                                · {{ overallProgress }}%
                            </span>
                        </p>
                    </div>
                </div>

                <Icon :name="isMinimized ? 'heroicons:chevron-up-20-solid' : 'heroicons:chevron-down-20-solid'"
                    class="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
            </div>

            <!-- Overall progress bar -->
            <div v-if="!isAllComplete" class="h-[2px] w-full bg-gray-100 dark:bg-white/5">
                <div class="h-full bg-primary-500 dark:bg-primary-400
                            transition-[width] duration-300 ease-out" :style="{ width: `${overallProgress}%` }" />
            </div>

            <!-- Upload List -->
            <div class="grid transition-[grid-template-rows] duration-300 ease-out"
                :class="isMinimized ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'">
                <div class="overflow-hidden">
                    <div class="overflow-y-auto max-h-72 divide-y divide-gray-100 dark:divide-white/5">
                        <div v-for="item in uploads" :key="item.id" class="group flex items-center gap-3 px-3.5 py-2.5">
                            <!-- File icon -->
                            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                        bg-gray-50 dark:bg-white/5">
                                <FileIcon :file-type="determineFileType(item.file)" class="w-4 h-4" />
                            </div>

                            <!-- File info -->
                            <div class="min-w-0 flex-1">
                                <p class="text-[13px] text-gray-800 dark:text-gray-200 truncate leading-tight"
                                    :title="item.name">
                                    {{ item.name }}
                                </p>
                                <p class="text-[11px] leading-tight mt-0.5 tabular-nums" :class="{
                                    'text-red-500 dark:text-red-400': item.status === 'error',
                                    'text-emerald-600 dark:text-emerald-400': item.status === 'completed',
                                    'text-gray-400 dark:text-gray-500': item.status === 'uploading' || item.status === 'processing'
                                }">
                                    <template v-if="item.status === 'error'">
                                        {{ $t(item.error || 'upload.error.unknown') }}
                                    </template>
                                    <template v-else-if="item.status === 'completed'">
                                        {{ $t('upload.state.completed') }}
                                    </template>
                                    <template v-else>
                                        {{ $t(`upload.state.${item.status}`, { progress: item.progress }) }}
                                    </template>
                                </p>

                                <!-- Per-item progress bar -->
                                <div v-if="item.status === 'uploading' || item.status === 'processing'"
                                    class="mt-1.5 w-full h-1 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                                    <div class="h-full rounded-full bg-primary-500/80 dark:bg-primary-400/80
                                                transition-[width] duration-300 ease-out"
                                        :style="{ width: `${item.progress}%` }" />
                                </div>
                            </div>

                            <!-- Dismiss button -->
                            <button v-if="item.status === 'error' || item.status === 'completed'"
                                @click.stop="removeUpload(item.id)" class="w-6 h-6 rounded-md flex items-center justify-center shrink-0
                                       text-gray-400 hover:text-gray-600 hover:bg-black/5
                                       dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-white/5
                                       opacity-0 group-hover:opacity-100 focus:opacity-100
                                       transition-all duration-150">
                                <Icon name="heroicons:x-mark-20-solid" class="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>
