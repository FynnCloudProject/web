<script setup lang="ts">
const { isDark, toggleDark } = useTheme()
const isTransitioning = ref(false)

const toggleTheme = (event: MouseEvent) => {
    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y)
    )

    if (!document.startViewTransition) {
        toggleDark()
        return
    }

    const transition = document.startViewTransition(async () => {
        isTransitioning.value = true
        toggleDark()
        await nextTick()
    })

    transition.finished.then(() => {
        isTransitioning.value = false
    })

    transition.ready.then(() => {
        const x = innerWidth / 2
        const y = innerHeight + 100 // Slightly lower for sinking effect
        const endRadius = Math.hypot(
            Math.max(x, innerWidth - x),
            y
        )

        const isDarkValue = isDark.value

        const clipPath = [
            `circle(${endRadius}px at ${x}px ${y}px)`,
            `circle(0px at ${x}px ${y}px)`
        ]

        document.documentElement.animate(
            {
                clipPath: isDarkValue ? clipPath : [...clipPath].reverse()
            },
            {
                duration: 500,
                easing: 'ease-out',
                pseudoElement: isDarkValue
                    ? '::view-transition-old(root)'
                    : '::view-transition-new(root)'
            }
        )
    })
}
</script>

<template>
    <button type="button"
        class="relative group flex items-center justify-center p-2 rounded-xl transition-all duration-500 hover:bg-gray-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 active:scale-95 cursor-pointer"
        aria-label="Toggle dark mode" @click="toggleTheme($event)">

        <Icon name="heroicons:sun-20-solid"
            class="w-5 h-5 text-amber-500 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] absolute"
            :class="[isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100', { 'transition-none!': isTransitioning }]" />

        <Icon name="heroicons:moon-20-solid"
            class="w-5 h-5 text-indigo-400 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] absolute"
            :class="[isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0', { 'transition-none!': isTransitioning }]" />

        <div class="w-5 h-5 opacity-0"></div>
    </button>
</template>
