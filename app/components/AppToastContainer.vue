<script setup lang="ts">
const { toasts, removeToast } = useToast()
</script>

<template>
    <Teleport to="body">
        <div
            class="fixed bottom-0 right-0 z-200 flex flex-col gap-3 pointer-events-auto max-h-[calc(100vh)] overflow-visible p-4">
            <TransitionGroup
                enter-active-class="transition-[transform,opacity] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[transform,opacity]"
                enter-from-class="opacity-0 translate-x-full" enter-to-class="opacity-100 translate-x-0"
                leave-active-class="transition-[transform,opacity] duration-300 ease-in will-change-[transform,opacity]"
                leave-from-class="opacity-100 translate-x-0" leave-to-class="opacity-0 translate-x-full"
                move-class="transition-transform duration-300 ease-out">
                <div v-for="toast in toasts" :key="toast.id">
                    <AppToast :toast="toast" :on-close="removeToast" :duration="5000" />
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>