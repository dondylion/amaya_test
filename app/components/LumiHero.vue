<script setup lang="ts">
defineProps<{ success?: boolean }>()
</script>

<template>
  <div class="hero" aria-hidden="true">
    <div class="hero-art">
      <img src="/images/lumi.svg" alt="" width="350" height="146" fetchpriority="high">
      <span v-if="success" class="hero-check"><LumiIcon name="check" /></span>
    </div>
  </div>
</template>
