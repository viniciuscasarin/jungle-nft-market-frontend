import type { CreateQuoteInput } from '@nft/shared-contracts';

export const queryKeys = {
  session: () => ['session'] as const,
  user: (userId: string, domain: string, ...extra: readonly unknown[]) =>
    ['user', userId, domain, ...extra] as const,
  catalog: {
    all: () => ['catalog'] as const,
    list: (params?: Record<string, unknown>) =>
      params ? (['catalog', 'list', params] as const) : (['catalog', 'list'] as const),
    detail: (nftId: string) => ['catalog', 'detail', nftId] as const,
    reviews: (nftId: string, params?: Record<string, unknown>) =>
      params
        ? (['catalog', 'reviews', nftId, params] as const)
        : (['catalog', 'reviews', nftId] as const),
  },
  cart: {
    all: () => ['cart'] as const,
    lists: () => ['cart', 'list'] as const,
    list: (userId?: string | null, sessionId?: string) =>
      userId
        ? (['cart', 'list', userId] as const)
        : sessionId
          ? (['cart', 'list', 'guest', sessionId] as const)
          : (['cart', 'list', 'guest'] as const),
    counts: () => ['cart', 'count'] as const,
    count: (userId?: string | null, sessionId?: string) =>
      userId
        ? (['cart', 'count', userId] as const)
        : sessionId
          ? (['cart', 'count', 'guest', sessionId] as const)
          : (['cart', 'count', 'guest'] as const),
  },
  quote: {
    all: () => ['quote'] as const,
    payment: (userId: string, input: CreateQuoteInput) => ['quote', 'payment', userId, input] as const,
    cart: (ownerId: string, items: CreateQuoteInput['items']) => ['quote', 'cart', ownerId, items] as const,
    detail: (quoteId: string) => ['quote', 'detail', quoteId] as const,
  },
  orders: {
    all: () => ['orders'] as const,
    list: (userId: string) => ['orders', 'user', userId] as const,
    detail: (orderId: string, userId?: string) =>
      userId
        ? (['orders', 'detail', orderId, userId] as const)
        : (['orders', 'detail', orderId] as const),
  },
};
