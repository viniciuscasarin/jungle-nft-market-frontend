import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { WalletCard } from './wallet-card';
import { IconMetamask } from '../../icons/IconMetamask';

const meta: Meta<typeof WalletCard> = {
  title: 'Widgets/WalletCard',
  component: WalletCard,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=70381:239',
    },
  },
  args: {
    address: '0x71C...394A',
    fullAddress: '0x71C2508103A2B14e21E42a35607bA7E56d45394A',
    walletName: 'MetaMask',
    network: 'Ethereum Mainnet',
    balanceEth: '4.8500',
    icon: <IconMetamask className="w-8 h-8" />,
    onCopyAddress: fn(),
    onSetDefault: fn(),
    onDisconnect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof WalletCard>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const copyBtn = canvas.getByRole('button', { name: /copiar/i });
    await expect(copyBtn).toBeInTheDocument();
    await userEvent.click(copyBtn);
    await expect(args.onCopyAddress).toHaveBeenCalled();
  },
};

export const ActiveDefaultWallet: Story = {
  args: {
    isDefault: true,
  },
};
