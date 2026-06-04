<script setup lang="ts">
const { initTheme } = useTheme()
const { initAppConfig, isOffline, hasBooted, appName } = useBackEndConfig()

const i18nHead = useLocaleHead()
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ${appName.value}` : appName.value
  },
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
await callOnce('app-config', initAppConfig)

onMounted(() => {
  initTheme()
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
