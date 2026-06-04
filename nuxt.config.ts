// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: true,
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  icon: {
    mode: "svg",
    serverBundle: "auto",
    clientBundle: {
      scan: true,
      icons: [
        "duo-icons:dashboard",
        "heroicons:folder-solid",
        "fa:file-image-o",
        "fa:file-video-o",
        "heroicons:musical-note-solid",
        "fa:file-pdf-o",
        "fa:file-text-o",
        "garden:file-spreadsheet-stroke-16",
        "fa:file-powerpoint-o",
        "heroicons:archive-box-solid",
        "heroicons:code-bracket",
        "fa:file-o",
      ],
    },
  },
  nitro: {
    devProxy: {
      "/api": {
        target: "http://localhost:8080/api",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/icon",
    "@nuxtjs/google-fonts",
    "@nuxtjs/i18n",
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      appVersion: process.env.npm_package_version,
    },
  },
  i18n: {
    compilation: {
      strictMessage: false,
    },
    locales: [
      { code: "en", language: "en-US", file: "en.json" },
      { code: "de", language: "de-DE", file: "de.json" },
      { code: "fr", language: "fr-FR", file: "fr.json" },
      { code: "it", language: "it-IT", file: "it.json" },
    ],
    strategy: "no_prefix",
    defaultLocale: "en",
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL,
    vueI18n: "./i18n.config.ts",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "lang",
    },
  },
  googleFonts: {
    families: {
      Inter: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
    download: true,
    inject: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  css: ["./app/assets/css/main.css"],
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
  },
});