<script setup lang="ts">
const { files, fetchFavorites, breadcrumbs } = useFiles()

const { t } = useI18n()
useHead({
    title: t('navigation.favoriteFiles')
})


await fetchFavorites()
</script>

<template>
    <FileExplorer :path="[]" :items="files" :read-only="true" :refresh="fetchFavorites" :breadcrumbs="breadcrumbs" />
</template>
