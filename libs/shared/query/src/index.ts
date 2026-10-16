import { QueryClient, type QueryClientConfig } from '@tanstack/react-query';
import { ApiError } from '@nft/shared-contracts';

export function createQueryClient(config?: QueryClientConfig): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            return error.retryable && failureCount < 3;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
    ...config,
  });
}

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
    user: (userId: string) => ['cart', 'user', userId] as const,
    guest: (guestId: string) => ['cart', 'guest', guestId] as const,
  },
  quote: {
    all: () => ['quote'] as const,
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

export function clearPrivateCache(queryClient: QueryClient, userId?: string): void {
  queryClient.removeQueries({
    predicate: query => {
      if (userId) {
        return query.queryKey.includes(userId);
      }
      return (
        query.queryKey[0] === 'user' ||
        query.queryKey.some(
          k => typeof k === 'string' && (k.startsWith('usr_') || k.startsWith('user_')),
        )
      );
    },
  });
}

export {
  QueryClient,
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
  QueryClientProvider,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
