<script setup lang="ts">
const { t } = useI18n()

const fileManager = useFiles()

useHead({
    title: t('navigation.favoriteFiles')
})

fileManager.fetchFavorites()
</script>

<template>
    <FileExplorer :manager="fileManager" />
</template>