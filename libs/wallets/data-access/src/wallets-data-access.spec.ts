import { describe, it, expect, vi } from 'vitest';
import type { HttpClient } from '@nft/shared-http';
import { createQueryClient, clearPrivateCache } from '@nft/shared-query';
import {
  getWallets,
  walletsQueryOptions,
  saveWallet,
  saveSecondaryWallet,
} from './index';

describe('Wallets Data Access (@nft/wallets-data-access)', () => {
  const mockClient: HttpClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  } as unknown as HttpClient;

  it('generates private query options keyed by userId and verifies clearPrivateCache', () => {
    const userId = 'user_bob';
    const options = walletsQueryOptions(mockClient, userId);

    expect(options.queryKey).toEqual(['user', 'user_bob', 'wallets']);
    expect(options.staleTime).toBe(300000);

    const queryClient = createQueryClient();
    queryClient.setQueryData(options.queryKey, {
      primary: {
        id: 'wal-1',
        address: '0x3333333333333333333333333333333333333333',
        network: 'ethereum-mainnet',
        isPrimary: true,
      },
      secondary: null,
    });
    expect(queryClient.getQueryData(options.queryKey)).toBeDefined();

    clearPrivateCache(queryClient, userId);
    expect(queryClient.getQueryData(options.queryKey)).toBeUndefined();
  });

  it('calls getWallets and validates user wallets schema', async () => {
    vi.mocked(mockClient.get).mockResolvedValueOnce({
      data: {
        primary: {
          id: 'wal-1',
          address: '0x1111111111111111111111111111111111111111',
          network: 'ethereum-mainnet',
          walletType: 'metamask',
          ensName: 'alice',
          label: 'Primary Vault',
          isPrimary: true,
        },
        secondary: null,
      },
    } as never);

    const result = await getWallets(mockClient);
    expect(result.primary.id).toBe('wal-1');
    expect(result.primary.address).toBe('0x1111111111111111111111111111111111111111');
    expect(mockClient.get).toHaveBeenCalledWith('/api/wallets');
  });

  it('calls saveWallet with validated create wallet input', async () => {
    vi.mocked(mockClient.put).mockResolvedValueOnce({
      data: {
        id: 'wal-1',
        address: '0x1111111111111111111111111111111111111111',
        network: 'polygon',
        walletType: 'coinbase',
        ensName: 'alicevault',
        label: 'My Polygon Vault',
        isPrimary: true,
      },
    } as never);

    const result = await saveWallet(mockClient, {
      address: '0x1111111111111111111111111111111111111111',
      network: 'polygon',
      walletType: 'coinbase',
      ensName: 'alicevault',
      label: 'My Polygon Vault',
      isPrimary: true,
    });

    expect(result.walletType).toBe('coinbase');
    expect(mockClient.put).toHaveBeenCalledWith(
      '/api/wallets',
      expect.objectContaining({
        address: '0x1111111111111111111111111111111111111111',
        network: 'polygon',
        walletType: 'coinbase',
        ensName: 'alicevault',
        label: 'My Polygon Vault',
        isPrimary: true,
      })
    );
  });


  it('calls saveSecondaryWallet targeting /api/wallets/secondary', async () => {
    vi.mocked(mockClient.put).mockResolvedValueOnce({
      data: {
        id: 'wal-2',
        address: '0x2222222222222222222222222222222222222222',
        network: 'arbitrum',
        walletType: 'walletconnect',
        isPrimary: false,
      },
    } as never);

    const result = await saveSecondaryWallet(mockClient, {
      address: '0x2222222222222222222222222222222222222222',
      network: 'arbitrum',
      walletType: 'walletconnect',
      isPrimary: false,
    });

    expect(result.id).toBe('wal-2');
    expect(mockClient.put).toHaveBeenCalledWith('/api/wallets/secondary', expect.any(Object));
  });
});
