<script setup lang="ts">
defineProps<{ name: 'check' | 'sparkle' | 'restore' | 'loader' | 'arrow' | 'alert' }>()
</script>

<template>
  <svg class="icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <use :href="`/images/icons.svg#${name}`" />
  </svg>
</template>
