import { randomUUID } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { test, expect } from '@playwright/test'
import { accessExpiry } from '../server/utils/offers'

test('offers set a private device cookie and contain server-owned prices', async ({ request }) => {
  const response = await request.get('/api/offers')
  expect(response.ok()).toBeTruthy()
  expect((await response.json()).offers.map((offer: { price: number }) => offer.price)).toEqual([1990, 299])
  expect(response.headers()['cache-control']).toBe('no-store')
  const cookies = (await request.storageState()).cookies
  expect(cookies[0]).toMatchObject({ name: 'lumi_device', httpOnly: true, sameSite: 'Lax' })
})

test('purchase is persisted, concurrent retries are idempotent, restore is isolated', async ({ request, playwright }) => {
  await request.get('/api/offers')
  const body = { offerId: 'yearly', requestId: randomUUID() }
  const responses = await Promise.all([1, 2, 3].map(() => request.post('/api/purchase', { data: body })))
  for (const response of responses) expect(response.ok()).toBeTruthy()
  const purchases = await Promise.all(responses.map(async response => (await response.json()).purchase))
  expect(new Set(purchases.map(purchase => purchase.id)).size).toBe(1)
  expect(purchases[0].amount).toBe(1990)
  const db = new DatabaseSync('.cache/test-purchases.sqlite', { readOnly: true })
  try {
    const row = db.prepare('SELECT COUNT(*) AS total FROM purchases WHERE request_id = ?').get(body.requestId)
    expect(row?.total).toBe(1)
  }
  finally { db.close() }
  const restored = await request.post('/api/restore')
  expect((await restored.json()).purchase.id).toBe(purchases[0].id)
  const stranger = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:3100' })
  expect((await (await stranger.post('/api/restore')).json()).purchase).toBeNull()
  await stranger.dispose()
  const conflict = await request.post('/api/purchase', { data: { ...body, offerId: 'monthly' } })
  expect(conflict.status()).toBe(409)
})

test('rejects invalid offers, forged prices and cross-origin writes', async ({ request }) => {
  for (const data of [
    { offerId: 'free', requestId: randomUUID() },
    { offerId: 'yearly', requestId: randomUUID(), amount: 1 },
    { offerId: 'monthly', requestId: 'invalid' },
  ]) {
    expect((await request.post('/api/purchase', { data })).status()).toBe(400)
  }
  expect((await request.post('/api/purchase', {
    data: { offerId: 'monthly', requestId: randomUUID() },
    headers: { origin: 'https://unrelated.example' },
  })).status()).toBe(403)
})

test('expired purchases are not restored', async ({ request }) => {
  await request.get('/api/offers')
  const response = await request.post('/api/purchase', { data: { offerId: 'monthly', requestId: randomUUID() } })
  const { purchase } = await response.json()
  const db = new DatabaseSync('.cache/test-purchases.sqlite')
  try { db.prepare('UPDATE purchases SET expires_at = ? WHERE id = ?').run('2020-01-01T00:00:00.000Z', purchase.id) }
  finally { db.close() }
  expect((await (await request.post('/api/restore')).json()).purchase).toBeNull()
})

test('calendar access duration handles month ends and leap years', () => {
  expect(accessExpiry(new Date('2026-01-31T12:00:00Z'), 1)).toBe('2026-02-28T12:00:00.000Z')
  expect(accessExpiry(new Date('2024-02-29T12:00:00Z'), 12)).toBe('2025-02-28T12:00:00.000Z')
})
