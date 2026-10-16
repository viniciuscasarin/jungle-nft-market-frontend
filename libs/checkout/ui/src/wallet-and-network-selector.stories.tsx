import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { WalletAndNetworkSelector } from './wallet-and-network-selector';

const meta: Meta<typeof WalletAndNetworkSelector> = {
  title: 'Checkout/WalletAndNetworkSelector',
  component: WalletAndNetworkSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof WalletAndNetworkSelector>;

export const DesktopSelector: Story = {
  render: () => (
    <div className="max-w-[420px] p-6 bg-surface-default text-text-primary">
      <WalletAndNetworkSelector />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Carteira e rede')).toBeInTheDocument();
    await expect(canvas.getByText('Coinbase Wallet')).toBeInTheDocument();
  },
};

export const MobileSelector: Story = {
  render: () => (
    <div className="max-w-[414px] p-6 bg-surface-default text-text-primary">
      <WalletAndNetworkSelector isMobile />
    </div>
  ),
};
