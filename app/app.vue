<script setup lang="ts">
const { initTheme } = useTheme()
const { initAppConfig, isOffline, hasBooted, appName } = useBackEndConfig()

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ${appName.value}` : appName.value
  }
})

onMounted(() => {
  initTheme()
  initAppConfig()
})
</script>

<template>
  <NuxtLayout name="auth" v-if="isOffline && !hasBooted">
    <ServerOffline />
  </NuxtLayout>
  <template v-else>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ConnectionBanner />
    <AppToastContainer />
    <DevMenu />
  </template>
</template>
