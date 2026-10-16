import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShellProvider, type ShellContextValue } from '@nft/shell-kit';
import { createQueryClient, queryKeys, QueryClientProvider } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import { PaymentFeaturePage } from './payment-feature-page';

describe('PaymentFeaturePage (@nft/checkout-feature)', () => {
  const mockQuote = {
    quoteId: 'quote_test_1',
    subtotal: '2.5000',
    discount: '0.0000',
    networkFee: '0.0050',
    total: '2.5050',
    coupon: null,
    itemsAvailability: [
      {
        nftId: 'nft_1',
        editionId: 'ed_1',
        requestedQuantity: 1,
        availableQuantity: 5,
        isAvailable: true,
        currentPrice: '2.5000',
        priceChanged: false,
      },
    ],
    isExpired: false,
    expiresAt: '2026-12-31T23:59:59.000Z',
  };

  const mockProfile = {
    id: 'user_alice',
    displayName: 'Alice Silva',
    username: 'alice',
    email: 'alice@example.com',
    avatarUrl: null,
    bio: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ensName: 'alice',
  };

  const mockWallets = {
    primary: {
      id: 'wal_1',
      userId: 'user_alice',
      address: '0x1111111111111111111111111111111111111111',
      network: 'ethereum-mainnet',
      walletType: 'metamask',
      isPrimary: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    secondary: null,
  };

  function renderWithShell(options: {
    isError?: boolean;
    onOrderSuccess?: (id: string) => void;
  } = {}) {
    const queryClient = createQueryClient({ defaultOptions: { queries: { retry: false } } });
    const httpClient = createHttpClient();
    const feedback = {
      notify: vi.fn(),
      announce: vi.fn(),
    };
    const navigate = vi.fn();

    if (options.isError) {
      vi.spyOn(httpClient, 'get').mockRejectedValue(new Error('Network error'));
    } else {
      queryClient.setQueryData(queryKeys.user('user_alice', 'profile'), mockProfile);
      queryClient.setQueryData(queryKeys.user('user_alice', 'wallets'), mockWallets);
      queryClient.setQueryData(queryKeys.quote.detail('quote_test_1'), mockQuote);
    }

    const contextValue: ShellContextValue = {
      queryClient,
      httpClient,
      realtimeClient: createRealtimeClient({ autoConnect: false }),
      session: {
        userId: 'user_alice',
        name: 'Alice Silva',
        email: 'alice@example.com',
      },
      navigate,
      feedback,
    };

    const utils = render(
      <QueryClientProvider client={queryClient}>
        <ShellProvider value={contextValue}>
          <PaymentFeaturePage
            quoteId="quote_test_1"
            onOrderSuccess={options.onOrderSuccess}
          />
        </ShellProvider>
      </QueryClientProvider>
    );

    return { ...utils, httpClient, feedback, navigate, queryClient };
  }

  it('renders prefilled form with profile and primary wallet data', async () => {
    renderWithShell();

    expect(screen.getAllByText('Perfil do colecionador')[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Nome de exibição/)[0]).toHaveValue('Alice Silva');
    expect(screen.getAllByLabelText(/E-mail/)[0]).toHaveValue('alice@example.com');
    expect(screen.getAllByLabelText(/Endereço da carteira/)[0]).toHaveValue(
      '0x1111111111111111111111111111111111111111'
    );
  });

  it('renders error state with retry button when query fails', async () => {
    renderWithShell({ isError: true });

    expect(await screen.findByText('Erro ao carregar checkout')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
  });

  const mockOrderItem = {
    nftId: 'nft_1',
    editionId: 'ed_1',
    title: 'Emerald Ape #01',
    imageUrl: '/assets/images/nft-03-emerald-ape.png',
    unitPrice: '2.5000',
    quantity: 1,
    subtotal: '2.5000',
  };

  it('submits valid order, notifies success and invokes navigation', async () => {
    const onOrderSuccess = vi.fn();
    const { httpClient, feedback } = renderWithShell({ onOrderSuccess });

    vi.spyOn(httpClient, 'post').mockResolvedValueOnce({
      data: {
        id: 'ord_confirmed_123',
        userId: 'user_alice',
        quoteId: 'quote_test_1',
        idempotencyKey: 'idem_test',
        status: 'confirmed',
        collector: {
          fullName: 'Alice Silva',
          email: 'alice@example.com',
          walletAddress: '0x1111111111111111111111111111111111111111',
          walletType: 'metamask',
          network: 'ethereum-mainnet',
          useSecondaryWallet: false,
        },
        items: [mockOrderItem],
        subtotal: '2.5000',
        discount: '0.0000',
        networkFee: '0.0050',
        total: '2.5050',
        receipt: {
          orderId: 'ord_confirmed_123',
          transactionHash: '0xabc',
          collector: {
            fullName: 'Alice Silva',
            email: 'alice@example.com',
            walletAddress: '0x1111111111111111111111111111111111111111',
            walletType: 'metamask',
            network: 'ethereum-mainnet',
            useSecondaryWallet: false,
          },
          items: [mockOrderItem],
          quoteId: 'quote_test_1',
          subtotal: '2.5000',
          discount: '0.0000',
          networkFee: '0.0050',
          total: '2.5050',
          confirmedAt: '2026-01-01T00:00:00.000Z',
        },
        rejectionReason: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    } as never);

    await waitFor(() => {
      expect(screen.getAllByLabelText(/Nome de exibição/)[0]).toHaveValue('Alice Silva');
    });

    const confirmBtns = screen.getAllByRole('button', { name: 'Confirmar compra' });
    fireEvent.click(confirmBtns[0]!);

    await waitFor(() => {
      expect(onOrderSuccess).toHaveBeenCalledWith('ord_confirmed_123');
      expect(feedback.notify).toHaveBeenCalledWith(
        expect.objectContaining({ tone: 'success' })
      );
    });
  });

  it('displays accessible error message when order is rejected and does not navigate', async () => {
    const onOrderSuccess = vi.fn();
    const { httpClient, feedback } = renderWithShell({ onOrderSuccess });

    vi.spyOn(httpClient, 'post').mockResolvedValueOnce({
      data: {
        id: 'ord_rejected_123',
        userId: 'user_alice',
        quoteId: 'quote_test_1',
        idempotencyKey: 'idem_test',
        status: 'rejected',
        collector: {
          fullName: 'Alice Silva',
          email: 'alice@example.com',
          walletAddress: '0x1111111111111111111111111111111111111111',
          walletType: 'metamask',
          network: 'ethereum-mainnet',
          useSecondaryWallet: false,
        },
        items: [mockOrderItem],
        subtotal: '2.5000',
        discount: '0.0000',
        networkFee: '0.0050',
        total: '2.5050',
        receipt: null,
        rejectionReason: 'Saldo insuficiente na carteira.',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    } as never);

    const confirmBtns = screen.getAllByRole('button', { name: 'Confirmar compra' });
    fireEvent.click(confirmBtns[0]!);

    await waitFor(() => {
      expect(onOrderSuccess).not.toHaveBeenCalled();
      expect(screen.getAllByText('Saldo insuficiente na carteira.')[0]).toBeInTheDocument();
      expect(feedback.notify).toHaveBeenCalledWith(
        expect.objectContaining({ tone: 'error' })
      );
    });
  });

  it('does not navigate when order status is pending', async () => {
    const onOrderSuccess = vi.fn();
    const { httpClient, feedback } = renderWithShell({ onOrderSuccess });

    vi.spyOn(httpClient, 'post').mockResolvedValueOnce({
      data: {
        id: 'ord_pending_123',
        userId: 'user_alice',
        quoteId: 'quote_test_1',
        idempotencyKey: 'idem_test',
        status: 'pending',
        collector: {
          fullName: 'Alice Silva',
          email: 'alice@example.com',
          walletAddress: '0x1111111111111111111111111111111111111111',
          walletType: 'metamask',
          network: 'ethereum-mainnet',
          useSecondaryWallet: false,
        },
        items: [mockOrderItem],
        subtotal: '2.5000',
        discount: '0.0000',
        networkFee: '0.0050',
        total: '2.5050',
        receipt: null,
        rejectionReason: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    } as never);

    const confirmBtns = screen.getAllByRole('button', { name: 'Confirmar compra' });
    fireEvent.click(confirmBtns[0]!);

    await waitFor(() => {
      expect(onOrderSuccess).not.toHaveBeenCalled();
      expect(feedback.notify).toHaveBeenCalledWith(
        expect.objectContaining({ tone: 'info' })
      );
    });
  });

  it('blocks submission and shows error if required field is invalid', async () => {
    const onOrderSuccess = vi.fn();
    const { httpClient } = renderWithShell({ onOrderSuccess });
    const postSpy = vi.spyOn(httpClient, 'post');

    await waitFor(() => {
      expect(screen.getAllByLabelText(/E-mail/)[0]).toHaveValue('alice@example.com');
    });

    const emailInputs = screen.getAllByLabelText(/E-mail/);
    fireEvent.change(emailInputs[0]!, { target: { value: 'invalid-email' } });

    const confirmBtns = screen.getAllByRole('button', { name: 'Confirmar compra' });
    fireEvent.click(confirmBtns[0]!);

    await waitFor(() => {
      expect(postSpy).not.toHaveBeenCalled();
      expect(onOrderSuccess).not.toHaveBeenCalled();
    });
  });
});
