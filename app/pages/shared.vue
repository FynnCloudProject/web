<script setup lang="ts">
const { files, fetchShared, breadcrumbs } = useFiles()

const { t } = useI18n()
useHead({
    title: t('navigation.sharedFiles')
})

await fetchShared()
</script>

<template>
    <FileExplorer :path="[]" :items="files" :read-only="true" :refresh="fetchShared" :breadcrumbs="breadcrumbs" />
</template>
