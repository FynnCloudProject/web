<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { Toast } from '~/composables/useToast'

const props = defineProps<{
    toast: Toast
    onClose: (id: string) => void
    duration?: number
}>()

const progress = ref(100)
const isHovered = ref(false)
let progressTimer: ReturnType<typeof setInterval> | null = null
let pausedProgress = 100

const config = computed(() => {
    const configs = {
        error: {
            icon: 'heroicons:exclamation-circle-20-solid',
            toastBg: 'bg-red-700',
            borderColor: 'border-red-200 dark:border-red-900/50',
            progressBg: 'bg-red-500 dark:bg-red-600',
            glowColor: 'shadow-red-500/20 dark:shadow-red-500/30',
        },
        success: {
            icon: 'heroicons:check-16-solid',
            toastBg: 'bg-green-700',
            borderColor: 'border-green-200 dark:border-green-900/50',
            progressBg: 'bg-green-500 dark:bg-green-600',
            glowColor: 'shadow-green-500/20 dark:shadow-green-500/30',
        },
        warning: {
            icon: 'mage:exclamation-square-fill',
            toastBg: 'bg-amber-500',
            borderColor: 'border-amber-200 dark:border-amber-900/50',
            progressBg: 'bg-amber-500 dark:bg-amber-600',
            glowColor: 'shadow-amber-500/20 dark:shadow-amber-500/30',
        },
        info: {
            icon: 'material-symbols:info-rounded',
            toastBg: 'bg-blue-700',
            borderColor: 'border-blue-200 dark:border-blue-900/50',
            progressBg: 'bg-blue-500 dark:bg-blue-600',
            glowColor: 'shadow-blue-500/20 dark:shadow-blue-500/30',
        },
    }
    return configs[props.toast.type]
})

const handleClose = () => {
    if (progressTimer) {
        clearInterval(progressTimer)
        progressTimer = null
    }
    props.onClose(props.toast.id)
}

const pauseProgress = () => {
    isHovered.value = true
    if (progressTimer) {
        clearInterval(progressTimer)
        progressTimer = null
        pausedProgress = progress.value
    }
}

const resumeProgress = () => {
    isHovered.value = false
    if (props.duration && props.duration > 0 && !progressTimer) {
        const interval = 50
        const decrement = (interval / props.duration) * 100

        progressTimer = setInterval(() => {
            progress.value -= decrement
            if (progress.value <= 0) {
                handleClose()
            }
        }, interval)
    }
}

onMounted(() => {
    if (props.duration && props.duration > 0) {
        const interval = 50
        const decrement = (interval / props.duration) * 100

        progressTimer = setInterval(() => {
            progress.value -= decrement
            if (progress.value <= 0) {
                handleClose()
            }
        }, interval)
    }
})

onUnmounted(() => {
    if (progressTimer) {
        clearInterval(progressTimer)
        progressTimer = null
    }
})
</script>

<template>
    <div class="toast-container flex items-stretch min-w-64 max-w-sm rounded-lg overflow-hidden transition-all duration-300 ease-out shadow-lg"
        :class="[
            config.toastBg,
        ]" @mouseenter="pauseProgress" @mouseleave="resumeProgress">
        <div class="flex-1 flex items-center gap-3 px-4 py-3 relative">
            <Icon :name="config.icon"
                class="w-5 h-5 shrink-0 relative z-10 text-white/90" />

            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium leading-snug break-words text-white">
                    {{ toast.message }}
                </p>
            </div>

            <button @click="handleClose"
                class="shrink-0 p-1 rounded-md hover:bg-white/15 active:bg-white/25 transition-colors duration-150 flex items-center justify-center active:scale-90"
                aria-label="Close notification">
                <Icon name="heroicons:x-mark" class="w-4 h-4 text-white/70 hover:text-white" />
            </button>
        </div>

        <!-- Progress bar at bottom -->
        <div v-if="duration" class="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10">
            <div class="h-full transition-all duration-100 ease-linear" :class="config.progressBg"
                :style="{
                    width: `${progress}%`,
                    opacity: isHovered ? 0.4 : 0.7
                }"></div>
        </div>
    </div>
</template>

<style scoped>
.toast-container {
    position: relative;
}
</style>