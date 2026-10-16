import type { Meta, StoryObj } from '@storybook/react';
import { WalletsPageContent } from './wallets-page-content';

const meta: Meta<typeof WalletsPageContent> = {
  component: WalletsPageContent,
  title: 'Wallets/WalletsPageContent',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof WalletsPageContent>;

const mockPrimaryWallet = {
  id: 'wallet_1',
  userId: 'user_alice',
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
  network: 'ethereum-mainnet' as const,
  walletType: 'metamask' as const,
  ensName: 'alice',
  label: 'Carteira Principal',
  displayName: 'Alice Collector',
  email: 'alice@example.com',
  referralCode: null,
  notes: null,
  isPrimary: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockSecondaryWallet = {
  id: 'wallet_2',
  userId: 'user_alice',
  address: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
  network: 'ethereum-mainnet' as const,
  walletType: 'walletconnect' as const,
  ensName: null,
  label: 'Carteira Secundária',
  displayName: null,
  email: null,
  referralCode: 'FRIEND123',
  notes: 'Carteira para testes',
  isPrimary: false,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

export const Default: Story = {
  args: {
    primaryWallet: mockPrimaryWallet,
    secondaryWallet: mockSecondaryWallet,
    isSaving: false,
    fieldErrors: {},
    successMessage: null,
  },
};

export const NoPrimaryWallet: Story = {
  args: {
    primaryWallet: null,
    secondaryWallet: null,
    isSaving: false,
    fieldErrors: {},
    successMessage: null,
  },
};

export const OnlyPrimaryWallet: Story = {
  args: {
    primaryWallet: mockPrimaryWallet,
    secondaryWallet: null,
    isSaving: false,
    fieldErrors: {},
    successMessage: null,
  },
};

export const WithSuccess: Story = {
  args: {
    ...Default.args,
    successMessage: 'Carteira principal salva com sucesso!',
  },
};

export const WithFieldErrors: Story = {
  args: {
    ...Default.args,
    fieldErrors: {
      address: 'Endereço de carteira inválido',
    },
  },
};

export const Saving: Story = {
  args: {
    ...Default.args,
    isSaving: true,
  },
};
