<script setup lang="ts">

const { files, fetchFiles, breadcrumbs } = useFiles()

const { t } = useI18n()

useHead({
  title: t('navigation.allFiles')
})

// Fetch root files
await fetchFiles()
</script>

<template>
  <FileExplorer :path="[]" :items="files" :refresh="fetchFiles" :breadcrumbs="breadcrumbs" />
</template>
