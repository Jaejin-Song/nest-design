<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useMask } from './useMask';
import type { InputType } from './type';

export interface Props {
  modelValue: string | number | undefined | null;
  label?: string;

  autofocus?: boolean;
  placeholder?: string;

  type?: InputType;

  /** mask */
  mask?: string;
  fillMask?: boolean | string;
  unmaskedValue?: boolean;

  /** state */
  disabled?: boolean;
  readonly?: boolean;

  /** milliseconds */
  debounce?: number;

  hint?: string;
}
export interface Emits {
  (e: 'update:modelValue', value: string | number): void;
  (e: 'change', value: string | number): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
});
const emit = defineEmits<Emits>();

let // for debounce
  emitTimer: null | NodeJS.Timeout = null,
  emitValueFn: undefined | (() => void);

const inputRef = ref<HTMLInputElement>();

const { innerValue, hasMask, updateMaskValue, onMaskedKeydown } = useMask(
  props,
  emitValue,
  inputRef,
);

const isTypeText = computed(() =>
  ['text', 'search', 'url', 'tel', 'password'].includes(props.type),
);

const onInput = (e: Event) => {
  const eventTarget = e.target as HTMLInputElement;
  const value = eventTarget.value;

  if (hasMask.value === true) {
    updateMaskValue(value, false, (e as InputEvent).inputType);
  } else {
    emitValue(value);

    if (isTypeText.value === true && e.target === document.activeElement) {
      const { selectionStart, selectionEnd } = eventTarget;

      if (selectionStart !== void 0 && selectionEnd !== void 0) {
        nextTick(() => {
          if (
            e.target === document.activeElement &&
            value.indexOf(value) === 0
          ) {
            eventTarget.setSelectionRange(selectionStart, selectionEnd);
          }
        });
      }
    }
  }
};

function emitValue(val: string | number) {
  emitValueFn = () => {
    emitTimer = null;

    if (props.modelValue !== val) {
      emit('update:modelValue', val);
    }

    emitValueFn = void 0;
  };

  if (props.debounce !== void 0) {
    emitTimer !== null && clearTimeout(emitTimer);
    emitTimer = setTimeout(emitValueFn, props.debounce);
  } else {
    emitValueFn();
  }
}

// function getCurValue() {
//   return temp.hasOwnProperty('value') === true
//     ? temp.value
//     : innerValue.value !== void 0
//       ? innerValue.value
//       : '';
// }

const onChange = (e: Event) => {
  emit('change', (e.target as HTMLInputElement).value);
};

const inputAttrs = computed(() => {
  const attrs = {
    type: props.type,
    // 'data-autofocus': props.autofocus === true || void 0,
    // rows: props.type === 'textarea' ? 6 : void 0,
    // 'aria-label': props.label,
    // name: nameProp.value,
    // ...state.splitAttrs.attributes.value,
    // id: state.targetUid.value,
    // maxlength: props.maxlength,
    disabled: props.disabled === true,
    readonly: props.readonly === true,
  };

  return attrs;
});

const focus = () => {
  const el = document.activeElement;

  if (inputRef.value !== null && inputRef.value !== el) {
    inputRef.value?.focus();
  }
};

const blur = () => {
  const el = document.activeElement;

  if (el !== null && inputRef.value === el) {
    inputRef.value.blur();
  }
};

const select = () => inputRef.value !== void 0 && inputRef.value.select();

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 필요하면 추후에 오픈함
const nativeEl = () => inputRef.value;

const onFocus = (e: FocusEvent) => {
  e.stopPropagation();
  emit('focus', e);
};

const onBlur = (e: FocusEvent) => {
  emit('blur', e);
};

const vFocus = {
  mounted: (el: HTMLInputElement) => props.autofocus === true && el.focus(),
};

defineExpose({
  focus,
  blur,
  select,
});

const inputValue = computed(() =>
  !props.mask ? props.modelValue : innerValue.value,
);
</script>
<template>
  <label>
    <span>{{ label }}</span>
    <div class="n-input__wrapper">
      <div v-if="$slots.prepend" class="prepend">
        <slot name="prepend" />
      </div>

      <div class="n-input__input-container">
        <span v-if="$slots.prefix" class="prefix">
          <slot name="prefix" />
        </span>
        <input
          v-focus
          ref="inputRef"
          class="n-input__native"
          v-bind="inputAttrs"
          :value="inputValue"
          :placeholder="placeholder"
          @input="onInput"
          @change="onChange"
          @focus="onFocus"
          @blur="onBlur"
          @keydown="onMaskedKeydown" />
        <span v-if="$slots.suffix" class="suffix">
          <slot name="suffix" />
        </span>
      </div>

      <div v-if="$slots.append" class="append">
        <slot name="append" />
      </div>
    </div>

    <div v-if="hint" class="n-input__bottom">
      {{ hint }}
    </div>
  </label>
</template>
<style lang="scss" scoped>
.n-input {
  &__wrapper {
    background: #ffffff;
    padding: 4px 8px;
    border: 1px solid #d9d9d9;
    display: flex;
  }

  &__native {
    border-width: 0;
    flex: 1;
  }

  &__input-container {
    display: flex;
    flex: 1;
  }
}

// input search x버튼 없애는 용도
input::-ms-clear,
input::-ms-reveal {
  display: none;
  width: 0;
  height: 0;
}
input::-webkit-search-decoration,
input::-webkit-search-cancel-button,
input::-webkit-search-results-button,
input::-webkit-search-results-decoration {
  display: none;
}
</style>
