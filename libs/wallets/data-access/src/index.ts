import type { HttpClient } from '@nft/shared-http';
import {
  queryOptions,
  queryKeys,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@nft/shared-query';
import {
  UserWalletsSchema,
  WalletSchema,
  CreateWalletInputSchema,
  type UserWallets,
  type Wallet,
  type CreateWalletInput,
} from '@nft/shared-contracts';

/**
 * Pure API call to fetch user wallets (primary and secondary).
 */
export async function getWallets(client: HttpClient): Promise<UserWallets> {
  const response = await client.get<UserWallets>('/api/wallets');
  return UserWalletsSchema.parse(response.data);
}

/**
 * Query options factory for wallets query with private key ['user', userId, 'wallets'].
 */
export function walletsQueryOptions(client: HttpClient, userId: string) {
  return queryOptions({
    queryKey: queryKeys.user(userId, 'wallets'),
    queryFn: () => getWallets(client),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(userId),
  });
}

/**
 * Hook to fetch user wallets using private query key.
 */
export function useWalletsQuery(
  client: HttpClient,
  userId: string
): UseQueryResult<UserWallets> {
  return useQuery(walletsQueryOptions(client, userId));
}

/**
 * Pure API call to create or update primary or secondary wallet.
 */
export async function saveWallet(
  client: HttpClient,
  input: CreateWalletInput
): Promise<Wallet> {
  const validated = CreateWalletInputSchema.parse(input);
  const response = await client.put<Wallet>('/api/wallets', validated);
  return WalletSchema.parse(response.data);
}

/**
 * Mutation hook to save wallet, invalidating wallets query.
 */
export function useSaveWallet(
  client: HttpClient,
  userId: string
): UseMutationResult<Wallet, Error, CreateWalletInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWalletInput) => saveWallet(client, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId, 'wallets') });
    },
  });
}

/**
 * Pure API call to specifically update secondary wallet.
 */
export async function saveSecondaryWallet(
  client: HttpClient,
  input: CreateWalletInput
): Promise<Wallet> {
  const validated = CreateWalletInputSchema.parse(input);
  const response = await client.put<Wallet>('/api/wallets/secondary', validated);
  return WalletSchema.parse(response.data);
}

/**
 * Mutation hook to save secondary wallet.
 */
export function useSaveSecondaryWallet(
  client: HttpClient,
  userId: string
): UseMutationResult<Wallet, Error, CreateWalletInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWalletInput) => saveSecondaryWallet(client, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId, 'wallets') });
    },
  });
}
