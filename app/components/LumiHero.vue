<script setup lang="ts">
import { ASSETS } from '#shared/constants/paywall'
defineProps<{ success?: boolean }>()
</script>

<template>
  <div class="hero" aria-hidden="true">
    <div class="hero-art">
      <img :src="ASSETS.hero" alt="" :width="ASSETS.heroWidth" :height="ASSETS.heroHeight" fetchpriority="high">
      <span v-if="success" class="hero-check"><LumiIcon name="check" /></span>
    </div>
  </div>
</template>
