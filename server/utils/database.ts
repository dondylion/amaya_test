import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { CURRENCY } from '../../shared/constants/paywall'
import { DATABASE, SERVER_ERRORS, SERVER_MESSAGES } from '../constants/config'
import { neon } from '@neondatabase/serverless'
import type { DatabaseSync } from 'node:sqlite'
import type { Purchase } from '../../shared/types/paywall'

interface PurchaseRow {
  id: string
  offer_id: Purchase['offerId']
  amount: number
  created_at: string | Date
  expires_at: string | Date
}

interface NewPurchase extends Purchase {
  deviceId: string
  requestId: string
}

let localDb: DatabaseSync | undefined

async function sqlite() {
  if (localDb) return localDb
  const config = useRuntimeConfig()
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    throw new Error(SERVER_MESSAGES.missingDatabase)
  }
  const path = resolve(config.sqlitePath)
  mkdirSync(dirname(path), { recursive: true })
  const { DatabaseSync } = await import('node:sqlite')
  localDb = new DatabaseSync(path)
  localDb.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = ${DATABASE.busyTimeoutMs};
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL,
      request_id TEXT NOT NULL,
      offer_id TEXT NOT NULL CHECK (offer_id IN ('yearly', 'monthly')),
      amount INTEGER NOT NULL CHECK (amount > 0),
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      UNIQUE (device_id, request_id)
    );
    CREATE INDEX IF NOT EXISTS purchases_device_expiry ON purchases (device_id, expires_at DESC);
  `)
  return localDb
}

function purchase(row: PurchaseRow): Purchase {
  return {
    id: row.id,
    offerId: row.offer_id,
    amount: Number(row.amount),
    currency: CURRENCY,
    createdAt: new Date(row.created_at).toISOString(),
    expiresAt: new Date(row.expires_at).toISOString(),
  }
}

export async function savePurchase(input: NewPurchase): Promise<Purchase> {
  const { databaseUrl } = useRuntimeConfig()
  let row: PurchaseRow
  if (databaseUrl) {
    const sql = neon(databaseUrl)
    const rows = await sql`
      INSERT INTO purchases (id, device_id, request_id, offer_id, amount, created_at, expires_at)
      VALUES (${input.id}, ${input.deviceId}, ${input.requestId}, ${input.offerId}, ${input.amount}, ${input.createdAt}, ${input.expiresAt})
      ON CONFLICT (device_id, request_id) DO UPDATE SET request_id = EXCLUDED.request_id
      RETURNING id, offer_id, amount, created_at, expires_at
    `
    row = rows[0] as PurchaseRow
  }
  else {
    const db = await sqlite()
    row = db.prepare(`
      INSERT INTO purchases (id, device_id, request_id, offer_id, amount, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (device_id, request_id) DO UPDATE SET request_id = excluded.request_id
      RETURNING id, offer_id, amount, created_at, expires_at
    `).get(input.id, input.deviceId, input.requestId, input.offerId, input.amount, input.createdAt, input.expiresAt) as unknown as PurchaseRow
  }
  if (row.offer_id !== input.offerId) {
    throw createError(SERVER_ERRORS.requestConflict)
  }
  return purchase(row)
}

export async function restorePurchase(id: string): Promise<Purchase | null> {
  const { databaseUrl } = useRuntimeConfig()
  let row: PurchaseRow | undefined
  const now = new Date().toISOString()
  if (databaseUrl) {
    const sql = neon(databaseUrl)
    const rows = await sql`
      SELECT id, offer_id, amount, created_at, expires_at FROM purchases
      WHERE device_id = ${id} AND expires_at > ${now}
      ORDER BY expires_at DESC, created_at DESC LIMIT 1
    `
    row = rows[0] as PurchaseRow | undefined
  }
  else {
    const db = await sqlite()
    row = db.prepare(`
      SELECT id, offer_id, amount, created_at, expires_at FROM purchases
      WHERE device_id = ? AND expires_at > ?
      ORDER BY expires_at DESC, created_at DESC LIMIT 1
    `).get(id, now) as unknown as PurchaseRow | undefined
  }
  return row ? purchase(row) : null
}
