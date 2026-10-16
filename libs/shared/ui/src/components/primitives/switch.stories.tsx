import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Switch } from './switch';

const meta: Meta<typeof Switch> = {
  title: 'Primitives/Switch',
  component: Switch,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    label: 'Notificações de preço',
    description: 'Receber alertas em tempo real quando um item for listado abaixo da cotação.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchBtn = canvas.getByRole('switch');
    await expect(switchBtn).toBeInTheDocument();
    await userEvent.click(switchBtn);
    await expect(switchBtn).toHaveAttribute('aria-checked', 'true');
  },
};

export const Checked: Story = {
  args: {
    label: 'Modo de economia de dados',
    defaultChecked: true,
  },
};
