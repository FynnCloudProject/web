<script setup lang="ts">
const { isDark, toggleDark } = useTheme()
</script>

<template>
    <button type="button"
        class="relative group flex items-center justify-center p-2 rounded-xl transition-all duration-500 hover:bg-gray-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 active:scale-95 cursor-pointer"
        aria-label="Toggle dark mode" @click="toggleDark()">

        <!-- Sun Icon (Show when Light) -->
        <Icon name="heroicons:sun-20-solid"
            class="w-5 h-5 text-amber-500 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] absolute"
            :class="isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'" />

        <!-- Moon Icon (Show when Dark) -->
        <Icon name="heroicons:moon-20-solid"
            class="w-5 h-5 text-indigo-400 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] absolute"
            :class="isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'" />

        <!-- Invisible placeholder to maintain size -->
        <div class="w-5 h-5 opacity-0"></div>
    </button>
</template>
