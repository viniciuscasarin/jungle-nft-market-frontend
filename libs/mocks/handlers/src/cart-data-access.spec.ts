import React from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { createHttpClient } from '@nft/shared-http';
import { createQueryClient, QueryClientProvider, queryKeys, useQuery } from '@nft/shared-query';
import {
  cartQueryOptions,
  cartItemCountQueryOptions,
  useAddToCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from '@nft/cart-data-access';
import {
  applyScenario,
  getMockDatabase,
  resetClock,
  setNetworkProfile,
  MemoryStorageAdapter,
  setStorageAdapter,
} from '@nft/mocks-core';
import { handlers } from './index';

const server = setupServer(...handlers);
const client = createHttpClient({
  baseURL: 'http://localhost',
  getGuestId: () => 'cart-hook-test',
});
const queryClient = createQueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});
const feedback = vi.fn();
const dependencies = { client, sessionId: 'cart-hook-test', onFeedback: feedback };
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(QueryClientProvider, { client: queryClient }, children);

function selected() {
  const nft = getMockDatabase().nfts[0];
  const edition = nft?.editions[0];
  if (!nft || !edition) throw new Error('Missing fixture');
  edition.availableSupply = 6;
  queryClient.setQueryData(queryKeys.catalog.detail(nft.id), nft);
  return { nftId: nft.id, editionId: edition.id, quantity: 2 };
}

