<script setup lang="ts">

const route = useRoute()
const { files, fetchFiles, breadcrumbs } = useFiles()

useHead({
  title: computed(() => {
    const lastCrumb = breadcrumbs.value[breadcrumbs.value.length - 1]
    return lastCrumb ? lastCrumb.name : 'My Files'
  })
})

// Extract path segments from the route param
const pathSegments = computed(() => {
  if (Array.isArray(route.params.path)) {
    return route.params.path
  }
  return [route.params.path] as string[]
})

// Fetch files when path changes
watch(pathSegments, async (newPath, oldPath) => {
  // Prevent double fetch if path segments are identical
  if (oldPath && newPath.length === oldPath.length && newPath.every((v, i) => v === oldPath[i])) {
    return
  }

  // Use the folder ID (last segment) for the fetch
  const folderID = newPath[newPath.length - 1] || null
  await fetchFiles(folderID)
}, { immediate: true })

const refresh = async () => {
  const folderID = pathSegments.value[pathSegments.value.length - 1] || null
  await fetchFiles(folderID)
}
</script>

<template>
  <!-- Reusing the explorer component, passing the current path -->
  <FileExplorer :path="pathSegments" :items="files" :refresh="refresh" :breadcrumbs="breadcrumbs" />
</template>
