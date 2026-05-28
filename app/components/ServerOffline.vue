<script setup lang="ts">
const { t } = useI18n()
const { initAppConfig, isOffline, lastOnlineAt } = useBackEndConfig()
const isLoading = ref(false)
const hasFailed = ref(false)

const timeSinceLastOnline = computed(() => {
    if (!lastOnlineAt.value) return null
    const diff = Date.now() - lastOnlineAt.value
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return t('error.offline.justNow', 'Just now')
    if (minutes < 60) return t('error.offline.minutesAgo', { n: minutes }, '{n} min ago')
    const hours = Math.floor(minutes / 60)
    return t('error.offline.hoursAgo', { n: hours }, '{n}h ago')
})

const retry = async () => {
    if (isLoading.value) return

    isLoading.value = true
    hasFailed.value = false

    await initAppConfig()

    if (isOffline.value) {
        hasFailed.value = true
    }

    isLoading.value = false
}
</script>

<template>
    <AuthCard :title="$t('error.serverOffline', 'Server Offline')">
        <div class="space-y-4">
            <div class="w-full bg-white/5 rounded-xl border border-white/10 p-5 flex flex-col gap-4">
                <!-- Status icon and message -->
                <div class="flex items-start gap-4">
                    <div class="p-2.5 bg-red-500/10 rounded-lg ring-1 ring-red-500/20 ring-inset shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-5 h-5 text-red-400">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                    </div>

                    <div class="flex flex-col pt-0.5 space-y-1.5">
                        <p class="text-zinc-200 text-sm font-medium">
                            {{ $t('error.serverUnreachable', 'Unable to connect to FynnCloud') }}
                        </p>
                        <p class="text-zinc-400 text-xs leading-relaxed">
                            {{ $t('error.offline.description', 'Please check your internet connection or try again later.') }}
                        </p>
                    </div>
                </div>

                <!-- Retry failed notice -->
                <Transition enter-active-class="transition duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1">
                    <div v-if="hasFailed"
                        class="flex items-center gap-2 px-3 py-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                        <svg class="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <p class="text-red-400 text-xs">
                            {{ $t('error.offline.stillUnable', 'Still unable to connect. Please try again.') }}
                        </p>
                    </div>
                </Transition>
            </div>

            <div class="pt-1">
                <AppButton block variant="white" :loading="isLoading" @click="retry">
                    {{ $t('action.retryConnection', 'Retry Now') }}
                </AppButton>
            </div>
        </div>
    </AuthCard>
</template>