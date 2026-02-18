<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
    modelValue: boolean
    title?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'close'): void
}>()

const modalRef = ref<HTMLElement | null>(null)

const close = () => {
    emit('update:modelValue', false)
    emit('close')
}

watch(() => props.modelValue, async (val) => {
    if (val) {
        await nextTick()
        const autofocusElement = modalRef.value?.querySelector('[autofocus]') as HTMLElement
        if (autofocusElement) {
            autofocusElement.focus()
        } else {
            modalRef.value?.focus()
        }
    }
})
</script>

<template>
    <Teleport to="body">
        <!-- Backdrop -->
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="modelValue" class="fixed inset-0 bg-zinc-900/50 z-[100]" @click="close" aria-hidden="true" />
        </Transition>

        <!-- Modal Container -->
        <Transition enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100" leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <div v-if="modelValue" class="fixed inset-0 z-[101] overflow-y-auto pointer-events-none">
                <div class="flex min-h-full items-end justify-center p-4 sm:items-center">
                    <div ref="modalRef" role="dialog" aria-modal="true"
                        :aria-labelledby="title ? 'modal-title' : undefined" tabindex="-1" class="relative w-full sm:max-w-lg pointer-events-auto outline-none
                               rounded-2xl bg-white dark:bg-neutral-900
                               border border-gray-100 dark:border-neutral-800
                               shadow-2xl" @click.stop>
                        <!-- Body -->
                        <div class="px-3 pt-2 pb-2">
                            <h3 v-if="title" id="modal-title"
                                class="text-3xl font-light text-gray-900 dark:text-white mb-1">
                                {{ title }}
                            </h3>
                            <slot />
                        </div>
                        <!-- Footer -->
                        <div v-if="$slots.footer" class="flex sm:flex-row-reverse gap-3 px-3 py-3">
                            <slot name="footer" :close="close" />
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>