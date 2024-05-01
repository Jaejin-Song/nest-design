<script setup lang="ts">
import { ref } from 'vue';

const value = ref('');
</script>
<template>
  <div>
    <n-input v-model="value" label="input label"></n-input>
  </div>
</template>
<style lang="scss" scoped></style>
