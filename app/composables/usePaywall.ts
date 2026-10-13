import type { Offer, Purchase } from '../../shared/types/paywall'

export function usePaywall() {
  // Browser fetching ensures the device cookie belongs to this visitor.
  const { data, status, error: offersError, refresh } = useFetch<{ offers: Offer[] }>('/api/offers', {
    server: false, retry: 0, timeout: 10000,
  })
  const selectedId = ref('yearly')
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
  // Reuse after network failure: the server may already have saved the purchase.
  let pendingRequest: { offerId: string, id: string } | null = null
  watch(selectedId, () => { message.value = '' })

  async function buy() {
    if (busy.value || !selected.value) return
    operation.value = 'purchase'
    message.value = ''
    const offer = selected.value
    try {
      if (!pendingRequest || pendingRequest.offerId !== offer.id) {
        pendingRequest = { offerId: offer.id, id: crypto.randomUUID() }
      }
      const result = await $fetch<{ purchase: Purchase }>('/api/purchase', {
        method: 'POST', body: { offerId: offer.id, requestId: pendingRequest.id }, retry: 0, timeout: 15000,
      })
      completed.value = result.purchase
      restored.value = false
      pendingRequest = null
    }
    catch {
      messageKind.value = 'error'
      message.value = 'Не удалось завершить покупку.\nПроверьте интернет и попробуйте ещё раз.'
    }
    finally { operation.value = null }
  }

  async function restore() {
    if (busy.value || loading.value || offersError.value) return
    operation.value = 'restore'
    message.value = ''
    try {
      const result = await $fetch<{ purchase: Purchase | null }>('/api/restore', {
        method: 'POST', retry: 0, timeout: 15000,
      })
      if (result.purchase) {
        completed.value = result.purchase
        restored.value = true
        pendingRequest = null
      }
      else {
        messageKind.value = 'info'
        message.value = 'На этом устройстве нет активных покупок.\nВыберите тариф, чтобы открыть мир Луми.'
      }
    }
    catch {
      messageKind.value = 'error'
      message.value = 'Не удалось восстановить покупки.\nПроверьте интернет и попробуйте ещё раз.'
    }
    finally { operation.value = null }
  }

  function returnToOffers() {
    if (completed.value) selectedId.value = completed.value.offerId
    completed.value = null
    message.value = ''
  }

  return { offers, selectedId, selected, loading, offersError, refresh, busy, operation,
    completed, purchaseOffer, restored, message, messageKind, buy, restore, returnToOffers }
}
