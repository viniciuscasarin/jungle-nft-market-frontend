import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { applyScenario } from '@nft/mocks-core';
import { NftListResponseSchema, NftItemSchema } from '@nft/shared-contracts';
import { parse, compare } from '@nft/shared-money';
import { catalogHandlers } from './catalog';

const server = setupServer(...catalogHandlers);

describe('Catalog Handlers Integration (@nft/mocks-handlers)', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    applyScenario('default', true);
    server.resetHandlers();
  });

  describe('GET /api/nfts', () => {
    it('returns first page with default pageSize 9 and valid facets', async () => {
      const response = await fetch('http://localhost/api/nfts');
      expect(response.status).toBe(200);

      const json = await response.json();
      const parsed = NftListResponseSchema.parse(json);

      expect(parsed.page).toBe(1);
      expect(parsed.pageSize).toBe(9);
      expect(parsed.items.length).toBe(9);
      expect(parsed.total).toBeGreaterThanOrEqual(48);
      expect(parsed.totalPages).toBe(Math.ceil(parsed.total / 9));

      expect(parsed.facets).toBeDefined();
      expect(parsed.facets?.collections.length).toBeGreaterThanOrEqual(5);
      expect(parsed.facets?.networks.length).toBe(3);
    });

    it('filters combinably by text search q and collections', async () => {
      const response = await fetch(
        'http://localhost/api/nfts?q=Primate&collections=col_cyber_jungle',
      );
      expect(response.status).toBe(200);

      const json = await response.json();
      const parsed = NftListResponseSchema.parse(json);

      expect(parsed.items.length).toBeGreaterThan(0);
      for (const item of parsed.items) {
        expect(
          item.title.toLowerCase().includes('primate') ||
            item.description?.toLowerCase().includes('primate'),
        ).toBe(true);
        expect(item.category).toBe('col_cyber_jungle');
      }
    });

    it('filters by networks', async () => {
      const response = await fetch('http://localhost/api/nfts?networks=solana');
      expect(response.status).toBe(200);

      const json = await response.json();
      const parsed = NftListResponseSchema.parse(json);

      expect(parsed.items.length).toBeGreaterThan(0);
      for (const item of parsed.items) {
        expect(item.network).toBe('solana');
      }
    });

    it('filters by ETH price range using @nft/shared-money decimal comparison', async () => {
      const response = await fetch('http://localhost/api/nfts?minPrice=1.00&maxPrice=2.00');
      expect(response.status).toBe(200);

      const json = await response.json();
      const parsed = NftListResponseSchema.parse(json);

      expect(parsed.items.length).toBeGreaterThan(0);
      for (const item of parsed.items) {
        expect(compare(parse(item.price), parse('1.00'))).toBeGreaterThanOrEqual(0);
        expect(compare(parse(item.price), parse('2.00'))).toBeLessThanOrEqual(0);
      }
    });

    it('sorts by price-asc and price-desc', async () => {
      const ascRes = await fetch('http://localhost/api/nfts?sort=price-asc&pageSize=20');
      const ascData = NftListResponseSchema.parse(await ascRes.json());

      for (let i = 0; i < ascData.items.length - 1; i++) {
        const a = parse(ascData.items[i]!.price);
        const b = parse(ascData.items[i + 1]!.price);
        expect(compare(a, b)).toBeLessThanOrEqual(0);
      }

      const descRes = await fetch('http://localhost/api/nfts?sort=price-desc&pageSize=20');
      const descData = NftListResponseSchema.parse(await descRes.json());

      for (let i = 0; i < descData.items.length - 1; i++) {
        const a = parse(descData.items[i]!.price);
        const b = parse(descData.items[i + 1]!.price);
        expect(compare(a, b)).toBeGreaterThanOrEqual(0);
      }
    });

    it('filters by trending and new tabs', async () => {
      const trendingRes = await fetch('http://localhost/api/nfts?tab=trending');
      const trendingData = NftListResponseSchema.parse(await trendingRes.json());
      expect(trendingData.items.length).toBeGreaterThan(0);

      const newRes = await fetch('http://localhost/api/nfts?tab=new');
      const newData = NftListResponseSchema.parse(await newRes.json());
      expect(newData.items.length).toBeGreaterThan(0);
    });

    it('returns empty array when filters match no NFTs', async () => {
      const response = await fetch(
        'http://localhost/api/nfts?q=completely_non_existent_nft_term_12345',
      );
      expect(response.status).toBe(200);

      const json = await response.json();
      const parsed = NftListResponseSchema.parse(json);

      expect(parsed.items).toHaveLength(0);
      expect(parsed.total).toBe(0);
      expect(parsed.page).toBe(1);
    });

    it('respects empty mock scenario', async () => {
      applyScenario('empty', true);
      const response = await fetch('http://localhost/api/nfts');
      expect(response.status).toBe(200);

      const json = await response.json();
      const parsed = NftListResponseSchema.parse(json);

      expect(parsed.items).toHaveLength(0);
      expect(parsed.total).toBe(0);
    });
  });

  describe('GET /api/nfts/:id', () => {
    it('returns single NFT item by ID', async () => {
      const response = await fetch('http://localhost/api/nfts/nft-01');
      expect(response.status).toBe(200);

      const json = await response.json();
      const parsed = NftItemSchema.parse(json);
      expect(parsed.id).toBe('nft-01');
    });

    it('returns 404 NOT_FOUND for unknown NFT ID', async () => {
      const response = await fetch('http://localhost/api/nfts/nft-999999');
      expect(response.status).toBe(404);

      const json = await response.json();
      expect(json.code).toBe('NOT_FOUND');
    });
  });
});
