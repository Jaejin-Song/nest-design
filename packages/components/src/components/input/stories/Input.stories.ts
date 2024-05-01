import type { Meta, StoryObj } from '@storybook/vue3';

import Input from '../input.vue';
import BasicExample from './Basic.vue';
import MethodExample from './Methods.vue';
import LabelExample from './WithLabel.vue';
import StateExample from './State.vue';
import TypeExample from './InputType.vue';
import MaskExample from './Mask.vue';
import DebounceExample from './Debounce.vue';

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    modelValue: undefined,
  },
  decorators: [
    (story) => ({
      components: { story },
      template: '<div style="margin: 3em; width: 300px"><story /></div>',
    }),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => ({
    components: { BasicExample },
    template: `<BasicExample />`,
  }),
};
export const Method: Story = {
  render: () => ({
    components: { MethodExample },
    template: `<MethodExample />`,
  }),
};
export const WithLabel: Story = {
  render: () => ({
    components: { LabelExample },
    template: `<LabelExample />`,
  }),
};
export const State: Story = {
  render: () => ({
    components: { StateExample },
    template: `<StateExample />`,
  }),
};
export const Type: Story = {
  render: () => ({
    components: { TypeExample },
    template: `<TypeExample />`,
  }),
};
export const Mask: Story = {
  render: () => ({
    components: { MaskExample },
    template: `<MaskExample />`,
  }),
};
export const Debounce: Story = {
  render: () => ({
    components: { DebounceExample },
    template: `<DebounceExample />`,
  }),
};
