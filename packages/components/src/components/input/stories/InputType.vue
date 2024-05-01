<script setup lang="ts">
import { ref } from 'vue';
import search from '../../../assets/search.svg';
import passwordSvg from '../../../assets/password.svg';

const textVal = ref('');
const numberVal = ref<number>();
const password = ref('');
const isPassword = ref(true);

const onUpdate = (val: any) => {
  console.log('val :>> ', val, typeof val, typeof numberVal.value);
};

const test = () => {
  console.log('import.meta.url :>> ', import.meta.url);
};

test();
</script>
<template>
  <n-input v-model="textVal" @change="onUpdate" label="type text" />
  <n-input
    v-model.number="numberVal"
    @change="onUpdate"
    type="number"
    label="type number"
    hint="type: number" />

  <n-input v-model="password" type="password" hint="type: password"> </n-input>
  <n-input
    v-model="password"
    @change="onUpdate"
    :type="isPassword ? 'password' : 'text'"
    hint="type: password with toggle">
    <template #append>
      <span @click="isPassword = !isPassword" role="presentation">
        <img
          :src="passwordSvg"
          alt="search icon"
          style="width: 12px; height: 12px" />
      </span>
    </template>
  </n-input>

  <n-input
    v-model="password"
    @change="onUpdate"
    :type="'search'"
    hint="type: search">
    <template #append>
      <span role="presentation">
        <img
          :src="search"
          alt="search icon"
          style="width: 12px; height: 12px" />
      </span>
    </template>
    <template #prefix> search : </template>
    <template #suffix> -suffix </template>
  </n-input>
</template>
<style lang="scss" scoped></style>
