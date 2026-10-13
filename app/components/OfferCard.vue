<script setup lang="ts">
import { DEFAULT_OFFER_ID } from '#shared/constants/paywall'
import { formatPrice, formatMonthlyPrice, formatOfferLabel } from '#shared/format'
import type { Offer } from '#shared/types/paywall'

const props = defineProps<{
  offer: Offer
  modelValue: string
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const selected = computed(() => props.modelValue === props.offer.id)
</script>

<template>
  <label class="offer" :class="{ 'offer-selected': selected, 'offer-yearly': offer.id === DEFAULT_OFFER_ID, 'offer-disabled': disabled }">
    <input
      :id="`offer-${offer.id}`"
      class="sr-only"
      type="radio"
      name="offer"
      :value="offer.id"
      :checked="selected"
      :disabled="disabled"
      :aria-label="formatOfferLabel(offer.title, offer.price)"
      @change="emit('update:modelValue', offer.id)"
    >
    <span class="offer-radio" aria-hidden="true"><LumiIcon v-if="selected" name="check" /></span>
    <span class="offer-content">
      <span class="offer-title">{{ offer.title }}</span>
      <span class="offer-price">{{ formatPrice(offer.price, offer.period) }}</span>
      <span v-if="offer.monthlyPrice" class="offer-monthly">{{ formatMonthlyPrice(offer.monthlyPrice) }}</span>
    </span>
    <span v-if="offer.badge" class="offer-badge">{{ offer.badge }}</span>
  </label>
</template>
