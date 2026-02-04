<script setup lang="ts">
defineProps<{
    error?: string | null
}>()
</script>

<template>
    <Transition enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0" enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-2 opacity-0">
        <div v-if="error"
            class="p-4 rounded-xl bg-red-500/10 text-red-200 border border-red-500/20 flex items-start gap-3 backdrop-blur-md">
            <Icon name="lucide:alert-circle" class="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
            <span class="text-sm font-medium leading-relaxed">{{ error }}</span>
        </div>
    </Transition>
</template>
