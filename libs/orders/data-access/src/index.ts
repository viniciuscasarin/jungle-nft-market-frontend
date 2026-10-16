import type { HttpClient } from '@nft/shared-http';
import {
  type Order,
  type CreateOrderInput,
  OrderSchema,
} from '@nft/shared-contracts';
import { useMutation, useQuery, type UseMutationResult } from '@nft/shared-query';
import { orderQueries } from './order-queries';

export { orderQueries };

export function orderDetailQueryOptions(
  client: HttpClient,
  orderId: string,
  userId: string
) {
  return orderQueries.detail(client, orderId, userId);
}

export function userOrdersQueryOptions(client: HttpClient, userId: string) {
  return orderQueries.list(client, userId);
}

export interface CreateOrderParams {
  input: CreateOrderInput;
  idempotencyKey: string;
}

export async function createOrder(
  client: HttpClient,
  params: CreateOrderParams
): Promise<Order> {
  const response = await client.post<Order>('/api/orders', params.input, {
    headers: {
      'Idempotency-Key': params.idempotencyKey,
    },
  });
  return OrderSchema.parse(response.data);
}

/**
 * Mutation hook for order creation.
 * Strict rule: mutations NEVER retry automatically.
 */
export function useCreateOrderMutation(
  client: HttpClient
): UseMutationResult<Order, Error, CreateOrderParams> {
  return useMutation({
    mutationFn: (params: CreateOrderParams) => createOrder(client, params),
    retry: false,
  });
}

export { useQuery };

export const ORDERS_DATA_ACCESS_MODULE = '@nft/orders-data-access';
