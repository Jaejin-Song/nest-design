<script setup lang="ts">
import { computed, ref } from 'vue';

const options = ['john', 'jack', 'mike'];
const checkedList = ref<string[]>(['john']);

const checkState = computed(() =>
  checkedList.value.length === options.length
    ? true
    : checkedList.value.length
      ? null
      : false,
);

const onUpdateCheckState = (_value: any) => {
  const val = _value as boolean | null;

  if (val === true) {
    checkedList.value = [...options];
  } else {
    checkedList.value = [];
  }
};
</script>
<template>
  <div>
    <n-checkbox
      :model-value="checkState"
      @update:model-value="onUpdateCheckState"
      label="check state" />
  </div>
  <div>
    <n-checkbox
      v-for="opt of options"
      :key="opt"
      v-model="checkedList"
      :value="opt"
      :label="opt" />
  </div>
</template>
<style lang="scss" scoped></style>
