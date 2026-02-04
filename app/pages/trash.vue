<script setup lang="ts">
const { files, fetchTrash, restoreFile, deleteFile, breadcrumbs } = useFiles()

const { t } = useI18n()
useHead({
    title: t('navigation.trash')
})

await fetchTrash()
</script>

<template>
    <FileExplorer :path="[]" :items="files" :is-trash="true" :read-only="true" :refresh="fetchTrash"
        :breadcrumbs="breadcrumbs" />
</template>
