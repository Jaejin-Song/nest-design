<script setup lang="ts">
import { ref } from 'vue';

const value = ref('');

const onUpdate = (val: any) => {
  console.log('update val :>> ', val);
};

const onFocus = (e: FocusEvent) => {
  console.log('focus e :>> ', e);
};

const onBlur = (e: FocusEvent) => {
  console.log('blur e :>> ', e);
};

const onChange = (val: any) => {
  console.log('change val :>> ', val);
};
</script>
<template>
  <div>
    <n-input
      v-model="value"
      @update:model-value="onUpdate"
      @focus="onFocus"
      @blur="onBlur"
      @change="onChange">
    </n-input>
  </div>
</template>
<style lang="scss" scoped></style>
