<script setup lang="ts">
const fileManager = useFiles()

definePageMeta({
  key: () => 'trash'
})

const { t } = useI18n()
useHead({
    title: t('navigation.trash')
})

useFolderRoute({
  manager: fileManager,
  rootBreadcrumb: { name: "Trash", labelKey: "navigation.trash", icon: "trash", path: "/trash", id: null },
  fetchFn: (parentID, breadcrumbs) => fileManager.fetchTrash(parentID, breadcrumbs),
})

</script>

<template>
    <FileExplorer :manager="fileManager" :is-trash="true" :read-only="true" />
</template>
