<script setup lang="ts">
import Basic from './Basic.vue';
import Events from './Events.vue';
import Methods from './Methods.vue';
import WithLabel from './WithLabel.vue';
import State from './State.vue';
import InputType from './InputType.vue';
import Mask from './Mask.vue';
import Debounce from './Debounce.vue';
</script>
<template>
  <main class="component-page">
    <Basic />
    <Events />
    <Methods />
    <WithLabel />
    <State />
    <InputType />
    <Mask />
    <Debounce />
  </main>
</template>
<style lang="scss" scoped>
.component-page {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
