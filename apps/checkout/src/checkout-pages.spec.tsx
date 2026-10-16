import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShellProvider, type ShellContextValue } from '@nft/shell-kit';
import { createQueryClient } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import { CartPage } from './CartPage';
import { PaymentPage } from './PaymentPage';
import { ConfirmationPage } from './ConfirmationPage';

describe('Checkout Remote Pages (@nft/checkout)', () => {
  const mockContextValue: ShellContextValue = {
    queryClient: createQueryClient(),
    httpClient: createHttpClient(),
    realtimeClient: createRealtimeClient({ autoConnect: false }),
    session: {
      userId: 'test-user',
      name: 'Checkout Tester',
      email: 'checkout@test.com',
    },
    navigate: () => {},
  };

  it('renders CartPage with accessible title and status elements', () => {
    render(
      <ShellProvider value={mockContextValue}>
        <CartPage />
      </ShellProvider>,
    );

    expect(screen.getByTestId('checkout-cart-page')).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Carrinho de Compras' }),
    ).toBeDefined();
    expect(screen.getByText('Sessão: Checkout Tester')).toBeDefined();
  });

  it('renders PaymentPage with accessible title and status elements', () => {
    render(
      <ShellProvider value={mockContextValue}>
        <PaymentPage />
      </ShellProvider>,
    );

    expect(screen.getByTestId('checkout-payment-page')).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Pagamento & Checkout' }),
    ).toBeDefined();
  });

  it('renders ConfirmationPage with accessible title and status elements', () => {
    render(
      <ShellProvider value={mockContextValue}>
        <ConfirmationPage />
      </ShellProvider>,
    );

    expect(screen.getByTestId('checkout-confirmation-page')).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /confirmação de pedido/i,
      }),
    ).toBeDefined();
  });
});
