---
title: Hello
slug: home
---

<script setup lang="ts">
import { ref } from 'vue';

const value = ref('');
</script>
<template>
  <n-input v-model="value"></n-input>
  <div>
    {{ `model : ${value}` }}
  </div>
</template>
<style lang="scss" scoped></style>
