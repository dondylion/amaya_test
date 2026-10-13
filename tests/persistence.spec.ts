import { spawn, type ChildProcess } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { setTimeout } from 'node:timers/promises'
import { test, expect } from '@playwright/test'

test('purchase survives a full server restart', async ({ playwright }) => {
  let server: ChildProcess | undefined
  const start = async () => {
    server = spawn(process.execPath, ['.output/server/index.mjs'], {
      env: { ...process.env, HOST: '127.0.0.1', PORT: '3101', NUXT_DATABASE_URL: '', NUXT_SQLITE_PATH: '.cache/restart-purchases.sqlite' },
      stdio: 'ignore',
      windowsHide: true,
    })
    for (let attempt = 0; attempt < 100; attempt++) {
      try { if ((await fetch('http://127.0.0.1:3101/api/offers')).ok) return }
      catch { await setTimeout(50) }
    }
    throw new Error('Persistence test server failed to start')
  }
  const stop = async () => {
    if (server && server.exitCode === null) {
      const exited = once(server, 'exit')
      server.kill()
      await exited
    }
  }
  const client = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:3101' })
  try {
    await start()
    await client.get('/api/offers')
    const response = await client.post('/api/purchase', { data: { offerId: 'monthly', requestId: randomUUID() } })
    expect(response.ok()).toBeTruthy()
    const { purchase } = await response.json()
    await stop()
    await start()
    const restored = await client.post('/api/restore')
    expect((await restored.json()).purchase).toEqual(purchase)
  }
  finally {
    await stop()
    await client.dispose()
  }
})
