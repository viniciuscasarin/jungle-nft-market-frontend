import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=I70522:3240;70504:3015;70486:523',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Badge Default',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Disponível',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Confirmado',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Últimas unidades',
  },
};

export const ErrorVariant: Story = {
  args: {
    variant: 'error',
    children: 'Esgotado',
  },
};

export const Edition: Story = {
  args: {
    variant: 'edition',
    children: '#42 de 100',
  },
};

export const Rarity: Story = {
  args: {
    variant: 'rarity',
    children: 'Lendário',
  },
};
