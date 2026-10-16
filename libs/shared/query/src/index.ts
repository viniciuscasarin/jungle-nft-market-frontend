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
