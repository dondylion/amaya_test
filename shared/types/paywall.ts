import type { CURRENCY, OFFER_IDS } from '../constants/paywall'

export interface Offer {
  id: typeof OFFER_IDS[number]
  title: string
  accessTitle: string
  price: number
  currency: typeof CURRENCY
  months: number
  period: string
  description: string
  badge?: string
  monthlyPrice?: number
}

export interface Purchase {
  id: string
  offerId: Offer['id']
  amount: number
  currency: typeof CURRENCY
  createdAt: string
  expiresAt: string
}
