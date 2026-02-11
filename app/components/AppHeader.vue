<script setup lang="ts">
import AppButton from './AppButton.vue';

const { logout } = useAuth()
const { appName } = useBackEndConfig()



const searchQuery = ref('')
const handleLogout = async () => {
    await logout()
}
</script>

<template>
    <div class="sticky top-0 left-0 right-0 z-30">
        <header
            class="shrink-0 h-14 shadow-[0_0px_4px_0_rgba(0,0,0,.1)] flex items-center justify-between px-4 bg-white dark:bg-neutral-900 dark:border-b dark:border-neutral-800 transition-all duration-500">
            <div class="flex items-center gap-2">
                <button type="button" class="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
                    @click="useUI().toggleSidebar()">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
                <NuxtLink to="/" class="flex items-center gap-2 text-3xl font-extralight text-primary-600">
                    <AppLogo />
                </NuxtLink>

            </div>

            <div class="flex items-center gap-4">
                <div class="flex-1 max-w-lg hidden md:block mr-8">
                    <AppSearch v-model="searchQuery" />
                </div>
                <div class="flex items-center gap-3">
                    <LanguageSwitcher />
                    <ThemeSwitcher />

                    <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                            <path fill-rule="evenodd"
                                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <AppButton @click="handleLogout" :title="$t('navigation.logout')"
                        class="aspect-square hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        rounded="rounded-xl" variant="ghost" :text-shadow="false"
                        text-color="text-gray-500 group/button:hover:text-red-500 dark:text-gray-400 dark:group-hover:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                            <path fill-rule="evenodd"
                                d="M16.5 3.75a1.5 1.5 0 011.5 1.5v13.5a1.5 1.5 0 01-1.5 1.5h-6a1.5 1.5 0 01-1.5-1.5V15a.75.75 0 00-1.5 0v3.75a3 3 0 003 3h6a3 3 0 003-3V5.25a3 3 0 00-3-3h-6a3 3 0 00-3 3V9A.75.75 0 109 9V5.25a1.5 1.5 0 011.5-1.5h6zm-5.03 4.72a.75.75 0 000 1.06l1.72 1.72H2.25a.75.75 0 000 1.5h10.94l-1.72 1.72a.75.75 0 101.06 1.06l3-3a.75.75 0 000-1.06l-3-3a.75.75 0 00-1.06 0z"
                                clip-rule="evenodd" />
                        </svg>
                    </AppButton>
                </div>
            </div>
        </header>
    </div>
</template>