import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShellProvider, type ShellContextValue } from '@nft/shell-kit';
import { createQueryClient, queryKeys, QueryClientProvider } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import { ProfilePage } from './ProfilePage';
import { WalletsPage } from './WalletsPage';

describe('Account Remote Pages (@nft/account)', () => {
  const queryClient = createQueryClient();
  const httpClient = createHttpClient();
  const mockContextValue: ShellContextValue = {
    queryClient,
    httpClient,
    realtimeClient: createRealtimeClient({ autoConnect: false }),
    session: {
      userId: 'test-user',
      name: 'Account Tester',
      email: 'account@test.com',
    },
    navigate: () => {},
    feedback: {
      notify: vi.fn(),
      announce: vi.fn(),
    },
  };

  it('renders ProfilePage with accessible profile layout and title', () => {
    queryClient.setQueryData(queryKeys.user('test-user', 'profile'), {
      id: 'test-user',
      displayName: 'Account Tester',
      username: 'tester',
      email: 'account@test.com',
      ensName: 'tester',
      walletNickname: 'Primary',
      avatarUrl: null,
      bio: null,
      createdAt: '2026-01-01T00:00:00Z',
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ShellProvider value={mockContextValue}>
          <ProfilePage />
        </ShellProvider>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Perfil do colecionador' })).toBeInTheDocument();
    expect(screen.getByLabelText(/nome de exibição/i)).toHaveValue('Account Tester');
  });

  it('renders WalletsPage with accessible wallets layout and title', () => {
    queryClient.setQueryData(queryKeys.user('test-user', 'wallets'), {
      primary: {
        id: 'wal-1',
        address: '0x1111111111111111111111111111111111111111',
        network: 'ethereum-mainnet',
        walletType: 'metamask',
        ensName: 'tester',
        label: 'Primary Vault',
        displayName: 'Minha MetaMask',
        isPrimary: true,
      },
      secondary: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ShellProvider value={mockContextValue}>
          <WalletsPage />
        </ShellProvider>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Carteira principal' })).toBeInTheDocument();
    expect(screen.getByLabelText(/endereço da carteira/i)).toHaveValue('0x1111111111111111111111111111111111111111');
  });
});
