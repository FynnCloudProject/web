<script setup lang="ts">
const { t } = useI18n()

const fileManager = useFiles()

useHead({
    title: t('navigation.recentFiles')
})

fileManager.fetchRecent()
</script>

<template>
    <FileExplorer :manager="fileManager" :read-only="true" />
</template>