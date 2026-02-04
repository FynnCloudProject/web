<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const availableLocales = computed(() => {
    return (locales.value as any[]).filter(i => i.code !== locale.value)
})

const currentLocale = computed(() => {
    return (locales.value as any[]).find(i => i.code === locale.value)
})

const toggleDropdown = () => {
    isOpen.value = !isOpen.value
}

const closeDropdown = () => {
    isOpen.value = false
}

const handleSetLocale = (code: string) => {
    setLocale(code as any)
    closeDropdown()
}

// Click outside to close
const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
        closeDropdown()
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <div class="relative inline-block text-center rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-500 dark:text-gray-400 "
        ref="containerRef">
        <div>
            <button type="button" @click="toggleDropdown"
                class="flex items-center justify-center p-2 text-center font-medium uppercase text-sm w-9 h-9 cursor-pointer"
                aria-label="Switch language">
                {{ currentLocale?.code }}
            </button>
        </div>

        <transition enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95">
            <div v-if="isOpen"
                class="absolute right-0 z-50 mt-2 w-32 origin-top-right rounded-xl bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-black/5 focus:outline-none border border-gray-100 dark:border-zinc-800 overflow-hidden p-1">
                <div class="px-1 py-1 space-y-0.5">
                    <button v-for="l in locales" :key="l.code" @click="handleSetLocale(l.code)" :class="[
                        l.code === locale ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800/50',
                        'group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors cursor-pointer'
                    ]">
                        <span class="uppercase flex-1 text-left">{{ l.code }}</span>
                        <span v-if="l.code === locale" class="flex shrink-0 text-primary-600 dark:text-primary-400">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                class="w-4 h-4">
                                <path fill-rule="evenodd"
                                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                    clip-rule="evenodd" />
                            </svg>
                        </span>
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>
