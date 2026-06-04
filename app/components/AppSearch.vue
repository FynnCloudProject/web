<script setup lang="ts">
const router = useRouter()
const route = useRoute()

const searchInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Sync input with URL query on mount (e.g. when navigating back to search page)
onMounted(() => {
    if (route.path === '/search' && route.query.q) {
        searchQuery.value = route.query.q as string
    }
    window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    if (debounceTimer) clearTimeout(debounceTimer)
})

const handleKeydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInput.value?.focus()
    }
    if (e.key === 'Escape' && document.activeElement === searchInput.value) {
        clearSearch()
    }
}

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    searchQuery.value = target.value

    if (debounceTimer) clearTimeout(debounceTimer)

    if (!target.value.trim()) {
        // If cleared, navigate back to files
        if (route.path === '/search') {
            router.push('/files/')
        }
        return
    }

    debounceTimer = setTimeout(() => {
        router.push({ path: '/search', query: { q: target.value.trim() } })
    }, 300)
}

const clearSearch = () => {
    searchQuery.value = ''
    searchInput.value?.blur()
    if (route.path === '/search') {
        router.push('/files/')
    }
}

// Keep input in sync when navigating away from search
watch(() => route.path, (path) => {
    if (path !== '/search') {
        searchQuery.value = ''
    }
})
</script>

<template>
    <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                class="w-4 h-4 text-gray-400 group-focus-within:text-primary-600 dark:text-gray-500 dark:group-focus-within:text-primary-400 transition-colors">
                <path fill-rule="evenodd"
                    d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                    clip-rule="evenodd" />
            </svg>
        </div>
        <input ref="searchInput" type="text" :value="searchQuery" :placeholder="$t('search.placeholder', 'Search files...')"
            class="block w-full rounded-xl border-none bg-gray-100/80 dark:bg-neutral-800/80 input-3d py-2 pl-10 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:bg-white dark:focus:bg-neutral-800 dark:focus:ring-primary-500/30 transition-all duration-200"
            @input="handleInput" />
        <div class="absolute inset-y-0 right-0 pr-2 flex items-center"
            :class="searchQuery ? 'cursor-pointer' : 'pointer-events-none'">
            <!-- Clear button when searching -->
            <button v-if="searchQuery" type="button" @click="clearSearch"
                class="p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                    <path
                        d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
            </button>
            <!-- Keyboard shortcut hint when not searching -->
            <kbd v-else class="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded
                       bg-linear-to-b from-gray-50 to-gray-150 dark:from-neutral-600 dark:to-neutral-700
                       border border-gray-200/80 dark:border-neutral-600
                       shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]
                       dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)]
                       text-[10px] font-sans font-medium text-gray-400 dark:text-gray-400">
                <span class="text-xs">⌘</span>K
            </kbd>
        </div>
    </div>
</template>
