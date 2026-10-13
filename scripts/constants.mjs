export const MIGRATION = {
  file: '../database/001-purchases.sql',
  missingConnection: 'Set NUXT_DATABASE_URL in .env before running the Neon migration.',
  success: 'Purchase schema is ready.',
  failure: 'Migration failed. Check Neon connectivity and database permissions.',
}
