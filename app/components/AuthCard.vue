<script setup lang="ts">
defineProps<{
    title: string
}>()

const { appName } = useBackEndConfig()
</script>

<template>
    <div class="w-full max-w-100">
        <AppLogo class="text-[3.5rem] tracking-tight text-primary-100! font-thin" />
        <p v-if="title" class="text-gray-200 pt-2 text-xl mb-2">{{ title }}</p>
        <slot />
        <div class="mt-8 text-center">
            <slot name="footer" />
        </div>
    </div>
</template>
