<script setup lang="ts">
const { t } = useI18n()

const fileManager = useFiles()

useHead({
  title: t('navigation.allFiles')
})

fileManager.fetchFiles()
</script>

<template>
  <FileExplorer :manager="fileManager" />
</template>