export const OFFER_IDS = ['yearly', 'monthly'] as const
export const DEFAULT_OFFER_ID = OFFER_IDS[0]
export const CURRENCY = 'RUB' as const
export const LOCALE = 'ru-RU'
export const LANGUAGE = 'ru'

export const API = {
  offers: '/api/offers',
  purchase: '/api/purchase',
  restore: '/api/restore',
} as const

export const REQUEST = {
  offersTimeoutMs: 10_000,
  purchaseTimeoutMs: 15_000,
  retryCount: 0,
} as const

export const ASSETS = {
  hero: '/images/lumi.svg',
  icons: '/images/icons.svg',
  heroWidth: 350,
  heroHeight: 146,
  iconSize: 24,
  iconViewBox: '0 0 24 24',
} as const

export const DEVICE_COOKIE = {
  name: 'lumi_device',
  maxAgeSeconds: 63_072_000,
} as const

export const APP_META = {
  themeColor: '#FFFCF5',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
} as const
