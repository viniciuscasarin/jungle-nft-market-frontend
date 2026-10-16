import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ConnectedWalletsSection } from './connected-wallets-section';

const meta: Meta<typeof ConnectedWalletsSection> = {
  title: 'Checkout/ConnectedWalletsSection',
  component: ConnectedWalletsSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ConnectedWalletsSection>;

export const MobileWallets: Story = {
  render: () => (
    <div className="max-w-[414px] p-6 bg-surface-default text-text-primary">
      <ConnectedWalletsSection />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Carteira conectada')).toBeInTheDocument();
    await expect(canvas.getByText('Reserva')).toBeInTheDocument();
    await expect(canvas.getByText('Principal')).toBeInTheDocument();
  },
};
