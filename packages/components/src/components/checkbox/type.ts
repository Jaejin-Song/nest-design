/* eslint-disable @typescript-eslint/no-explicit-any */

export interface FormProps {
  name?: string;
}

export interface Props extends FormProps {
  /**
   * The label of the button
   */
  modelValue: any;
  // value props
  value?: any;

  trueValue?: any;
  falseValue?: any;
  indeterminateValue?: any;

  label?: string;
  leftLabel?: boolean;

  disabled?: boolean;
  tabIndex?: number;
}

export interface Emtis {
  (e: 'update:modelValue', modelValue: any): void;
}
