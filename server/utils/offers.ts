import type { Offer } from '../../shared/types/paywall'

export const offers: Offer[] = [
  {
    id: 'yearly',
    title: 'На год',
    accessTitle: 'Годовой доступ',
    price: 1990,
    currency: 'RUB',
    months: 12,
    period: 'год',
    description: 'Доступ на 12 месяцев. Без автопродления.',
    badge: 'Выгоднее на 45%',
    monthlyPrice: 166,
  },
  {
    id: 'monthly',
    title: 'На месяц',
    accessTitle: 'Месячный доступ',
    price: 299,
    currency: 'RUB',
    months: 1,
    period: 'месяц',
    description: 'Доступ на 1 месяц. Без автопродления.',
  },
]

export function accessExpiry(date: Date, months: number): string {
  const result = new Date(date)
  const day = result.getUTCDate()
  result.setUTCDate(1)
  result.setUTCMonth(result.getUTCMonth() + months)
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate()
  result.setUTCDate(Math.min(day, lastDay))
  return result.toISOString()
}
