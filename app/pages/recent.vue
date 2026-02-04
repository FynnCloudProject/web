<script setup lang="ts">
const { files, fetchRecent, breadcrumbs } = useFiles()

const { t } = useI18n()
useHead({
    title: t('navigation.recentFiles')
})

await fetchRecent()
</script>

<template>
    <FileExplorer :path="[]" :items="files" :read-only="true" :refresh="fetchRecent" :breadcrumbs="breadcrumbs" />
</template>
