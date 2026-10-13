export const DATABASE = {
  defaultSqlitePath: '.data/lumi.sqlite',
  busyTimeoutMs: 5_000,
} as const

export const SERVER_ERRORS = {
  crossOrigin: { statusCode: 403, statusMessage: 'Cross-origin request rejected' },
  requestConflict: { statusCode: 409, statusMessage: 'Request already used for a different offer' },
  storageUnavailable: { statusCode: 503, statusMessage: 'Purchase storage unavailable' },
} as const

export const SERVER_MESSAGES = {
  missingDatabase: 'Configure NUXT_DATABASE_URL for persistent serverless storage',
} as const

export const NO_CACHE = { name: 'Cache-Control', value: 'no-store' } as const
