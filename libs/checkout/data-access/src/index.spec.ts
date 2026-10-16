import { describe, it, expect, vi } from 'vitest';
import type { HttpClient } from '@nft/shared-http';
import { createQueryClient, clearPrivateCache } from '@nft/shared-query';
import {
  profileQueryOptions,
  walletsQueryOptions,
  quoteQueryOptions,
  createCheckoutQuote,
} from './index';

describe('Checkout Data Access (@nft/checkout-data-access)', () => {
  const mockClient: HttpClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  } as unknown as HttpClient;

  it('generates private query options for profile keyed by userId', () => {
    const userId = 'user_123';
    const options = profileQueryOptions(mockClient, userId);
    expect(options.queryKey).toEqual(['user', 'user_123', 'profile']);

    const queryClient = createQueryClient();
    queryClient.setQueryData(options.queryKey, { id: userId });
    expect(queryClient.getQueryData(options.queryKey)).toBeDefined();

    clearPrivateCache(queryClient, userId);
    expect(queryClient.getQueryData(options.queryKey)).toBeUndefined();
  });

  it('generates private query options for wallets keyed by userId', () => {
    const userId = 'user_123';
    const options = walletsQueryOptions(mockClient, userId);
    expect(options.queryKey).toEqual(['user', 'user_123', 'wallets']);

    const queryClient = createQueryClient();
    queryClient.setQueryData(options.queryKey, { primary: null, secondary: null });
    expect(queryClient.getQueryData(options.queryKey)).toBeDefined();

    clearPrivateCache(queryClient, userId);
    expect(queryClient.getQueryData(options.queryKey)).toBeUndefined();
  });

  it('generates quote query options with quote detail key', () => {
    const options = quoteQueryOptions(mockClient, 'quote_1');
    expect(options.queryKey).toEqual(['quote', 'detail', 'quote_1']);
  });

  it('creates quote and validates schema', async () => {
    const mockQuoteResponse = {
      quoteId: 'quote_1',
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
      expiresAt: '2026-10-16T18:00:00.000Z',
    };

    vi.mocked(mockClient.post).mockResolvedValueOnce({
      data: mockQuoteResponse,
    } as never);

    const result = await createCheckoutQuote(mockClient, {
      items: [
        {
          nftId: 'nft_1',
          editionId: 'ed_1',
          quantity: 1,
        },
      ],
    });

    expect(result.quoteId).toBe('quote_1');
    expect(mockClient.post).toHaveBeenCalledWith('/api/checkout/quote', {
      items: [{ nftId: 'nft_1', editionId: 'ed_1', quantity: 1 }],
    });
  });
});
