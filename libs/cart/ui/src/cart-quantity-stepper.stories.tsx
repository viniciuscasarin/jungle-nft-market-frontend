import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { CartQuantityStepper } from './cart-quantity-stepper';

const meta: Meta<typeof CartQuantityStepper> = {
  title: 'Cart/CartQuantityStepper',
  component: CartQuantityStepper,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CartQuantityStepper>;

function DefaultStepperDemo() {
  const [val, setVal] = React.useState(2);
  return (
    <div className="p-6 bg-surface-default text-text-primary">
      <CartQuantityStepper value={val} onChange={setVal} min={1} max={10} />
    </div>
  );
}

function SmallStepperDemo() {
  const [val, setVal] = React.useState(1);
  return (
    <div className="p-6 bg-surface-default text-text-primary">
      <CartQuantityStepper value={val} size="sm" onChange={setVal} min={1} max={5} />
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultStepperDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const incBtn = canvas.getByRole('button', { name: 'Aumentar quantidade' });
    const decBtn = canvas.getByRole('button', { name: 'Diminuir quantidade' });
    const spin = canvas.getByRole('spinbutton');

    await expect(spin).toHaveTextContent('2');
    await userEvent.click(incBtn);
    await expect(spin).toHaveTextContent('3');
    await userEvent.click(decBtn);
    await expect(spin).toHaveTextContent('2');
  },
};

export const SmallMobile: Story = {
  render: () => <SmallStepperDemo />,
};
