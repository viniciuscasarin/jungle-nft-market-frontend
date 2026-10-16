import type { HttpClient } from '@nft/shared-http';
import { ApiError, CartSchema, type Cart } from '@nft/shared-contracts';
import { queryKeys, queryOptions } from '@nft/shared-query';

/** Uses the Shell's HTTP client and keeps anonymous identity in the request boundary. */
export function cartQueryOptions(client: HttpClient, userId?: string | null, sessionId?: string) {
  return queryOptions({
    queryKey: queryKeys.cart.list(userId, sessionId),
    queryFn: async ({ signal }): Promise<Cart> => {
      const response = await client.get<unknown>('/api/cart', {
        signal,
        ...(!userId && sessionId ? { headers: { 'X-Session-Id': sessionId } } : {}),
      });
      return CartSchema.parse(response.data);
    },
    staleTime: 30_000,
    retry: (count, error) => error instanceof ApiError && error.retryable && count < 1,
  });
}

/** Shares the cart cache so optimistic additions immediately update every badge. */
export function cartItemCountQueryOptions(
  client: HttpClient,
  userId?: string | null,
  sessionId?: string,
) {
  return queryOptions({
    ...cartQueryOptions(client, userId, sessionId),
    select: (cart: Cart) => cart.items.reduce((count, item) => count + item.quantity, 0),
  });
}
