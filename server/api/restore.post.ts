import { deviceId, requireSameOrigin } from '../utils/device'
import { restorePurchase } from '../utils/database'

export default defineEventHandler(async (event) => {
  requireSameOrigin(event)
  const id = deviceId(event)
  try {
    return { purchase: await restorePurchase(id) }
  }
  catch {
    throw createError({ statusCode: 503, statusMessage: 'Purchase storage unavailable' })
  }
})
