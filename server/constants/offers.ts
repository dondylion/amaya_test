import { CURRENCY, OFFER_IDS } from '../../shared/constants/paywall'
import { ru } from '../../shared/content/ru'
import type { Offer } from '../../shared/types/paywall'

export const OFFERS: Offer[] = [
  {
    id: OFFER_IDS[0],
    ...ru.offers.yearly,
    price: 1990,
    currency: CURRENCY,
    months: 12,
    monthlyPrice: 166,
  },
  {
    id: OFFER_IDS[1],
    ...ru.offers.monthly,
    price: 299,
    currency: CURRENCY,
    months: 1,
  },
]
