export default defineNuxtConfig({
  compatibilityDate: '2026-10-13',
  devtools: { enabled: false },
  nitro: {
    vercel: { functions: { runtime: 'nodejs24.x' } },
  },
  modules: ['@nuxt/eslint'],
  css: ['@fontsource-variable/nunito', '~/assets/css/main.css'],
  runtimeConfig: {
    databaseUrl: '',
    sqlitePath: '.data/lumi.sqlite',
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Луми — целый мир маленьких открытий',
      meta: [
        { name: 'description', content: 'Все миры Луми без рекламы. Выберите доступ на месяц или год — тестовая покупка без списания денег.' },
        { name: 'theme-color', content: '#FFFCF5' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/images/lumi.svg' }],
    },
  },
  typescript: {
    strict: true,
  },
})
