<script setup lang="ts">
import { ref } from 'vue';

const value = ref('');
</script>
<template>
  <n-input v-model="value" disabled label="disabled" />
  <n-input v-model="value" readonly label="readonly" />
</template>
<style lang="scss" scoped></style>
