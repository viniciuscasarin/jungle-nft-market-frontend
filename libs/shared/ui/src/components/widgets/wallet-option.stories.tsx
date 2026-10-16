import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { WalletOption } from './wallet-option';
import { IconMetamask } from '../../icons/IconMetamask';
import { IconWalletconnect } from '../../icons/IconWalletconnect';

const meta: Meta<typeof WalletOption> = {
  title: 'Widgets/WalletOption',
  component: WalletOption,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=70381:245',
    },
  },
};

export default meta;
type Story = StoryObj<typeof WalletOption>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-md">
      <WalletOption
        name="wallet"
        value="metamask"
        title="MetaMask"
        description="Conectar usando extensão do navegador"
        icon={<IconMetamask className="w-8 h-8" />}
        badge="Popular"
        defaultChecked
      />
      <WalletOption
        name="wallet"
        value="walletconnect"
        title="WalletConnect"
        description="Conectar usando QR code mobile"
        icon={<IconWalletconnect className="w-8 h-8" />}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wcRadio = canvas.getByRole('radio', { name: /WalletConnect/i });
    await expect(wcRadio).toBeInTheDocument();
    await userEvent.click(wcRadio);
    await expect(wcRadio).toBeChecked();
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="max-w-md">
      <WalletOption
        name="wallet-disabled"
        title="Coinbase Wallet"
        description="Indisponível nesta simulação"
        icon={<IconMetamask className="w-8 h-8 opacity-40" />}
        disabled
      />
    </div>
  ),
};
