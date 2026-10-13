import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'

try { process.loadEnvFile() }
catch (error) { if (error.code !== 'ENOENT') throw error }

const url = process.env.NUXT_DATABASE_URL
if (!url) throw new Error('Set NUXT_DATABASE_URL in .env before running the Neon migration.')
const sql = neon(url)
const migration = await readFile(new URL('../database/001-purchases.sql', import.meta.url), 'utf8')
const statements = migration.split(';').map(value => value.trim()).filter(Boolean)
try {
  await sql.transaction(statements.map(statement => sql.query(statement)))
  console.log('Purchase schema is ready.')
}
catch {
  console.error('Migration failed. Check Neon connectivity and database permissions.')
  process.exitCode = 1
}
