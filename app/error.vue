<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()
const { initTheme } = useTheme()

const is404 = computed(() => props.error.statusCode === 404)

const i18nHead = useLocaleHead()
useHead({
  title: () => is404.value ? t('error.page.notFound.title') : t('error.page.generic.title'),
  htmlAttrs: () => ({
    lang: i18nHead.value.htmlAttrs?.lang
  }),
  script: [
    {
      innerHTML: `(function(){try{var k=document.cookie.split(';');function g(n){for(var i=0;i<k.length;i++){var c=k[i].trim();if(c.indexOf(n+'=')===0)return decodeURIComponent(c.substring(n.length+1))}return null}var t=g('fynncloud-theme-dark');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='true'||(t===null&&d)){document.documentElement.classList.add('dark')}var c=g('fynncloud-primary-color')||'blue';var s=[50,100,200,300,400,500,600,700,800,900,950];var r=document.documentElement;s.forEach(function(n){r.style.setProperty('--color-primary-'+n,'var(--color-'+c+'-'+n+')')})}catch(e){}})()`,
      tagPosition: 'head',
    }
  ]
})

onMounted(() => {
  initTheme()
})

const handleGoHome = () => clearError({ redirect: '/files/' })
</script>

<template>
  <div
    class="min-h-dvh w-full flex items-center justify-center bg-linear-to-br from-zinc-900 to-primary-700 dark:from-primary-950 dark:to-zinc-950 font-sans p-6"
  >
    <div class="w-full max-w-100">
      <AppLogo class="text-[3.5rem]! tracking-tight text-primary-100! font-thin!" />

      <p class="text-white/30 text-sm font-medium mt-4 mb-1 tracking-widest uppercase">
        {{ error.statusCode }}
      </p>
      <p class="text-white text-2xl font-semibold mb-2">
        {{ is404 ? $t('error.page.notFound.title') : $t('error.page.generic.title') }}
      </p>
      <p class="text-gray-300 text-sm leading-relaxed mb-8">
        {{ is404 ? $t('error.page.notFound.description') : $t('error.page.generic.description') }}
      </p>

      <AppButton
        :label="$t('error.page.goHome')"
        variant="white"
        icon="heroicons:arrow-left-solid"
        @click="handleGoHome"   
      />
    </div>
  </div>
</template>
