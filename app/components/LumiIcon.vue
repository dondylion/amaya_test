<script setup lang="ts">
import { ASSETS } from '#shared/constants/paywall'
defineProps<{ name: 'check' | 'sparkle' | 'restore' | 'loader' | 'arrow' | 'alert' }>()
</script>

<template>
  <svg class="icon" :width="ASSETS.iconSize" :height="ASSETS.iconSize" :viewBox="ASSETS.iconViewBox" aria-hidden="true" focusable="false">
    <use :href="`${ASSETS.icons}#${name}`" />
  </svg>
</template>
