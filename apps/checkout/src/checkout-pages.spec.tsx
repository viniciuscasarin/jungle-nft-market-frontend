import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShellProvider, type ShellContextValue } from '@nft/shell-kit';
import { createQueryClient, QueryClientProvider } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import { CartPage } from './CartPage';
import { PaymentPage } from './PaymentPage';
import { ConfirmationPage } from './ConfirmationPage';

describe('Checkout Remote Pages (@nft/checkout)', () => {
  const queryClient = createQueryClient();
  const mockContextValue: ShellContextValue = {
    queryClient,
    httpClient: createHttpClient(),
    realtimeClient: createRealtimeClient({ autoConnect: false }),
    session: {
      userId: 'test-user',
      name: 'Checkout Tester',
      email: 'checkout@test.com',
    },
    navigate: () => {},
    feedback: {
      notify: vi.fn(),
      announce: vi.fn(),
    },
  };

  it('renders CartPage with accessible title and status elements', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ShellProvider value={mockContextValue}>
          <CartPage />
        </ShellProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId('checkout-cart-page')).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Carrinho de Compras' }),
    ).toBeDefined();
    expect(screen.getByText('Sessão: Checkout Tester')).toBeDefined();
  });

  it('renders PaymentPage with accessible title and status elements', () => {
    queryClient.setQueryData(['user', 'test-user', 'profile'], {
      id: 'test-user',
      displayName: 'Checkout Tester',
      username: 'tester',
      email: 'checkout@test.com',
      ensName: 'tester',
      createdAt: '2026-01-01T00:00:00Z',
    });
    queryClient.setQueryData(['user', 'test-user', 'wallets'], {
      primary: {
        id: 'wal-1',
        address: '0x1111111111111111111111111111111111111111',
        network: 'ethereum-mainnet',
        walletType: 'metamask',
        isPrimary: true,
      },
      secondary: null,
    });
    queryClient.setQueryData(['quote', 'detail', 'quote-999'], {
      quoteId: 'quote-999',
      subtotal: '2.5000',
      discount: '0.0000',
      networkFee: '0.0050',
      total: '2.5050',
      coupon: null,
      itemsAvailability: [],
      isExpired: false,
      expiresAt: '2026-12-31T23:59:59Z',
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ShellProvider value={mockContextValue}>
          <PaymentPage />
        </ShellProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId('checkout-payment-page')).toBeDefined();
    expect(
      screen.getAllByRole('heading', { name: /perfil do colecionador/i }).length,
    ).toBeGreaterThan(0);
  });

  it('renders ConfirmationPage with accessible title and status elements', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ShellProvider value={mockContextValue}>
          <ConfirmationPage />
        </ShellProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId('checkout-confirmation-page')).toBeDefined();
  });
});
