<script setup lang="ts">
import { ref } from 'vue';

const inputRef = ref();
const value = ref('');

const focus = () => {
  inputRef.value.focus();
};
const blur = () => {
  inputRef.value.blur();
};
const select = () => inputRef.value.select();

const nativeFocus = () => {
  const nativeInput = inputRef.value.nativeEl();
  nativeInput.focus();
};
</script>
<template>
  <div>
    <button @click="focus">focus</button>
    <button @click="blur">blur</button>
    <button @click="select">select</button>
    <button @click="nativeFocus">nativeFocus</button>
  </div>
  <n-input ref="inputRef" v-model="value"></n-input>
</template>
<style lang="scss" scoped></style>
