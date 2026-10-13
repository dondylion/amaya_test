import { NO_CACHE } from '../constants/config'
import { offers } from '../utils/offers'
import { deviceId } from '../utils/device'

export default defineEventHandler((event) => {
  deviceId(event)
  setHeader(event, NO_CACHE.name, NO_CACHE.value)
  return { offers }
})
