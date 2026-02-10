<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { t } = useI18n()

useHead({
    title: t('admin.settings')
})
</script>

<template>
    <div class="space-y-2">
        <div class="flex items-center justify-between">
            <h1 class="text-4xl font-medium text-gray-900 dark:text-gray-100">
                {{ t('admin.settings') }}
            </h1>
        </div>

        <div class="flex flex-col items-center justify-center py-20 text-gray-400">
            <Icon name="heroicons:cog-6-tooth" class="w-16 h-16 mb-4 opacity-50" />
            <p class="text-lg font-medium">{{ t('admin.comingSoon') }}</p>
        </div>
    </div>
</template>
