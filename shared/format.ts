import { LOCALE } from './constants/paywall'
import { ru } from './content/ru'

const numberFormatter = new Intl.NumberFormat(LOCALE)

export const formatMoney = (amount: number) => numberFormatter.format(amount)
export const formatPrice = (amount: number, period: string) => ru.format.price(formatMoney(amount), period)
export const formatPurchaseButton = (amount: number, period: string) => ru.format.purchaseButton(formatPrice(amount, period))
export const formatMonthlyPrice = (amount: number) => ru.format.monthlyPrice(formatMoney(amount))
export const formatOfferLabel = (title: string, amount: number) => ru.format.offerLabel(title, formatMoney(amount))
export const formatReceipt = (title: string, amount: number) => ru.format.receipt(title, formatMoney(amount))
