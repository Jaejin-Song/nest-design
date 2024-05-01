<script setup lang="ts">
import { ref } from 'vue';

const value = ref('');
</script>
<template>
  <n-input v-model="value" :debounce="500" hint="debounce: 500" />
  <div>
    {{ `value: ${value}` }}
  </div>
</template>
<style lang="scss" scoped></style>
