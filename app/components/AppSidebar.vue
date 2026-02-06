<script setup lang="ts">
const { t } = useI18n()

const links = computed(() => [
  { label: t('navigation.allFiles'), icon: 'folder', to: '/' },
  { label: t('navigation.recentFiles'), icon: 'clock', to: '/recent' },
  { label: t('navigation.favoriteFiles'), icon: 'star', to: '/favorites' },
  { label: t('navigation.sharedFiles'), icon: 'share', to: '/shared' },
])

const route = useRoute()
const { formattedUsage, percentage } = useQuota()
</script>

<template>
  <div class="h-full">
    <div
      class="h-full bg-primary-700 dark:bg-primary-800 dark:border-r dark:border-primary-800 shadow-lg pb-2 flex flex-col justify-between">
      <nav class="space-y-1 p-2">
        <AppSidebarItem v-for="link in links" :key="link.to" :link="link" />

      </nav>
      <div class="grow">
      </div>
      <div class="px-2">
        <AppSidebarItem :link="{ label: t('navigation.trash'), icon: 'trash', to: '/trash', variant: 'danger' }" />
      </div>
      <div class="mt-4 mx-auto w-full px-4 mb-2 space-y-1">
        <div class="flex justify-between mx-1">
          <p class="text-xs text-gray-200 text-center">{{ t('quota.usedSpace') }}:</p>
          <p class="text-xs text-gray-200 text-center">{{ formattedUsage }}</p>
        </div>
        <div
          class="relative w-full bg-primary-950/40 rounded-full h-3 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] border-b border-white/10">
          <div v-if="percentage >= 6"
            class="h-full rounded-full transition-all duration-500 ease-out bg-linear-to-b from-white to-gray-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_2px_4px_rgba(0,0,0,0.2)] border-t border-white/50"
            :style="{ width: `${percentage}%` }"></div>
        </div>
      </div>
    </div>
  </div>
</template>
