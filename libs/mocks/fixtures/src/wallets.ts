import type { Wallet } from '@nft/shared-contracts';

export const mockWallets: Wallet[] = [
  // Alice's wallets
  {
    id: 'wallet_alice_primary',
    userId: 'user_alice',
    address: '0x1111111111111111111111111111111111111111',
    network: 'ethereum-mainnet',
    ensName: 'alice',
    label: 'Alice Main Vault',
    isPrimary: true,
    createdAt: '2026-01-01T10:05:00.000Z',
  },
  {
    id: 'wallet_alice_secondary',
    userId: 'user_alice',
    address: '0x2222222222222222222222222222222222222222',
    network: 'polygon',
    ensName: null,
    label: 'Alice Polygon Wallet',
    isPrimary: false,
    createdAt: '2026-01-01T10:10:00.000Z',
  },

  // Bob's wallets
  {
    id: 'wallet_bob_primary',
    userId: 'user_bob',
    address: '0x3333333333333333333333333333333333333333',
    network: 'ethereum-mainnet',
    ensName: 'bob',
    label: 'Bob Ethereum Ledger',
    isPrimary: true,
    createdAt: '2026-01-02T12:05:00.000Z',
  },
  {
    id: 'wallet_bob_secondary',
    userId: 'user_bob',
    address: '0x4444444444444444444444444444444444444444',
    network: 'arbitrum',
    ensName: null,
    label: 'Bob Arbitrum Vault',
    isPrimary: false,
    createdAt: '2026-01-02T12:10:00.000Z',
  },
];
