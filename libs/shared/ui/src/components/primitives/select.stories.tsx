import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './select';

const meta: Meta<typeof Select> = {
  title: 'Primitives/Select',
  component: Select,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    placeholder: 'Ordenar por...',
    options: [
      { value: 'price_asc', label: 'Menor Preço' },
      { value: 'price_desc', label: 'Maior Preço' },
      { value: 'recent', label: 'Mais Recentes' },
      { value: 'popular', label: 'Mais Populares' },
    ],
  },
};
