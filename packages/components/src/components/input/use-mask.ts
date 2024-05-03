import { type Ref, nextTick, ref, watch } from 'vue';
import { shouldIgnoreKey } from '../../utils/key-composition';
import type { InputType } from './type';

export interface MaskProps {
  modelValue: string | number | undefined | null;
  mask?: string;
  fillMask?: boolean | string;
  unmaskedValue?: boolean;
  type: InputType;
}

// leave NAMED_MASKS at top of file (code referenced from docs)
const NAMED_MASKS: Record<string, string> = {
  date: '####/##/##',
  datetime: '####/##/## ##:##',
  time: '##:##',
  fulltime: '##:##:##',
  phone: '(###) ### - ####',
  card: '#### #### #### ####',
};

type TokenDef = {
  pattern: string;
  negate: string;
  transform?: (v: string) => string;
  regex?: RegExp;
};

const TOKEN_KEYS = ['#', 'S', 'N', 'A', 'a', 'X', 'x'] as const;

type TokensDef = Record<(typeof TOKEN_KEYS)[number], TokenDef>;

const TOKENS: TokensDef = {
  '#': { pattern: '[\\d]', negate: '[^\\d]' },

  S: { pattern: '[a-zA-Z]', negate: '[^a-zA-Z]' },
  N: { pattern: '[0-9a-zA-Z]', negate: '[^0-9a-zA-Z]' },

  A: {
    pattern: '[a-zA-Z]',
    negate: '[^a-zA-Z]',
    transform: (v) => v.toLocaleUpperCase(),
  },
  a: {
    pattern: '[a-zA-Z]',
    negate: '[^a-zA-Z]',
    transform: (v) => v.toLocaleLowerCase(),
  },

  X: {
    pattern: '[0-9a-zA-Z]',
    negate: '[^0-9a-zA-Z]',
    transform: (v) => v.toLocaleUpperCase(),
  },
  x: {
    pattern: '[0-9a-zA-Z]',
    negate: '[^0-9a-zA-Z]',
    transform: (v) => v.toLocaleLowerCase(),
  },
};

TOKEN_KEYS.forEach((key) => {
  TOKENS[key].regex = new RegExp(TOKENS[key].pattern);
});

// TOKEN_KEYS 다른 변수를 사용하여 특정 문자들을 포함한 정규 표현식을 생성
const tokenRegexMask = new RegExp(
    '\\\\([^.*+?^${}()|([\\]])|([.*+?^${}()|[\\]])|([' +
      TOKEN_KEYS.join('') +
      '])|(.)',
    'g',
  ),
  escRegex = /[.*+?^${}()|[\]\\]/g;

// '\x01'
const MARKER = String.fromCharCode(1);

