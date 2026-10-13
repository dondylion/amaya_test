import { API, DEFAULT_OFFER_ID, REQUEST } from '#shared/constants/paywall'
import { ru } from '#shared/content/ru'
import type { Offer, Purchase } from '#shared/types/paywall'

export function usePaywall() {
  const { data, status, error: offersError, refresh } = useFetch<{ offers: Offer[] }>(API.offers, {
    server: false, retry: REQUEST.retryCount, timeout: REQUEST.offersTimeoutMs,
  })
  const selectedId = ref<string>(DEFAULT_OFFER_ID)
  const operation = ref<'purchase' | 'restore' | null>(null)
  const completed = ref<Purchase | null>(null)
  const restored = ref(false)
  const message = ref('')
  const messageKind = ref<'error' | 'info'>('error')
  const offers = computed(() => data.value?.offers ?? [])
  const selected = computed(() => offers.value.find(offer => offer.id === selectedId.value))
  const busy = computed(() => operation.value !== null)
  const loading = computed(() => status.value === 'pending' || status.value === 'idle')
  const purchaseOffer = computed(() => offers.value.find(offer => offer.id === completed.value?.offerId))
  let pendingRequest: { offerId: string, id: string } | null = null
  watch(selectedId, () => { message.value = '' })

  async function buy() {
    if (busy.value || loading.value || offersError.value || !selected.value) return
    operation.value = 'purchase'
    message.value = ''
    const offer = selected.value
    try {
      if (!pendingRequest || pendingRequest.offerId !== offer.id) {
        pendingRequest = { offerId: offer.id, id: crypto.randomUUID() }
      }
      const result = await $fetch<{ purchase: Purchase }>(API.purchase, {
        method: 'POST', body: { offerId: offer.id, requestId: pendingRequest.id }, retry: REQUEST.retryCount, timeout: REQUEST.purchaseTimeoutMs,
      })
      completed.value = result.purchase
      restored.value = false
      pendingRequest = null
    }
    catch {
      messageKind.value = 'error'
      message.value = ru.messages.purchaseError
    }
    finally { operation.value = null }
  }

  async function restore() {
    if (busy.value || loading.value || offersError.value) return
    operation.value = 'restore'
    message.value = ''
    try {
      const result = await $fetch<{ purchase: Purchase | null }>(API.restore, {
        method: 'POST', retry: REQUEST.retryCount, timeout: REQUEST.purchaseTimeoutMs,
      })
      if (result.purchase) {
        completed.value = result.purchase
        restored.value = true
        pendingRequest = null
      }
      else {
        messageKind.value = 'info'
        message.value = ru.messages.noPurchases
      }
    }
    catch {
      messageKind.value = 'error'
      message.value = ru.messages.restoreError
    }
    finally { operation.value = null }
  }

  async function returnToOffers() {
    if (completed.value) selectedId.value = completed.value.offerId
    completed.value = null
    message.value = ''
    await refresh()
  }

  return { offers, selectedId, selected, loading, offersError, refresh, busy, operation,
    completed, purchaseOffer, restored, message, messageKind, buy, restore, returnToOffers }
}
