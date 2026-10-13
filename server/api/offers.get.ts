import { offers } from '../utils/offers'
import { deviceId } from '../utils/device'

export default defineEventHandler((event) => {
  deviceId(event)
  setHeader(event, 'Cache-Control', 'no-store')
  return { offers }
})
