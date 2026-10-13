export interface Offer {
  id: 'yearly' | 'monthly'
  title: string
  accessTitle: string
  price: number
  currency: 'RUB'
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
  currency: 'RUB'
  createdAt: string
  expiresAt: string
}
