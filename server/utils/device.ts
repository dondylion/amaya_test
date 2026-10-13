import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'
import { z } from 'zod'
import { DEVICE_COOKIE } from '../../shared/constants/paywall'
import { NO_CACHE, SERVER_ERRORS } from '../constants/config'

export function deviceId(event: H3Event): string {
  const existing = getCookie(event, DEVICE_COOKIE.name)
  if (existing && z.uuid().safeParse(existing).success) return existing
  const id = randomUUID()
  setCookie(event, DEVICE_COOKIE.name, id, {
    httpOnly: true,
    secure: getRequestURL(event).protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: DEVICE_COOKIE.maxAgeSeconds,
  })
  return id
}

export function requireSameOrigin(event: H3Event) {
  const origin = getHeader(event, 'origin')
  if (getHeader(event, 'sec-fetch-site') === 'cross-site'
    || (origin && origin !== getRequestURL(event).origin)) {
    throw createError(SERVER_ERRORS.crossOrigin)
  }
  setHeader(event, NO_CACHE.name, NO_CACHE.value)
}
