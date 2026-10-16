import { useEffect, useRef } from 'react';
import { ApiError, type Cart } from '@nft/shared-contracts';
import type { HttpClient } from '@nft/shared-http';
import { queryKeys, useMutation, useQueryClient, type QueryClient } from '@nft/shared-query';
import { cartQueryOptions } from './cart-queries';

export interface CartMutationDependencies {
  client: HttpClient;
  userId?: string | null | undefined;
  sessionId?: string | undefined;
  onFeedback?: ((message: string, tone: 'success' | 'error') => void) | undefined;
}

export function cartRequestOptions(dependencies: CartMutationDependencies) {
  return {
    timeout: 10_000,
    ...(!dependencies.userId && dependencies.sessionId
      ? { headers: { 'X-Session-Id': dependencies.sessionId } }
      : {}),
  };
}

/** The identity guard prevents late responses from recreating a logged-out user's cache. */
export function useCartMutation<Input>(
  dependencies: CartMutationDependencies,
  mutationFn: (input: Input) => Promise<Cart>,
  successMessage: string,
  optimistic?: (cart: Cart, input: Input, client: QueryClient) => Cart | Promise<Cart>,
) {
  const queryClient = useQueryClient();
  const key = queryKeys.cart.list(dependencies.userId, dependencies.sessionId);
  const owner = JSON.stringify(key);
  const activeOwner = useRef<string | null>(owner);
  useEffect(() => {
    activeOwner.current = owner;
    return () => { activeOwner.current = null; };
  }, [owner]);

  return useMutation({
    mutationFn,
    retry: false,
    scope: { id: owner },
    onMutate: async (input: Input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Cart>(key);
      if (optimistic) {
        const cart =
          previous ??
          (await queryClient.fetchQuery(
            cartQueryOptions(dependencies.client, dependencies.userId, dependencies.sessionId),
          ));
        const next = await optimistic(cart, input, queryClient);
        if (activeOwner.current === owner) queryClient.setQueryData(key, next);
      }
      return { previous, owner, key };
    },
    onSuccess: async (cart, _input, snapshot) => {
      if (!snapshot || activeOwner.current !== snapshot.owner) return;
      queryClient.setQueryData(snapshot.key, cart);
      dependencies.onFeedback?.(successMessage, 'success');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: snapshot.key }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.cart.count(dependencies.userId, dependencies.sessionId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.quote.all() }),
      ]);
    },
    onError: (error, _input, snapshot) => {
      if (activeOwner.current === null) return;
      if (snapshot && activeOwner.current !== snapshot.owner) return;
      if (optimistic && snapshot) {
        if (snapshot?.previous) queryClient.setQueryData(snapshot.key, snapshot.previous);
        else queryClient.removeQueries({ queryKey: snapshot?.key ?? key, exact: true });
      }
      const message =
        error instanceof ApiError
          ? error.code === 'AVAILABILITY_CONFLICT'
            ? 'Estoque insuficiente.'
            : error.code === 'SESSION_EXPIRED'
              ? 'Sua sessão expirou. Entre novamente.'
              : error.retryable
                ? 'Falha de conexão. Tente novamente.'
                : error.message
          : 'Não foi possível alterar o carrinho. Tente novamente.';
      dependencies.onFeedback?.(message, 'error');
    },
  });
}
