import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  timeout: 30000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node .output/server/index.mjs',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    env: {
      HOST: '127.0.0.1',
      PORT: '3100',
      NUXT_DATABASE_URL: '',
      NUXT_SQLITE_PATH: '.cache/test-purchases.sqlite',
    },
  },
})
