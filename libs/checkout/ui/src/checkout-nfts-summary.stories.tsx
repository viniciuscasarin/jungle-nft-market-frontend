import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { CheckoutNftsSummary } from './checkout-nfts-summary';

const meta: Meta<typeof CheckoutNftsSummary> = {
  title: 'Checkout/CheckoutNftsSummary',
  component: CheckoutNftsSummary,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof CheckoutNftsSummary>;

export const Default: Story = {
  render: () => (
    <div className="max-w-[460px] p-6 bg-surface-default text-text-primary">
      <CheckoutNftsSummary />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Seus NFTs')).toBeInTheDocument();
    await expect(canvas.getByText(/Emerald Ape #042/)).toBeInTheDocument();
    await expect(canvas.getByText('26.846 ETH')).toBeInTheDocument();
  },
};