describe('Cart data access through MSW', () => {
  it('does not recreate an identity cache after the component unmounts during POST', async () => {
    const input = selected();
    await queryClient.fetchQuery(cartQueryOptions(client, null, dependencies.sessionId));
    setNetworkProfile({ id: 'unmount-cart', name: 'Unmount cart', rules: [{ phase: 'before', method: 'POST', pathPattern: '/api/cart/items', behavior: { type: 'latency', duration: 100 } }] });
    const { result, unmount } = renderHook(() => useAddToCart(dependencies), { wrapper });
    let pending: Promise<unknown>;
    act(() => { pending = result.current.mutateAsync(input); });
    await waitFor(() => expect(result.current.isPending).toBe(true));
    unmount();
    queryClient.removeQueries({ queryKey: queryKeys.cart.list(null, dependencies.sessionId) });
    await act(async () => { await pending; });
    expect(queryClient.getQueryData(queryKeys.cart.list(null, dependencies.sessionId))).toBeUndefined();
    expect(feedback).not.toHaveBeenCalled();
  });
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.restoreAllMocks();
  });
  beforeEach(() => {
    resetClock();
    setStorageAdapter(new MemoryStorageAdapter());
    applyScenario('default', true);
    feedback.mockClear();
    server.resetHandlers();
  });

  it('updates the shared count before POST finishes and replaces temporary IDs after success', async () => {
    const input = selected();
    setNetworkProfile({
      id: 'cart-latency',
      name: 'Cart latency',
      rules: [
        {
          phase: 'before',
          method: 'POST',
          pathPattern: '/api/cart/items',
          behavior: { type: 'latency', duration: 150 },
        },
      ],
    });
    const { result } = renderHook(
      () => ({
        add: useAddToCart(dependencies),
        count: useQuery(cartItemCountQueryOptions(client, null, dependencies.sessionId)),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.count.data).toBe(0));
    act(() => result.current.add.mutate(input));
    await waitFor(() => expect(result.current.count.data).toBe(2));
    expect(result.current.add.isPending).toBe(true);
    await waitFor(() => expect(result.current.add.isSuccess).toBe(true));
    expect(result.current.add.data?.items[0]?.id).not.toContain('optimistic:');
    expect(feedback).toHaveBeenCalledWith('Item adicionado ao carrinho', 'success');
  });

  it('restores cart and badge after stock rejection and does not retry POST', async () => {
    const input = selected();
    const post = vi.spyOn(client, 'post');
    await queryClient.fetchQuery(cartQueryOptions(client, null, dependencies.sessionId));
    const { result } = renderHook(() => useAddToCart(dependencies), { wrapper });
    await act(async () => {
      await expect(result.current.mutateAsync({ ...input, quantity: 7 })).rejects.toMatchObject({
        code: 'AVAILABILITY_CONFLICT',
      });
    });
    expect(
      queryClient.getQueryData(queryKeys.cart.list(null, dependencies.sessionId)),
    ).toMatchObject({ items: [] });
    expect(post).toHaveBeenCalledTimes(1);
    expect(feedback).toHaveBeenCalledWith('Estoque insuficiente.', 'error');
  });

  it('rolls back a network failure and invalidates quote data after a successful addition', async () => {
    const input = selected();
    await queryClient.fetchQuery(cartQueryOptions(client, null, dependencies.sessionId));
    queryClient.setQueryData(queryKeys.quote.detail('old-quote'), { quoteId: 'old-quote' });
    const { result } = renderHook(() => useAddToCart(dependencies), { wrapper });
    setNetworkProfile({
      id: 'offline-cart',
      name: 'Offline cart',
      rules: [
        {
          phase: 'before',
          method: 'POST',
          pathPattern: '/api/cart/items',
          behavior: { type: 'connectionError' },
        },
      ],
    });
    await act(async () => {
      await expect(result.current.mutateAsync(input)).rejects.toMatchObject({ retryable: true });
    });
    expect(
      queryClient.getQueryData(queryKeys.cart.list(null, dependencies.sessionId)),
    ).toMatchObject({ items: [] });
    setNetworkProfile({ id: 'default', name: 'Default', rules: [] });
    await act(async () => {
      await result.current.mutateAsync(input);
    });
    expect(queryClient.getQueryState(queryKeys.quote.detail('old-quote'))?.isInvalidated).toBe(
      true,
    );
  });

  it('updates, removes and clears the server cart with validated responses', async () => {
    const input = selected();
    const { result } = renderHook(
      () => ({
        add: useAddToCart(dependencies),
        update: useUpdateCartItem(dependencies),
        remove: useRemoveCartItem(dependencies),
        clear: useClearCart(dependencies),
      }),
      { wrapper },
    );
    await act(async () => {
      await result.current.add.mutateAsync(input);
    });
    const itemId = result.current.add.data?.items[0]?.id;
    if (!itemId) throw new Error('Missing cart item');
    await act(async () => {
      await result.current.update.mutateAsync({ itemId, quantity: 3 });
    });
    expect(result.current.update.data?.items[0]?.quantity).toBe(3);
    await act(async () => {
      await result.current.remove.mutateAsync({ itemId });
    });
    expect(result.current.remove.data?.items).toEqual([]);
    await act(async () => {
      await result.current.add.mutateAsync(input);
      await result.current.clear.mutateAsync();
    });
    expect(
      (await queryClient.fetchQuery(cartQueryOptions(client, null, dependencies.sessionId))).items,
    ).toEqual([]);
  });

  it('rejects expired sessions and reports the normalized error', async () => {
    const input = selected();
    const user = getMockDatabase().users[0];
    if (!user) throw new Error('Missing user');
    getMockDatabase().sessions.push({
      token: 'expired-hook',
      user,
      expiresAt: '2025-01-01T00:00:00.000Z',
    });
    const authClient = createHttpClient({
      baseURL: 'http://localhost',
      getAuthToken: () => 'expired-hook',
    });
    const { result } = renderHook(
      () => useAddToCart({ client: authClient, userId: user.id, onFeedback: feedback }),
      { wrapper },
    );
    await act(async () => {
      await expect(result.current.mutateAsync(input)).rejects.toMatchObject({
        code: 'SESSION_EXPIRED',
      });
    });
    expect(feedback).toHaveBeenCalledWith('Sua sessão expirou. Entre novamente.', 'error');
  });

  it('does not restore the previous identity cache when an in-flight request completes', async () => {
    const input = selected();
    await queryClient.fetchQuery(cartQueryOptions(client, null, dependencies.sessionId));
    setNetworkProfile({
      id: 'slow-cart',
      name: 'Slow cart',
      rules: [
        {
          phase: 'before',
          method: 'POST',
          pathPattern: '/api/cart/items',
          behavior: { type: 'latency', duration: 100 },
        },
      ],
    });
    const { result, rerender } = renderHook(
      ({ sessionId }) => useAddToCart({ ...dependencies, sessionId }),
      { wrapper, initialProps: { sessionId: dependencies.sessionId } },
    );
    act(() => result.current.mutate(input));
    await waitFor(() => expect(result.current.isPending).toBe(true));
    rerender({ sessionId: 'next-guest' });
    queryClient.removeQueries({ queryKey: queryKeys.cart.list(null, dependencies.sessionId) });
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(
      queryClient.getQueryData(queryKeys.cart.list(null, dependencies.sessionId)),
    ).toBeUndefined();
    expect(feedback).not.toHaveBeenCalled();
  });
});
