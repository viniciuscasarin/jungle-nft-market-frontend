import type { HttpClient } from '@nft/shared-http';
import { type Order, OrderSchema } from '@nft/shared-contracts';
import { queryKeys, queryOptions } from '@nft/shared-query';

export const orderQueries = {
  detail: (client: HttpClient, orderId: string, userId: string) =>
    queryOptions({
      queryKey: queryKeys.orders.detail(orderId, userId),
      queryFn: async (): Promise<Order> => {
        const response = await client.get<Order>(`/api/orders/${orderId}`);
        return OrderSchema.parse(response.data);
      },
      staleTime: 1000 * 60,
    }),
  list: (client: HttpClient, userId: string) =>
    queryOptions({
      queryKey: queryKeys.orders.list(userId),
      queryFn: async (): Promise<Order[]> => {
        const response = await client.get<Order[]>('/api/orders');
        if (Array.isArray(response.data)) {
          return response.data.map((item) => OrderSchema.parse(item));
        }
        return [];
      },
      staleTime: 1000 * 60,
    }),
};
