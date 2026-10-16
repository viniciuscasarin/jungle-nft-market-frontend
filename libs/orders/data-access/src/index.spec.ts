import { describe, it, expect, vi } from 'vitest';
import type { HttpClient } from '@nft/shared-http';
import { createQueryClient, clearPrivateCache } from '@nft/shared-query';
import {
  orderDetailQueryOptions,
  userOrdersQueryOptions,
  createOrder,
} from './index';

describe('Orders Data Access (@nft/orders-data-access)', () => {
  const mockClient: HttpClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  } as unknown as HttpClient;

  it('generates private query options for order detail keyed by userId and verifies isolation', () => {
    const userId = 'user_123';
    const orderId = 'order_456';
    const options = orderDetailQueryOptions(mockClient, orderId, userId);

    expect(options.queryKey).toEqual(['orders', 'detail', 'order_456', 'user_123']);

    const queryClient = createQueryClient();
    queryClient.setQueryData(options.queryKey, { id: orderId });
    expect(queryClient.getQueryData(options.queryKey)).toBeDefined();

    clearPrivateCache(queryClient, userId);
    expect(queryClient.getQueryData(options.queryKey)).toBeUndefined();
  });

  it('generates private query options for user orders list', () => {
    const userId = 'user_123';
    const options = userOrdersQueryOptions(mockClient, userId);
    expect(options.queryKey).toEqual(['orders', 'user', 'user_123']);
  });

  it('calls createOrder with Idempotency-Key in headers and parses response', async () => {
    const mockOrderResponse = {
      id: 'order_1',
      userId: 'user_123',
      quoteId: 'quote_1',
      idempotencyKey: 'idem_1',
      status: 'confirmed',
      collector: {
        fullName: 'Alice Silva',
        email: 'alice@example.com',
        walletAddress: '0x1111111111111111111111111111111111111111',
        walletType: 'metamask',
        network: 'ethereum-mainnet',
        useSecondaryWallet: false,
      },
      items: [
        {
          nftId: 'nft_1',
          editionId: 'ed_1',
          title: 'Ape',
          imageUrl: '/img.png',
          unitPrice: '1.0000',
          quantity: 1,
          subtotal: '1.0000',
        },
      ],
      subtotal: '1.0000',
      discount: '0.0000',
      networkFee: '0.0050',
      total: '1.0050',
      receipt: null,
      rejectionReason: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    vi.mocked(mockClient.post).mockResolvedValueOnce({
      data: mockOrderResponse,
    } as never);

    const result = await createOrder(mockClient, {
      idempotencyKey: 'idem_1',
      input: {
        quoteId: 'quote_1',
        collector: {
          fullName: 'Alice Silva',
          email: 'alice@example.com',
          walletAddress: '0x1111111111111111111111111111111111111111',
          walletType: 'metamask',
          network: 'ethereum-mainnet',
          useSecondaryWallet: false,
          secondaryWallet: null,
        },
      },
    });

    expect(result.id).toBe('order_1');
    expect(mockClient.post).toHaveBeenCalledWith(
      '/api/orders',
      expect.objectContaining({ quoteId: 'quote_1' }),
      {
        headers: {
          'Idempotency-Key': 'idem_1',
        },
      }
    );
  });
});
