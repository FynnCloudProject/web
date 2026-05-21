<script setup lang="ts">
const { t } = useI18n()

const fileManager = useFiles()

useHead({
    title: t('navigation.sharedFiles')
})

fileManager.fetchShared()
</script>

<template>
    <FileExplorer :manager="fileManager" :read-only="true" />
</template>
