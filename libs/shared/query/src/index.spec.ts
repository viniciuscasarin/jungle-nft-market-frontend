import { describe, it, expect } from 'vitest';
import { queryKeys, createQueryClient, clearPrivateCache } from './index';

describe('queryKeys (@nft/shared-query)', () => {
  it('invalidates cart lists and counts through their own prefixes', async () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(queryKeys.cart.list('user_alice'), { items: [] });
    queryClient.setQueryData(queryKeys.cart.list('user_bob'), { items: [] });
    queryClient.setQueryData(queryKeys.cart.count('user_alice'), 0);
    queryClient.setQueryData(queryKeys.catalog.list(), { items: [] });

    await queryClient.invalidateQueries({ queryKey: queryKeys.cart.lists() });

    expect(queryClient.getQueryState(queryKeys.cart.list('user_alice'))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(queryKeys.cart.list('user_bob'))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(queryKeys.cart.count('user_alice'))?.isInvalidated).toBe(false);

    await queryClient.invalidateQueries({ queryKey: queryKeys.cart.counts() });

    expect(queryClient.getQueryState(queryKeys.cart.count('user_alice'))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(queryKeys.catalog.list())?.isInvalidated).toBe(false);
    queryClient.clear();
  });

  it('isolates cart caches by user and preserves guest data on private cache cleanup', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(queryKeys.cart.list('user_alice'), { items: ['alice-item'] });
    queryClient.setQueryData(queryKeys.cart.count('user_alice'), 2);
    queryClient.setQueryData(queryKeys.cart.list('user_bob'), { items: ['bob-item'] });
    queryClient.setQueryData(queryKeys.cart.count('user_bob'), 1);
    queryClient.setQueryData(queryKeys.cart.list(), { items: ['guest-item'] });
    queryClient.setQueryData(queryKeys.cart.count(), 3);

    clearPrivateCache(queryClient, 'user_alice');

    expect(queryClient.getQueryData(queryKeys.cart.list('user_alice'))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.cart.count('user_alice'))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.cart.list('user_bob'))).toEqual({ items: ['bob-item'] });
    expect(queryClient.getQueryData(queryKeys.cart.count('user_bob'))).toBe(1);
    expect(queryClient.getQueryData(queryKeys.cart.list(null))).toEqual({ items: ['guest-item'] });
    expect(queryClient.getQueryData(queryKeys.cart.count(null))).toBe(3);
    queryClient.clear();
  });

  it('invalidates all cart data without affecting the catalog', async () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(queryKeys.cart.list(), { items: [] });
    queryClient.setQueryData(queryKeys.cart.count('user_alice'), 1);
    queryClient.setQueryData(queryKeys.catalog.list(), { items: [] });

    await queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() });

    expect(queryClient.getQueryState(queryKeys.cart.list())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(queryKeys.cart.count('user_alice'))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(queryKeys.catalog.list())?.isInvalidated).toBe(false);
    queryClient.clear();
  });

  it('generates deterministic catalog query keys', () => {
    expect(queryKeys.catalog.all()).toEqual(['catalog']);
    expect(queryKeys.catalog.list()).toEqual(['catalog', 'list']);
    expect(queryKeys.catalog.list({ page: 1, sort: 'price-asc' })).toEqual([
      'catalog',
      'list',
      { page: 1, sort: 'price-asc' },
    ]);
    expect(queryKeys.catalog.detail('nft-01')).toEqual(['catalog', 'detail', 'nft-01']);
    expect(queryKeys.catalog.reviews('nft-01', { page: 1 })).toEqual([
      'catalog',
      'reviews',
      'nft-01',
      { page: 1 },
    ]);
  });

  it('preserves public catalog cache when clearing private user cache', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(queryKeys.catalog.list({ page: 1 }), { items: [] });
    queryClient.setQueryData(queryKeys.user('user_alice', 'favorites'), ['nft-01']);

    clearPrivateCache(queryClient);

    expect(queryClient.getQueryData(queryKeys.catalog.list({ page: 1 }))).toEqual({ items: [] });
    expect(queryClient.getQueryData(queryKeys.user('user_alice', 'favorites'))).toBeUndefined();
  });
});
