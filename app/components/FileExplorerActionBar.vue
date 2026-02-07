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
                <AppButton v-if="isTrash" variant="primary" rounded="rounded-lg" size="md" @click="emit('restore')"
                    :allow-mini="true" icon="fluent:arrow-reset-32-filled">
                    <div class="flex items-center gap-2">

                        {{ t('files.actions.restore') }}
                    </div>
                </AppButton>

                <!-- Move (Hidden in Trash) -->
                <AppButton v-if="!isTrash" variant="primary" rounded="rounded-lg" size="md" @click="emit('move')"
                    :allow-mini="true" icon="lucide:arrow-right-left">
                    {{ t('files.actions.move.button') }}
                </AppButton>

                <!-- Delete -->
                <AppButton @click="emit('delete')" variant="danger" rounded="rounded-lg" size="md" :allow-mini="true"
                    icon="heroicons:trash">
                    <div class="flex items-center gap-2">
                        {{ isTrash ? t('files.actions.deletePermanent.button') : t('files.actions.delete.button') }}
                    </div>
                </AppButton>

                <div class="h-6 w-px bg-gray-200 dark:bg-neutral-600 mx-1"></div>

                <!-- Deselect (Circular) -->
                <AppButton @click="emit('clearSelection')" variant="canvas" text-color="dark:text-white"
                    rounded="rounded-full" size="md" class="h-10 w-10" icon="heroicons:x-mark">
                </AppButton>
            </div>
        </div>
    </transition>
</template>
