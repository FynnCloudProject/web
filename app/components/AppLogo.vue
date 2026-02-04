<script setup lang="ts">
const { appName } = useBackEndConfig()
</script>

<template>
  <h1 class="flex items-center gap-2 text-3xl font-extralight text-primary-600">
    {{ appName }}
  </h1>
</template>
