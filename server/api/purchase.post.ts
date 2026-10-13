import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { OFFER_IDS } from '../../shared/constants/paywall'
import { SERVER_ERRORS } from '../constants/config'
import { offers, accessExpiry } from '../utils/offers'
import { deviceId, requireSameOrigin } from '../utils/device'
import { savePurchase } from '../utils/database'

const schema = z.object({
  offerId: z.enum(OFFER_IDS),
  requestId: z.uuid(),
}).strict()

export default defineEventHandler(async (event) => {
  requireSameOrigin(event)
  const body = await readValidatedBody(event, schema.parse)
  const offer = offers.find(offer => offer.id === body.offerId)!
  const now = new Date()
  const id = deviceId(event)
  try {
    const purchase = await savePurchase({
      id: randomUUID(),
      deviceId: id,
      requestId: body.requestId,
      offerId: offer.id,
      amount: offer.price,
      currency: offer.currency,
      createdAt: now.toISOString(),
      expiresAt: accessExpiry(now, offer.months),
    })
    return { purchase }
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === SERVER_ERRORS.requestConflict.statusCode) throw error
    throw createError(SERVER_ERRORS.storageUnavailable)
  }
})
