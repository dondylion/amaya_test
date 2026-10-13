import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'
import { MIGRATION } from './constants.mjs'

try { process.loadEnvFile() }
catch (error) { if (error.code !== 'ENOENT') throw error }

const url = process.env.NUXT_DATABASE_URL
if (!url) throw new Error(MIGRATION.missingConnection)
const sql = neon(url)
const migration = await readFile(new URL(MIGRATION.file, import.meta.url), 'utf8')
const statements = migration.split(';').map(value => value.trim()).filter(Boolean)
try {
  await sql.transaction(statements.map(statement => sql.query(statement)))
  console.log(MIGRATION.success)
}
catch {
  console.error(MIGRATION.failure)
  process.exitCode = 1
}
