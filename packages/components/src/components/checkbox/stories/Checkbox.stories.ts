import type { Meta, StoryObj } from '@storybook/vue3';

import Checkbox from '../checkbox.vue';
import BasicExample from './basic.vue';
import LabelExample from './label.vue';
import ArrayModelExample from './arrayModel.vue';
import CheckAllExample from './checkAll.vue';
import DisabledExample from './disabled.vue';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  args: {
    modelValue: true,
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Basic: Story = {
  render: () => ({
    components: { BasicExample },
    template: `<BasicExample />`,
  }),
};

export const WithLabel: Story = {
  render: () => ({
    components: { LabelExample },
    template: `<LabelExample />`,
  }),
};

export const ArrayModel: Story = {
  render: () => ({
    components: { ArrayModelExample },
    template: `<ArrayModelExample />`,
  }),
};

export const CheckAll: Story = {
  render: () => ({
    components: { CheckAllExample },
    template: `<CheckAllExample />`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { DisabledExample },
    template: `<DisabledExample />`,
  }),
};
