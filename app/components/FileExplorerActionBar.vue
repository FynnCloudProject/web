<script setup lang="ts">
const props = defineProps<{
    selectedCount: number
    isTrash: boolean
}>()

const emit = defineEmits<{
    restore: []
    move: []
    delete: []
    clearSelection: []
}>()

const { t } = useI18n()
</script>

<template>
    <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 translate-y-full"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-full">
        <div v-if="selectedCount > 0"
            class="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-xl rounded-full p-2 pl-4 flex items-center gap-2">
            <div class="text-md font-medium text-gray-700 dark:text-white line-clamp-1 min-w-20">
                {{ t('files.selected', { count: selectedCount }) }}
            </div>

            <div class="h-6 w-px bg-gray-200 dark:bg-neutral-600 mx-1"></div>

            <div class="flex items-center gap-2">
                <!-- Restore (Only in Trash) -->
                <AppButton v-if="isTrash" variant="primary" rounded="rounded-lg" size="md" @click="emit('restore')">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"
                            stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                        </svg>
                        {{ t('files.actions.restore') }}
                    </div>
                </AppButton>

                <!-- Move (Hidden in Trash) -->
                <AppButton v-if="!isTrash" variant="primary" rounded="rounded-lg" size="md" @click="emit('move')">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="15 14 20 9 15 4" />
                            <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
                        </svg>
                        {{ t('files.actions.move.button') }}
                    </div>
                </AppButton>

                <!-- Delete -->
                <AppButton @click="emit('delete')" variant="danger" rounded="rounded-lg" size="md">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" x2="10" y1="11" y2="17" />
                            <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                        {{ isTrash ? t('files.actions.deletePermanent.button') : t('files.actions.delete.button') }}
                    </div>
                </AppButton>

                <div class="h-6 w-px bg-gray-200 dark:bg-neutral-600 mx-1"></div>

                <!-- Deselect (Circular) -->
                <AppButton @click="emit('clearSelection')" variant="canvas" text-color="dark:text-white"
                    rounded="rounded-full" size="md" class="h-10 w-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                </AppButton>
            </div>
        </div>
    </transition>
</template>
