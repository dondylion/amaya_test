import { APP_META, ASSETS, LANGUAGE } from './shared/constants/paywall'
import { ru } from './shared/content/ru'
import { DATABASE } from './server/constants/config'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-13',
  telemetry: false,
  devtools: { enabled: false },
  nitro: {
    vercel: { functions: { runtime: 'nodejs24.x' } },
  },
  modules: ['@nuxt/eslint'],
  css: ['@fontsource-variable/nunito', '~/assets/css/tokens.css', '~/assets/css/main.css'],
  runtimeConfig: {
    databaseUrl: '',
    sqlitePath: DATABASE.defaultSqlitePath,
  },
  app: {
    head: {
      htmlAttrs: { lang: LANGUAGE },
      title: ru.meta.title,
      meta: [
        { name: 'description', content: ru.meta.description },
        { name: 'theme-color', content: APP_META.themeColor },
        { name: 'viewport', content: APP_META.viewport },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: ASSETS.hero }],
    },
  },
  typescript: {
    strict: true,
  },
})
