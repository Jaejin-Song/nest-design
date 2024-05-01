<script setup lang="ts">
import { type HTMLAttributes, computed, toRaw } from 'vue';
import type { Props, Emtis } from './type';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
  trueValue: true,
  falseValue: false,
  indeterminateValue: null,

  tabIndex: 0,
});
const emit = defineEmits<Emtis>();

const modelIsArray = computed(() => Array.isArray(props.modelValue));

const index = computed(() => {
  const value = toRaw(props.value);

  return modelIsArray.value === true
    ? props.modelValue.findIndex((opt: any) => toRaw(opt) === value)
    : -1;
});

const isTrue = computed(() =>
  modelIsArray.value === true
    ? index.value > -1
    : toRaw(props.modelValue) === toRaw(props.trueValue),
);

const isFalse = computed(() =>
  modelIsArray.value === true
    ? index.value === -1
    : toRaw(props.modelValue) === toRaw(props.falseValue),
);

const isIndeterminate = computed(
  () => isTrue.value === false && isFalse.value === false,
);

const classes = computed(
  () =>
    'n-checkbox' +
    (props.leftLabel === true ? ' n-checkbox--reverse' : '') +
    (props.disabled === true ? ` n-checkbox--disabled` : ''),
);

const innerClass = computed(() => {
  const state =
    isTrue.value === true
      ? 'truthy'
      : isFalse.value === true
        ? 'falsy'
        : 'indet';

  return `n-checkbox__inner n-checkbox__inner--${state}`;
});

const onClick = (e: Event) => {
  if (e !== void 0) {
    e.stopPropagation();
  }

  if (props.disabled !== true) {
    emit('update:modelValue', getNextValue());
  }
};

const getNextValue = () => {
  if (modelIsArray.value === true) {
    if (isTrue.value === true) {
      const copy = [...props.modelValue] as Array<any>;
      copy.splice(index.value, 1);
      return copy;
    }

    return props.modelValue.concat([props.value]);
  }

  if (isTrue.value === true) {
    return props.falseValue;
  } else if (isFalse.value === true) {
    return props.trueValue;
  }

  return getIndetNextValue();
};

const getIndetNextValue = () => {
  return props.trueValue;
};

const tabIndex = computed(() =>
  props.disabled === true ? -1 : props.tabIndex,
);

const attributes = computed(() => {
  const attrs: HTMLAttributes = {
    tabindex: tabIndex.value,
    role: 'checkbox',
    'aria-label': props.label,
    'aria-checked':
      isIndeterminate.value === true
        ? 'mixed'
        : isTrue.value === true
          ? 'true'
          : 'false',
    'aria-disabled': props.disabled === true ? 'true' : 'false',
  };

  return attrs;
});

const formAttrs = computed(() => {
  const attrs = {
    type: 'checkbox',
    // dom property
    '.checked': isTrue.value,
    // dom attribute
    '^checked': isTrue.value === true ? true : void 0,
    name: props.name,
    value: modelIsArray.value === true ? props.value : props.trueValue,
  };

  return attrs;
});

const onKeyup = (e: KeyboardEvent) => {
  if (e.code === 'Enter' || e.code === 'Space') {
    onClick(e);
  }
};

const onKeyDown = (e: KeyboardEvent) => {
  if (e.code === 'Enter' || e.code === 'Space') {
    e.preventDefault();
    e.stopPropagation();
  }
};
</script>
<template>
  <div
    :class="classes"
    v-bind="attributes"
    @click="onClick"
    @keyup="onKeyup"
    @keydown="onKeyDown">
    <div :class="innerClass" aria-hidden="true">
      <!-- input은 상속받아서 쓰는걸로 수정해야함 -->
      <input class="n-checkbox__native" v-bind="formAttrs" />
      <div class="n-checkbox__bg">
        <svg class="n-checkbox__svg" viewBox="0 0 24 24">
          <path
            class="n-checkbox__truthy"
            fill="none"
            d="M4 12.6111L8.92308 17.5L20 6.5" />
          <path class="n-checkbox__indet" d="M4,14H20V10H4" />
        </svg>
      </div>
    </div>
    <div v-if="label" class="n-checkbox__label">
      {{ label }}
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
