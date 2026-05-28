<script setup lang="ts">
const { initAppConfig, isOffline } = useBackEndConfig()
const isRetrying = ref(false)

const retry = async () => {
    isRetrying.value = true
    await initAppConfig()
    isRetrying.value = false
}
</script>

<template>
    <Teleport to="body">
        <Transition enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2">
            <div v-if="isOffline"
                class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 bg-red-700 rounded-lg shadow-lg min-w-64 max-w-sm">
                <Icon name="heroicons:wifi" class="w-5 h-5 shrink-0 text-white/90" />

                <p class="flex-1 text-sm font-medium text-white">
                    {{ $t('error.offline.banner', 'Connection lost') }}
                </p>

                <button @click="retry" :disabled="isRetrying"
                    class="shrink-0 p-1 rounded-md hover:bg-white/15 active:bg-white/25 transition-colors duration-150 flex items-center justify-center active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Icon v-if="isRetrying" name="heroicons:arrow-path-20-solid"
                        class="w-4 h-4 text-white/70 animate-spin" />
                    <Icon v-else name="heroicons:arrow-path-20-solid" class="w-4 h-4 text-white/70 hover:text-white" />
                </button>
            </div>
        </Transition>
    </Teleport>
</template>
