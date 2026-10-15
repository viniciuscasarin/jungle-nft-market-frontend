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

export {
  QueryClient,
  useQuery,
  useMutation,
  useQueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