export const useMask = (
  props: MaskProps,
  emitValue: (val: string | number, stopWatcher?: boolean) => void,
  inputRef: Ref<HTMLInputElement | undefined>,
) => {
  let computedUnmask: undefined | ((val: string) => string),
    computedMask: undefined | any[],
    maskMarked: undefined | string,
    maskReplaced: undefined | string,
    selectionAnchor: undefined | number;

  const hasMask = ref<boolean | null>(null);
  const innerValue = ref(getInitialMaskedValue());

  function getIsTypeText() {
    return ['textarea', 'text', 'search', 'url', 'tel', 'password'].includes(
      props.type,
    );
  }

  watch(
    () => props.mask,
    (v) => {
      if (v !== undefined) {
        updateMaskValue(String(innerValue.value), true);
      }
    },
  );

  function getInitialMaskedValue() {
    updateMaskInternals();

    if (hasMask.value === true) {
      const masked = maskValue(unmaskValue(String(props.modelValue)));

      return props.fillMask !== false ? fillWithMask(masked) : masked;
    }

    return props.modelValue;
  }

  function updateMaskInternals() {
    if (props.mask === undefined) {
      hasMask.value === false;
      return;
    }
    hasMask.value = props.mask.length !== 0 && getIsTypeText();

    if (hasMask.value === false) {
      computedUnmask = undefined;

      return;
    }

    const localComputedMask =
        NAMED_MASKS[props.mask] === undefined
          ? props.mask
          : NAMED_MASKS[props.mask],
      fillChar =
        typeof props.fillMask === 'string' && props.fillMask.length !== 0
          ? props.fillMask.slice(0, 1)
          : '_',
      fillCharEscaped = fillChar.replace(escRegex, '\\$&'),
      unmask: string[] = [],
      extract: string[] = [],
      mask: (string | TokenDef)[] = [];

    let unmaskChar = '',
      negateChar = '';

    localComputedMask.replace(tokenRegexMask, (_, char1, esc, token, char2) => {
      if (token !== undefined) {
        const c = TOKENS[token];
        mask.push(c);
        negateChar = c.negate;

        extract.push('(?:' + negateChar + '+)?(' + c.pattern + ')?');
      } else if (esc !== undefined) {
        unmaskChar = '\\' + (esc === '\\' ? '' : esc);
        mask.push(esc);
        unmask.push('([^' + unmaskChar + ']+)?' + unmaskChar + '?');
      } else {
        const c = char1 !== undefined ? char1 : char2;
        unmaskChar = c === '\\' ? '\\\\\\\\' : c.replace(escRegex, '\\\\$&');
        mask.push(c);
        unmask.push('([^' + unmaskChar + ']+)?' + unmaskChar + '?');
      }

      // just for type issue
      return '';
    });

    const unmaskMatcher = new RegExp(
        '^' +
          unmask.join('') +
          '(' +
          (unmaskChar === '' ? '.' : '[^' + unmaskChar + ']') +
          '+)?' +
          (unmaskChar === '' ? '' : '[' + unmaskChar + ']*') +
          '$',
      ),
      extractLast = extract.length - 1,
      extractMatcher = extract.map((re, index) => {
        if (index === extractLast) {
          return new RegExp(
            '^' +
              re +
              '(' +
              (negateChar === '' ? '.' : negateChar) +
              '+)?' +
              (fillCharEscaped + '*'),
          );
        }

        return new RegExp('^' + re);
      });

    computedMask = mask;
    computedUnmask = (val) => {
      const unmaskMatch = unmaskMatcher.exec(val.slice(0, mask.length + 1));
      if (unmaskMatch !== null) {
        val = unmaskMatch.slice(1).join('');
      }

      const extractMatch: string[] = [],
        extractMatcherLength = extractMatcher.length;

      for (let i = 0, str = val; i < extractMatcherLength; i++) {
        const m = extractMatcher[i].exec(str);

        if (m === null) {
          break;
        }

        str = str.slice((m.shift() ?? '').length);
        extractMatch.push(...m);
      }
      if (extractMatch.length !== 0) {
        return extractMatch.join('');
      }

      return val;
    };
    maskMarked = mask.map((v) => (typeof v === 'string' ? v : MARKER)).join('');
    maskReplaced = maskMarked.split(MARKER).join(fillChar);
  }

  function updateMaskValue(
    rawVal: string,
    updateMaskInternalsFlag?: boolean,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inputType?: string,
  ) {
    const inp = inputRef.value;
    if (inp === undefined) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const end = inp.selectionEnd ?? 0,
      unmasked = unmaskValue(rawVal);

    // Update here so unmask uses the original fillChar
    updateMaskInternalsFlag === true && updateMaskInternals();

    const preMasked = maskValue(unmasked),
      masked = props.fillMask !== false ? fillWithMask(preMasked) : preMasked,
      changed = innerValue.value !== masked;

    console.log('rawVal :>> ', rawVal);
    console.log('unmasked :>> ', unmasked);
    console.log('preMasked :>> ', preMasked);
    console.log('masked :>> ', masked);

    inp.value !== masked && (inp.value = masked);

    changed === true && (innerValue.value = masked);

    document.activeElement === inp &&
      nextTick(() => {
        if (masked === maskReplaced) {
          inp.setSelectionRange(0, 0, 'forward');

          return;
        }

        // if (changed === true) {
        //   const cursor = Math.max(
        //     0,
        //     maskMarked.indexOf(MARKER),
        //     Math.min(preMasked.length, end) - 1,
        //   );
        //   moveCursor.right(inp, cursor);
        // } else {
        //   // 값을 임의로 넣어주기 때문에 커서가 맨 뒤로 움직임
        //   // 처음의 위치로 커서를 다시 옮겨줘야됨
        //   const cursor = end - 1;
        //   moveCursor.right(inp, cursor);
        // }

        const cursor = end - 1;
        moveCursor.right(inp, cursor);
      });

    const val = props.unmaskedValue === true ? unmaskValue(masked) : masked;

    if (
      String(
        props.modelValue !== val && (props.modelValue !== null || val !== ''),
      )
    ) {
      emitValue(val, true);
    }
  }

  function maskValue(val: undefined | null | string) {
    if (val === undefined || val === null || val === '') {
      return '';
    }

    const mask = computedMask;
    if (mask === undefined) {
      return '';
    }

    let valIndex = 0,
      output = '';

    for (let maskIndex = 0; maskIndex < mask.length; maskIndex++) {
      const valChar = val[valIndex],
        maskDef = mask[maskIndex];

      if (typeof maskDef === 'string') {
        output += maskDef;
        valChar === maskDef && valIndex++;
      } else if (valChar !== undefined && maskDef.regex.test(valChar)) {
        output +=
          maskDef.transform !== undefined ? maskDef.transform(valChar) : valChar;
        valIndex++;
      } else {
        return output;
      }
    }

    return output;
  }

  function unmaskValue(val: string | number): string {
    if (computedUnmask === undefined) return val.toString();

    if (typeof val === 'number') return computedUnmask(val.toString());

    return computedUnmask(val);
  }

  function fillWithMask(val: string) {
    if (maskReplaced === undefined) return val;

    if (maskReplaced.length - val.length <= 0) {
      return val;
    }

    return val + maskReplaced.slice(val.length);
  }

  function getPaddedMaskMarked(size: number) {
    // 타입가드를 위한 예외처리지만 ''을 return하는게 올바른 액션은 아님.
    if (maskMarked === undefined) return '';

    if (size < maskMarked.length) {
      return maskMarked.slice(-size);
    }

    let pad = '',
      localMaskMarked = maskMarked;
    const padPos = localMaskMarked.indexOf(MARKER);

    if (padPos !== -1) {
      for (let i = size - localMaskMarked.length; i > 0; i--) {
        pad += MARKER;
      }

      localMaskMarked =
        localMaskMarked.slice(0, padPos) + pad + localMaskMarked.slice(padPos);
    }

    return localMaskMarked;
  }

  const moveCursor = {
    left(inp: HTMLInputElement, cursor: number) {
      if (maskMarked === undefined) return;

      const noMarkBefore = maskMarked.slice(cursor - 1).indexOf(MARKER) === -1;
      let i = Math.max(0, cursor - 1);

      for (; i >= 0; i--) {
        if (maskMarked[i] === MARKER) {
          cursor = i;
          noMarkBefore === true && cursor++;
          break;
        }
      }

      if (
        i < 0 &&
        maskMarked[cursor] !== undefined &&
        maskMarked[cursor] !== MARKER
      ) {
        return moveCursor.right(inp, 0);
      }

      cursor >= 0 && inp.setSelectionRange(cursor, cursor, 'backward');
    },

    right(inp: HTMLInputElement, cursor: number) {
      if (maskMarked === undefined) return;

      const limit = inp.value.length;
      let i = Math.min(limit, cursor + 1);

      for (; i <= limit; i++) {
        if (maskMarked[i] === MARKER) {
          cursor = i;
          break;
        } else if (maskMarked[i - 1] === MARKER) {
          cursor = i;
        }
      }

      if (
        i > limit &&
        maskMarked[cursor - 1] !== undefined &&
        maskMarked[cursor - 1] !== MARKER
      ) {
        return moveCursor.left(inp, limit);
      }

      inp.setSelectionRange(cursor, cursor, 'forward');
    },

    leftReverse(inp: HTMLInputElement, cursor: number) {
      const localMaskMarked = getPaddedMaskMarked(inp.value.length);
      let i = Math.max(0, cursor - 1);

      for (; i >= 0; i--) {
        if (localMaskMarked[i - 1] === MARKER) {
          cursor = i;
          break;
        } else if (localMaskMarked[i] === MARKER) {
          cursor = i;
          if (i === 0) {
            break;
          }
        }
      }

      if (
        i < 0 &&
        localMaskMarked[cursor] !== undefined &&
        localMaskMarked[cursor] !== MARKER
      ) {
        return moveCursor.rightReverse(inp, 0);
      }

      cursor >= 0 && inp.setSelectionRange(cursor, cursor, 'backward');
    },

    rightReverse(inp: HTMLInputElement, cursor: number) {
      const limit = inp.value.length,
        localMaskMarked = getPaddedMaskMarked(limit),
        noMarkBefore =
          localMaskMarked.slice(0, cursor + 1).indexOf(MARKER) === -1;
      let i = Math.min(limit, cursor + 1);

      for (; i <= limit; i++) {
        if (localMaskMarked[i - 1] === MARKER) {
          cursor = i;
          cursor > 0 && noMarkBefore === true && cursor--;
          break;
        }
      }

      if (
        i > limit &&
        localMaskMarked[cursor - 1] !== undefined &&
        localMaskMarked[cursor - 1] !== MARKER
      ) {
        return moveCursor.leftReverse(inp, limit);
      }

      inp.setSelectionRange(cursor, cursor, 'forward');
    },
  };

  function onMaskedKeydown(e: KeyboardEvent) {
    // emit('keydown', e)

    if (
      shouldIgnoreKey(e) === true ||
      e.altKey === true // let browser handle these
    ) {
      return;
    }

    const inp = inputRef.value as HTMLInputElement,
      start = inp.selectionStart ?? 0,
      end = inp.selectionEnd ?? 0;

    if (!e.shiftKey) {
      selectionAnchor = undefined;
    }

    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
      // Left / Right
      if (e.shiftKey && selectionAnchor === undefined) {
        selectionAnchor = inp.selectionDirection === 'forward' ? start : end;
      }

      const fn = moveCursor[e.code === 'ArrowRight' ? 'right' : 'left'];

      e.preventDefault();
      fn(inp, selectionAnchor === start ? end : start);

      if (e.shiftKey) {
        const cursor = inp.selectionStart ?? 0;
        inp.setSelectionRange(
          Math.min(selectionAnchor!, cursor),
          Math.max(selectionAnchor!, cursor),
          'forward',
        );
      }
    } else if (
      e.code === 'Backspace' && // Backspace
      start === end
    ) {
      moveCursor.left(inp, start);
      inp.setSelectionRange(inp.selectionStart, end, 'backward');
    } else if (
      e.code === 'Delete' && // Delete
      start === end
    ) {
      moveCursor.rightReverse(inp, end);
      inp.setSelectionRange(start, inp.selectionEnd, 'forward');
    }
  }

  return {
    innerValue,
    hasMask,
    updateMaskValue,
    onMaskedKeydown,
  };
};
