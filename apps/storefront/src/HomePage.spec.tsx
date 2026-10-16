import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShellProvider, type ShellContextValue } from '@nft/shell-kit';
import { createQueryClient } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import { HomePage } from './HomePage';

describe('HomePage (@nft/storefront)', () => {
  const mockContextValue: ShellContextValue = {
    queryClient: createQueryClient(),
    httpClient: createHttpClient(),
    realtimeClient: createRealtimeClient({ autoConnect: false }),
    session: {
      userId: 'test-user',
      name: 'Test Collector',
      email: 'collector@test.com',
    },
    navigate: () => {},
  };

  it('renders HomePage with hero banner, catalog grid and accessible shell indicators', () => {
    render(
      <ShellProvider value={mockContextValue}>
        <HomePage />
      </ShellProvider>,
    );

    expect(screen.getByTestId('storefront-home-page')).toBeDefined();
    expect(screen.getByTestId('home-hero-banner')).toBeDefined();
    expect(screen.getByTestId('catalog-nft-grid')).toBeDefined();
    expect(screen.getByText('Storefront Remote - Início')).toBeDefined();
    expect(screen.getByText('Sessão: Test Collector')).toBeDefined();
  });
});
