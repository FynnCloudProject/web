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
          <svg v-if="link.icon.includes('folder')" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <svg v-else-if="link.icon.includes('clock')" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="link.icon.includes('star')" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.563.044.8.77.388 1.141l-4.114 3.733a.563.563 0 00-.182.557l1.102 5.396c.122.592-.519 1.055-1.02.766L12.001 18.66l-4.707 2.68c-.5.289-1.142-.174-1.02-.766l1.102-5.396a.563.563 0 00-.182-.557l-4.114-3.733c-.412-.37-.175-1.096.388-1.141l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <svg v-else-if="link.icon.includes('share')" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.287.696.287 1.093s-.107.77-.287 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186z" />
          </svg>
          <svg v-else-if="link.icon.includes('trash')" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          <svg v-else-if="link.icon.includes('settings')" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
        {{ link.label }}
      </div>
    </a>
  </NuxtLink>
</template>
