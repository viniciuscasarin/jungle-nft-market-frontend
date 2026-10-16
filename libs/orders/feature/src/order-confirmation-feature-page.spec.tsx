import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ShellProvider, type ShellContextValue } from '@nft/shell-kit';
import { createQueryClient, QueryClientProvider } from '@nft/shared-query';
import { createHttpClient } from '@nft/shared-http';
import { createRealtimeClient } from '@nft/shared-realtime';
import type { Order } from '@nft/shared-contracts';
import { OrderConfirmationFeaturePage } from './order-confirmation-feature-page';

let mockRouteParams: Record<string, string> = { orderId: 'order_test_1' };

vi.mock('@nft/shared-router', () => ({
  useParams: () => mockRouteParams,
}));

describe('OrderConfirmationFeaturePage (@nft/orders-feature)', () => {
  const queryClient = createQueryClient();
  const httpClient = createHttpClient();
  const realtimeClient = createRealtimeClient();
  const mockNavigate = vi.fn();
  const mockFeedback = {
    notify: vi.fn(),
    announce: vi.fn(),
  };

  const shellValue: ShellContextValue = {
    queryClient,
    httpClient,
    realtimeClient,
    session: {
      userId: 'user_alice',
      name: 'Alice Silva',
      email: 'alice@example.com',
    },
    navigate: mockNavigate,
    feedback: mockFeedback,
  };

  const mockConfirmedOrder: Order = {
    id: 'order_test_1',
    userId: 'user_alice',
    quoteId: 'quote_1',
    idempotencyKey: 'idem_1',
    status: 'confirmed',
    collector: {
      fullName: 'Alice Silva',
      email: 'alice@example.com',
      walletAddress: '0x1111111111111111111111111111111111111111',
      walletType: 'metamask',
      network: 'ethereum-mainnet',
      ensName: 'alice',
      useSecondaryWallet: false,
      secondaryWallet: null,
    },
    items: [
      {
        nftId: 'nft_1',
        editionId: 'ed_1',
        editionNumber: 1,
        title: 'Cyber Apex #01',
        imageUrl: 'https://example.com/nft.png',
        unitPrice: '2.5000',
        quantity: 1,
        subtotal: '2.5000',
      },
    ],
    subtotal: '2.5000',
    discount: '0.0000',
    networkFee: '0.0050',
    total: '2.5050',
    receipt: {
      orderId: 'order_test_1',
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      collector: {
        fullName: 'Alice Silva',
        email: 'alice@example.com',
        walletAddress: '0x1111111111111111111111111111111111111111',
        walletType: 'metamask',
        network: 'ethereum-mainnet',
        ensName: 'alice',
        useSecondaryWallet: false,
        secondaryWallet: null,
      },
      items: [
        {
          nftId: 'nft_1',
          editionId: 'ed_1',
          editionNumber: 1,
          title: 'Cyber Apex #01',
          imageUrl: 'https://example.com/nft.png',
          unitPrice: '2.5000',
          quantity: 1,
          subtotal: '2.5000',
        },
      ],
      quoteId: 'quote_1',
      subtotal: '2.5000',
      discount: '0.0000',
      networkFee: '0.0050',
      total: '2.5050',
      confirmedAt: '2026-02-10T14:05:00.000Z',
      blockNumber: 19842000,
    },
    rejectionReason: null,
    createdAt: '2026-02-10T14:00:00.000Z',
    updatedAt: '2026-02-10T14:05:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    mockRouteParams = { orderId: 'order_test_1' };
  });

  function renderPage(customShell?: Partial<ShellContextValue>) {
    const value = { ...shellValue, ...customShell };
    return render(
      <QueryClientProvider client={queryClient}>
        <ShellProvider value={value}>
          <OrderConfirmationFeaturePage />
        </ShellProvider>
      </QueryClientProvider>
    );
  }

  it('renders confirmation modal when order status is "confirmed"', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({
      data: mockConfirmedOrder,
    } as never);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('Seus NFTs agora estão na sua carteira')).toBeInTheDocument();
    expect(screen.getByText('Cyber Apex #01')).toBeInTheDocument();
    expect(screen.getByText('0x1234…cdef')).toBeInTheDocument();
    expect(document.title).toBe('Confirmação de Pedido | Jungle NFT');
  });

  it('renders ErrorState with rejection reason and NOT modal when status is "rejected"', async () => {
    const rejectedOrder: Order = {
      ...mockConfirmedOrder,
      status: 'rejected',
      receipt: null,
      rejectionReason: 'Saldo insuficiente na carteira para pagar taxa de rede.',
    };

    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({
      data: rejectedOrder,
    } as never);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText('Pedido não concluído')).toBeInTheDocument();
    expect(screen.getByText('Saldo insuficiente na carteira para pagar taxa de rede.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(/seus nfts agora estão na sua carteira/i)).not.toBeInTheDocument();
  });

  it('renders processing indicator and NOT modal when status is "pending"', async () => {
    const pendingOrder: Order = {
      ...mockConfirmedOrder,
      status: 'pending',
      receipt: null,
    };

    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({
      data: pendingOrder,
    } as never);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Processando Transação')).toBeInTheDocument();
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(/seus nfts agora estão na sua carteira/i)).not.toBeInTheDocument();
  });

  it('renders ErrorState when order belongs to a different user', async () => {
    const differentUserOrder: Order = {
      ...mockConfirmedOrder,
      userId: 'user_other',
    };

    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({
      data: differentUserOrder,
    } as never);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText('Pedido não encontrado')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders ErrorState when user is not authenticated', async () => {
    renderPage({ session: null });

    expect(screen.getByText('Acesso não autorizado')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
