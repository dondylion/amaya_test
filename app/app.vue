<script setup lang="ts">
import { ru } from '#shared/content/ru'
import { formatPurchaseButton, formatReceipt } from '#shared/format'
const {
  offers, selectedId, selected, loading, offersError, refresh, busy, operation,
  completed, purchaseOffer, restored, message, messageKind, buy, restore, returnToOffers,
} = usePaywall()
const heading = useTemplateRef('heading')
watch(() => !!completed.value, async () => {
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'instant' })
  heading.value?.focus({ preventScroll: true })
})
</script>

<template>
  <main class="paywall" :class="{ 'paywall-success': completed }">
    <header class="brand-header">
      <span class="logo" :aria-label="ru.brand.name">{{ ru.brand.logo }}</span>
      <span class="parent-badge">{{ ru.brand.audience }}</span>
    </header>
    <LumiHero :success="!!completed" />
    <template v-if="completed">
      <h1 ref="heading" tabindex="-1" class="headline success-headline">{{ ru.success.title[0] }}<br>{{ ru.success.title[1] }}</h1>
      <p class="subtitle success-subtitle">{{ ru.success.subtitle[0] }}<br>{{ ru.success.subtitle[1] }}</p>
      <section class="receipt" :aria-label="ru.success.receiptLabel">
        <h2><LumiIcon name="check" />{{ restored ? ru.success.restored : ru.success.saved }}</h2>
        <p class="receipt-plan">{{ formatReceipt(purchaseOffer?.accessTitle ?? '', completed.amount) }}</p>
        <p class="receipt-note">{{ ru.success.note }}</p>
      </section>
      <button type="button" class="primary-button success-button" @click="returnToOffers">{{ ru.success.confirm }}</button>
      <button type="button" class="text-button back-button" @click="returnToOffers">{{ ru.success.back }}</button>
    </template>
    <template v-else>
      <h1 ref="heading" tabindex="-1" class="headline">{{ ru.paywall.title[0] }}<br>{{ ru.paywall.title[1] }}</h1>
      <p class="subtitle">{{ ru.paywall.subtitle[0] }}<br>{{ ru.paywall.subtitle[1] }}</p>
      <ul class="benefits" :aria-label="ru.paywall.benefitsLabel">
        <li><span class="benefit-sparkle" aria-hidden="true">{{ ru.paywall.sparkle }}</span>{{ ru.paywall.worlds }}</li>
        <li><LumiIcon name="check" />{{ ru.paywall.noAds }}</li>
      </ul>
      <section class="plans" :aria-label="ru.paywall.plansLabel" :aria-busy="loading">
        <template v-if="loading">
          <div class="offer-skeleton yearly-skeleton" />
          <div class="offer-skeleton monthly-skeleton" />
          <span class="sr-only" role="status">{{ ru.paywall.loadingOffers }}</span>
        </template>
        <div v-else-if="offersError" class="offers-error" role="alert">
          <LumiIcon name="alert" />
          <p>{{ ru.messages.offersError[0] }}<br>{{ ru.messages.offersError[1] }}</p>
          <button type="button" class="text-button" @click="refresh()">{{ ru.paywall.retry }}</button>
        </div>
        <OfferCard v-for="offer in offersError || loading ? [] : offers" :key="offer.id" v-model="selectedId" :offer="offer" :disabled="busy" />
      </section>
      <button type="button" class="primary-button buy-button" :disabled="busy || loading || !!offersError || !selected" :aria-busy="operation === 'purchase'" @click="buy">
        <template v-if="operation === 'purchase'"><LumiIcon name="loader" class="spinner" />{{ ru.paywall.loadingPurchase }}</template>
        <template v-else-if="selected">{{ formatPurchaseButton(selected.price, selected.period) }}</template>
        <template v-else>{{ ru.paywall.openAccess }}</template>
      </button>
      <p class="purchase-terms">{{ ru.paywall.terms }}<br>{{ selected?.description ?? ru.paywall.chooseAfterLoading }}</p>
      <button type="button" class="text-button restore-button" :disabled="busy || loading || !!offersError" :aria-busy="operation === 'restore'" @click="restore">
        <LumiIcon v-if="operation === 'restore'" name="loader" class="spinner" />
        {{ operation === 'restore' ? ru.paywall.restoring : ru.paywall.restore }}
      </button>
      <div v-if="message" class="feedback" :class="`feedback-${messageKind}`" :role="messageKind === 'error' ? 'alert' : 'status'">{{ message }}</div>
      <p class="parent-note">{{ ru.paywall.parentNote }}</p>
      <noscript><p class="feedback feedback-error">{{ ru.paywall.javascriptRequired }}</p></noscript>
    </template>
  </main>
</template>
