<script setup lang="ts">

const fileManager = useFiles()

definePageMeta({
  key: () => 'files'
})

useHead({
  title: computed(() => {
    const lastCrumb = fileManager.breadcrumbs.value[fileManager.breadcrumbs.value.length - 1]
    return lastCrumb ? lastCrumb.name : 'My Files'
  })
})

useFolderRoute({
  manager: fileManager,
  rootBreadcrumb: { name: "Home", labelKey: "navigation.allFiles", path: "/", id: null },
  fetchFn: (parentID, breadcrumbs) => fileManager.fetchFiles(parentID, breadcrumbs),
})

</script>

<template>
  <FileExplorer :manager="fileManager" />
</template>
