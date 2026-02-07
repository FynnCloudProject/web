<script setup lang="ts">
interface SidebarLink {
  label: string
  icon: string
  to: string
  variant?: 'default' | 'danger'
}

defineProps<{
  link: SidebarLink
}>()

const route = useRoute()
</script>

<template>
  <NuxtLink :to="link.to" custom v-slot="{ href, navigate, isActive }">
    <a :href="href" @click="navigate"
      class="group relative flex items-center w-full px-3 py-2 text-sm font-medium rounded-sm transition-all duration-150 ease-out active:scale-[0.98]"
      :class="[(isActive || route.path === link.to) ? '' : (link.variant === 'danger' ? 'text-red-100 hover:text-white dark:text-red-400 dark:hover:text-red-200' : 'text-primary-100 hover:text-white dark:text-neutral-100 dark:hover:text-white')]">

      <div v-if="isActive || route.path === link.to"
        class="absolute inset-0 bg-linear-to-b shadow-[inset_0_2px_3px_rgba(255,255,255,0.9),0_6px_14px_rgba(0,0,0,0.2)] rounded-sm transition-all duration-150 ease-out group-active:shadow-[inset_0_6px_12px_-2px_rgba(0,0,0,0.5)]"
        :class="link.variant === 'danger' ? 'from-white to-red-200' : 'from-white to-primary-200'">
      </div>

      <div v-else
        class="absolute inset-0 bg-linear-to-b shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.2)] rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-150 ease-out"
        :class="link.variant === 'danger' ? 'from-red-500 to-red-700' : 'from-primary-500 to-primary-700'">
      </div>

      <div class="relative z-10 flex items-center gap-3"
        :class="(isActive || route.path === link.to) ? (link.variant === 'danger' ? 'text-red-700' : 'text-primary-700') : ''">
        <span class="shrink-0 h-5 w-5">
          <Icon v-if="link.icon" :name="link.icon" class="h-5 w-5" />
        </span>
        {{ link.label }}
      </div>
    </a>
  </NuxtLink>
</template>
