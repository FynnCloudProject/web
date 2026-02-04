<script setup lang="ts">
const props = defineProps<{
    modelValue: boolean
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'primary' | 'danger'
    loading?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'confirm'): void
    (e: 'cancel'): void
}>()

const onConfirm = () => {
    emit('confirm')
}

const onCancel = () => {
    emit('cancel')
    emit('update:modelValue', false)
}
</script>

<template>
    <AppDialog :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" :title="title">
        <div class="text-sm text-gray-500 dark:text-gray-400">
            <div v-html="description"></div>
        </div>
        <template #footer>
            <div class="flex gap-3">
                <AppButton variant="secondary" @click="onCancel" :disabled="loading" rounded="rounded-lg">
                    {{ cancelLabel || $t('common.cancel') }}
                </AppButton>
                <AppButton :variant="variant || 'primary'" @click="onConfirm" :loading="loading" rounded="rounded-lg">
                    {{ confirmLabel || $t('common.confirm') }}
                </AppButton>
            </div>
        </template>
    </AppDialog>
</template>
