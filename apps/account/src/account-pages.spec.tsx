import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShellProvider, type ShellContextValue } from '@nft/shell-kit';
import { createQueryClient } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import { ProfilePage } from './ProfilePage';
import { WalletsPage } from './WalletsPage';

describe('Account Remote Pages (@nft/account)', () => {
  const mockContextValue: ShellContextValue = {
    queryClient: createQueryClient(),
    httpClient: createHttpClient(),
    realtimeClient: createRealtimeClient({ autoConnect: false }),
    session: {
      userId: 'test-user',
      name: 'Account Tester',
      email: 'account@test.com',
    },
    navigate: () => {},
  };

  it('renders ProfilePage with accessible title and status elements', () => {
    render(
      <ShellProvider value={mockContextValue}>
        <ProfilePage />
      </ShellProvider>,
    );

    expect(screen.getByTestId('account-profile-page')).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Perfil do Colecionador' }),
    ).toBeDefined();
    expect(screen.getByText('Sessão: Account Tester')).toBeDefined();
  });

  it('renders WalletsPage with accessible title and status elements', () => {
    render(
      <ShellProvider value={mockContextValue}>
        <WalletsPage />
      </ShellProvider>,
    );

    expect(screen.getByTestId('account-wallets-page')).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Carteiras Conectadas' }),
    ).toBeDefined();
  });
});
