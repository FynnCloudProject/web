<script setup lang="ts">
const { t } = useI18n()

const links = computed(() => [
    {
        label: t('admin.overview'), icon: 'duo-icons:dashboard', to: '/admin'
    },
    {
        label: t('admin.users'), icon: 'heroicons:users-16-solid', to: '/admin/users'
    },
    { label: t('admin.tiers'), icon: 'heroicons:circle-stack-solid', to: '/admin/tiers' },
    { label: t('admin.settings'), icon: 'heroicons:cog-6-tooth-solid', to: '/admin/settings' },
])
</script>

<template>
    <div class="h-full">
        <div class="h-full bg-primary-700 dark:bg-primary-800 shadow-lg pb-2 flex flex-col justify-between">
            <nav class="space-y-1 p-2">
                <AppSidebarItem v-for="link in links" :key="link.to" :link="link" />
            </nav>
            <div class="grow">
            </div>
            <div class="px-2">
                <AppSidebarItem :link="{ label: t('admin.backToFiles'), icon: 'heroicons:arrow-left', to: '/' }" />
            </div>
        </div>
    </div>
</template>