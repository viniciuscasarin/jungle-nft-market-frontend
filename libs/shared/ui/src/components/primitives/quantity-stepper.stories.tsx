import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import React, { useState } from 'react';
import { QuantityStepper } from './quantity-stepper';

function QuantityStepperDemo() {
  const [qty, setQty] = useState(1);
  return <QuantityStepper value={qty} onChange={setQty} min={1} max={10} />;
}

const meta: Meta<typeof QuantityStepper> = {
  title: 'Primitives/QuantityStepper',
  component: QuantityStepper,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof QuantityStepper>;

export const Default: Story = {
  render: () => <QuantityStepperDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const incButton = canvas.getByRole('button', { name: /Aumentar quantidade/i });
    await expect(incButton).toBeInTheDocument();
    await userEvent.click(incButton);
    const input = canvas.getByRole('spinbutton');
    await expect(input).toHaveValue(2);
  },
};
