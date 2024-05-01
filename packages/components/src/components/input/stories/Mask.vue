<script setup lang="ts">
import { ref } from 'vue';

const value = ref('');
const value2 = ref('');
const value3 = ref('');
</script>
<template>
  <div>
    <n-input v-model="value" mask="###-###" hint="mask: ###-###"></n-input>
    <div>
      {{ `value: ${value}` }}
    </div>
  </div>

  <div>
    <n-input
      v-model="value2"
      mask="###-###"
      hint="mask: ###-###, fill-mask"
      fill-mask></n-input>
    <div>
      {{ `value: ${value2}` }}
    </div>
  </div>

  <div>
    <n-input
      v-model="value3"
      mask="###-###"
      hint="mask: ###-###, fill-mask, unmaskedValue"
      fill-mask
      unmaskedValue></n-input>
    <div>
      {{ `value: ${value3}` }}
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
