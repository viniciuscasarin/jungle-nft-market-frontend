import { describe, it, expect } from 'vitest';
import { queryKeys, createQueryClient, clearPrivateCache } from './index';

describe('queryKeys (@nft/shared-query)', () => {
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
