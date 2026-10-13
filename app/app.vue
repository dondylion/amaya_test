<script setup lang="ts">
const {
  offers, selectedId, selected, loading, offersError, refresh, busy, operation,
  completed, purchaseOffer, restored, message, messageKind, buy, restore, returnToOffers,
} = usePaywall()
const heading = useTemplateRef('heading')
const money = (amount: number) => new Intl.NumberFormat('ru-RU').format(amount)
watch(() => !!completed.value, async () => {
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'instant' })
  heading.value?.focus({ preventScroll: true })
})
</script>

<template>
  <main class="paywall" :class="{ 'paywall-success': completed }">
    <header class="brand-header">
      <span class="logo" aria-label="Луми">луми</span>
      <span class="parent-badge">Для родителей</span>
    </header>
    <LumiHero :success="!!completed" />
    <template v-if="completed">
      <h1 ref="heading" tabindex="-1" class="headline success-headline">Приключения<br>начинаются!</h1>
      <p class="subtitle success-subtitle">Полный доступ открыт.<br>Можно исследовать мир Луми!</p>
      <section class="receipt" aria-label="Подтверждение покупки">
        <h2><LumiIcon name="check" />{{ restored ? 'Покупка восстановлена' : 'Покупка сохранена' }}</h2>
        <p class="receipt-plan">{{ purchaseOffer?.accessTitle }} · {{ money(completed.amount) }} ₽</p>
        <p class="receipt-note">Тестовая операция. Деньги не списаны.</p>
      </section>
      <button type="button" class="primary-button success-button" @click="returnToOffers">Здорово!</button>
      <button type="button" class="text-button back-button" @click="returnToOffers">Вернуться к тарифам</button>
    </template>
    <template v-else>
      <h1 ref="heading" tabindex="-1" class="headline">Целый мир<br>маленьких открытий</h1>
      <p class="subtitle">Все игры и новые приключения<br>в одной подписке</p>
      <ul class="benefits" aria-label="Преимущества подписки">
        <li><span class="benefit-sparkle" aria-hidden="true">✦</span>Все миры</li>
        <li><LumiIcon name="check" />Без рекламы</li>
      </ul>
      <section class="plans" aria-label="Выберите тариф" :aria-busy="loading">
        <template v-if="loading">
          <div class="offer-skeleton yearly-skeleton" />
          <div class="offer-skeleton monthly-skeleton" />
          <span class="sr-only" role="status">Загружаем тарифы…</span>
        </template>
        <div v-else-if="offersError" class="offers-error" role="alert">
          <LumiIcon name="alert" />
          <p>Не удалось загрузить тарифы.<br>Проверьте подключение к интернету.</p>
          <button type="button" class="text-button" @click="refresh()">Попробовать ещё раз</button>
        </div>
        <OfferCard v-for="offer in offersError || loading ? [] : offers" :key="offer.id" v-model="selectedId" :offer="offer" :disabled="busy" />
      </section>
      <button type="button" class="primary-button buy-button" :disabled="busy || loading || !!offersError || !selected" :aria-busy="operation === 'purchase'" @click="buy">
        <template v-if="operation === 'purchase'"><LumiIcon name="loader" class="spinner" />Открываем доступ…</template>
        <template v-else-if="selected">Открыть за {{ money(selected.price) }} ₽ / {{ selected.period }}</template>
        <template v-else>Открыть полный доступ</template>
      </button>
      <p class="purchase-terms">Тестовая покупка — без списания денег.<br>{{ selected?.description ?? 'Выберите тариф после загрузки.' }}</p>
      <button type="button" class="text-button restore-button" :disabled="busy || loading || !!offersError" :aria-busy="operation === 'restore'" @click="restore">
        <LumiIcon v-if="operation === 'restore'" name="loader" class="spinner" />
        {{ operation === 'restore' ? 'Восстанавливаем…' : 'Восстановить покупки' }}
      </button>
      <div v-if="message" class="feedback" :class="`feedback-${messageKind}`" :role="messageKind === 'error' ? 'alert' : 'status'">{{ message }}</div>
      <p class="parent-note">Покупки и настройки — с помощью взрослых</p>
      <noscript><p class="feedback feedback-error">Для выбора тарифа и тестовой покупки включите JavaScript.</p></noscript>
    </template>
  </main>
</template>
