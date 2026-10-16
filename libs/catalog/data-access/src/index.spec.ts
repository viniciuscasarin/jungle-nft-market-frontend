import { describe, it, expect, vi } from 'vitest';
import type { HttpClient } from '@nft/shared-http';
import {
  fetchCatalogNfts,
  catalogListQueryOptions,
  fetchNftDetail,
} from './index';

describe('Catalog Data Access (@nft/catalog-data-access)', () => {
  const mockNftItem = {
    id: 'nft-01',
    title: 'Alpha Primate',
    imageUrl: '/assets/images/hero-nft.png',
    creator: { id: 'c-1', name: 'Jungle Labs' },
    price: '1.50',
    rating: { average: 4.8, count: 20 },
    editions: [],
    tags: [],
    version: 1,
  };

  const mockListResponse = {
    items: [mockNftItem],
    total: 1,
    page: 1,
    pageSize: 9,
    totalPages: 1,
  };

  it('fetchCatalogNfts forwards normalized params and AbortSignal to client.get', async () => {
    const abortController = new AbortController();
    const getMock = vi.fn().mockResolvedValue({ data: mockListResponse });
    const mockClient = { get: getMock } as unknown as HttpClient;

    const result = await fetchCatalogNfts(mockClient, {
      params: { q: 'ape', page: 2 },
      signal: abortController.signal,
    });

    expect(getMock).toHaveBeenCalledWith('/api/nfts', {
      params: expect.objectContaining({
        q: 'ape',
        page: 2,
        pageSize: 9,
        sort: 'popular-desc',
        tab: 'all',
      }),
      signal: abortController.signal,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe('nft-01');
  });

  it('catalogListQueryOptions configures deterministic queryKey, staleTime: 60_000 and queryFn', async () => {
    const getMock = vi.fn().mockResolvedValue({ data: mockListResponse });
    const mockClient = { get: getMock } as unknown as HttpClient;

    const options = catalogListQueryOptions(mockClient, { q: 'primate' });

    expect(options.queryKey[0]).toBe('catalog');
    expect(options.queryKey[1]).toBe('list');
    expect(options.staleTime).toBe(60_000);

    const abortController = new AbortController();
    const queryFn = options.queryFn as (ctx: { signal: AbortSignal }) => Promise<unknown>;
    const data = await queryFn({ signal: abortController.signal });

    expect(getMock).toHaveBeenCalledWith('/api/nfts', {
      params: expect.objectContaining({ q: 'primate' }),
      signal: abortController.signal,
    });
    expect(data).toBeDefined();
  });

  it('fetchNftDetail queries single NFT by id with AbortSignal', async () => {
    const getMock = vi.fn().mockResolvedValue({ data: mockNftItem });
    const mockClient = { get: getMock } as unknown as HttpClient;

    const result = await fetchNftDetail(mockClient, 'nft-01');
    expect(getMock).toHaveBeenCalledWith('/api/nfts/nft-01', { signal: undefined });
    expect(result.id).toBe('nft-01');
  });
});
