<script setup lang="ts">
const { appName } = useBackEndConfig()
</script>

<template>
  <h1 class="flex items-center gap-2 text-3xl font-extralight text-primary-600">
    {{ appName }} <span v-if="$route.path.includes('admin')" class="italic text-red-600 dark:text-red-400">Admin</span>
  </h1>
</template>
