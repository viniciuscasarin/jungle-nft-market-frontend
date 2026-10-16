import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShellProvider, type ShellContextValue } from '@nft/shell-kit';
import { createQueryClient } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import { PdpPage } from './PdpPage';

describe('PdpPage (@nft/storefront)', () => {
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

  it('renders PDP placeholder with accessible title and status elements', () => {
    render(
      <ShellProvider value={mockContextValue}>
        <PdpPage />
      </ShellProvider>,
    );

    expect(screen.getByTestId('storefront-pdp-page')).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 1, name: /detalhes do nft/i }),
    ).toBeDefined();
    expect(screen.getByText('Storefront Remote')).toBeDefined();
    expect(screen.getByText('Sessão: Test Collector')).toBeDefined();
  });
});
