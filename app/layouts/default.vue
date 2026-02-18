<script setup lang="ts">
const { isVisible, playerHeight } = useAudioPlayer()
const { fetchQuota } = useQuota()
const isSSR = ref(false)
const isDev = import.meta.env.DEV
const { primaryColor } = useTheme()
if (import.meta.server) {
  isSSR.value = true
}



const route = useRoute()
const { closeSidebar, isSidebarOpen } = useUI()

watch(() => route.path, () => {
  closeSidebar()
})

onMounted(() => {
  fetchQuota()
})
</script>

<template>
  <div
    class="flex flex-col gap-0 space-0 h-screen overflow-hidden bg-gray-100 text-gray-900 font-sans dark:bg-zinc-950 dark:text-zinc-100">
    <AppHeader />
    <div class="flex flex-1 overflow-hidden">

      <aside class="w-64 shrink-0 overflow-y-auto hidden md:block ">
        <AppSidebar />
      </aside>


      <div class="relative z-50 md:hidden">
        <Transition enter-active-class="transition-opacity ease-linear duration-300" enter-from-class="opacity-0"
          enter-to-class="opacity-100" leave-active-class="transition-opacity ease-linear duration-300"
          leave-from-class="opacity-100" leave-to-class="opacity-0">
          <div v-if="isSidebarOpen" class="fixed inset-0 bg-gray-900/80" @click="closeSidebar()"></div>
        </Transition>

        <Transition enter-active-class="transition ease-in-out duration-300 transform"
          enter-from-class="-translate-x-full" enter-to-class="translate-x-0"
          leave-active-class="transition ease-in-out duration-300 transform" leave-from-class="translate-x-0"
          leave-to-class="-translate-x-full">
          <div v-if="isSidebarOpen" class="fixed inset-0 flex">
            <div class="relative mr-16 flex w-full max-w-xs flex-1">
              <Transition enter-active-class="ease-in-out duration-300" enter-from-class="opacity-0"
                enter-to-class="opacity-100" leave-active-class="ease-in-out duration-300"
                leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="isSidebarOpen" class="absolute top-0 left-full flex w-16 justify-center pt-5">
                  <button type="button" class="-m-2.5 p-2.5" @click="closeSidebar()">
                    <span class="sr-only">Close sidebar</span>
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </Transition>
              <div class="flex flex-col h-full w-full overflow-y-auto bg-white">
                <AppSidebar />
              </div>
            </div>
          </div>
        </Transition>
      </div>


      <div class="relative flex-1 min-w-0 flex flex-col">
        <!-- The below is ugly as fuck -->
        <main class="flex-1 overflow-y-auto transition-all duration-300"
          :style="{ paddingBottom: `${playerHeight == 0 ? '0.5rem' : playerHeight + 12}px` }">
          <slot />
        </main>
        <AppAudioPlayer />
        <AppPdfViewer />
        <AppVideoPlayer />
        <AppImageViewer />
      </div>
    </div>
    <UploadProgress />
    <!-- Show primary color
    <div class="fixed bottom-0 right-0 z-50">
      <div class="flex items-center justify-center p-8">
        <p class="text-4xl font-thin text-gray-600 dark:text-gray-200 capitalize">{{ primaryColor }}</p>
      </div>
    </div>
 -->
  </div>
</template>
