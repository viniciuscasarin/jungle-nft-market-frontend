import type { HttpClient } from '@nft/shared-http';
import {
  type Profile,
  type UserWallets,
  type Quote,
  type CreateQuoteInput,
  ProfileSchema,
  UserWalletsSchema,
  QuoteSchema,
} from '@nft/shared-contracts';
import { queryKeys, queryOptions } from '@nft/shared-query';

export function profileQueryOptions(client: HttpClient, userId: string) {
  return queryOptions({
    queryKey: queryKeys.user(userId, 'profile'),
    queryFn: async (): Promise<Profile> => {
      const response = await client.get<Profile>('/api/profile');
      return ProfileSchema.parse(response.data);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function walletsQueryOptions(client: HttpClient, userId: string) {
  return queryOptions({
    queryKey: queryKeys.user(userId, 'wallets'),
    queryFn: async (): Promise<UserWallets> => {
      const response = await client.get<UserWallets>('/api/wallets');
      return UserWalletsSchema.parse(response.data);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function quoteQueryOptions(client: HttpClient, quoteId: string) {
  return queryOptions({
    queryKey: queryKeys.quote.detail(quoteId),
    queryFn: async (): Promise<Quote> => {
      const response = await client.get<Quote>(`/api/checkout/quote/${quoteId}`);
      return QuoteSchema.parse(response.data);
    },
    staleTime: 1000 * 30, // 30s
  });
}

export async function createCheckoutQuote(
  client: HttpClient,
  input: CreateQuoteInput
): Promise<Quote> {
  const response = await client.post<Quote>('/api/checkout/quote', input);
  return QuoteSchema.parse(response.data);
}

export const CHECKOUT_DATA_ACCESS_MODULE = '@nft/checkout-data-access';
