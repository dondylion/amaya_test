import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'
import { z } from 'zod'

export function deviceId(event: H3Event): string {
  const existing = getCookie(event, 'lumi_device')
  if (existing && z.uuid().safeParse(existing).success) return existing
  const id = randomUUID()
  setCookie(event, 'lumi_device', id, {
    httpOnly: true,
    secure: getRequestURL(event).protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 730,
  })
  return id
}

export function requireSameOrigin(event: H3Event) {
  const origin = getHeader(event, 'origin')
  if (getHeader(event, 'sec-fetch-site') === 'cross-site'
    || (origin && origin !== getRequestURL(event).origin)) {
    throw createError({ statusCode: 403, statusMessage: 'Cross-origin request rejected' })
  }
  setHeader(event, 'Cache-Control', 'no-store')
}
